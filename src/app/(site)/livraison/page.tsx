import type { Metadata } from "next";
import Link from "next/link";
import { IconBox, IconClock, IconTruck, IconWallet } from "@/components/icons";
import { InfoPage } from "@/components/layout/info-page";
import { Alert, ButtonLink } from "@/components/ui/primitives";
import { CONTACT, GOVERNORATES } from "@/config/site";
import { getStoreData } from "@/lib/catalog";
import { formatTND } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Livraison",
  description:
    "Zones desservies, tarifs, délais et installation : comment MaisonTech livre les appareils en Tunisie. Tarifs de démonstration modifiables dans l'administration.",
  alternates: { canonical: "/livraison" },
};

const STEPS = [
  {
    title: "Commande confirmée",
    body: "Vous recevez une référence de commande. Dans la démonstration, aucun paiement n'est prélevé à cette étape.",
  },
  {
    title: "Préparation et appel",
    body: "Le transporteur vous appelle pour convenir d'un créneau. Prévoyez quelqu'un pour la réception des gros appareils.",
  },
  {
    title: "Livraison à domicile",
    body: "Le colis est remis contre signature. Vérifiez l'état de l'appareil avant de signer le bon de livraison.",
  },
  {
    title: "Mise en service",
    body: "Pour le gros électroménager, le branchement est effectué si l'option est choisie et si l'installation (eau, électricité) existe déjà.",
  },
];

export default async function LivraisonPage() {
  const { settings } = await getStoreData();
  const shipping = settings.shipping;

  return (
    <InfoPage
      eyebrow="Aide"
      title="Livraison"
      description="Les tarifs et délais affichés ici sont des valeurs de configuration, modifiables à tout moment depuis l'administration de la boutique."
      aside={
        <div className="rounded-panel border border-line bg-surface p-4">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">Résumé</p>
          <dl className="mt-2 space-y-2 text-[12.5px]">
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-ink-muted">Standard</dt>
              <dd className="font-bold text-ink">{formatTND(shipping.flatRate)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-ink-muted">Express</dt>
              <dd className="font-bold text-ink">{formatTND(shipping.expressRate)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-ink-muted">Offerte dès</dt>
              <dd className="font-bold text-ink">{formatTND(shipping.freeShippingThreshold)}</dd>
            </div>
            <div className="border-t border-line pt-2">
              <dt className="text-ink-muted">Délai annoncé</dt>
              <dd className="font-semibold text-ink">{shipping.estimatedDays}</dd>
            </div>
          </dl>
        </div>
      }
    >
      <Alert tone="info" title="Tarifs de démonstration">
        Les montants ci-dessous proviennent des paramètres de la boutique et peuvent être modifiés dans{" "}
        <Link href="/admin/parametres">l&apos;administration</Link> par un administrateur connecté. Ils ne
        correspondent à aucun contrat de transport réel.
      </Alert>

      <h2>Zones desservies</h2>
      <p>
        L&apos;expédition est annoncée vers les 24 gouvernorats. La livraison standard passe par un transporteur
        partenaire ; les appareils les plus volumineux (réfrigérateurs, cuisinières, lave-linge) voyagent sur une
        tournée dédiée et nécessitent une prise de rendez-vous téléphonique.
      </p>
      <div className="not-prose mt-3 flex flex-wrap gap-1.5">
        {GOVERNORATES.map((governorate) => (
          <span
            key={governorate}
            className="rounded-full border border-line bg-paper px-2.5 py-1 text-[11.5px] font-semibold text-ink-soft"
          >
            {governorate}
          </span>
        ))}
      </div>

      <h2>Tarifs</h2>
      <div className="not-prose mt-3 overflow-hidden rounded-field border border-line">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-paper text-[11px] uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="px-3 py-2 font-bold">Mode</th>
              <th scope="col" className="px-3 py-2 font-bold">Zone</th>
              <th scope="col" className="px-3 py-2 font-bold">Délai</th>
              <th scope="col" className="px-3 py-2 text-right font-bold">Tarif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            <tr>
              <td className="px-3 py-2.5 font-semibold text-ink">Standard</td>
              <td className="px-3 py-2.5 text-ink-soft">24 gouvernorats</td>
              <td className="px-3 py-2.5 text-ink-soft">{shipping.estimatedDays}</td>
              <td className="px-3 py-2.5 text-right font-semibold text-ink">
                {formatTND(shipping.flatRate)}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2.5 font-semibold text-ink">Express</td>
              <td className="px-3 py-2.5 text-ink-soft">Grand Tunis, Sousse, Sfax</td>
              <td className="px-3 py-2.5 text-ink-soft">24 à 48 h ouvrées</td>
              <td className="px-3 py-2.5 text-right font-semibold text-ink">
                {formatTND(shipping.expressRate)}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2.5 font-semibold text-ink">Retrait showroom</td>
              <td className="px-3 py-2.5 text-ink-soft">{CONTACT.city}</td>
              <td className="px-3 py-2.5 text-ink-soft">Sur rendez-vous</td>
              <td className="px-3 py-2.5 text-right font-semibold text-accent-dark">Gratuit</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        La livraison standard est offerte pour toute commande dont le sous-total atteint{" "}
        <strong>{formatTND(shipping.freeShippingThreshold)}</strong>. Le seuil est calculé sur le sous-total des
        articles, hors frais de livraison et hors montant des codes promo fixes.
      </p>

      <h2>Le parcours d&apos;une commande</h2>
      <div className="not-prose mt-3 grid gap-2.5 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <div key={step.title} className="rounded-field border border-line bg-paper p-3.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-accent-dark">
              Étape {index + 1}
            </span>
            <h3 className="!mt-1 text-[13px] font-bold text-ink">{step.title}</h3>
            <p className="!mt-1 text-[12px] leading-relaxed text-ink-soft">{step.body}</p>
          </div>
        ))}
      </div>

      <h2>Ce qu&apos;il faut préparer</h2>
      <ul>
        <li>
          <strong>L&apos;accès :</strong> vérifiez la largeur des portes, des couloirs et de l&apos;ascenseur avant de
          commander. Les dimensions de chaque appareil figurent sur sa fiche produit.
        </li>
        <li>
          <strong>Les raccordements :</strong> une prise reliée à la terre, un robinet d&apos;arrivée d&apos;eau et une
          évacuation sont nécessaires pour un lave-linge ou un lave-vaisselle.
        </li>
        <li>
          <strong>Le sol :</strong> un appareil de 80 kg ne se pose pas sur un support instable ; prévoyez un sol plane
          et une surface dégagée d&apos;au moins un mètre devant l&apos;appareil.
        </li>
        <li>
          <strong>La reprise :</strong> l&apos;enlèvement de l&apos;ancien appareil est une option payante, à demander
          au moment de la commande et à confirmer par le transporteur.
        </li>
      </ul>

      <h2>Paiement à la réception</h2>
      <p>
        {settings.payments.cashOnDelivery
          ? "Le paiement en espèces à la livraison est activé dans les paramètres de cette démonstration. Le transporteur encaisse le montant total affiché sur le bon de livraison."
          : "Le paiement à la livraison est actuellement désactivé dans les paramètres de la boutique."}{" "}
        Aucun paiement par carte n&apos;est traité sur ce site : ne saisissez jamais de données bancaires dans un
        formulaire de cette démonstration.
      </p>

      <h2>Un problème à la réception ?</h2>
      <p>
        Refusez le colis s&apos;il est visiblement endommagé, ou signalez-le immédiatement en indiquant « sous réserve
        de vérification » sur le bon. Puis contactez le service client au <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>{" "}
        avec la référence de commande et des photos. Les conditions complètes sont sur la page{" "}
        <Link href="/retours">Retours et garanties</Link>.
      </p>

      <div className="not-prose mt-6 flex flex-wrap gap-2">
        <ButtonLink href="/produits" variant="dark">
          Voir le catalogue
        </ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Poser une question
        </ButtonLink>
      </div>

      <div className="not-prose mt-6 grid gap-2 sm:grid-cols-3">
        {[
          { icon: IconTruck, label: "24 gouvernorats" },
          { icon: IconClock, label: shipping.estimatedDays },
          { icon: IconWallet, label: settings.payments.cashOnDelivery ? "Paiement à la livraison" : "Paiement en ligne désactivé" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2 rounded-field border border-line bg-paper px-3 py-2.5">
              <Icon size={16} className="shrink-0 text-accent-dark" />
              <span className="text-[12px] font-semibold text-ink-soft">{item.label}</span>
            </div>
          );
        })}
      </div>

      <p className="not-prose mt-4 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
        <IconBox size={13} /> Délai de retour : {shipping.returnsDays} jours après réception (voir Retours).
      </p>
    </InfoPage>
  );
}
