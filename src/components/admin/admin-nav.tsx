"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconChart,
  IconGrid,
  IconBox,
  IconSettings,
  IconTag,
  IconUsers,
  IconLogout,
  IconHome,
} from "@/components/icons";

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: IconChart, exact: true },
  { href: "/admin/produits", label: "Produits", icon: IconGrid, exact: false },
  { href: "/admin/commandes", label: "Commandes", icon: IconBox, exact: false },
  { href: "/admin/clients", label: "Clients", icon: IconUsers, exact: false },
  { href: "/admin/codes-promo", label: "Codes promo", icon: IconTag, exact: false },
  { href: "/admin/categories", label: "Catégories", icon: IconHome, exact: false },
  { href: "/admin/parametres", label: "Paramètres", icon: IconSettings, exact: false },
] as const;

export function AdminNav({ pendingOrders }: { pendingOrders: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation administration" className="space-y-0.5">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        const badge = item.href === "/admin/commandes" && pendingOrders > 0 ? pendingOrders : null;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-field px-3 py-2.5 text-[13px] font-semibold transition-colors ${
              active
                ? "bg-navy text-white"
                : "text-ink-soft hover:bg-[#f2f4f3] hover:text-ink"
            }`}
          >
            <Icon size={16} />
            <span className="flex-1">{item.label}</span>
            {badge !== null && (
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10.5px] font-bold ${
                  active ? "bg-white/20 text-white" : "bg-promo-soft text-promo"
                }`}
              >
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        void fetch("/api/auth/logout", { method: "POST" })
          .catch(() => undefined)
          .finally(() => {
            router.replace("/admin/connexion");
            router.refresh();
          });
      }}
      className="flex w-full items-center gap-2.5 rounded-field px-3 py-2.5 text-left text-[13px] font-semibold text-ink-muted transition-colors hover:bg-promo-soft hover:text-promo"
    >
      <IconLogout size={16} />
      Déconnexion
    </button>
  );
}
