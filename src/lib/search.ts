import { normalizeText } from "./slug";
import type { Brand, Product } from "./types";

export interface SearchHit {
  product: Product;
  score: number;
}

/**
 * Catalog search: name, brand, category, SKU, tags and keywords, accent- and
 * case-insensitive. Pure function so the UI can reuse it for suggestions.
 */
export function searchProducts(products: Product[], query: string, limit = 8): Product[] {
  const term = normalizeText(query);
  if (!term) return [];
  const words = term.split(" ").filter(Boolean);

  const scored: SearchHit[] = [];
  for (const product of products) {
    const haystack = normalizeText(
      [
        product.name,
        product.shortDescription,
        product.sku,
        product.subcategory,
        ...product.tags,
        ...product.keywords,
      ].join(" "),
    );
    if (!words.every((word) => haystack.includes(word))) continue;

    let score = 0;
    const normalizedName = normalizeText(product.name);
    if (normalizedName === term) score += 120;
    if (normalizedName.startsWith(term)) score += 70;
    if (normalizedName.includes(term)) score += 45;
    if (normalizeText(product.sku) === term) score += 100;
    if (normalizeText(product.brandSlug).includes(term)) score += 25;
    score += product.rating * 2;
    if (product.bestseller) score += 4;
    scored.push({ product, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, "fr"))
    .slice(0, limit)
    .map((hit) => hit.product);
}

export function brandName(brandSlug: string, brands: Brand[]): string {
  return brands.find((brand) => brand.slug === brandSlug)?.name ?? brandSlug;
}
