import type { Metadata } from "next";
import { IconTag } from "@/components/icons";
import { CatalogView } from "@/components/catalog/catalog-view";
import { Alert } from "@/components/ui/primitives";
import { getStoreData } from "@/lib/catalog";
import type { SearchParamsRecord } from "@/lib/catalog-params";

export const metadata: Metadata = {
  title: "Promotions",
  description:
    "Toutes les promotions en cours sur MaisonTech : remises immédiates sur une sélection d'appareils de démonstration.",
  alternates: { canonical: "/promotions" },
};

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const [params, { products }] = await Promise.all([searchParams, getStoreData()]);
  const promoCount = products.filter((product) => product.originalPrice).length;

  return (
    <CatalogView
      basePath="/promotions"
      eyebrow="Bonnes affaires"
      title="Promotions en cours"
      description={`${promoCount} appareils bénéficient d'une remise de démonstration. Les prix barrés correspondent au prix conseillé fictif du catalogue.`}
      breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Promotions" }]}
      searchParams={params}
      force={{ onSale: true }}
      notice={
        <Alert tone="warning">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <IconTag size={14} /> Remises de démonstration
          </span>{" "}
          — ces prix ne correspondent à aucune offre commerciale réelle. Les codes promo
          (BIENVENUE10, LIVRAISON, MAISON50, HIVER15) sont également des données de test.
        </Alert>
      }
      headerExtra={
        <div className="rounded-card border border-promo/25 bg-promo-soft px-4 py-2.5 text-[12.5px] font-semibold text-promo">
          Jusqu'à -30 % sur une sélection
        </div>
      }
    />
  );
}
