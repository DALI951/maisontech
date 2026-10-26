import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/primitives";

const POLICY_LINKS = [
  { href: "/livraison", label: "Livraison" },
  { href: "/retours", label: "Retours et garanties" },
  { href: "/faq", label: "Questions fréquentes" },
  { href: "/cgv", label: "Conditions de vente" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

/** Shared shell for editorial / policy pages. */
export function InfoPage({
  title,
  eyebrow,
  description,
  updated,
  children,
  aside,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  updated?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="container-page py-6 sm:py-10">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: title }]} />

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_236px] lg:items-start">
        <div className="min-w-0">
          <header>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="mt-1.5 text-[27px] font-extrabold leading-tight tracking-[-0.03em] text-navy sm:text-[33px]">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">{description}</p>
            )}
            {updated && <p className="mt-2 text-[11.5px] text-ink-muted">Dernière mise à jour : {updated}</p>}
          </header>

          <div className="mt-5 rounded-panel border border-line bg-surface p-5 sm:p-7">
            <div
              className="text-[13.5px] leading-relaxed text-ink-soft [&_a]:font-semibold [&_a]:text-accent-dark [&_a:hover]:underline [&_h2]:mt-7 [&_h2]:text-[16.5px] [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-ink [&_h2:first-child]:mt-0 [&_h3]:mt-5 [&_h3]:text-[13.5px] [&_h3]:font-bold [&_h3]:text-ink [&_li]:pl-0.5 [&_li]:leading-relaxed [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_p]:mt-2.5 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
            >
              {children}
            </div>
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[132px]">
          {aside}
          <div className="rounded-panel border border-line bg-surface p-3">
            <p className="px-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
              Informations
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {POLICY_LINKS.filter((link) => link.label !== title).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-field px-2 py-1.5 text-[12px] font-semibold text-ink-soft transition-colors hover:bg-[#f5f6f5] hover:text-accent-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
