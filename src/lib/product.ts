import type { Availability, Product, ProductSummary } from "./types";
import { discountPercent } from "./money";

export function availabilityOf(product: Pick<Product, "stock">): Availability {
  if (product.stock <= 0) return "out_of_stock";
  if (product.stock <= 5) return "low_stock";
  return "in_stock";
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  in_stock: "En stock",
  low_stock: "Dernières pièces",
  out_of_stock: "Rupture de stock",
};

export const AVAILABILITY_DETAIL: Record<Availability, string> = {
  in_stock: "Expédié sous 48 h ouvrées",
  low_stock: "Stock limité — commandez rapidement",
  out_of_stock: "Reapprovisionnement en cours",
};

export function isPurchasable(product: Pick<Product, "stock">): boolean {
  return product.stock > 0;
}

export function activePrice(product: Pick<Product, "price">): number {
  return product.price;
}

export function productDiscount(product: Pick<Product, "price" | "originalPrice">): number {
  return discountPercent(product.price, product.originalPrice);
}

export const ENERGY_LABEL: Record<string, string> = {
  "A+++": "A+++",
  "A++": "A++",
  "A+": "A+",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
};

/** Colour used by the energy badge (demo scale, not an official label). */
export function energyColor(energyClass: string): string {
  switch (energyClass) {
    case "A+++":
    case "A++":
    case "A+":
      return "#1c6b4b";
    case "A":
      return "#2f7a45";
    case "B":
      return "#5c8a34";
    case "C":
      return "#9a8a2a";
    case "D":
      return "#b4772a";
    case "E":
      return "#b45a2a";
    default:
      return "#a03a2b";
  }
}

export function dimensionsLabel(product: Product): string {
  const { width, height, depth, unit } = product.dimensions;
  return `${width} × ${height} × ${depth} ${unit}`;
}

/** Converts a full product record into the light shape used by cards and search. */
export function summarizeProduct(product: Product): ProductSummary {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandSlug: product.brandSlug,
    categorySlug: product.categorySlug,
    subcategory: product.subcategory,
    shortDescription: product.shortDescription,
    price: product.price,
    originalPrice: product.originalPrice,
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    energyClass: product.energyClass,
    isNew: product.isNew,
    bestseller: product.bestseller,
    featured: product.featured,
    visual: product.visual,
    imageUrl: product.imageUrl,
    dimensions: product.dimensions,
  };
}
