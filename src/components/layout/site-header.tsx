"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  IconArrowRight,
  IconCart,
  IconChevronDown,
  IconClose,
  IconHeart,
  IconMenu,
  IconPhone,
  IconScale,
  IconSearch,
  IconUser,
} from "@/components/icons";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Logo } from "@/components/layout/logo";
import { SearchBox } from "@/components/layout/search-box";
import { useCommerce } from "@/store/commerce";
import type { PublicUser } from "@/lib/types";

export interface HeaderCategory {
  slug: string;
  name: string;
  shortName: string;
}

const SERVICE_LINKS = [
  { href: "/produits", label: "Tous les produits" },
  { href: "/promotions", label: "Promotions" },
  { href: "/marques", label: "Marques" },
  { href: "/livraison", label: "Livraison" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

function CountBadge({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-promo px-1 text-[10.5px] font-bold leading-none text-white">
      {value > 99 ? "99+" : value}
    </span>
  );
}

export function SiteHeader({
  announcements,
  categories,
  user,
  supportPhone,
}: {
  announcements: string[];
  categories: HeaderCategory[];
  user: PublicUser | null;
  supportPhone: string;
}) {
  const router = useRouter();
  const { cartCount, wishlist, compare } = useCommerce();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setDrawerOpen(false);
        setMobileSearch(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  async function logout() {
    setAccountOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  const primaryCategories = categories.slice(0, 8);

  return (
    <div className="sticky top-0 z-50">
      <AnnouncementBar messages={announcements} />
      <header
        className={`border-b border-line bg-surface/95 backdrop-blur transition-shadow ${
          scrolled ? "shadow-header" : ""
        }`}
      >
        <div className="container-page">
          <div className="flex h-16 items-center gap-3 md:h-[74px] md:gap-5">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={drawerOpen}
              className="flex h-10 w-10 items-center justify-center rounded-field border border-line text-ink hover:border-accent hover:text-accent-dark lg:hidden"
            >
              <IconMenu size={20} />
            </button>

            <Logo />

            <div className="hidden flex-1 justify-center px-2 md:flex">
              <div className="w-full max-w-xl">
                <SearchBox />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => setMobileSearch((value) => !value)}
                aria-label="Rechercher"
                aria-expanded={mobileSearch}
                className="flex h-10 w-10 items-center justify-center rounded-field text-ink hover:bg-paper md:hidden"
              >
                <IconSearch size={20} />
              </button>

              <div className="relative hidden sm:block" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="flex h-10 items-center gap-1.5 rounded-field px-2 text-ink transition-colors hover:bg-paper"
                >
                  <IconUser size={20} />
                  <span className="hidden text-[12.5px] font-semibold lg:block">
                    {user ? user.fullName.split(" ")[0] : "Compte"}
                  </span>
                  <IconChevronDown size={14} className="text-ink-muted" />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="fade-up absolute right-0 top-[calc(100%+8px)] w-64 overflow-hidden rounded-panel border border-line bg-surface shadow-lift"
                  >
                    {user ? (
                      <>
                        <div className="border-b border-line px-4 py-3">
                          <p className="text-[13px] font-semibold text-ink">{user.fullName}</p>
                          <p className="truncate text-[12px] text-ink-muted">{user.email}</p>
                        </div>
                        <div className="py-1.5">
                          <Link
                            href="/compte"
                            role="menuitem"
                            onClick={() => setAccountOpen(false)}
                            className="block px-4 py-2 text-[13.5px] text-ink hover:bg-paper"
                          >
                            Mon compte
                          </Link>
                          <Link
                            href="/compte/commandes"
                            role="menuitem"
                            onClick={() => setAccountOpen(false)}
                            className="block px-4 py-2 text-[13.5px] text-ink hover:bg-paper"
                          >
                            Mes commandes
                          </Link>
                          <Link
                            href="/favoris"
                            role="menuitem"
                            onClick={() => setAccountOpen(false)}
                            className="block px-4 py-2 text-[13.5px] text-ink hover:bg-paper"
                          >
                            Mes favoris
                          </Link>
                          {user.role === "admin" && (
                            <Link
                              href="/admin"
                              role="menuitem"
                              onClick={() => setAccountOpen(false)}
                              className="block px-4 py-2 text-[13.5px] font-semibold text-accent-dark hover:bg-paper"
                            >
                              Administration
                            </Link>
                          )}
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={logout}
                          className="block w-full border-t border-line px-4 py-2.5 text-left text-[13.5px] text-ink-soft hover:bg-paper hover:text-promo"
                        >
                          Se déconnecter
                        </button>
                      </>
                    ) : (
                      <div className="p-3">
                        <Link
                          href="/connexion"
                          onClick={() => setAccountOpen(false)}
                          className="flex h-10 items-center justify-center rounded-field bg-navy text-[13px] font-semibold text-white hover:bg-navy-2"
                        >
                          Se connecter
                        </Link>
                        <Link
                          href="/inscription"
                          onClick={() => setAccountOpen(false)}
                          className="mt-2 flex h-10 items-center justify-center rounded-field border border-line-strong text-[13px] font-semibold text-ink hover:border-accent hover:text-accent-dark"
                        >
                          Créer un compte
                        </Link>
                        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
                          Comptes de démonstration disponibles sur la page de connexion.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/comparer"
                aria-label={`Comparateur${compare.length ? ` (${compare.length})` : ""}`}
                className="relative hidden h-10 w-10 items-center justify-center rounded-field text-ink hover:bg-paper sm:flex"
              >
                <IconScale size={20} />
                <CountBadge value={compare.length} />
              </Link>

              <Link
                href="/favoris"
                aria-label={`Favoris${wishlist.length ? ` (${wishlist.length})` : ""}`}
                className="relative flex h-10 w-10 items-center justify-center rounded-field text-ink hover:bg-paper"
              >
                <IconHeart size={20} />
                <CountBadge value={wishlist.length} />
              </Link>

              <Link
                href="/panier"
                aria-label={`Panier${cartCount ? ` (${cartCount})` : ""}`}
                className="relative flex h-10 items-center gap-1.5 rounded-field px-2 text-ink hover:bg-paper"
              >
                <span className="relative">
                  <IconCart size={21} />
                  <CountBadge value={cartCount} />
                </span>
                <span className="hidden text-[12.5px] font-semibold lg:block">Panier</span>
              </Link>
            </div>
          </div>

          {mobileSearch && (
            <div className="border-t border-line py-3 md:hidden">
              <SearchBox autoFocus variant="page" onNavigate={() => setMobileSearch(false)} />
            </div>
          )}

          <nav aria-label="Catégories" className="hidden h-11 items-center gap-5 border-t border-line/80 lg:flex">
            <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-5 overflow-x-auto">
              {primaryCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categorie/${category.slug}`}
                  className="whitespace-nowrap text-[13px] font-medium text-ink-soft transition-colors hover:text-accent-dark"
                >
                  {category.shortName}
                </Link>
              ))}
              <Link
                href="/produits"
                className="whitespace-nowrap text-[13px] font-semibold text-ink transition-colors hover:text-accent-dark"
              >
                Tout le catalogue
              </Link>
            </div>
            <div className="flex shrink-0 items-center gap-4 border-l border-line pl-4">
              <Link
                href="/promotions"
                className="flex items-center gap-1 whitespace-nowrap text-[13px] font-semibold text-promo hover:underline"
              >
                Promotions
              </Link>
              <Link
                href="/marques"
                className="whitespace-nowrap text-[13px] font-medium text-ink-soft hover:text-accent-dark"
              >
                Marques
              </Link>
              <a
                href={`tel:${supportPhone.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium text-ink-soft hover:text-accent-dark"
              >
                <IconPhone size={15} />
                {supportPhone}
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[70] lg:hidden ${drawerOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-navy/40 transition-opacity duration-200 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
          className={`absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-surface shadow-lift transition-transform duration-250 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <Logo size="sm" />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fermer le menu"
              className="flex h-9 w-9 items-center justify-center rounded-field border border-line text-ink"
            >
              <IconClose size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {user ? (
              <Link
                href="/compte"
                onClick={() => setDrawerOpen(false)}
                className="mb-4 flex items-center gap-3 rounded-field border border-line bg-paper px-3 py-2.5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-[13px] font-bold text-white">
                  {user.fullName.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold text-ink">
                    {user.fullName}
                  </span>
                  <span className="block text-[11.5px] text-ink-muted">Voir mon compte</span>
                </span>
                <IconArrowRight size={16} className="ml-auto text-ink-muted" />
              </Link>
            ) : (
              <div className="mb-4 grid grid-cols-2 gap-2">
                <Link
                  href="/connexion"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-10 items-center justify-center rounded-field bg-navy text-[13px] font-semibold text-white"
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-10 items-center justify-center rounded-field border border-line-strong text-[13px] font-semibold text-ink"
                >
                  S'inscrire
                </Link>
              </div>
            )}

            <p className="eyebrow mb-2">Catégories</p>
            <ul className="mb-5 space-y-0.5">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/categorie/${category.slug}`}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-between rounded-field px-2 py-2 text-[14px] text-ink hover:bg-paper"
                  >
                    {category.shortName}
                    <IconArrowRight size={15} className="text-line-strong" />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="eyebrow mb-2">La boutique</p>
            <ul className="space-y-0.5">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="block rounded-field px-2 py-2 text-[14px] text-ink hover:bg-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/comparer"
                  onClick={() => setDrawerOpen(false)}
                  className="block rounded-field px-2 py-2 text-[14px] text-ink hover:bg-paper"
                >
                  Comparateur{compare.length > 0 ? ` (${compare.length})` : ""}
                </Link>
              </li>
            </ul>
          </div>

          <div className="border-t border-line px-4 py-3">
            <a
              href={`tel:${supportPhone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-[13px] font-medium text-ink-soft"
            >
              <IconPhone size={16} />
              {supportPhone}
            </a>
            {user && (
              <button
                type="button"
                onClick={logout}
                className="mt-2 text-[13px] font-semibold text-promo"
              >
                Se déconnecter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
