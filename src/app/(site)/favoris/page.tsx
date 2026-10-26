import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";
import { Breadcrumbs } from "@/components/ui/primitives";
import { getStoreData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes favoris",
  description: "Les appareils que vous avez gardés de côté sur MaisonTech.",
  robots: { index: false, follow: true },
};

export default async function WishlistPage() {
  const { brands } = await getStoreData();
  const brandNames = Object.fromEntries(brands.map((brand) => [brand.slug, brand.name]));

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Mes favoris" }]} />

      <div className="mt-4">
        <p className="eyebrow">Sélection personnelle</p>
        <h1 className="mt-1.5 text-[26px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[32px]">
          Mes favoris
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
          Gardez les appareils qui vous intéressent sous la main. Cette liste est stockée uniquement
          dans votre navigateur.
        </p>
      </div>

      <div className="mt-6">
        <WishlistView brandNames={brandNames} />
      </div>
    </div>
  );
}
