import type { Availability } from "./types";
import { DEFAULT_PER_PAGE, PER_PAGE_OPTIONS, type CatalogFilters, type SortKey } from "./catalog-shared";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export const SORT_PARAM_TO_KEY: Record<string, SortKey> = {
  pertinence: "pertinence",
  popularite: "popular",
  nouveautes: "newest",
  "prix-asc": "price-asc",
  "prix-desc": "price-desc",
  note: "rating",
};

export const SORT_KEY_TO_PARAM: Record<SortKey, string> = {
  pertinence: "pertinence",
  popular: "popularite",
  newest: "nouveautes",
  "price-asc": "prix-asc",
  "price-desc": "prix-desc",
  rating: "note",
};

export const SORT_LABELS: Record<string, string> = {
  pertinence: "Pertinence",
  popularite: "Popularité",
  nouveautes: "Nouveautés",
  "prix-asc": "Prix croissant",
  "prix-desc": "Prix décroissant",
  note: "Mieux notés",
};

const AVAILABILITY_PARAMS: Availability[] = ["in_stock", "low_stock", "out_of_stock"];

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function list(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function positiveNumber(value: string | string[] | undefined): number | undefined {
  const raw = first(value);
  if (!raw) return undefined;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export interface ParsedCatalog {
  filters: CatalogFilters;
  sortParam: string;
  query?: string;
  /** Number of user-applied filters, for the mobile badge. */
  activeCount: number;
}

export function parseCatalogParams(
  searchParams: SearchParamsRecord,
  options: { category?: string; fixedSort?: SortKey } = {},
): ParsedCatalog {
  const sortParam = SORT_KEY_TO_PARAM[options.fixedSort ?? "pertinence"];
  const requestedSort = first(searchParams.tri);
  const sort = options.fixedSort
    ? options.fixedSort
    : (SORT_PARAM_TO_KEY[requestedSort ?? "pertinence"] ?? "pertinence");

  const brands = list(searchParams.marque);
  const availability = list(searchParams.dispo).filter((entry): entry is Availability =>
    AVAILABILITY_PARAMS.includes(entry as Availability),
  );
  const energies = list(searchParams.energie);
  const minPrice = positiveNumber(searchParams["prix-min"]);
  const maxPrice = positiveNumber(searchParams["prix-max"]);
  const onSale = first(searchParams.promo) === "1";
  const isNew = first(searchParams.nouveau) === "1";
  const page = Math.max(1, Math.floor(positiveNumber(searchParams.page) ?? 1));
  const perPageRaw = positiveNumber(searchParams["par-page"]);
  const perPage = PER_PAGE_OPTIONS.includes(perPageRaw ?? 0) ? perPageRaw! : DEFAULT_PER_PAGE;
  const query = first(searchParams.q)?.trim().slice(0, 80) || undefined;

  const activeCount =
    (brands.length > 0 ? 1 : 0) +
    (availability.length > 0 ? 1 : 0) +
    (energies.length > 0 ? 1 : 0) +
    (minPrice !== undefined || maxPrice !== undefined ? 1 : 0) +
    (onSale ? 1 : 0) +
    (isNew ? 1 : 0);

  return {
    filters: {
      category: options.category,
      brands,
      availability,
      energies,
      minPrice,
      maxPrice,
      onSale,
      isNew,
      q: query,
      sort,
      page,
      perPage,
    },
    sortParam: options.fixedSort ? sortParam : (requestedSort ?? "pertinence"),
    query,
    activeCount,
  };
}

/** Serialises params, dropping empty values, so URLs stay shareable and clean. */
export function buildHref(
  pathname: string,
  params: Record<string, string | number | boolean | undefined | null | string[]>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    if (Array.isArray(value)) {
      if (value.length > 0) search.set(key, value.join(","));
    } else if (value === true) {
      search.set(key, "1");
    } else {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function searchParamsToRecord(searchParams: SearchParamsRecord): SearchParamsRecord {
  return searchParams;
}
