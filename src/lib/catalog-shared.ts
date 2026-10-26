import type { Availability } from "./types";

/**
 * Catalog types and constants with NO data access.
 *
 * `catalog.ts` imports the database, so anything imported from it lands in the
 * client bundle as soon as one client component touches it. Client components
 * (filters, sort, pagination) must import from this module instead.
 */

export type SortKey = "pertinence" | "price-asc" | "price-desc" | "newest" | "rating" | "popular";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "pertinence", label: "Pertinence" },
  { value: "popular", label: "Popularité" },
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux notés" },
];

export interface CatalogFilters {
  category?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  availability?: Availability[];
  energies?: string[];
  onSale?: boolean;
  isNew?: boolean;
  q?: string;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export interface CatalogFacets {
  brands: { slug: string; name: string; count: number }[];
  priceMin: number;
  priceMax: number;
  availability: Record<Availability, number>;
  energies: { value: string; count: number }[];
  total: number;
}

export const PER_PAGE_OPTIONS = [12, 24, 36];
export const DEFAULT_PER_PAGE = 12;
