import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { Alert, ButtonLink } from "@/components/ui/primitives";
import { CONTACT, SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "MaisonTech : une sélection d'électroménager lisible, des fiches produits honnêtes et une livraison partout en Tunisie. Projet de démonstration.",
  alternates: { canonical: "/a-propos" },
};

const VALUES = [
  {
    title: "Une sélection courte, pas un catalogue infini",
    body: "Six références par catégorie, choisies pour leur disponibilité, leur consommation et la disponibilité des pièces. Nous préférons expliquer un appareil que noyer le visiteur sous 400 résultats.",
  },
  {
    title: "Des fiches qui disent ce qui compte",
    body: "Dimensions réelles, classe énergétique, niveau sonore, consommation annuelle : les informations qui décident d'un achat, plutôt qu'une liste de 60 lignes marketing.",
  },
  {
    title: "Le prix, tout de suite",
    body: "Prix en dinars, TVA incluse, sans remise artificielle permanente. Quand une promotion existe, elle affiche le prix de référence et sa date de fin.",
  },
  {
    title: "Un service qui répond",
    body: "Une question sur un montage, une livraison, un retour : le service client est joignable par téléphone, WhatsApp ou e-mail aux horaires indiqués.",
  },
];

const TIMELINE = [
  { year: "2021", text: "Ouverture d'un atelier de réparation à Tunis : diagnostic, pièces détachées, conseil avant achat." },
  { year: "2023", text: "Premier showroom : 40 m² de gros électroménager, livraison assurée sur le Grand Tunis." },
  { year: "2025", text: "Extension de la livraison aux 24 gouvernorats, ouverture du service après-vente à distance." },
  { year: "2026", text: "Lancement de cette boutique en ligne — et de sa version de démonstration que vous consultez." },
];

export default function AProposPage() {
  return (
    <InfoPage
      eyebrow="La maison"
      title="À propos de MaisonTech"
      description="Une boutique spécialisée dans l'électroménager, pensée pour les foyers tunisiens : des appareils fiables, des prix lisibles et un vrai service après-vente."
      aside={
        <div className="rounded-panel border border-line bg-surface p-4">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">En bref</p>
          <dl className="mt-2 space-y-2 text-[12.5px]">
            <div>
              <dt className="text-ink-muted">Enseigne</dt>
              <dd className="font-semibold text-ink">{SITE.name}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Activité</dt>
              <dd className="font-semibold text-ink">Électroménager & petit équipement</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Zone desservie</dt>
              <dd className="font-semibold text-ink">24 gouvernorats</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Contact</dt>
              <dd className="font-semibold text-ink">{CONTACT.phone}</dd>
            </div>
          </dl>
        </div>
      }
    >
      <Alert tone="info" title="Projet de démonstration">
        MaisonTech est un projet de démonstration technique. L&apos;enseigne, les adresses, les numéros et
        l&apos;historique ci-dessous sont fictifs et n&apos;engagent personne. Les commandes passées sur ce site sont
        simulées : aucun paiement n&apos;est encaissé, aucun appareil n&apos;est expédié.
      </Alert>

      <h2>Notre point de départ</h2>
      <p>
        Acheter un lave-linge en Tunisie implique trois questions très concrètes : est-ce que l&apos;appareil entre
        dans la buanderie, est-ce qu&apos;il consomme raisonnablement, et est-ce qu&apos;on trouvera une pièce dans
        trois ans. La plupart des sites répondent à la première, esquivent la deuxième et ignorent la troisième.
      </p>
      <p>
        MaisonTech est né de cette frustration. Nous avons construit une boutique autour de trois engagements :
        montrer les dimensions exactes, afficher la consommation réelle, et ne vendre que des références dont les
        pièces sont disponibles localement.
      </p>

      <h2>Ce que nous défendons</h2>
      <div className="not-prose mt-3 grid gap-3 sm:grid-cols-2">
        {VALUES.map((value) => (
          <div key={value.title} className="rounded-field border border-line bg-paper p-4">
            <h3 className="!mt-0 text-[13.5px] font-bold text-ink">{value.title}</h3>
            <p className="!mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{value.body}</p>
          </div>
        ))}
      </div>

      <h2>Notre parcours</h2>
      <ol className="not-prose mt-3 space-y-3">
        {TIMELINE.map((item) => (
          <li key={item.year} className="flex gap-3">
            <span className="mt-0.5 shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-dark">
              {item.year}
            </span>
            <span className="text-[13px] leading-relaxed text-ink-soft">{item.text}</span>
          </li>
        ))}
      </ol>

      <h2>Comment lire cette boutique</h2>
      <p>
        Chaque produit appartient à une catégorie unique et porte une référence interne. Les fiches indiquent les
        dimensions, la classe énergétique, la garantie et les options de livraison. Les prix sont exprimés en dinars
        tunisiens, toutes taxes comprises, et recalculés côté serveur au moment du panier : ce que vous voyez dans le
        panier est ce que le serveur facture.
      </p>
      <p>
        Les avis clients affichés sont des contenus de démonstration, pas de véritables retours vérifiés. Nous
        n&apos;affichons pas de note agrégée inventée sur les moteurs de recherche.
      </p>

      <h2>Nous écrire</h2>
      <p>
        Une question sur un appareil, une commande ou un partenariat ? Le{" "}
        <Link href="/contact">formulaire de contact</Link> est le plus rapide, ou appelez le{" "}
        <a href={CONTACT.phoneHref}>{CONTACT.phone}</a> ({CONTACT.hours}).
      </p>

      <div className="not-prose mt-6 flex flex-wrap gap-2">
        <ButtonLink href="/produits" variant="dark">
          Parcourir le catalogue
        </ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Nous contacter
        </ButtonLink>
      </div>
    </InfoPage>
  );
}
