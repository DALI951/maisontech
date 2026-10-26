import type { EnergyClass, Specification, VisualShape } from "./types";
import type { Product } from "./types";
import { slugify } from "./slug";

/** Shape of the payload the admin product form sends. */
export interface ProductInput {
  name: string;
  brandSlug: string;
  categorySlug: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  stock: number;
  shortDescription: string;
  description: string[];
  specs: Specification[];
  colors: { name: string; hex: string }[];
  energyClass?: EnergyClass;
  warranty: string;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  shape: VisualShape;
  body: string;
  imageUrl?: string;
}

export const VISUAL_SHAPE_OPTIONS: { value: VisualShape; label: string }[] = [
  { value: "fridge", label: "Réfrigérateur combiné" },
  { value: "fridge-side", label: "Réfrigérateur américain" },
  { value: "freezer", label: "Congélateur" },
  { value: "washer", label: "Lave-linge" },
  { value: "washer-dryer", label: "Lavante-séchante" },
  { value: "dishwasher", label: "Lave-vaisselle" },
  { value: "cooker", label: "Cuisinière" },
  { value: "oven", label: "Four" },
  { value: "hob", label: "Table de cuisson" },
  { value: "hood", label: "Hotte" },
  { value: "microwave", label: "Micro-ondes" },
  { value: "ac", label: "Climatiseur" },
  { value: "tv", label: "Téléviseur" },
  { value: "vacuum", label: "Aspirateur" },
  { value: "coffee", label: "Machine à café" },
  { value: "mixer", label: "Robot / mixeur" },
  { value: "kettle", label: "Bouilloire" },
  { value: "toaster", label: "Grille-pain" },
  { value: "fryer", label: "Friteuse sans huile" },
  { value: "iron", label: "Fer à repasser" },
  { value: "fan", label: "Ventilateur" },
  { value: "heater", label: "Chauffage / ventilation" },
];

const VISUAL_SHAPES = new Set<string>(VISUAL_SHAPE_OPTIONS.map((option) => option.value));

const ENERGY_CLASSES = new Set(["A+++", "A++", "A+", "A", "B", "C", "D", "E", "F", "G"]);

export const ENERGY_OPTIONS = ["A+++", "A++", "A+", "A", "B", "C", "D", "E"] as const;

const HEX_RE = /^#[0-9a-f]{6}$/i;

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === 1;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseSpecs(value: unknown): Specification[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const spec = entry as Partial<Specification>;
      if (!asString(spec.label) || !asString(spec.value)) return [];
      return [{ label: asString(spec.label), value: asString(spec.value), group: spec.group ?? "features" }];
    });
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.split("|"))
      .filter((parts) => parts.length >= 2 && parts[0].trim() && parts[1].trim())
      .map((parts) => ({
        label: parts[0].trim(),
        value: parts.slice(1).join("|").trim(),
        group: "features" as const,
      }));
  }
  return [];
}

function parseColors(value: unknown): { name: string; hex: string }[] {
  let entries: { name: string; hex: string }[] = [];
  if (Array.isArray(value)) {
    entries = value.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const color = entry as { name?: unknown; hex?: unknown };
      return [{ name: asString(color.name), hex: asString(color.hex) }];
    });
  } else if (typeof value === "string") {
    entries = value
      .split("\n")
      .map((line) => line.split("|"))
      .filter((parts) => parts.length >= 2)
      .map((parts) => ({ name: parts[0].trim(), hex: parts[1].trim() }));
  }
  return entries.filter((color) => color.name && HEX_RE.test(color.hex)).slice(0, 6);
}

function parseDescription(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => asString(entry)).filter(Boolean).slice(0, 12);
  }
  if (typeof value === "string") {
    return value
      .split(/\n\s*\n|\n/)
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 12);
  }
  return [];
}

export interface ProductValidation {
  ok: boolean;
  errors: Record<string, string>;
  value?: ProductInput;
}

export function validateProductInput(raw: unknown): ProductValidation {
  const errors: Record<string, string> = {};
  if (!raw || typeof raw !== "object") {
    return { ok: false, errors: { name: "Données du produit illisibles." } };
  }
  const input = raw as Record<string, unknown>;

  const name = asString(input.name);
  if (name.length < 3) errors.name = "Le nom doit contenir au moins 3 caractères.";
  if (name.length > 120) errors.name = "Le nom est limité à 120 caractères.";

  const brandSlug = asString(input.brandSlug);
  if (!brandSlug) errors.brandSlug = "Choisissez une marque.";

  const categorySlug = asString(input.categorySlug);
  if (!categorySlug) errors.categorySlug = "Choisissez une catégorie.";

  const subcategory = asString(input.subcategory) || "Général";

  const price = asNumber(input.price);
  if (price === null || price <= 0) errors.price = "Le prix doit être supérieur à 0 DT.";
  else if (price > 100_000) errors.price = "Prix trop élevé : vérifiez la saisie.";

  const originalPriceRaw = asNumber(input.originalPrice);
  const originalPrice =
    originalPriceRaw !== null && originalPriceRaw > (price ?? 0) ? originalPriceRaw : undefined;
  if (originalPriceRaw !== null && originalPriceRaw > 0 && originalPriceRaw <= (price ?? 0)) {
    errors.originalPrice = "Le prix barré doit être supérieur au prix de vente.";
  }

  const stock = asNumber(input.stock);
  if (stock === null || stock < 0 || !Number.isInteger(stock)) {
    errors.stock = "Indiquez un stock entier positif (0 autorisé).";
  } else if (stock > 9999) {
    errors.stock = "Stock maximum : 9 999 unités.";
  }

  const shortDescription = asString(input.shortDescription);
  if (shortDescription.length < 10) {
    errors.shortDescription = "La description courte doit faire au moins 10 caractères.";
  }

  const description = parseDescription(input.description);
  if (description.length === 0) {
    errors.description = "Ajoutez au moins un paragraphe de description.";
  }

  const specs = parseSpecs(input.specs);
  if (specs.length < 2) errors.specs = "Renseignez au moins deux caractéristiques.";

  const colors = parseColors(input.colors);
  const shape = asString(input.shape) || "fridge";
  if (!VISUAL_SHAPES.has(shape)) errors.shape = "Illustration invalide.";

  const body = asString(input.body) || "#cdd6db";
  if (!HEX_RE.test(body)) errors.body = "Couleur de l'appareil au format #rrggbb.";

  const energyRaw = asString(input.energyClass);
  const energyClass =
    energyRaw && ENERGY_CLASSES.has(energyRaw) ? (energyRaw as EnergyClass) : undefined;
  if (energyRaw && !energyClass) errors.energyClass = "Classe énergétique inconnue.";

  const warranty = asString(input.warranty) || "Garantie 2 ans (conditions de démonstration)";

  const imageUrl = asString(input.imageUrl);
  if (imageUrl && !/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith("/")) {
    errors.imageUrl = "URL attendue : http(s)://… ou un chemin local /images/…";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors,
    value: {
      name,
      brandSlug,
      categorySlug,
      subcategory,
      price: price!,
      originalPrice,
      stock: stock!,
      shortDescription,
      description,
      specs,
      colors: colors.length
        ? colors
        : [{ name: "Inox", hex: body }],
      energyClass,
      warranty,
      featured: asBool(input.featured),
      bestseller: asBool(input.bestseller),
      isNew: asBool(input.isNew),
      shape: shape as VisualShape,
      body,
      imageUrl: imageUrl || undefined,
    },
  };
}

const BRAND_CODES: Record<string, string> = {
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

const CATEGORY_CODES: Record<string, string> = {
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

/** Builds a brand-new product record from validated input. */
export function createProductRecord(
  input: ProductInput,
  existing: Product[],
): Product {
  const now = new Date().toISOString();
  const baseSlug = slugify(input.name) || `appareil-${Date.now().toString(36)}`;
  let slug = baseSlug;
  let suffix = 2;
  while (existing.some((product) => product.slug === slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const keywords = Array.from(
    new Set(
      [
        ...input.name.split(/[\s,/]+/),
        ...input.specs.map((spec) => spec.label),
        input.subcategory,
        input.brandSlug,
        input.categorySlug,
        ...input.description.join(" ").split(/[\s,.]+/),
      ]
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 60);

  return {
    id: `p-${slug}`,
    slug,
    name: input.name,
    brandSlug: input.brandSlug,
    categorySlug: input.categorySlug,
    subcategory: input.subcategory,
    sku: `${BRAND_CODES[input.brandSlug] ?? "MT"}-${CATEGORY_CODES[input.categorySlug] ?? "XX"}-${String(
      9000 + existing.length,
    ).padStart(4, "0")}`,
    price: input.price,
    originalPrice: input.originalPrice,
    shortDescription: input.shortDescription,
    description: input.description,
    specs: input.specs,
    colors: input.colors,
    dimensions: { width: 60, height: 85, depth: 60, unit: "cm" },
    weightKg: 30,
    energyClass: input.energyClass,
    stock: input.stock,
    warranty: input.warranty,
    featured: input.featured,
    bestseller: input.bestseller,
    isNew: input.isNew,
    rating: 0,
    reviewCount: 0,
    tags: [],
    keywords,
    relatedIds: [],
    visual: { shape: input.shape, body: input.body },
    imageUrl: input.imageUrl,
    createdAt: now,
    updatedAt: now,
  };
}

/** Applies validated input onto an existing product (keeps id, slug, stats). */
export function applyProductUpdate(product: Product, input: ProductInput): Product {
  return {
    ...product,
    name: input.name,
    brandSlug: input.brandSlug,
    categorySlug: input.categorySlug,
    subcategory: input.subcategory,
    price: input.price,
    originalPrice: input.originalPrice,
    shortDescription: input.shortDescription,
    description: input.description,
    specs: input.specs,
    colors: input.colors,
    energyClass: input.energyClass,
    stock: input.stock,
    warranty: input.warranty,
    featured: input.featured,
    bestseller: input.bestseller,
    isNew: input.isNew,
    visual: { shape: input.shape, body: input.body },
    imageUrl: input.imageUrl,
    updatedAt: new Date().toISOString(),
    keywords: Array.from(
      new Set(
        [
          ...product.keywords,
          ...input.name.split(/[\s,/]+/),
          ...input.specs.map((spec) => spec.label),
          input.subcategory,
        ]
          .map((word) => word.trim().toLowerCase())
          .filter(Boolean),
      ),
    ).slice(0, 80),
  };
}
