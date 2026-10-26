import type { Brand } from "@/lib/types";

/**
 * DEMO DATA — all ten brands are fictional. Any resemblance to a real
 * manufacturer is unintended, and no real specifications are claimed.
 */
export const brands: Brand[] = [
  {
    id: "brand-novacool",
    slug: "novacool",
    name: "Novacool",
    tagline: "Le froid, sans compromis",
    origin: "Marque fictive",
    description:
      "Spécialiste du froid : combinés NoFrost, side-by-side et congélateurs. Une gamme imaginée pour la démonstration MaisonTech.",
    accent: "#2f6f9e",
  },
  {
    id: "brand-aqualis",
    slug: "aqualis",
    name: "Aqualis",
    tagline: "L'eau, le linge, la vaisselle",
    origin: "Marque fictive",
    description:
      "Lave-linge et lave-vaisselle. Marque de démonstration utilisée pour illustrer l'organisation du catalogue par spécialité.",
    accent: "#147f8a",
  },
  {
    id: "brand-thermia",
    slug: "thermia",
    name: "Thermia",
    tagline: "La chaleur juste",
    origin: "Marque fictive",
    description:
      "Cuisinières, fours, micro-ondes et chauffage. Marque fictive créée pour la vitrine de démonstration.",
    accent: "#b4532a",
  },
  {
    id: "brand-ventis",
    slug: "ventis",
    name: "Ventis",
    tagline: "L'air en mouvement",
    origin: "Marque fictive",
    description:
      "Climatiseurs et ventilateurs. Spécifications et prix de démonstration uniquement.",
    accent: "#2f7a6b",
  },
  {
    id: "brand-lumen",
    slug: "lumen",
    name: "Lumen",
    tagline: "Voir plus loin",
    origin: "Marque fictive",
    description:
      "Téléviseurs LED, QLED et OLED. Marque de démonstration, sans lien avec un fabricant réel.",
    accent: "#4b4f9e",
  },
  {
    id: "brand-kuisto",
    slug: "kuisto",
    name: "Kuisto",
    tagline: "Petit format, grand usage",
    origin: "Marque fictive",
    description:
      "Petit électroménager et accessoires de cuisine. Contenu entièrement fictif.",
    accent: "#96602a",
  },
  {
    id: "brand-brewella",
    slug: "brewella",
    name: "Brewella",
    tagline: "Chaque tasse compte",
    origin: "Marque fictive",
    description:
      "Machines à café automatiques, expresso et cafetières. Marque de démonstration.",
    accent: "#7a4b2e",
  },
  {
    id: "brand-vortexa",
    slug: "vortexa",
    name: "Vortexa",
    tagline: "Préparer, mixer, réussir",
    origin: "Marque fictive",
    description:
      "Robots pâtissiers, blenders et mixeurs. Marque fictive utilisée pour la démonstration.",
    accent: "#a33b5a",
  },
  {
    id: "brand-aeris",
    slug: "aeris",
    name: "Aeris",
    tagline: "Respirer propre",
    origin: "Marque fictive",
    description:
      "Aspirateurs traîneaux, balais et robots. Spécifications de démonstration.",
    accent: "#3d6b57",
  },
  {
    id: "brand-saphir",
    slug: "saphir",
    name: "Saphir",
    tagline: "Le haut de gamme, simplement",
    origin: "Marque fictive",
    description:
      "Marque premium fictive, présente dans plusieurs catégories pour illustrer la comparaison entre gammes.",
    accent: "#1c3b6e",
  },
];

export const brandBySlug = (slug: string) => brands.find((b) => b.slug === slug);
