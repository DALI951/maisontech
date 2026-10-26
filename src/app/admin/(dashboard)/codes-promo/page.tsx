import { AdminPageHeader, AdminPanel } from "@/components/admin/ui";
import { DiscountManager } from "@/components/admin/discount-manager";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Codes promo" };

export default async function AdminDiscountsPage() {
  const database = await readDb();
  const sorted = database.discounts
    .slice()
    .sort((a, b) => (a.active === b.active ? a.code.localeCompare(b.code) : a.active ? -1 : 1));

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Marketing"
        title="Codes promo"
        description="Créez, activez et limitez les remises. Les codes actifs sont validés côté serveur à chaque application dans le panier."
      />

      <AdminPanel padded>
        <DiscountManager initial={sorted} />
      </AdminPanel>

      <p className="text-[11px] leading-relaxed text-ink-muted">
        Un code expiré ou épuisé reste visible ici mais est refusé au moment du calcul du panier. La
        suppression d&apos;un code n&apos;annule pas les remises déjà appliquées aux commandes
        passées.
      </p>
    </div>
  );
}
