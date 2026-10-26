import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { Alert, ButtonLink } from "@/components/ui/primitives";
import { CONTACT, LEGAL, SITE } from "@/config/site";
import { getStoreData } from "@/lib/catalog";
import { formatTND } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente de la boutique MaisonTech : commande, prix, livraison, paiement, rétractation, garanties et litiges. Texte de démonstration.",
  alternates: { canonical: "/cgv" },
};

export default async function CgvPage() {
  const { settings } = await getStoreData();
  const shipping = settings.shipping;

  return (
    <InfoPage
      eyebrow="Cadre juridique"
      title="Conditions générales de vente"
      description="Les règles applicables aux commandes passées sur cette boutique. Version de démonstration, à faire relire par un juriste avant toute exploitation réelle."
      updated={LEGAL.lastUpdated}
    >
      <Alert tone="warning" title="Texte fourni à titre d'exemple">
        Ce document est un modèle générique rédigé pour une démonstration technique. Il ne remplace ni un conseil
        juridique, ni les mentions légales obligatoires de votre activité. Adaptez chaque article à votre statut, à
        vos transporteurs et à la réglementation applicable — notamment la loi tunisienne sur la protection du
        consommateur et les règles de commerce électronique.
      </Alert>

      <h2>1. Objet et champ d&apos;application</h2>
      <p>
        Les présentes conditions régissent la vente d&apos;appareils électroménagers et de petit équipement proposés
        sur le site {SITE.name}. Toute commande implique l&apos;acceptation sans réserve de ces conditions. Elles
        prévalent sur tout autre document, sauf accord écrit contraire.
      </p>

      <h2>2. Identité du vendeur</h2>
      <p>
        Le site est édité par {SITE.legalName}, dont le siège est situé {CONTACT.address}, {CONTACT.postalCode}{" "}
        {CONTACT.city}, {CONTACT.country}. {LEGAL.rc}. {LEGAL.matricule}. {LEGAL.capital}.
      </p>
      <p>
        Contact : <a href={CONTACT.phoneHref}>{CONTACT.phone}</a> — <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
        Les informations d&apos;identification complètes figurent sur la page{" "}
        <Link href="/mentions-legales">Mentions légales</Link>.
      </p>

      <h2>3. Produits et disponibilité</h2>
      <p>
        Les produits sont décrits avec leurs caractéristiques essentielles : dimensions, capacité, classe
        énergétique, niveau sonore, garantie annoncée. Les photographies et illustrations sont des représentations
        indicatives ; pour cette démonstration, les visuels sont générés et ne représentent pas un appareil réel.
      </p>
      <p>
        Les offres sont valables dans la limite des stocks disponibles. En cas d&apos;indisponibilité après commande,
        le client est informé et peut accepter un délai, un produit équivalent ou l&apos;annulation sans frais.
      </p>

      <h2>4. Prix</h2>
      <p>
        Les prix sont exprimés en dinars tunisiens (TND), toutes taxes comprises, hors frais de livraison. Les frais
        de livraison sont affichés avant validation de la commande : {formatTND(shipping.flatRate)} en standard,{" "}
        {formatTND(shipping.expressRate)} en express, offerts au-delà de{" "}
        {formatTND(shipping.freeShippingThreshold)} de sous-total.
      </p>
      <p>
        Les montants sont calculés côté serveur à partir du catalogue. Un code promotionnel saisi par le client ne
        s&apos;applique que s&apos;il est actif, non expiré, non épuisé et compatible avec le panier. Le vendeur peut
        modifier ses prix à tout moment, le prix applicable étant celui affiché au moment de la validation.
      </p>

      <h2>5. Commande</h2>
      <p>
        La commande est formée lorsque le client valide son panier et que le serveur enregistre une référence. Un
        récapitulatif est affiché immédiatement à l&apos;écran. Le client doit vérifier l&apos;exactitude de ses
        coordonnées, de son adresse et du mode de livraison choisi.
      </p>
      <p>
        Dans cette version de démonstration, la commande est simulée : aucun paiement n&apos;est encaissé, aucun
        appareil n&apos;est préparé ni expédié, et aucune facture fiscale n&apos;est émise.
      </p>

      <h2>6. Paiement</h2>
      <ul>
        <li>
          <strong>Paiement à la livraison :</strong>{" "}
          {settings.payments.cashOnDelivery ? "disponible, en espèces, à la remise de l'appareil." : "non disponible actuellement."}
        </li>
        <li>
          <strong>Virement bancaire :</strong>{" "}
          {settings.payments.bankTransfer
            ? "possible sur demande ; la commande est préparée après réception effective des fonds."
            : "non disponible actuellement."}
        </li>
        <li>
          <strong>Paiement par carte :</strong> non proposé sur ce site. Aucun prestataire de paiement n&apos;est
          intégré et aucune donnée bancaire ne doit être transmise via les formulaires de cette démonstration.
        </li>
      </ul>

      <h2>7. Livraison</h2>
      <p>
        La livraison est assurée vers les 24 gouvernorats, dans un délai indicatif de {shipping.estimatedDays} après
        confirmation. Ce délai dépend du transporteur et de la disponibilité du produit ; il n&apos;est pas garanti
        au sens d&apos;une obligation de résultat. Les modalités détaillées figurent sur la page{" "}
        <Link href="/livraison">Livraison</Link>.
      </p>
      <p>
        Le client doit fournir un accès adapté au gabarit de l&apos;appareil et être présent au créneau convenu. En cas
        d&apos;absence, un second passage peut être facturé.
      </p>

      <h2>8. Droit de rétractation et retours</h2>
      <p>
        Le client dispose d&apos;un délai de {shipping.returnsDays} jours après réception pour demander un retour,
        à condition que l&apos;appareil soit complet, non installé et dans son emballage d&apos;origine. Les
        conditions détaillées et les exclusions figurent sur la page <Link href="/retours">Retours et garanties</Link>.
      </p>

      <h2>9. Garanties</h2>
      <p>
        Les appareils bénéficient de la garantie légale de conformité et de la garantie constructeur annoncée sur
        chaque fiche. La garantie ne couvre pas l&apos;usure normale, les dommages liés à une installation non
        conforme, à une surtension, à un transport effectué par le client ou à un usage non domestique.
      </p>

      <h2>10. Responsabilité</h2>
      <p>
        Le vendeur ne peut être tenu responsable des dommages indirects résultant de l&apos;utilisation des produits,
        ni des interruptions du site pour maintenance. Les informations techniques proviennent des fabricants ; une
        erreur manifeste peut être corrigée et la commande annulée si elle en dépend.
      </p>

      <h2>11. Données personnelles</h2>
      <p>
        Les données collectées servent uniquement à traiter la commande, gérer la relation client et, avec
        consentement, envoyer la newsletter. Les modalités d&apos;exercice des droits sont décrites sur la page{" "}
        <Link href="/confidentialite">Confidentialité</Link>.
      </p>

      <h2>12. Propriété intellectuelle</h2>
      <p>
        Les textes, visuels, logos et éléments graphiques du site sont protégés. Toute reproduction sans autorisation
        écrite est interdite, à l&apos;exception des usages prévus par la loi (citation courte, presse).
      </p>

      <h2>13. Droit applicable et litiges</h2>
      <p>
        Les présentes conditions sont soumises au droit tunisien. En cas de litige, une solution amiable est recherchée
        en priorité via le service client. À défaut d&apos;accord, les tribunaux compétents du lieu du siège du
        vendeur sont saisis, sous réserve des règles protectrices applicables aux consommateurs.
      </p>

      <h2>14. Évolution des conditions</h2>
      <p>
        Le vendeur peut modifier ces conditions à tout moment. La version applicable est celle en vigueur à la date de
        la commande. Dernière mise à jour : {LEGAL.lastUpdated}.
      </p>

      <div className="not-prose mt-6 flex flex-wrap gap-2">
        <ButtonLink href="/contact" variant="dark">
          Une question sur ces conditions
        </ButtonLink>
        <ButtonLink href="/mentions-legales" variant="secondary">
          Mentions légales
        </ButtonLink>
      </div>
    </InfoPage>
  );
}
