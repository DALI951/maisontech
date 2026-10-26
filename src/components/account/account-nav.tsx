"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBox,
  IconGrid,
  IconHome,
  IconLogout,
  IconPin,
  IconUser,
} from "@/components/icons";

const ITEMS = [
  { href: "/compte", label: "Vue d'ensemble", icon: IconHome, exact: true },
  { href: "/compte/commandes", label: "Mes commandes", icon: IconBox, exact: false },
  { href: "/compte/adresses", label: "Mes adresses", icon: IconPin, exact: false },
  { href: "/favoris", label: "Mes favoris", icon: IconGrid, exact: true },
] as const;

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation du compte" className="rounded-panel border border-line bg-surface p-2">
      <ul className="space-y-0.5">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-field px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                  active ? "bg-accent-soft text-accent-dark" : "text-ink-soft hover:bg-[#f5f6f5] hover:text-ink"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            </li>
          );
        })}
        {isAdmin && (
          <li>
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-field px-3 py-2.5 text-[13px] font-semibold text-navy transition-colors hover:bg-navy/5"
            >
              <IconUser size={16} />
              Administration
            </Link>
          </li>
        )}
      </ul>
      <div className="mt-1 border-t border-line pt-1">
        <LogoutButton />
      </div>
    </nav>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <form
      action="/api/auth/logout"
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        void fetch("/api/auth/logout", { method: "POST" })
          .catch(() => undefined)
          .finally(() => {
            router.replace("/");
            router.refresh();
          });
        form.blur();
      }}
    >
      <button
        type="submit"
        className="flex w-full items-center gap-2.5 rounded-field px-3 py-2.5 text-left text-[13px] font-semibold text-ink-muted transition-colors hover:bg-promo-soft hover:text-promo"
      >
        <IconLogout size={16} />
        Se déconnecter
      </button>
    </form>
  );
}
