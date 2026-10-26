import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";
import type { SearchParamsRecord } from "@/lib/catalog-params";
import { getStoreData } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Tous les produits",
  description:
    "Le catalogue complet MaisonTech : réfrigérateurs, lave-linge, lave-vaisselle, cuisinières, climatiseurs, téléviseurs et petit électroménager.",
  alternates: { canonical: "/produits" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const params = await searchParams;
  const { products } = await getStoreData();

  return (
    <CatalogView
      basePath="/produits"
      eyebrow="Catalogue"
      title="Tous nos appareils"
      description="Filtrez par marque, prix, disponibilité et classe énergétique. Chaque fiche indique les caractéristiques, la garantie et les avis de démonstration."
      breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Tous les produits" }]}
      searchParams={params}
      headerExtra={
        <div className="rounded-card border border-line bg-surface px-4 py-2.5 text-[12.5px] text-ink-soft">
          <strong className="font-semibold text-ink">{products.length}</strong> appareils ·{" "}
          <strong className="font-semibold text-ink">12</strong> catégories
        </div>
      }
    />
  );
}
