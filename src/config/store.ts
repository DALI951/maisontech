import type { StoreSettings } from "@/lib/types";

/**
 * Default store configuration.
 *
 * The values below are seeded into the demo database and can be edited from
 * /admin/parametres. EVERY commercial claim here is a placeholder: shipping
 * prices, delivery times, warranty wording and payment options must be checked
 * against the real business before launch (see README "Before going live").
 */
export const DEFAULT_SETTINGS: StoreSettings = {
  brandName: "MaisonTech",
  brandTagline: "L'électroménager, choisi avec soin.",
  announcements: [
    "Livraison partout en Tunisie — offerte dès 1 500 DT d'achat",
    "Promotions de saison : jusqu'à -25 % sur une sélection d'appareils",
    "Service client : +216 70 000 000 · Lun – Sam, 9h – 18h30",
  ],
  supportPhone: "+216 70 000 000",
  supportEmail: "contact@maisontech.example",
  supportHours: "Lun – Sam, 9h00 – 18h30",
  storeAddress: "12, avenue du Showroom — Tunis 1000 (adresse fictive)",
  shipping: {
    flatRate: 25,
    freeShippingThreshold: 1500,
    expressRate: 45,
    estimatedDays: "2 à 5 jours ouvrés",
    returnsDays: 7,
  },
  payments: {
    cashOnDelivery: true,
    bankTransfer: true,
    // Online card payment stays off until a real provider is wired server-side.
    onlinePayment: false,
  },
  trustBadges: [
    {
      title: "Livraison en Tunisie",
      description: "Expédition vers les 24 gouvernorats, suivi par téléphone.",
      icon: "truck",
    },
    {
      title: "Paiement à la livraison",
      description: "Réglez en espèces à la réception, si l'option est active.",
      icon: "wallet",
    },
    {
      title: "Garantie constructeur",
      description: "2 ans sur la majorité des appareils (conditions illustratives).",
      icon: "shield",
    },
    {
      title: "Service client",
      description: "Une équipe joignable du lundi au samedi, 9h – 18h30.",
      icon: "headset",
    },
  ],
  newsletter: {
    heading: "Les bonnes affaires, sans le bruit",
    description:
      "Une fois par mois : les nouveautés, les promotions réelles et un guide d'achat court. Pas de spam.",
    note: "Démonstration : l'inscription est enregistrée localement, aucun e-mail n'est envoyé.",
  },
  hero: [
    {
      id: "hero-froid",
      eyebrow: "Froid & fraîcheur",
      title: "La cuisine qui garde",
      titleAccent: "tout frais",
      description:
        "Combinés NoFrost, side-by-side et congélateurs : le froid utile, sans givre à gratter ni bruit permanent.",
      ctaLabel: "Découvrir les réfrigérateurs",
      ctaHref: "/categorie/refrigerateurs",
      categorySlug: "refrigerateurs",
      productSlug: "refrigerateur-combine-nofrost-340-l",
      discountLabel: "-14 % sur le combiné 340 L",
      expiresAt: "2026-11-15",
      theme: "light",
    },
    {
      id: "hero-clim",
      eyebrow: "Confort d'été",
      title: "Un intérieur à",
      titleAccent: "22 °C",
      description:
        "Climatiseurs inverter silencieux, dimensionnés pour chaque pièce. Livraison et mise en service à organiser avec le revendeur.",
      ctaLabel: "Voir les climatiseurs",
      ctaHref: "/categorie/climatiseurs",
      categorySlug: "climatiseurs",
      productSlug: "climatiseur-inverter-12-000-btu",
      discountLabel: "Offre de saison : -15 %",
      expiresAt: "2026-11-30",
      theme: "navy",
    },
  ],
  featuredCategorySlugs: [
    "refrigerateurs",
    "lave-linge",
    "lave-vaisselle",
    "cuisinieres-four",
    "micro-ondes",
    "climatiseurs",
    "televiseurs",
    "aspirateurs",
    "petits-electromenagers",
    "machines-a-cafe",
    "mixeurs-robots",
    "chauffage-ventilation",
  ],
  demoBanner: true,
};

/** Demo discount codes — test data, never to be used as real promotions. */
export const DEMO_DISCOUNTS = [
  {
    id: "dc-bienvenue10",
    code: "BIENVENUE10",
    description: "-10 % sur votre première commande dès 500 DT",
    type: "percent" as const,
    value: 10,
    minOrder: 500,
    expiresAt: null,
    maxUses: null,
    usedCount: 12,
    active: true,
  },
  {
    id: "dc-livraison",
    code: "LIVRAISON",
    description: "Livraison offerte dès 800 DT d'achat",
    type: "free_shipping" as const,
    value: 0,
    minOrder: 800,
    expiresAt: null,
    maxUses: null,
    usedCount: 34,
    active: true,
  },
  {
    id: "dc-maison50",
    code: "MAISON50",
    description: "50 DT de remise dès 1 000 DT d'achat",
    type: "fixed" as const,
    value: 50,
    minOrder: 1000,
    expiresAt: "2026-12-31",
    maxUses: 200,
    usedCount: 57,
    active: true,
  },
  {
    id: "dc-hiver15",
    code: "HIVER15",
    description: "-15 % sur le chauffage et la ventilation",
    type: "percent" as const,
    value: 15,
    minOrder: 300,
    expiresAt: "2026-11-30",
    maxUses: 100,
    usedCount: 8,
    active: true,
  },
  {
    id: "dc-expire",
    code: "PROMO2025",
    description: "Ancienne promotion de démonstration (expirée)",
    type: "percent" as const,
    value: 20,
    minOrder: 0,
    expiresAt: "2025-12-31",
    maxUses: null,
    usedCount: 91,
    active: true,
  },
  {
    id: "dc-plafonne",
    code: "LIMITE1",
    description: "Code de démonstration déjà épuisé",
    type: "fixed" as const,
    value: 100,
    minOrder: 0,
    expiresAt: null,
    maxUses: 1,
    usedCount: 1,
    active: true,
  },
];
