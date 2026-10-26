import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Breadcrumbs } from "@/components/ui/primitives";
import { GOVERNORATES } from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { getStoreData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commande",
  description: "Finalisez votre commande MaisonTech : coordonnées, livraison et mode de paiement.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [user, { settings }] = await Promise.all([getCurrentUser(), getStoreData()]);
  const address = user?.addresses.find((entry) => entry.isDefault) ?? user?.addresses[0];

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Panier", href: "/panier" },
          { label: "Commande" },
        ]}
      />

      <div className="mt-4">
        <p className="eyebrow">Étape 2 sur 3</p>
        <h1 className="mt-1.5 text-[26px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[32px]">
          Livraison et paiement
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
          Vérifiez vos coordonnées, choisissez un mode de paiement, puis confirmez. Aucun débit
          n&apos;est effectué dans cette démonstration.
        </p>
      </div>

      <div className="mt-6">
        <CheckoutForm
          governorates={GOVERNORATES}
          authedName={user?.fullName}
          defaults={{
            fullName: user?.fullName,
            email: user?.email,
            phone: address?.phone,
            address: address?.address,
            city: address?.city,
            governorate: address?.governorate,
          }}
          settings={{
            shipping: settings.shipping,
            payments: settings.payments,
          }}
        />
      </div>
    </div>
  );
}
