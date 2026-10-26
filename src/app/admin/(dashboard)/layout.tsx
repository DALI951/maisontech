import type { Metadata } from "next";
import Link from "next/link";
import { AdminLogoutButton, AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/layout/logo";
import { IconArrowRight, IconShield } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin MaisonTech" },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const database = await readDb();
  const pendingOrders = database.orders.filter((order) => order.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#f5f6f5]">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4">
          <Link href="/admin" aria-label="Tableau de bord">
            <Logo size="sm" />
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full bg-navy px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white sm:inline-flex">
            <IconShield size={11} />
            Admin
          </span>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-right sm:block">
              <span className="block text-[12.5px] font-semibold leading-tight text-ink">
                {user.fullName}
              </span>
              <span className="block text-[11px] leading-tight text-ink-muted">{user.email}</span>
            </span>
            <Link
              href="/"
              className="hidden items-center gap-1 rounded-field border border-line-strong px-3 py-2 text-[12.5px] font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent-dark sm:inline-flex"
            >
              Boutique
              <IconArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] gap-6 px-4 py-5">
        <aside className="hidden w-[232px] shrink-0 lg:block">
          <div className="sticky top-[84px]">
            <div className="rounded-panel border border-line bg-surface p-2">
              <AdminNav pendingOrders={pendingOrders} />
              <div className="mt-1 border-t border-line pt-1">
                <AdminLogoutButton />
              </div>
            </div>
            <p className="mt-3 px-1 text-[11px] leading-relaxed text-ink-muted">
              Données de démonstration stockées localement. Aucune commande n&apos;est réelle.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 lg:hidden">
            <div className="rounded-panel border border-line bg-surface p-2">
              <AdminNav pendingOrders={pendingOrders} />
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
