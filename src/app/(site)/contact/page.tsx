import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { IconClock, IconMail, IconPhone, IconPin } from "@/components/icons";
import { InfoPage } from "@/components/layout/info-page";
import { Alert } from "@/components/ui/primitives";
import { CONTACT, SOCIAL } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez MaisonTech : téléphone, WhatsApp, e-mail et formulaire. Horaires du service client et adresse du showroom (démonstration).",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    icon: IconPhone,
    label: "Téléphone",
    value: CONTACT.phone,
    href: CONTACT.phoneHref,
    note: "Du lundi au samedi, pendant les horaires d'ouverture.",
  },
  {
    icon: IconMail,
    label: "E-mail",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    note: "Réponse sous 1 jour ouvré (engagement de démonstration).",
  },
  {
    icon: IconPhone,
    label: "WhatsApp",
    value: CONTACT.whatsapp,
    href: `https://wa.me/${CONTACT.whatsapp.replace(/[^\d]/g, "")}`,
    note: "Photos de plaque signalétique acceptées pour identifier un appareil.",
  },
  {
    icon: IconPin,
    label: "Showroom",
    value: `${CONTACT.address}, ${CONTACT.postalCode} ${CONTACT.city}`,
    href: undefined,
    note: CONTACT.mapNote,
  },
] as const;

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Service client"
      title="Contact"
      description="Une question sur un appareil, une commande en cours ou un retour ? Choisissez le canal qui vous arrange."
      aside={
        <div className="rounded-panel border border-line bg-surface p-4">
          <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            <IconClock size={13} /> Horaires
          </p>
          <p className="mt-1.5 text-[12.5px] font-semibold text-ink">{CONTACT.hours}</p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
            Fermé les jours fériés. Les messages reçus en dehors des horaires sont traités le jour ouvré suivant.
          </p>
          <div className="mt-3 border-t border-line pt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">Réseaux</p>
            <ul className="mt-1 space-y-1">
              {SOCIAL.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[12px] font-semibold text-ink-soft hover:text-accent-dark"
                  >
                    {item.label} · {item.handle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
    >
      <Alert tone="info" title="Démonstration">
        Le formulaire fonctionne réellement : votre message est enregistré dans la base de démonstration et visible
        dans l&apos;administration. Aucun e-mail n&apos;est envoyé tant qu&apos;aucun service d&apos;envoi n&apos;est
        configuré.
      </Alert>

      <div className="not-prose mt-4 grid gap-2.5 sm:grid-cols-2">
        {CHANNELS.map((channel) => {
          const Icon = channel.icon;
          const content = (
            <>
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                <Icon size={13} /> {channel.label}
              </span>
              <span className="mt-1 block text-[13.5px] font-semibold text-ink">{channel.value}</span>
              <span className="mt-1 block text-[11.5px] leading-relaxed text-ink-muted">{channel.note}</span>
            </>
          );
          return channel.href ? (
            <a
              key={channel.label}
              href={channel.href}
              className="rounded-field border border-line bg-paper p-3.5 transition-colors hover:border-accent-line hover:bg-surface"
            >
              {content}
            </a>
          ) : (
            <div key={channel.label} className="rounded-field border border-line bg-paper p-3.5">
              {content}
            </div>
          );
        })}
      </div>

      <h2>Écrire au service client</h2>
      <p>
        Décrivez votre demande le plus précisément possible : référence de commande, nom de l&apos;appareil ou
        numéro de produit. Pour un problème technique, indiquez le message d&apos;erreur ou joignez une photo depuis
        WhatsApp.
      </p>

      <div className="not-prose mt-4">
        <ContactForm />
      </div>

      <h2>Avant d&apos;écrire</h2>
      <p>
        La plupart des questions trouvent une réponse immédiate dans les pages <Link href="/faq">FAQ</Link>,{" "}
        <Link href="/livraison">Livraison</Link> et <Link href="/retours">Retours et garanties</Link>. Pour suivre
        une commande, ouvrez <Link href="/compte/commandes">Mes commandes</Link> depuis votre espace client.
      </p>

      <h2>Réclamations</h2>
      <p>
        Si votre demande n&apos;est pas résolue après un premier échange, répondez au même fil en précisant
        « réclamation » dans l&apos;objet. Dans une boutique réelle, ce canal doit être relié à une procédure de
        médiation et à un registre de réclamations conformes à la réglementation en vigueur.
      </p>
    </InfoPage>
  );
}
