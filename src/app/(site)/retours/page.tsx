import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { Alert, ButtonLink } from "@/components/ui/primitives";
import { CONTACT } from "@/config/site";
import { getStoreData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Retours et garanties",
  description:
    "Retour sous 7 jours, procédure de réclamation, garantie constructeur et exclusions : les règles de retour de la boutique MaisonTech (démonstration).",
  alternates: { canonical: "/retours" },
};

const ELIGIBLE = [
  "L'appareil est dans son emballage d'origine, complet (notice, accessoires, visserie).",
  "Il n'a pas été installé, raccordé ni utilisé au-delà d'un essai de mise sous tension.",
  "La demande est formulée dans le délai de retour après la réception.",
  "La preuve d'achat (référence de commande ou facture) est fournie.",
];

const EXCLUDED = [
  "Les appareils dont l'emballage a été détruit ou découpé pour l'installation.",
  "Les produits d'hygiène et consommables ouverts (filtres, produits d'entretien, accessoires scellés).",
  "Les appareils endommagés par une mauvaise installation, une surtension ou un usage non conforme.",
  "Les commandes sur mesure ou personnalisées, sauf défaut de conformité.",
];

export default async function RetoursPage() {
  const { settings } = await getStoreData();
  const days = settings.shipping.returnsDays;

  return (
    <InfoPage
      eyebrow="Aide"
      title="Retours et garanties"
      description="Ce que vous pouvez retourner, dans quel délai, et comment se passe une prise en charge sous garantie."
      aside={
        <div className="rounded-panel border border-line bg-surface p-4">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">Délai de retour</p>
          <p className="mt-1 text-[26px] font-extrabold leading-none tracking-tight text-navy">{days} jours</p>
          <p className="mt-1 text-[11.5px] text-ink-muted">après réception, appareil non installé.</p>
          <ButtonLink href="/contact" variant="secondary" size="sm" className="mt-3 w-full">
            Ouvrir une demande
          </ButtonLink>
        </div>
      }
    >
      <Alert tone="warning" title="Politique de démonstration">
        Les règles ci-dessous illustrent un fonctionnement plausible mais ne constituent pas un contrat. Le délai de{" "}
        {days} jours provient des paramètres de la boutique et peut être modifié par un administrateur. Avant toute
        mise en ligne, faites relire ce texte : les droits du consommateur en Tunisie ne peuvent pas être réduits par
        une clause de boutique.
      </Alert>

      <h2>Délai et principe</h2>
      <p>
        Vous disposez de <strong>{days} jours calendaires</strong> à compter de la réception pour demander un retour
        d&apos;un appareil qui ne vous convient pas. Le retour est accepté si l&apos;appareil est complet, non installé
        et dans son emballage d&apos;origine. Les frais de retour sont à la charge du client, sauf erreur de
        préparation, produit non conforme ou appareil arrivé endommagé.
      </p>
      <p>
        Un appareil déjà raccordé (eau, gaz, évacuation) ne peut plus être remis en vente comme neuf : dans ce cas, la
        demande est traitée comme un dossier de garantie, pas comme un retour de rétractation.
      </p>

      <h2>Conditions d&apos;acceptation</h2>
      <ul>
        {ELIGIBLE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>Ce qui n&apos;est pas repris</h2>
      <ul>
        {EXCLUDED.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>Comment faire une demande</h2>
      <ol>
        <li>
          Connectez-vous à <Link href="/compte/commandes">votre espace client</Link> et repérez la référence de la
          commande concernée.
        </li>
        <li>
          Écrivez au service client via le <Link href="/contact">formulaire de contact</Link> ou par téléphone au{" "}
          <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>, en précisant la référence et le motif.
        </li>
        <li>
          Vous recevez une étiquette ou un créneau d&apos;enlèvement. Emballez l&apos;appareil dans son carton
          d&apos;origine, avec tous ses accessoires.
        </li>
        <li>
          Après réception et contrôle, le remboursement est déclenché sur le moyen de paiement d&apos;origine. Dans
          cette démonstration, aucun remboursement réel n&apos;est effectué : la commande est seulement marquée comme
          annulée ou remboursée dans l&apos;administration.
        </li>
      </ol>

      <h2>Garantie constructeur</h2>
      <p>
        Les fiches produits annoncent une garantie de 2 ans à titre illustratif. La durée réelle, la couverture et le
        réseau de réparation agréé dépendent du fabricant et du distributeur. La garantie couvre les défauts de
        fabrication, pas l&apos;usure normale, le calcaire, les surtensions, les chutes ou une installation non
        conforme.
      </p>
      <p>
        Une intervention sous garantie ne prolonge pas la durée initiale. Conservez la facture : sans preuve d&apos;achat
        datée, le fabricant applique généralement la date de fabrication comme point de départ.
      </p>

      <h2>Appareil arrivé endommagé</h2>
      <p>
        Signalez les dommages immédiatement, idéalement avant de signer le bon de livraison, en indiquant « sous
        réserve de vérification ». Photographiez l&apos;emballage et l&apos;appareil, puis contactez le service client
        dans les 48 heures. Un appareil endommagé pendant le transport est remplacé ou remboursé sans frais.
      </p>

      <h2>Réclamations non résolues</h2>
      <p>
        Si une demande reste sans solution après deux échanges, demandez l&apos;escalade en précisant « réclamation »
        dans l&apos;objet de votre message. Une boutique réelle doit publier ici le nom et les coordonnées de son
        médiateur ou de l&apos;organisme de contrôle compétent.
      </p>

      <div className="not-prose mt-6 flex flex-wrap gap-2">
        <ButtonLink href="/contact" variant="dark">
          Contacter le service client
        </ButtonLink>
        <ButtonLink href="/faq" variant="secondary">
          Lire la FAQ
        </ButtonLink>
      </div>
    </InfoPage>
  );
}
