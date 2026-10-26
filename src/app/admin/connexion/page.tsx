import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Logo } from "@/components/layout/logo";
import { IconShield } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_ACCOUNTS } from "@/data/seed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion administration",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f5f4] px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center">
          <Link href="/" aria-label="Retour à la boutique">
            <Logo />
          </Link>
        </div>

        <div className="mt-6 rounded-panel border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(12,27,42,.06)] sm:p-7">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white">
            <IconShield size={18} />
          </span>
          <h1 className="mt-3 text-[22px] font-extrabold leading-tight tracking-[-0.025em] text-navy">
            Administration
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            Espace réservé à l&apos;équipe. L&apos;accès est vérifié côté serveur à chaque requête.
          </p>

          <AdminLoginForm
            demoEmail={DEMO_ACCOUNTS[1].email}
            demoPassword={DEMO_ACCOUNTS[1].password}
          />

          <p className="mt-4 border-t border-line pt-3 text-[11.5px] leading-relaxed text-ink-muted">
            Les comptes de démonstration sont publics et documentés dans le README. En production,
            remplacez-les par une authentification réelle (SSO ou base d&apos;utilisateurs chiffrée).
          </p>
        </div>

        <p className="mt-4 text-center text-[12px] text-ink-soft">
          <Link href="/" className="font-semibold text-accent-dark hover:underline">
            ← Retour à la boutique
          </Link>
        </p>
      </div>
    </div>
  );
}
