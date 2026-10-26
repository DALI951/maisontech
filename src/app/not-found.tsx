import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { NotFoundBody } from "@/components/layout/not-found-body";

/**
 * Global 404 for unmatched URLs. It renders outside the storefront layout, so it
 * brings its own minimal header instead of the full navigation.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-line bg-surface">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Link
            href="/produits"
            className="text-[12.5px] font-semibold text-ink-soft transition-colors hover:text-accent-dark"
          >
            Catalogue
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <NotFoundBody />
      </main>
      <footer className="border-t border-line bg-surface py-4">
        <p className="container-page text-center text-[11.5px] text-ink-muted">
          MaisonTech — boutique de démonstration. Aucune commande réelle n&apos;y est traitée.
        </p>
      </footer>
    </div>
  );
}
