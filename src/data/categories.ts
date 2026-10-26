import type { Category } from "@/lib/types";

/**
 * DEMO DATA — the 12 categories requested for the storefront.
 * Copy is intentionally generic so it can be replaced without touching code.
 */
export const categories: Category[] = [
  {
    id: "cat-froid",
    slug: "refrigerateurs",
    name: "Réfrigérateurs et congélateurs",
    shortName: "Réfrigérateurs",
    tagline: "Gardez le frais, plus longtemps",
    description:
      "Combinés NoFrost, side-by-side, réfrigérateurs compacts et congélateurs : des appareils pensés pour la cuisine tunisienne, du studio à la grande famille.",
    sortOrder: 1,
    featured: true,
  },
  {
    id: "cat-lavage",
    slug: "lave-linge",
    name: "Lave-linge",
    shortName: "Lave-linge",
    tagline: "Du linge impeccable, sans effort",
    description:
      "Lave-linge frontaux et top, lavantes-séchantes et modèles compacts. Comparez la capacité, la classe énergétique et le niveau sonore avant de choisir.",
    sortOrder: 2,
    featured: true,
  },
  {
    id: "cat-vaisselle",
    slug: "lave-vaisselle",
    name: "Lave-vaisselle",
    shortName: "Lave-vaisselle",
    tagline: "La vaisselle en fin de repas, pas en fin de soirée",
    description:
      "Du compact 6 couverts au 15 couverts silencieux : de quoi équiper un studio comme une grande cuisine familiale.",
    sortOrder: 3,
    featured: true,
  },
  {
    id: "cat-cuisson",
    slug: "cuisinieres-four",
    name: "Cuisinières et fours",
    shortName: "Cuisinières",
    tagline: "La cuisson, au degré près",
    description:
      "Cuisinières à gaz, vitrocéramiques et à induction, fours encastrables multifonction et tables de cuisson.",
    sortOrder: 4,
    featured: true,
  },
  {
    id: "cat-micro-ondes",
    slug: "micro-ondes",
    name: "Micro-ondes",
    shortName: "Micro-ondes",
    tagline: "Rapide, simple, essentiel",
    description:
      "Micro-ondes solo, avec grill ou combinés, posables ou encastrables, de 20 à 30 litres.",
    sortOrder: 5,
    featured: true,
  },
  {
    id: "cat-clim",
    slug: "climatiseurs",
    name: "Climatiseurs",
    shortName: "Climatiseurs",
    tagline: "Un été à 22 °C",
    description:
      "Splits inverter de 9 000 à 24 000 BTU, réversibles chaud/froid et climatiseurs mobiles sans installation.",
    sortOrder: 6,
    featured: true,
  },
  {
    id: "cat-tv",
    slug: "televiseurs",
    name: "Téléviseurs",
    shortName: "Téléviseurs",
    tagline: "L'image qui prend la pièce",
    description:
      "TV LED, QLED et OLED de 32 à 65 pouces, avec les fonctions connectées utiles au quotidien.",
    sortOrder: 7,
    featured: true,
  },
  {
    id: "cat-aspirateur",
    slug: "aspirateurs",
    name: "Aspirateurs",
    shortName: "Aspirateurs",
    tagline: "Maison nette en dix minutes",
    description:
      "Aspirateurs traîneaux, balais sans fil, robots et modèles portables pour les petites surfaces.",
    sortOrder: 8,
    featured: true,
  },
  {
    id: "cat-petit-electro",
    slug: "petits-electromenagers",
    name: "Petits électroménagers",
    shortName: "Petit électro",
    tagline: "Les gestes du quotidien",
    description:
      "Bouilloires, grille-pain, friteuses sans huile et fers à repasser : les appareils qu'on utilise tous les jours.",
    sortOrder: 9,
    featured: true,
  },
  {
    id: "cat-cafe",
    slug: "machines-a-cafe",
    name: "Machines à café",
    shortName: "Machines à café",
    tagline: "Le café comme au comptoir",
    description:
      "Machines automatiques avec broyeur, expresso à capsules ou manuelles, et cafetières filtre programmables.",
    sortOrder: 10,
    featured: true,
  },
  {
    id: "cat-preparation",
    slug: "mixeurs-robots",
    name: "Mixeurs et robots de cuisine",
    shortName: "Mixeurs & robots",
    tagline: "Préparer plus, en moins de temps",
    description:
      "Robots pâtissiers, blenders, robots multifonction, mixeurs plongeants et hachoirs.",
    sortOrder: 11,
    featured: true,
  },
  {
    id: "cat-chauffage",
    slug: "chauffage-ventilation",
    name: "Chauffage et ventilation",
    shortName: "Chauffage",
    tagline: "Le bon confort, toute l'année",
    description:
      "Radiateurs à bain d'huile, chauffages céramiques, convecteurs et ventilateurs pour chaque saison.",
    sortOrder: 12,
    featured: true,
  },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
