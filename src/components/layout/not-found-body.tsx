import Link from "next/link";
import { IconArrowRight, IconSearch } from "@/components/icons";
import { ButtonLink } from "@/components/ui/primitives";

const SUGGESTIONS = [
  { href: "/produits", label: "Tous les produits" },
  { href: "/promotions", label: "Promotions en cours" },
  { href: "/marques", label: "Nos marques" },
  { href: "/faq", label: "Questions fréquentes" },
  { href: "/livraison", label: "Livraison et délais" },
  { href: "/contact", label: "Contacter le service client" },
];

/** Shared 404 body. No data access, so it can render in any layout. */
export function NotFoundBody({ standalone = false }: { standalone?: boolean }) {
  return (
    <div className={standalone ? "container-page flex min-h-screen flex-col justify-center py-16" : "container-page py-14 sm:py-20"}>
      <div className="mx-auto w-full max-w-xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-dark">Erreur 404</p>
        <p className="mt-2 text-[64px] font-extrabold leading-none tracking-[-0.05em] text-navy sm:text-[84px]">
          4<span className="text-accent">0</span>4
        </p>
        <h1 className="mt-3 text-[22px] font-extrabold tracking-[-0.02em] text-ink sm:text-[26px]">
          Cette page n&apos;existe pas
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
          Le lien est peut-être obsolète, ou l&apos;adresse contient une faute de frappe. Le produit que vous cherchez
          a pu être renommé ou retiré du catalogue.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <ButtonLink href="/" variant="dark">
            Retour à l&apos;accueil
          </ButtonLink>
          <ButtonLink href="/produits" variant="secondary">
            Parcourir le catalogue
          </ButtonLink>
        </div>

        <div className="mt-8 rounded-panel border border-line bg-surface p-4 text-left">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            <IconSearch size={13} /> Pistes utiles
          </p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {SUGGESTIONS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between gap-2 rounded-field px-2 py-2 text-[12.5px] font-semibold text-ink-soft transition-colors hover:bg-paper hover:text-accent-dark"
                >
                  {item.label}
                  <IconArrowRight size={13} className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-5 text-[11.5px] text-ink-muted">
          Vous cherchez une commande ?{" "}
          <Link href="/compte/commandes" className="font-semibold text-accent-dark hover:underline">
            Suivez-la depuis votre espace client
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
