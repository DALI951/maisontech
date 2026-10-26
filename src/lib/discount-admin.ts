import type { DiscountCode } from "./types";

/**
 * Discount validation shared by the API routes and the admin form.
 * Kept out of the route module so the client bundle never pulls `db`/`fs`.
 */

const TYPES = new Set(["percent", "fixed", "free_shipping"]);

export type DiscountDraft = Omit<DiscountCode, "id" | "usedCount">;

export function validateDiscount(raw: unknown): {
  value?: DiscountDraft;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const input = (raw ?? {}) as Record<string, unknown>;

  const code = typeof input.code === "string" ? input.code.trim().toUpperCase() : "";
  if (!/^[A-Z0-9][A-Z0-9-]{2,19}$/.test(code)) {
    errors.code = "Code de 3 à 20 caractères : lettres, chiffres et tirets.";
  }

  const description = typeof input.description === "string" ? input.description.trim() : "";
  if (description.length < 5) errors.description = "Décrivez l'offre en quelques mots.";

  const type = typeof input.type === "string" ? input.type : "";
  if (!TYPES.has(type)) errors.type = "Type d'offre inconnu.";

  const value = Number(input.value ?? 0);
  if (!Number.isFinite(value) || value < 0) errors.value = "Valeur invalide.";
  else if (type === "percent" && (value <= 0 || value > 90)) {
    errors.value = "Le pourcentage doit être compris entre 1 et 90.";
  } else if (type === "fixed" && value <= 0) {
    errors.value = "Le montant de la remise doit être supérieur à 0.";
  }

  const minOrder = Number(input.minOrder ?? 0);
  if (!Number.isFinite(minOrder) || minOrder < 0) errors.minOrder = "Montant minimum invalide.";

  let expiresAt: string | null = null;
  if (typeof input.expiresAt === "string" && input.expiresAt.trim()) {
    const parsed = new Date(input.expiresAt);
    if (Number.isNaN(parsed.getTime())) errors.expiresAt = "Date de fin invalide.";
    else expiresAt = parsed.toISOString();
  }

  let maxUses: number | null = null;
  if (input.maxUses !== null && input.maxUses !== undefined && String(input.maxUses).trim() !== "") {
    const parsed = Number(input.maxUses);
    if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
      errors.maxUses = "Nombre d'utilisations invalide.";
    } else {
      maxUses = parsed;
    }
  }

  const active = input.active === undefined ? true : Boolean(input.active);

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors,
    value: {
      code,
      description,
      type: type as DiscountCode["type"],
      value,
      minOrder,
      expiresAt,
      maxUses,
      active,
    },
  };
}
