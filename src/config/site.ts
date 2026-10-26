/**
 * Storefront identity. Everything customer-facing that marketing may want to
 * change lives here (or in the admin "Paramètres" screen for the parts that are
 * stored in the demo database).
 *
 * ALL business details below are FICTIONAL placeholders. Replace them before
 * launch — see README.md ("Before going live").
 */

export const SITE = {
  name: "MaisonTech",
  legalName: "MaisonTech SARL (dénomination fictive)",
  tagline: "L'électroménager, choisi avec soin.",
  description:
    "Réfrigérateurs, lave-linge, cuisinières, climatiseurs et petit électroménager : une sélection d'appareils fiables, livrés partout en Tunisie.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "fr_TN",
  currency: "TND",
  currencyLabel: "DT",
  country: "Tunisie",
} as const;

/** Fictional contact details — must be replaced with the real shop's details. */
export const CONTACT = {
  phone: "+216 70 000 000",
  phoneHref: "tel:+21670000000",
  whatsapp: "+216 20 000 000",
  email: "contact@maisontech.example",
  ordersEmail: "commandes@maisontech.example",
  address: "12, avenue du Showroom (adresse fictive)",
  city: "Tunis",
  postalCode: "1000",
  country: "Tunisie",
  hours: "Lun – Sam, 9h00 – 18h30",
  mapNote: "Adresse de démonstration — aucune boutique réelle à cette adresse.",
} as const;

export const SOCIAL = [
  { label: "Facebook", href: "https://facebook.com", handle: "@maisontech" },
  { label: "Instagram", href: "https://instagram.com", handle: "@maisontech" },
  { label: "TikTok", href: "https://tiktok.com", handle: "@maisontech" },
] as const;

/** Legal identifiers are intentionally placeholders, not invented facts. */
export const LEGAL = {
  rc: "RC : à compléter (numéro fictif)",
  matricule: "Matricule fiscal : à compléter",
  capital: "Capital social : à compléter",
  publisher: "Directeur de la publication : à compléter",
  host: "Hébergeur : à compléter avant mise en ligne",
  lastUpdated: "26 octobre 2026",
} as const;

export const GOVERNORATES = [
  "Ariana",
  "Béja",
  "Ben Arous",
  "Bizerte",
  "Gabès",
  "Gafsa",
  "Jendouba",
  "Kairouan",
  "Kasserine",
  "Kébili",
  "Le Kef",
  "Mahdia",
  "La Manouba",
  "Médenine",
  "Monastir",
  "Nabeul",
  "Sfax",
  "Sidi Bouzid",
  "Siliana",
  "Sousse",
  "Tataouine",
  "Tozeur",
  "Tunis",
  "Zaghouan",
] as const;
