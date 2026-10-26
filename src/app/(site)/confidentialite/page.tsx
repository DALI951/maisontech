import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { Alert, ButtonLink } from "@/components/ui/primitives";
import { CONTACT, LEGAL } from "@/config/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données la boutique MaisonTech enregistre réellement, où elles sont stockées, combien de temps elles sont conservées et comment exercer vos droits.",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <InfoPage
      eyebrow="Cadre juridique"
      title="Politique de confidentialité"
      description="Cette page décrit le comportement réel de l'application que vous consultez, pas une politique générique copiée d'un modèle."
      updated={LEGAL.lastUpdated}
    >
      <Alert tone="info" title="Données de démonstration">
        Cette boutique est une démonstration. La base de données est un fichier JSON stocké sur le serveur du projet et
        régénéré par le script de réinitialisation. N&apos;y saisissez pas de données personnelles réelles : utilisez
        une adresse fictive.
      </Alert>

      <h2>Qui est responsable</h2>
      <p>
        Le responsable du traitement est l&apos;éditeur du site, joignable à l&apos;adresse{" "}
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> et au <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>.
        L&apos;identité complète figure sur la page <Link href="/mentions-legales">Mentions légales</Link>.
      </p>

      <h2>Ce que nous enregistrons réellement</h2>
      <h3>Compte client</h3>
      <ul>
        <li>Nom complet, adresse e-mail, numéro de téléphone et mot de passe.</li>
        <li>
          Le mot de passe n&apos;est jamais stocké en clair : il est transformé par hachage <strong>scrypt</strong> avec
          un sel aléatoire unique par compte. Il est impossible de le relire, seulement de le vérifier.
        </li>
        <li>Les commandes passées, leurs lignes, les montants et l&apos;adresse de livraison associée.</li>
        <li>Le carnet d&apos;adresses que vous ajoutez dans votre espace client.</li>
      </ul>

      <h3>Session</h3>
      <ul>
        <li>
          Un cookie <strong>mt_session</strong>, marqué HttpOnly et SameSite, contenant un identifiant de session
          aléatoire. Il sert uniquement à vous reconnaître entre deux pages.
        </li>
        <li>Seul le hachage du jeton est conservé côté serveur, avec une date d&apos;expiration.</li>
        <li>La déconnexion supprime la session côté serveur et efface le cookie.</li>
      </ul>

      <h3>Panier, favoris et comparaison</h3>
      <ul>
        <li>
          Le panier (<code>mt.cart.v1</code>), les favoris (<code>mt.wishlist.v1</code>), la comparaison (
          <code>mt.compare.v1</code>), les produits récemment consultés (<code>mt.recent.v1</code>) et le code promo
          saisi sont stockés dans le <strong>localStorage</strong> de votre navigateur.
        </li>
        <li>
          Ces données ne quittent pas votre appareil. Elles contiennent des identifiants de produits et des quantités,
          jamais d&apos;adresse ni d&apos;information de paiement.
        </li>
        <li>Un bouton d&apos;effacement est disponible dans le panier et dans les favoris.</li>
      </ul>

      <h3>Messages et newsletter</h3>
      <ul>
        <li>Le formulaire de contact enregistre votre nom, votre e-mail, l&apos;objet et le contenu du message.</li>
        <li>
          La newsletter conserve uniquement l&apos;adresse e-mail et la date d&apos;inscription. Aucun e-mail
          n&apos;est réellement envoyé dans cette démonstration.
        </li>
      </ul>

      <h2>Ce que nous ne faisons pas</h2>
      <ul>
        <li>Aucun outil de mesure d&apos;audience, aucun pixel publicitaire, aucun traceur tiers n&apos;est chargé.</li>
        <li>Aucun profilage publicitaire et aucune revente de données à des partenaires.</li>
        <li>
          Aucune donnée bancaire n&apos;est collectée : le paiement par carte n&apos;est pas intégré et ne doit pas être
          tenté sur ce site.
        </li>
        <li>Les mots de passe ne sont jamais écrits dans les journaux du serveur.</li>
      </ul>

      <h2>Pourquoi ces données sont traitées</h2>
      <ul>
        <li>
          <strong>Exécution de la commande :</strong> créer le compte, préparer la livraison, gérer le service
          après-vente et les retours.
        </li>
        <li>
          <strong>Intérêt légitime :</strong> assurer la sécurité du site, prévenir les abus et conserver une trace des
          commandes.
        </li>
        <li>
          <strong>Consentement :</strong> envoi de la newsletter. Il peut être retiré à tout moment.
        </li>
      </ul>

      <h2>Combien de temps</h2>
      <ul>
        <li>Sessions : jusqu&apos;à expiration du cookie, et au maximum la durée configurée côté serveur.</li>
        <li>Compte et commandes : conservés tant que le compte existe, puis archivés ou supprimés sur demande.</li>
        <li>Messages de contact : conservés le temps du traitement de la demande.</li>
        <li>
          Réinitialiser la démonstration efface l&apos;ensemble de la base, y compris les comptes et les commandes
          simulées.
        </li>
      </ul>

      <h2>Qui peut y accéder</h2>
      <p>
        Les données sont accessibles au personnel disposant d&apos;un compte administrateur, dans la limite de ses
        besoins (gestion des commandes, du catalogue et du service client). Aucun sous-traitant externe
        n&apos;intervient dans cette démonstration : le stockage est local au serveur du projet.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l&apos;accès à vos données, leur rectification ou leur suppression, vous opposer à un
        traitement et retirer votre consentement à la newsletter. Écrivez à{" "}
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> en précisant l&apos;adresse du compte concerné. Une
        réponse est apportée dans un délai raisonnable après vérification de votre identité.
      </p>
      <p>
        Dans l&apos;espace client, vous pouvez déjà modifier vos coordonnées et votre carnet d&apos;adresses, et
        supprimer les données stockées localement en vidant le panier et les favoris.
      </p>

      <h2>Sécurité</h2>
      <p>
        Les mots de passe sont hachés avec scrypt, les sessions reposent sur des jetons aléatoires stockés en base, et
        les routes d&apos;administration vérifient le rôle côté serveur avant tout rendu. Aucun contrôle
        d&apos;authentification n&apos;est effectué uniquement dans le navigateur.
      </p>

      <h2>Modifications</h2>
      <p>
        Cette politique peut évoluer avec le site. La date de dernière mise à jour figure en haut de page. Dernière
        révision : {LEGAL.lastUpdated}.
      </p>

      <div className="not-prose mt-6 flex flex-wrap gap-2">
        <ButtonLink href="/contact" variant="dark">
          Exercer un droit
        </ButtonLink>
        <ButtonLink href="/cgv" variant="secondary">
          Conditions de vente
        </ButtonLink>
      </div>
    </InfoPage>
  );
}
