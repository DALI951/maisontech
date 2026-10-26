import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getStoreData } from "@/lib/catalog";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/produits", priority: 0.9, changeFrequency: "daily" },
  { path: "/promotions", priority: 0.8, changeFrequency: "daily" },
  { path: "/marques", priority: 0.6, changeFrequency: "weekly" },
  { path: "/a-propos", priority: 0.4, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.4, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/livraison", priority: 0.5, changeFrequency: "monthly" },
  { path: "/retours", priority: 0.4, changeFrequency: "monthly" },
  { path: "/cgv", priority: 0.3, changeFrequency: "yearly" },
  { path: "/confidentialite", priority: 0.3, changeFrequency: "yearly" },
  { path: "/mentions-legales", priority: 0.3, changeFrequency: "yearly" },
];

/**
 * Every URL below is public and indexable. Private areas (/admin, /compte,
 * /panier, /commande) are listed in robots.ts instead.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories, brands } = await getStoreData();
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...categories.map((category) => ({
      url: `${base}/categorie/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...brands.map((brand) => ({
      url: `${base}/marques/${brand.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...products.map((product) => ({
      url: `${base}/produit/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
