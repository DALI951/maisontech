import Link from "next/link";
import { IconClock, IconMail, IconPhone, IconPin } from "@/components/icons";
import { Logo } from "@/components/layout/logo";
import { CONTACT, SITE, SOCIAL } from "@/config/site";
import type { Category } from "@/lib/types";

export function SiteFooter({
  categories,
  supportPhone,
  supportEmail,
  supportHours,
  storeAddress,
}: {
  categories: Category[];
  supportPhone: string;
  supportEmail: string;
  supportHours: string;
  storeAddress: string;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-navy text-white/80">
      <div className="container-page py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/65">
              {SITE.tagline} Une sélection d'appareils fiables, livrés partout en Tunisie.
            </p>
            <ul className="mt-5 space-y-2 text-[12.5px] text-white/70">
              <li className="flex items-start gap-2">
                <IconPin size={15} className="mt-0.5 shrink-0 text-white/50" />
                {storeAddress}
              </li>
              <li className="flex items-center gap-2">
                <IconPhone size={15} className="shrink-0 text-white/50" />
                <a href={`tel:${supportPhone.replace(/\s/g, "")}`} className="hover:text-white">
                  {supportPhone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <IconMail size={15} className="shrink-0 text-white/50" />
                <a href={`mailto:${supportEmail}`} className="hover:text-white">
                  {supportEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <IconClock size={15} className="shrink-0 text-white/50" />
                {supportHours}
              </li>
            </ul>
          </div>

          <FooterColumn
            title="Catégories"
            links={[
              ...categories.slice(0, 7).map((category) => ({
                href: `/categorie/${category.slug}`,
                label: category.shortName,
              })),
              { href: "/produits", label: "Tout le catalogue" },
            ]}
          />

          <FooterColumn
            title="Aide & services"
            links={[
              { href: "/faq", label: "Questions fréquentes" },
              { href: "/livraison", label: "Livraison et délais" },
              { href: "/retours", label: "Retours et garanties" },
              { href: "/contact", label: "Nous contacter" },
              { href: "/compte/commandes", label: "Suivre ma commande" },
              { href: "/comparer", label: "Comparateur" },
            ]}
          />

          <FooterColumn
            title="La maison"
            links={[
              { href: "/a-propos", label: "À propos" },
              { href: "/marques", label: "Nos marques" },
              { href: "/promotions", label: "Promotions" },
              { href: "/cgv", label: "Conditions de vente" },
              { href: "/confidentialite", label: "Confidentialité" },
              { href: "/mentions-legales", label: "Mentions légales" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11.5px] text-white/50">
            © {year} {SITE.name} — boutique de démonstration. {SOCIAL.map((s) => s.handle).join(" · ")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-white/60">
              Paiement à la livraison
            </span>
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-white/60">
              Virement bancaire
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/40">
              Prix en {SITE.currency}
            </span>
          </div>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-white/40">
          Site de démonstration : les produits, les marques, les prix et les avis sont fictifs.
          Aucun paiement n'est encaissé et aucune commande n'est expédiée. Coordonnées de contact
          également fictives — {CONTACT.city}, {CONTACT.country}.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.14em] text-white">{title}</h2>
      <ul className="space-y-1.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[13px] text-white/65 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
