import type { EnergyClass, Product, Specification, VisualShape } from "@/lib/types";
import { slugify } from "@/lib/slug";
import { brands } from "../brands";
import { categories } from "../categories";

/** Compact authoring format — the factory fills in ids, keywords, dates, etc. */
export interface SeedProduct {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  was?: number;
  stock: number;
  rating: number;
  reviews: number;
  colors: [string, string][];
  specs: [string, string, Specification["group"]?][];
  short: string;
  long: string[];
  dims: [number, number, number];
  weight: number;
  energy?: EnergyClass;
  flags?: ("featured" | "bestseller" | "new")[];
  shape: VisualShape;
  body: string;
  tags: string[];
  keywords?: string[];
  warranty?: string;
  imageUrl?: string;
}

const brandCodes: Record<string, string> = {
  novacool: "NVC",
  aqualis: "AQL",
  thermia: "THM",
  ventis: "VTS",
  lumen: "LMN",
  kuisto: "KST",
  brewella: "BWL",
  vortexa: "VTX",
  aeris: "AER",
  saphir: "SPH",
};

const categoryCodes: Record<string, string> = {
  refrigerateurs: "FR",
  "lave-linge": "LL",
  "lave-vaisselle": "LV",
  "cuisinieres-four": "CF",
  "micro-ondes": "MO",
  climatiseurs: "CL",
  televiseurs: "TV",
  aspirateurs: "AS",
  "petits-electromenagers": "PE",
  "machines-a-cafe": "CA",
  "mixeurs-robots": "MX",
  "chauffage-ventilation": "CH",
};

const DAY = 86_400_000;
const CREATED_BASE = Date.UTC(2026, 6, 6); // fixed so demo data is stable between builds
const UPDATED_BASE = Date.UTC(2026, 9, 1);

export const DEFAULT_WARRANTY = "Garantie 2 ans (conditions illustratives de démonstration)";

export function buildProduct(seed: SeedProduct, index: number): Product {
  const slug = slugify(seed.name);
  const brand = brands.find((b) => b.slug === seed.brand);
  const category = categories.find((c) => c.slug === seed.category);
  if (!brand) throw new Error(`Unknown brand "${seed.brand}" for ${seed.name}`);
  if (!category) throw new Error(`Unknown category "${seed.category}" for ${seed.name}`);

  const flags = new Set(seed.flags ?? []);
  const createdAt = new Date(CREATED_BASE + index * 1.4 * DAY).toISOString();
  const updatedAt = new Date(UPDATED_BASE + (index % 14) * DAY).toISOString();

  const keywords = Array.from(
    new Set(
      [
        ...seed.name.split(/[\s,/]+/),
        ...seed.tags,
        brand.name,
        category.name,
        category.shortName,
        seed.subcategory,
        ...(seed.keywords ?? []),
        ...seed.specs.flatMap(([label, value]) => [label, value]),
      ]
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean),
    ),
  );

  return {
    id: `p-${slug}`,
    slug,
    name: seed.name,
    brandSlug: seed.brand,
    categorySlug: seed.category,
    subcategory: seed.subcategory,
    sku: `${brandCodes[seed.brand]}-${categoryCodes[seed.category]}-${String(index + 101).padStart(4, "0")}`,
    price: seed.price,
    originalPrice: seed.was && seed.was > seed.price ? seed.was : undefined,
    shortDescription: seed.short,
    description: seed.long,
    specs: seed.specs.map(([label, value, group]) => ({
      label,
      value,
      group: group ?? "features",
    })),
    colors: seed.colors.map(([name, hex]) => ({ name, hex })),
    dimensions: { width: seed.dims[0], height: seed.dims[1], depth: seed.dims[2], unit: "cm" },
    weightKg: seed.weight,
    energyClass: seed.energy,
    stock: seed.stock,
    warranty: seed.warranty ?? DEFAULT_WARRANTY,
    featured: flags.has("featured"),
    bestseller: flags.has("bestseller"),
    isNew: flags.has("new"),
    rating: seed.rating,
    reviewCount: seed.reviews,
    tags: seed.tags,
    keywords,
    relatedIds: [],
    visual: { shape: seed.shape, body: seed.body },
    imageUrl: seed.imageUrl,
    createdAt,
    updatedAt,
  };
}

/** Fills `relatedIds` once every product exists: same category first, then same brand. */
export function linkRelated(products: Product[]): Product[] {
  return products.map((product) => {
    const sameCategory = products
      .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
      .sort((a, b) => b.rating - a.rating)
      .map((p) => p.id);
    const sameBrand = products
      .filter((p) => p.id !== product.id && p.brandSlug === product.brandSlug)
      .sort((a, b) => b.rating - a.rating)
      .map((p) => p.id);
    const related = Array.from(new Set([...sameCategory, ...sameBrand])).slice(0, 4);
    return { ...product, relatedIds: related };
  });
}
