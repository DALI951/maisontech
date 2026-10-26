import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IconCheck, IconInfo } from "@/components/icons";
import { RegisterForm } from "@/components/account/auth-forms";
import { Breadcrumbs } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez un compte MaisonTech pour suivre vos commandes et enregistrer vos adresses.",
  robots: { index: false, follow: true },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect("/compte");

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Créer un compte" }]} />

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-10">
        <div className="rounded-panel border border-line bg-surface p-5 sm:p-7">
          <p className="eyebrow">Nouveau client</p>
          <h1 className="mt-1.5 text-[25px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[29px]">
            Créer un compte
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            Un e-mail, un mot de passe, et vos commandes sont regroupées au même endroit.
          </p>

          <div className="mt-5">
            <RegisterForm next={params.next} />
          </div>
        </div>

        <aside className="space-y-3.5">
          <div className="rounded-panel border border-line bg-surface p-5">
            <h2 className="text-[14px] font-bold text-ink">Ce que vous obtenez</h2>
            <ul className="mt-3 space-y-2">
              {[
                "Historique des commandes simulées, avec statut et détail",
                "Carnet d'adresses de livraison réutilisable",
                "Liste de favoris synchronisée avec votre compte (dans cette démo : par navigateur)",
                "Formulaire de commande prérempli",
              ].map((entry) => (
                <li key={entry} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-soft">
                  <IconCheck size={14} className="mt-0.5 shrink-0 text-accent-dark" />
                  {entry}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-panel border border-line bg-[#f4f6f5] p-5">
            <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft">
              <IconInfo size={14} className="mt-0.5 shrink-0" />
              Démonstration : les comptes sont enregistrés dans une base locale. Aucun e-mail de
              confirmation n'est envoyé et aucun mot de passe réel ne doit être utilisé.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
