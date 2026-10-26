import type {
  Availability,
  Brand,
  Category,
  DiscountCode,
  Product,
  Review,
  StoreSettings,
} from "./types";
import {
  DEFAULT_PER_PAGE,
  PER_PAGE_OPTIONS,
  SORT_OPTIONS,
  type CatalogFacets,
  type CatalogFilters,
  type SortKey,
} from "./catalog-shared";
import { readDb } from "./db";
import { searchProducts } from "./search";
import { evaluateDiscountCode, type DiscountEvaluation } from "./pricing";
import { availabilityOf } from "./product";
import { addMoney, toMillimes } from "./money";

export type { CatalogFacets, CatalogFilters, SortKey } from "./catalog-shared";
export { DEFAULT_PER_PAGE, PER_PAGE_OPTIONS, SORT_OPTIONS } from "./catalog-shared";

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  perPage: number;
  facets: CatalogFacets;
}

function sortProducts(products: Product[], sort: SortKey | undefined): Product[] {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => toMillimes(a.price) - toMillimes(b.price));
    case "price-desc":
      return list.sort((a, b) => toMillimes(b.price) - toMillimes(a.price));
    case "newest":
      return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    case "rating":
      return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "popular":
      return list.sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
    default:
      return list.sort(
        (a, b) =>
          Number(b.bestseller) - Number(a.bestseller) ||
          Number(b.featured) - Number(a.featured) ||
          b.rating - a.rating,
      );
  }
}

export function filterCatalog(
  products: Product[],
  brands: Brand[],
  filters: CatalogFilters,
): CatalogResult {
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  // 1. Base scope: category + text query (facet counts are computed on this set).
  let scoped = products;
  if (filters.category) {
    scoped = scoped.filter((product) => product.categorySlug === filters.category);
  }
  if (filters.q && filters.q.trim()) {
    const hits = searchProducts(scoped, filters.q, 500);
    const order = new Map(hits.map((hit, index) => [hit.id, index]));
    scoped = hits.length ? hits : [];
    if (!filters.sort || filters.sort === "pertinence") {
      scoped = [...scoped].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    }
  }

  const priceMin = scoped.length ? Math.min(...scoped.map((p) => p.price)) : 0;
  const priceMax = scoped.length ? Math.max(...scoped.map((p) => p.price)) : 0;

  const facets: CatalogFacets = {
    brands: brands
      .map((brand) => ({
        slug: brand.slug,
        name: brand.name,
        count: scoped.filter((product) => product.brandSlug === brand.slug).length,
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count),
    priceMin,
    priceMax,
    availability: {
      in_stock: scoped.filter((p) => availabilityOf(p) === "in_stock").length,
      low_stock: scoped.filter((p) => availabilityOf(p) === "low_stock").length,
      out_of_stock: scoped.filter((p) => availabilityOf(p) === "out_of_stock").length,
    },
    energies: Array.from(new Set(scoped.map((p) => p.energyClass).filter(Boolean)))
      .map((value) => ({
        value: value as string,
        count: scoped.filter((p) => p.energyClass === value).length,
      }))
      .sort((a, b) => a.value.localeCompare(b.value)),
    total: scoped.length,
  };

  // 2. Filters
  let filtered = scoped;
  if (filters.brands?.length) {
    const set = new Set(filters.brands);
    filtered = filtered.filter((product) => set.has(product.brandSlug));
  }
  if (typeof filters.minPrice === "number") {
    filtered = filtered.filter((product) => toMillimes(product.price) >= toMillimes(filters.minPrice!));
  }
  if (typeof filters.maxPrice === "number") {
    filtered = filtered.filter((product) => toMillimes(product.price) <= toMillimes(filters.maxPrice!));
  }
  if (filters.availability?.length) {
    const set = new Set(filters.availability);
    filtered = filtered.filter((product) => set.has(availabilityOf(product)));
  }
  if (filters.energies?.length) {
    const set = new Set(filters.energies);
    filtered = filtered.filter((product) => product.energyClass && set.has(product.energyClass));
  }
  if (filters.onSale) {
    filtered = filtered.filter((product) => Boolean(product.originalPrice));
  }
  if (filters.isNew) {
    filtered = filtered.filter((product) => product.isNew);
  }

  // 3. Sort + paginate
  const sorted = sortProducts(filtered, filters.sort);
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, filters.page ?? 1), pageCount);
  const start = (page - 1) * perPage;

  return {
    items: sorted.slice(start, start + perPage),
    total,
    page,
    pageCount,
    perPage,
    facets,
  };
}

export async function getStoreData(): Promise<{
  products: Product[];
  categories: Category[];
  brands: Brand[];
  settings: StoreSettings;
  reviews: Review[];
  discounts: DiscountCode[];
}> {
  const database = await readDb();
  return {
    products: database.products,
    categories: database.categories,
    brands: database.brands,
    settings: database.settings,
    reviews: database.reviews,
    discounts: database.discounts,
  };
}

export async function listProducts(filters: CatalogFilters = {}): Promise<CatalogResult> {
  const { products, brands } = await getStoreData();
  return filterCatalog(products, brands, filters);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { products } = await getStoreData();
  return products.find((product) => product.slug === slug);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const { products } = await getStoreData();
  const map = new Map(products.map((product) => [product.id, product]));
  return ids.map((id) => map.get(id)).filter((product): product is Product => Boolean(product));
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { products } = await getStoreData();
  const related = product.relatedIds
    .map((id) => products.find((entry) => entry.id === id))
    .filter((entry): entry is Product => Boolean(entry));
  if (related.length >= limit) return related.slice(0, limit);
  const fallback = products
    .filter((entry) => entry.categorySlug === product.categorySlug && entry.id !== product.id)
    .filter((entry) => !related.some((r) => r.id === entry.id))
    .slice(0, limit - related.length);
  return [...related, ...fallback];
}

export async function getReviewsForProduct(slug: string): Promise<Review[]> {
  const { reviews } = await getStoreData();
  return reviews
    .filter((review) => review.productSlug === slug)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const { categories } = await getStoreData();
  return categories.find((category) => category.slug === slug);
}

export async function getBrandBySlug(slug: string): Promise<Brand | undefined> {
  const { brands } = await getStoreData();
  return brands.find((brand) => brand.slug === slug);
}

export async function getFeaturedProducts(): Promise<{
  bestsellers: Product[];
  promotions: Product[];
  newArrivals: Product[];
  recommended: Product[];
  limitedStock: Product[];
}> {
  const { products } = await getStoreData();
  return {
    bestsellers: products.filter((p) => p.bestseller).slice(0, 8),
    promotions: products
      .filter((p) => p.originalPrice)
      .sort((a, b) => (b.originalPrice! - b.price) - (a.originalPrice! - a.price))
      .slice(0, 8),
    newArrivals: products
      .filter((p) => p.isNew)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 8),
    recommended: products.slice().sort((a, b) => b.rating - a.rating).slice(0, 8),
    limitedStock: products
      .filter((p) => p.stock > 0 && p.stock <= 4)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 4),
  };
}

export async function getProductsByIdsForCart(ids: string[]): Promise<Product[]> {
  return getProductsByIds(ids);
}

export async function getDiscounts(): Promise<DiscountCode[]> {
  const { discounts } = await getStoreData();
  return discounts;
}

/** Server-side validation used by the cart preview and the order endpoint. */
export async function validateDiscountCode(
  code: string | undefined,
  subtotal: number,
  now?: Date,
): Promise<DiscountEvaluation> {
  if (!code) return evaluateDiscountCode(undefined, subtotal, now);
  const { discounts } = await getStoreData();
  const normalized = code.trim().toUpperCase();
  const discount = discounts.find((entry) => entry.code.toUpperCase() === normalized);
  return evaluateDiscountCode(discount, subtotal, now);
}

export function countByCategory(products: Product[]): Record<string, number> {
  return products.reduce<Record<string, number>>((accumulator, product) => {
    accumulator[product.categorySlug] = (accumulator[product.categorySlug] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function subtotalOf(products: Product[]): number {
  return addMoney(...products.map((product) => product.price));
}
