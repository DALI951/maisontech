import type { Metadata } from "next";
import { CompareView } from "@/components/compare/compare-view";
import { Breadcrumbs } from "@/components/ui/primitives";
import { getStoreData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comparateur d'appareils",
  description:
    "Comparez jusqu'à quatre appareils MaisonTech : prix, disponibilité, classe énergétique, dimensions et caractéristiques.",
  robots: { index: false, follow: true },
};

export default async function ComparePage() {
  const { brands } = await getStoreData();
  const brandNames = Object.fromEntries(brands.map((brand) => [brand.slug, brand.name]));

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Comparateur" }]} />

      <div className="mt-4">
        <p className="eyebrow">Décider sans hésiter</p>
        <h1 className="mt-1.5 text-[26px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[32px]">
          Comparateur
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
          Quatre appareils côte à côte, ligne par ligne. Les caractéristiques proviennent des fiches
          produit de démonstration.
        </p>
      </div>

      <div className="mt-6">
        <CompareView brandNames={brandNames} />
      </div>
    </div>
  );
}
