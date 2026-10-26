import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/faq-accordion";
import { InfoPage } from "@/components/layout/info-page";
import { ButtonLink } from "@/components/ui/primitives";
import { CONTACT } from "@/config/site";
import { faqCategories, faqs } from "@/data/content";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description:
    "Commandes, livraison, paiement, garantie et retours : les réponses aux questions les plus posées sur la boutique MaisonTech.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="Aide"
      title="Questions fréquentes"
      description="Tout ce qui revient le plus souvent, classé par thème. Si votre question n'y figure pas, le service client répond en une journée ouvrée."
      aside={
        <div className="rounded-panel border border-line bg-surface p-4">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">Besoin d&apos;aide ?</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
            Une question qui n&apos;est pas dans la liste ? Écrivez-nous, nous répondons aux mêmes horaires que le
            standard.
          </p>
          <a
            href={CONTACT.phoneHref}
            className="mt-2 block text-[12.5px] font-semibold text-accent-dark hover:underline"
          >
            {CONTACT.phone}
          </a>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">{CONTACT.hours}</p>
          <ButtonLink href="/contact" variant="secondary" size="sm" className="mt-3 w-full">
            Formulaire de contact
          </ButtonLink>
        </div>
      }
    >
      <p>
        Cette page décrit le fonctionnement de la boutique de démonstration. Aucune des réponses ci-dessous
        n&apos;est un engagement contractuel : avant une mise en ligne réelle, chaque règle doit être relue et validée
        par le commerçant.
      </p>

      <div className="not-prose mt-5 space-y-6">
        {faqCategories.map((category) => {
          const items = faqs.filter((item) => item.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category} aria-labelledby={`faq-${category}`}>
              <h2
                id={`faq-${category}`}
                className="!mt-0 mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-ink-muted"
              >
                {category}
              </h2>
              <FaqAccordion items={items} />
            </section>
          );
        })}
      </div>

      <h2>Et ensuite ?</h2>
      <ul>
        <li>
          Les tarifs et délais détaillés sont sur la page <Link href="/livraison">Livraison</Link>.
        </li>
        <li>
          Les conditions de retour et de garantie sont sur la page <Link href="/retours">Retours et garanties</Link>.
        </li>
        <li>
          Les règles d&apos;achat complètes figurent dans les <Link href="/cgv">conditions générales de vente</Link>.
        </li>
        <li>
          Pour toute question sur vos données personnelles : <Link href="/confidentialite">Confidentialité</Link>.
        </li>
      </ul>

      <div className="not-prose mt-6 flex flex-wrap gap-2">
        <ButtonLink href="/produits" variant="dark">
          Voir les produits
        </ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Contacter le service client
        </ButtonLink>
      </div>
    </InfoPage>
  );
}
