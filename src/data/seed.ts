import "server-only";
import type { Database, Order, OrderItem, Review, User } from "@/lib/types";
import { addMoney, multiplyMoney, percentOf, toMillimes, fromMillimes } from "@/lib/money";
import { DEFAULT_SETTINGS, DEMO_DISCOUNTS } from "@/config/store";
import { categories } from "./categories";
import { brands } from "./brands";
import { seedProducts } from "./products";
import { GOVERNORATES } from "@/config/site";

/**
 * Builds the initial demo database.
 *
 * This file is server-only. It ships demo customers, demo orders and demo
 * reviews so every screen looks complete. Nothing here describes real people
 * or real transactions.
 */

export const SEED_VERSION = 3;

/** Published demo credentials — displayed on the login page on purpose. */
export const DEMO_ACCOUNTS = [
  {
    email: "client@maisontech.example",
    password: "Client!2345",
    role: "customer" as const,
    fullName: "Sonia Ben Amor",
  },
  {
    email: "admin@maisontech.example",
    password: "Admin!2345",
    role: "admin" as const,
    fullName: "Admin MaisonTech",
  },
];

/** Deterministic PRNG so the demo data never changes between builds. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AUTHORS = [
  "Sonia B.",
  "Karim T.",
  "Ines M.",
  "Hamza R.",
  "Nadia L.",
  "Youssef A.",
  "Mariem K.",
  "Walid S.",
  "Rim H.",
  "Anis D.",
  "Leila G.",
  "Bilel N.",
];

const CITIES: Record<string, string> = {
  Tunis: "Tunis",
  Ariana: "Ariana",
  "Ben Arous": "Ben Arous",
  "La Manouba": "Manouba",
  Sousse: "Sousse",
  Sfax: "Sfax",
  Nabeul: "Nabeul",
  Bizerte: "Bizerte",
  Monastir: "Monastir",
  Mahdia: "Mahdia",
};

const REVIEW_TEMPLATES: Record<string, { title: string; body: string; stars: number }[]> = {
  refrigerateurs: [
    {
      title: "Silencieux et bien pensé",
      body: "Les clayettes se nettoient facilement et le froid est vraiment homogène. On n'entend presque rien depuis le salon.",
      stars: 5,
    },
    {
      title: "Bon volume pour la famille",
      body: "Les courses de la semaine rentrent sans jouer au tetris. Le congélateur est un peu juste pour les glaces, mais rien de gênant.",
      stars: 4,
    },
    {
      title: "Livraison soignée",
      body: "Appareil arrivé protégé, installé et mis en température par le livreur. Aucun coup sur l'inox.",
      stars: 5,
    },
  ],
  "lave-linge": [
    {
      title: "Cycle court très utile",
      body: "Le programme 30 minutes dépanne vraiment avec deux enfants. L'essorage laisse le linge presque sec.",
      stars: 5,
    },
    {
      title: "Discret à l'essorage",
      body: "Je lance les machines le soir sans réveiller personne. Le hublot s'ouvre grand, c'est pratique pour les couettes.",
      stars: 5,
    },
    {
      title: "Bon rapport qualité prix",
      body: "Rien d'extraordinaire côté finitions mais il fait le travail depuis deux mois sans souci.",
      stars: 4,
    },
  ],
  "lave-vaisselle": [
    {
      title: "La vaisselle sèche vraiment",
      body: "Avec l'ouverture automatique de porte, plus besoin d'essuyer les verres. Très content du résultat.",
      stars: 5,
    },
    {
      title: "Grand panier",
      body: "Les grandes plaques rentrent au fond. Un peu long sur le cycle intensif, mais la vaisselle sort impeccable.",
      stars: 4,
    },
    {
      title: "Silencieux",
      body: "On l'entend à peine depuis la cuisine. Le panier à couverts est bien conçu.",
      stars: 5,
    },
  ],
  "cuisinieres-four": [
    {
      title: "Le four chauffe juste",
      body: "Les gâteaux lèvent régulièrement, la chaleur est homogène. La sécurité sur les feux rassure avec les enfants.",
      stars: 5,
    },
    {
      title: "Induction très réactive",
      body: "L'eau bout en quelques minutes et le nettoyage de la plaque prend dix secondes. Il faut prévoir des casseroles compatibles.",
      stars: 5,
    },
    {
      title: "Bon four, notice perfectible",
      body: "L'appareil est solide et simple. La notice en français est courte, j'ai cherché un peu pour la pyrolyse.",
      stars: 4,
    },
  ],
  "micro-ondes": [
    {
      title: "Fait exactement le travail",
      body: "Réchauffe vite, les commandes sont simples. Le plateau est assez grand pour une assiette à bord haut.",
      stars: 5,
    },
    {
      title: "Compact et pratique",
      body: "Il tient sur le plan de travail sans gêner. La molette mécanique évite de chercher dans les menus.",
      stars: 4,
    },
    {
      title: "Gril efficace",
      body: "Les gratins dorent correctement en mode combiné. La cavité se nettoie à l'éponge.",
      stars: 4,
    },
  ],
  climatiseurs: [
    {
      title: "Refroidit très vite",
      body: "La pièce passe de 32 à 24 °C en une dizaine de minutes. En mode nuit, on n'entend presque rien.",
      stars: 5,
    },
    {
      title: "Consommation raisonnable",
      body: "L'inverter se ressent sur la facture par rapport à l'ancien appareil on/off. Installation faite proprement.",
      stars: 5,
    },
    {
      title: "Bon appareil, prévoir la pose",
      body: "Le split est de bonne qualité mais l'installation demande un frigoriste. Budgétez-la à part.",
      stars: 4,
    },
  ],
  televiseurs: [
    {
      title: "Image très propre",
      body: "Les noirs sont profonds et les couleurs naturelles après quelques réglages. Le son reste moyen, une barre de son aide.",
      stars: 5,
    },
    {
      title: "Bon recul pour 55 pouces",
      body: "À 2,5 m, c'est la bonne taille. Le pied central laisse de la place sur le meuble.",
      stars: 5,
    },
    {
      title: "Simple à installer",
      body: "Montage du pied en cinq minutes et détection automatique des sources. Rien à redire pour le prix.",
      stars: 4,
    },
  ],
  aspirateurs: [
    {
      title: "Aspiration franche",
      body: "Le bac se vide sans toucher la poussière et l'aspiration n'a pas baissé après un mois. Un peu bruyant en turbo.",
      stars: 4,
    },
    {
      title: "Parfait pour les escaliers",
      body: "Léger, autonomie suffisante pour tout l'étage. La brosse ramasse bien les cheveux.",
      stars: 5,
    },
    {
      title: "Le robot fait le quotidien",
      body: "Il passe tous les matins sous les meubles. Il faut relever les câbles, sinon il les avale.",
      stars: 4,
    },
  ],
  "petits-electromenagers": [
    {
      title: "Chauffe très vite",
      body: "L'eau bout en moins de trois minutes et l'arrêt automatique fonctionne. Le corps en inox est solide.",
      stars: 5,
    },
    {
      title: "Les frites sans culpabilité",
      body: "Résultat croustillant avec une cuillère d'huile. Le panier passe au lave-vaisselle, c'est un vrai plus.",
      stars: 5,
    },
    {
      title: "Correct pour le prix",
      body: "Le dorage est un peu irrégulier selon la tranche de pain, mais l'appareil fait le job chaque matin.",
      stars: 3,
    },
  ],
  "machines-a-cafe": [
    {
      title: "Un vrai expresso",
      body: "La crema est là et le réglage de mouture change vraiment le goût. Le réservoir se remplit facilement.",
      stars: 5,
    },
    {
      title: "Pratique au quotidien",
      body: "Une capsule, un bouton, 25 secondes. Exactement ce qu'il me fallait le matin.",
      stars: 5,
    },
    {
      title: "Bon café, entretien à suivre",
      body: "Le détartrage est à faire régulièrement si l'eau est calcaire. Sinon le résultat est constant.",
      stars: 4,
    },
  ],
  "mixeurs-robots": [
    {
      title: "Pétrit sans forcer",
      body: "La pâte à pain ne fait pas vibrer l'appareil. Le bol en inox est large et stable.",
      stars: 5,
    },
    {
      title: "Smoothies impeccables",
      body: "Les fruits congelés passent sans morceaux. Le bol en verre est lourd mais ne garde pas les odeurs.",
      stars: 4,
    },
    {
      title: "Gain de temps réel",
      body: "Hacher oignons et persil prend maintenant dix secondes. Le bol passe au lave-vaisselle.",
      stars: 5,
    },
  ],
  "chauffage-ventilation": [
    {
      title: "Chaleur douce",
      body: "Il chauffe la chambre sans bruit et sans dessécher l'air. La chaleur dure un moment après l'arrêt.",
      stars: 5,
    },
    {
      title: "Rapide et efficace",
      body: "La salle de bain est chaude en deux minutes. L'oscillation évite d'avoir trop chaud d'un côté.",
      stars: 4,
    },
    {
      title: "Silencieux la nuit",
      body: "Le mode nuit est vraiment utilisable pour dormir. La minuterie évite de le laisser tourner.",
      stars: 5,
    },
  ],
};

function buildReviews(): Review[] {
  const random = mulberry32(20261026);
  const reviews: Review[] = [];
  seedProducts.forEach((product, productIndex) => {
    const templates = REVIEW_TEMPLATES[product.categorySlug] ?? REVIEW_TEMPLATES["petits-electromenagers"];
    const count = 2 + (productIndex % 2);
    for (let i = 0; i < count; i += 1) {
      const template = templates[(productIndex + i) % templates.length];
      const daysAgo = 6 + Math.floor(random() * 150);
      const date = new Date(Date.UTC(2026, 9, 26) - daysAgo * 86_400_000);
      reviews.push({
        id: `rev-${product.slug}-${i + 1}`,
        productSlug: product.slug,
        author: AUTHORS[(productIndex * 3 + i) % AUTHORS.length],
        city: Object.values(CITIES)[(productIndex + i) % Object.values(CITIES).length],
        rating: Math.min(5, Math.max(3, template.stars - (i === 2 ? 1 : 0))),
        date: date.toISOString().slice(0, 10),
        title: template.title,
        body: template.body,
      });
    }
  });
  return reviews;
}

const DEMO_CUSTOMERS = [
  { fullName: "Sonia Ben Amor", email: "client@maisontech.example", city: "La Marsa", governorate: "Tunis" },
  { fullName: "Karim Trabelsi", email: "karim.trabelsi@example.tn", city: "Sfax", governorate: "Sfax" },
  { fullName: "Ines Mzoughi", email: "ines.mzoughi@example.tn", city: "Sousse", governorate: "Sousse" },
  { fullName: "Hamza Riahi", email: "hamza.riahi@example.tn", city: "Ben Arous", governorate: "Ben Arous" },
  { fullName: "Nadia Louati", email: "nadia.louati@example.tn", city: "Nabeul", governorate: "Nabeul" },
  { fullName: "Youssef Ayari", email: "youssef.ayari@example.tn", city: "Bizerte", governorate: "Bizerte" },
];

const ORDER_STATUSES: Order["status"][] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "delivered",
  "delivered",
  "cancelled",
];

function roundToMillimes(value: number): number {
  return fromMillimes(toMillimes(value));
}

function buildOrders(): Order[] {
  const random = mulberry32(951_951);
  const orders: Order[] = [];
  const now = Date.UTC(2026, 9, 26, 9, 30);

  for (let i = 0; i < 34; i += 1) {
    const daysAgo = Math.floor(random() * 96);
    const createdAt = new Date(now - daysAgo * 86_400_000 - Math.floor(random() * 8) * 3_600_000);
    const customer = DEMO_CUSTOMERS[i % DEMO_CUSTOMERS.length];
    const itemCount = 1 + Math.floor(random() * 3);
    const chosen = new Set<number>();
    const items: OrderItem[] = [];

    for (let k = 0; k < itemCount; k += 1) {
      let index = Math.floor(random() * seedProducts.length);
      let guard = 0;
      while (chosen.has(index) && guard < 40) {
        index = (index + 7) % seedProducts.length;
        guard += 1;
      }
      chosen.add(index);
      const product = seedProducts[index];
      const quantity = product.price > 1500 ? 1 : 1 + Math.floor(random() * 2);
      items.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brandSlug: product.brandSlug,
        quantity,
        unitPrice: product.price,
        lineTotal: multiplyMoney(product.price, quantity),
      });
    }

    const subtotal = roundToMillimes(addMoney(...items.map((item) => item.lineTotal)));
    let shipping = DEFAULT_SETTINGS.shipping.flatRate;
    if (subtotal >= DEFAULT_SETTINGS.shipping.freeShippingThreshold) shipping = 0;
    let discount = 0;
    let discountCode: string | undefined;
    if (subtotal >= 1000 && random() > 0.55) {
      discountCode = "MAISON50";
      discount = percentOf(subtotal, 0) + 50;
    } else if (random() > 0.7) {
      discountCode = "BIENVENUE10";
      discount = percentOf(subtotal, 10);
    }
    const total = roundToMillimes(Math.max(0, addMoney(subtotal, shipping, -discount)));

    const status =
      daysAgo > 21
        ? random() > 0.12
          ? "delivered"
          : "cancelled"
        : daysAgo > 10
          ? "shipped"
          : daysAgo > 5
            ? "preparing"
            : daysAgo > 2
              ? "confirmed"
              : ORDER_STATUSES[i % 2 === 0 ? 0 : 1];

    orders.push({
      id: `ord-${1000 + i}`,
      reference: `MT-${String(2600 + i)}`,
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + 86_400_000).toISOString(),
      status,
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        phone: `+216 ${20 + (i % 9)} ${String(100 + i).padStart(3, "0")} ${String(400 + i).padStart(3, "0")}`,
        address: `${12 + i}, rue de la Démonstration`,
        city: customer.city,
        governorate: customer.governorate || GOVERNORATES[i % GOVERNORATES.length],
        notes: i % 5 === 0 ? "Appeler avant la livraison, merci." : undefined,
      },
      items,
      subtotal,
      shipping,
      discount,
      discountCode,
      total,
      paymentMethod: i % 7 === 0 ? "bank_transfer" : "cod",
      simulated: true,
      userId: i % 6 === 0 ? "user-demo-client" : undefined,
    });
  }

  return orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createSeedDatabase(hash: (password: string) => string): Database {
  const customers: User[] = DEMO_CUSTOMERS.map((customer, index) => ({
    id: index === 0 ? "user-demo-client" : `user-demo-${index + 1}`,
    fullName: customer.fullName,
    email: customer.email,
    passwordHash: hash(index === 0 ? "Client!2345" : `Demo!${2000 + index}`),
    role: "customer",
    createdAt: new Date(Date.UTC(2026, 6, 10 + index)).toISOString(),
    addresses:
      index === 0
        ? [
            {
              id: "addr-demo-1",
              label: "Maison",
              fullName: customer.fullName,
              phone: "+216 20 000 111",
              address: "8, rue des Jasmins",
              city: "La Marsa",
              governorate: "Tunis",
              isDefault: true,
            },
            {
              id: "addr-demo-2",
              label: "Bureau",
              fullName: customer.fullName,
              phone: "+216 20 000 111",
              address: "Résidence Les Cyprès, Bloc B",
              city: "Les Berges du Lac",
              governorate: "Tunis",
              isDefault: false,
            },
          ]
        : [],
  }));

  const admin: User = {
    id: "user-demo-admin",
    fullName: "Admin MaisonTech",
    email: "admin@maisontech.example",
    passwordHash: hash("Admin!2345"),
    role: "admin",
    createdAt: new Date(Date.UTC(2026, 6, 1)).toISOString(),
    addresses: [],
  };

  return {
    version: SEED_VERSION,
    products: seedProducts,
    categories,
    brands,
    orders: buildOrders(),
    users: [...customers, admin],
    sessions: [],
    discounts: DEMO_DISCOUNTS,
    reviews: buildReviews(),
    settings: DEFAULT_SETTINGS,
    subscribers: [
      {
        id: "sub-1",
        email: "sonia.b@example.tn",
        createdAt: new Date(Date.UTC(2026, 8, 14)).toISOString(),
      },
      {
        id: "sub-2",
        email: "karim.t@example.tn",
        createdAt: new Date(Date.UTC(2026, 9, 2)).toISOString(),
      },
    ],
    messages: [
      {
        id: "msg-1",
        createdAt: new Date(Date.UTC(2026, 9, 12)).toISOString(),
        name: "Leila Gharbi",
        email: "leila.g@example.tn",
        subject: "Disponibilité d'un lave-vaisselle",
        message:
          "Bonjour, le lave-vaisselle 14 couverts est-il disponible en retrait en magasin ? Merci.",
        handled: false,
      },
    ],
  };
}
