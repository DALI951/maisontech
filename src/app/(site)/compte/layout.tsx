import type { Metadata } from "next";
import { AccountNav } from "@/components/account/account-nav";
import { Breadcrumbs } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Mon compte" }]} />

      <div className="mt-4 grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-[132px]">
          <div className="rounded-panel border border-line bg-surface p-4">
            <p className="eyebrow">Connecté</p>
            <p className="mt-1 text-[14px] font-bold leading-snug text-ink">{user.fullName}</p>
            <p className="mt-0.5 break-all text-[11.5px] text-ink-muted">{user.email}</p>
          </div>
          <div className="mt-3">
            <AccountNav isAdmin={user.role === "admin"} />
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
