import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { Alert, ButtonLink } from "@/components/ui/primitives";
import { CONTACT, LEGAL, SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Éditeur du site, responsable de la publication, hébergement et propriété intellectuelle de la boutique MaisonTech (démonstration).",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <InfoPage
      eyebrow="Cadre juridique"
      title="Mentions légales"
      description="Identification de l'éditeur du site et informations d'hébergement. Les champs marqués « à compléter » doivent être renseignés avant toute mise en ligne."
      updated={LEGAL.lastUpdated}
    >
      <Alert tone="warning" title="Informations incomplètes par construction">
        Cette boutique est une démonstration technique. Les identifiants d&apos;entreprise, l&apos;adresse et
        l&apos;hébergeur sont volontairement laissés en attente : inventer un numéro de registre de commerce ou un
        matricule fiscal serait une fausse déclaration. Renseignez ces champs avec les données réelles de votre
        société, puis retirez cette bannière.
      </Alert>

      <h2>Éditeur du site</h2>
      <ul>
        <li>
          <strong>Dénomination :</strong> {SITE.legalName}
        </li>
        <li>
          <strong>Adresse :</strong> {CONTACT.address}, {CONTACT.postalCode} {CONTACT.city}, {CONTACT.country}
        </li>
        <li>
          <strong>Téléphone :</strong> <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
        </li>
        <li>
          <strong>E-mail :</strong> <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </li>
        <li>
          <strong>Registre de commerce :</strong> {LEGAL.rc}
        </li>
        <li>
          <strong>Matricule fiscal :</strong> {LEGAL.matricule}
        </li>
        <li>
          <strong>Capital social :</strong> {LEGAL.capital}
        </li>
      </ul>

      <h2>Directeur de la publication</h2>
      <p>{LEGAL.publisher}. Cette mention désigne la personne responsable du contenu publié sur le site.</p>

      <h2>Hébergement</h2>
      <p>
        {LEGAL.host}. Indiquez ici la raison sociale, l&apos;adresse et le contact de l&apos;hébergeur qui stocke les
        pages et les données de la boutique. Dans cette démonstration, l&apos;application tourne localement sur le
        poste de développement.
      </p>

      <h2>Activité</h2>
      <p>
        Commerce de détail d&apos;appareils électroménagers et de petit équipement domestique. Les prix sont affichés
        en dinars tunisiens, toutes taxes comprises, hors frais de livraison indiqués séparément au moment de la
        commande.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        La structure du site, ses textes, ses composants d&apos;interface et ses visuels sont la propriété de
        l&apos;éditeur. Les marques citées appartiennent à leurs titulaires respectifs et sont mentionnées à titre
        descriptif. Les visuels de produits de cette démonstration sont générés par le site lui-même et ne
        reproduisent pas des appareils réels.
      </p>
      <p>
        Toute reproduction, adaptation ou diffusion, totale ou partielle, sans autorisation écrite est interdite, sauf
        exceptions légales (courte citation avec mention de la source, revue de presse).
      </p>

      <h2>Liens externes</h2>
      <p>
        Le site peut contenir des liens vers des services tiers (réseaux sociaux, transporteurs). L&apos;éditeur
        n&apos;exerce aucun contrôle sur leur contenu et décline toute responsabilité quant à leurs pratiques,
        notamment en matière de données personnelles.
      </p>

      <h2>Signalement</h2>
      <p>
        Pour signaler un contenu illicite, une erreur manifeste sur une fiche produit ou un dysfonctionnement
        technique, écrivez à <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> en précisant l&apos;URL concernée
        et la nature du problème.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le détail des traitements, des durées de conservation et des droits figure sur la page{" "}
        <Link href="/confidentialite">Politique de confidentialité</Link>. Les règles d&apos;achat sont dans les{" "}
        <Link href="/cgv">conditions générales de vente</Link>.
      </p>

      <div className="not-prose mt-6 flex flex-wrap gap-2">
        <ButtonLink href="/confidentialite" variant="dark">
          Confidentialité
        </ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Nous contacter
        </ButtonLink>
      </div>
    </InfoPage>
  );
}
