import { slugify } from "./slug";

/** Category validation shared by the API routes and the admin form. */
export interface CategoryInput {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  sortOrder: number;
  featured: boolean;
}

export function validateCategory(raw: unknown): {
  value?: CategoryInput;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const input = (raw ?? {}) as Record<string, unknown>;
  const asString = (key: string) =>
    typeof input[key] === "string" ? (input[key] as string).trim() : "";

  const name = asString("name");
  if (name.length < 3) errors.name = "Le nom doit contenir au moins 3 caractères.";
  else if (name.length > 80) errors.name = "Nom limité à 80 caractères.";

  const shortName = asString("shortName") || name;
  if (shortName.length > 40) errors.shortName = "Nom court limité à 40 caractères.";

  const tagline = asString("tagline");
  if (tagline.length < 5) errors.tagline = "Ajoutez une accroche courte (5 caractères minimum).";

  const description = asString("description");
  if (description.length < 20) {
    errors.description = "La description doit faire au moins 20 caractères.";
  }

  const sortOrder = Number(input.sortOrder ?? 0);
  if (!Number.isFinite(sortOrder) || sortOrder < 0 || sortOrder > 999) {
    errors.sortOrder = "Ordre entre 0 et 999.";
  }

  if (!slugify(name)) errors.name = "Ce nom ne produit pas d'URL valide.";

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors,
    value: {
      name,
      shortName,
      tagline,
      description,
      sortOrder: Math.round(sortOrder),
      featured: Boolean(input.featured),
    },
  };
}
