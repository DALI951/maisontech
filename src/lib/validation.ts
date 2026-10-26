import type { PaymentMethod } from "./types";

export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/**
 * Tunisian numbers: optional +216 prefix, then 8 digits starting with 2, 4, 5,
 * 7 or 9. Spaces, dots and dashes are tolerated in input.
 */
export function isValidTunisianPhone(value: string): boolean {
  const digits = value.replace(/[\s.\-()]/g, "");
  const withoutPrefix = digits.startsWith("+216")
    ? digits.slice(4)
    : digits.startsWith("00216")
      ? digits.slice(5)
      : digits;
  return /^[24579]\d{7}$/.test(withoutPrefix);
}

export function isValidPassword(value: string): boolean {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

export interface CheckoutInput {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  governorate: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

export function validateCheckout(input: Partial<CheckoutInput>): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.fullName || input.fullName.trim().length < 3) {
    errors.fullName = "Indiquez votre nom complet (3 caractères minimum).";
  }
  if (!input.email || !input.email.trim()) {
    errors.email = "Une adresse e-mail est nécessaire pour le suivi de commande.";
  } else if (!isValidEmail(input.email)) {
    errors.email = "Cette adresse e-mail ne semble pas valide (ex. nom@domaine.tn).";
  }
  if (!input.phone || !input.phone.trim()) {
    errors.phone = "Un numéro de téléphone est requis pour la livraison.";
  } else if (!isValidTunisianPhone(input.phone)) {
    errors.phone = "Numéro tunisien attendu : 8 chiffres, par exemple 20 123 456.";
  }
  if (!input.address || input.address.trim().length < 8) {
    errors.address = "Précisez l'adresse : rue, numéro et étage si besoin.";
  }
  if (!input.city || input.city.trim().length < 2) {
    errors.city = "Indiquez la ville ou la localité.";
  }
  if (!input.governorate || !input.governorate.trim()) {
    errors.governorate = "Choisissez un gouvernorat de livraison.";
  }
  if (input.notes && input.notes.length > 500) {
    errors.notes = "Les instructions sont limitées à 500 caractères.";
  }
  if (!input.paymentMethod) {
    errors.paymentMethod = "Sélectionnez un mode de paiement.";
  }

  return errors;
}

export function validateRegister(input: {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.fullName || input.fullName.trim().length < 3) {
    errors.fullName = "Indiquez votre nom complet.";
  }
  if (!input.email || !isValidEmail(input.email)) {
    errors.email = "Adresse e-mail invalide.";
  }
  if (!input.password || !isValidPassword(input.password)) {
    errors.password = "8 caractères minimum, avec au moins une lettre et un chiffre.";
  }
  if (input.password !== input.confirm) {
    errors.confirm = "Les deux mots de passe ne correspondent pas.";
  }
  return errors;
}

export function validateLogin(input: { email?: string; password?: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.email || !isValidEmail(input.email)) errors.email = "Adresse e-mail invalide.";
  if (!input.password) errors.password = "Saisissez votre mot de passe.";
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function validateAddress(input: {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  governorate?: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.fullName || input.fullName.trim().length < 3) errors.fullName = "Nom complet requis.";
  if (!input.phone || !isValidTunisianPhone(input.phone)) errors.phone = "Numéro tunisien invalide.";
  if (!input.address || input.address.trim().length < 8) errors.address = "Adresse trop courte.";
  if (!input.city || input.city.trim().length < 2) errors.city = "Ville requise.";
  if (!input.governorate) errors.governorate = "Gouvernorat requis.";
  return errors;
}
