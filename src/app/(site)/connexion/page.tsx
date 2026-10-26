import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { IconLock, IconShield, IconTruck } from "@/components/icons";
import { LoginForm } from "@/components/account/auth-forms";
import { Breadcrumbs } from "@/components/ui/primitives";
import { DEMO_ACCOUNTS } from "@/data/seed";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte MaisonTech pour suivre vos commandes et vos adresses.",
  robots: { index: false, follow: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(params.next && params.next.startsWith("/") ? params.next : "/compte");

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Connexion" }]} />

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-10">
        <div className="rounded-panel border border-line bg-surface p-5 sm:p-7">
          <p className="eyebrow">Espace client</p>
          <h1 className="mt-1.5 text-[25px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[29px]">
            Se connecter
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            Retrouvez vos commandes, vos adresses et vos favoris sur tous vos appareils.
          </p>

          <div className="mt-5">
            <LoginForm
              next={params.next}
              demo={DEMO_ACCOUNTS.map((account) => ({
                email: account.email,
                password: account.password,
                role: account.role === "admin" ? "admin" : "client",
              }))}
            />
          </div>
        </div>

        <aside className="space-y-3.5">
          <div className="rounded-panel border border-line bg-surface p-5">
            <h2 className="text-[14px] font-bold text-ink">Pourquoi créer un compte ?</h2>
            <ul className="mt-3 space-y-3">
              {[
                {
                  icon: <IconTruck size={16} />,
                  title: "Suivi des commandes",
                  body: "Chaque commande simulée reste consultable avec son statut et son récapitulatif.",
                },
                {
                  icon: <IconShield size={16} />,
                  title: "Adresses enregistrées",
                  body: "Saisissez une fois vos coordonnées de livraison, réutilisez-les ensuite.",
                },
                {
                  icon: <IconLock size={16} />,
                  title: "Session sécurisée",
                  body: "Mot de passe haché côté serveur et cookie de session HttpOnly — jamais de mot de passe en clair.",
                },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{item.title}</p>
                    <p className="text-[12px] leading-relaxed text-ink-soft">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-panel border border-line bg-[#f4f6f5] p-5">
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              Cette boutique est une démonstration :{""}
              <Link href="/inscription" className="font-semibold text-accent-dark hover:underline">
                créez un compte de test
              </Link>{" "}
              ou utilisez les identifiants publiés à gauche. N'employez jamais un mot de passe réel.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
