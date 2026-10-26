import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { Breadcrumbs } from "@/components/ui/primitives";
import { getStoreData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mon panier",
  description: "Vérifiez vos articles, appliquez un code promo et finalisez votre commande.",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const { discounts } = await getStoreData();
  const demoCodes = discounts
    .filter((discount) => discount.active)
    .map((discount) => ({ code: discount.code, description: discount.description }));

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Mon panier" }]} />

      <div className="mt-4">
        <p className="eyebrow">Étape 1 sur 3</p>
        <h1 className="mt-1.5 text-[26px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[32px]">
          Mon panier
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
          Le contenu du panier est stocké dans ce navigateur. Les prix, le stock et les remises sont
          revérifiés par le serveur à chaque modification.
        </p>
      </div>

      <div className="mt-6">
        <CartView demoCodes={demoCodes} />
      </div>
    </div>
  );
}
