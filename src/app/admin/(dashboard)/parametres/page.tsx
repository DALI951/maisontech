import { AdminPageHeader } from "@/components/admin/ui";
import { ResetDemoButton } from "@/components/admin/reset-demo-button";
import { SettingsForm } from "@/components/admin/settings-form";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Paramètres" };

export default async function AdminSettingsPage() {
  const database = await readDb();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Paramètres de la boutique"
        description="Coordonnées, frais de livraison, moyens de paiement et textes de la newsletter. Chaque valeur est validée côté serveur."
        actions={<ResetDemoButton />}
      />

      <SettingsForm settings={database.settings} />

      <p className="text-[11px] leading-relaxed text-ink-muted">
        Les paramètres sont enregistrés dans la base de démonstration locale. « Réinitialiser la
        démo » restaure aussi ces valeurs d&apos;origine.
      </p>
    </div>
  );
}
