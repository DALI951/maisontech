import type { Category } from "@/lib/types";

export interface FaqItem {
  id: string;
  category: "Commande" | "Livraison" | "Paiement" | "Garantie" | "Retours";
  question: string;
  answer: string;
}

/**
 * DEMO FAQ content. The answers describe how this demo behaves, not a real
 * shop's contractual policy.
 */
export const faqs: FaqItem[] = [
  {
    id: "faq-1",
    category: "Commande",
    question: "Comment passer commande sur MaisonTech ?",
    answer:
      "Ajoutez vos appareils au panier, ouvrez le panier puis cliquez sur « Passer commande ». Renseignez vos coordonnées, choisissez le mode de paiement disponible et validez. Dans cette démonstration, la commande est simulée : aucune somme n'est prélevée et aucun appareil n'est expédié.",
  },
  {
    id: "faq-2",
    category: "Livraison",
    question: "Livrez-vous partout en Tunisie ?",
    answer:
      "La démonstration annonce une livraison vers les 24 gouvernorats, avec un tarif forfaitaire configurable et la livraison offerte au-delà d'un seuil. Ces montants sont des valeurs de test modifiables dans l'administration.",
  },
  {
    id: "faq-3",
    category: "Livraison",
    question: "Quels sont les délais de livraison ?",
    answer:
      "Le délai affiché par défaut est de 2 à 5 jours ouvrés. Il s'agit d'une valeur de configuration, pas d'un engagement contractuel : chaque transporteur a ses propres délais.",
  },
  {
    id: "faq-4",
    category: "Paiement",
    question: "Puis-je payer à la livraison ?",
    answer:
      "Oui, si l'option « paiement à la livraison » est activée dans les paramètres de la boutique. Le paiement en ligne est volontairement désactivé tant qu'aucun prestataire de paiement sécurisé n'est configuré côté serveur.",
  },
  {
    id: "faq-5",
    category: "Paiement",
    question: "Le paiement par carte est-il disponible ?",
    answer:
      "Non. Cette version de démonstration n'intègre aucun prestataire de paiement : aucune donnée bancaire ne doit être saisie. Un paiement en ligne réel exige une intégration serveur (Stripe, Kenz'up, Paymee…) et une conformité PCI-DSS.",
  },
  {
    id: "faq-6",
    category: "Garantie",
    question: "Les appareils sont-ils garantis ?",
    answer:
      "Les fiches produits mentionnent une garantie de 2 ans à titre illustratif. Les durées réelles dépendent du fabricant et du revendeur : elles doivent être remplacées par les conditions officielles avant mise en ligne.",
  },
  {
    id: "faq-7",
    category: "Retours",
    question: "Comment retourner un appareil ?",
    answer:
      "La politique de démonstration prévoit un retour sous 7 jours, appareil non installé et dans son emballage d'origine. Le remboursement est effectué après contrôle. Adaptez ce délai et ces conditions à votre boutique réelle.",
  },
  {
    id: "faq-8",
    category: "Commande",
    question: "Puis-je modifier ma commande après validation ?",
    answer:
      "Dans la démonstration, une commande simulée peut être annulée depuis l'espace client tant qu'elle n'est pas marquée « expédiée ». Dans une boutique réelle, la modification dépend de l'état de préparation.",
  },
];

export const faqCategories: FaqItem["category"][] = [
  "Commande",
  "Livraison",
  "Paiement",
  "Garantie",
  "Retours",
];

export const HOME_FAQS = faqs.slice(0, 5);

/** Home-page testimonials. Clearly labelled as demo content in the UI. */
export const testimonials = [
  {
    id: "t1",
    author: "Sonia B.",
    city: "La Marsa",
    rating: 5,
    product: "Réfrigérateur combiné NoFrost 340 L",
    body:
      "Livraison en trois jours et installation faite sur place. Le réfrigérateur est vraiment silencieux, on l'oublie la nuit.",
  },
  {
    id: "t2",
    author: "Karim T.",
    city: "Sfax",
    rating: 5,
    product: "Lave-linge frontal 10 kg Inverter",
    body:
      "J'ai comparé trois modèles sur le site avant de choisir. Les fiches techniques sont claires, ça évite de se tromper de capacité.",
  },
  {
    id: "t3",
    author: "Ines M.",
    city: "Sousse",
    rating: 4,
    product: "Machine à café automatique avec broyeur",
    body:
      "Le café est excellent et le réglage de la mouture est simple. Le réservoir demande à être rempli souvent, mais le résultat est là.",
  },
  {
    id: "t4",
    author: "Hamza R.",
    city: "Ben Arous",
    rating: 5,
    product: "Climatiseur inverter 12 000 BTU",
    body:
      "Conseil utile sur la puissance nécessaire pour la pièce. Le split est discret et refroidit vite, même en pleine après-midi.",
  },
];

export const categoryEditorial: Record<string, { title: string; body: string }> = {
  refrigerateurs: {
    title: "Bien choisir son réfrigérateur",
    body: "Comptez 100 à 150 litres par personne. Le NoFrost évite le givre, le froid ventilé homogénéise la température et un niveau sonore sous 40 dB se remarque à peine dans une cuisine ouverte.",
  },
  "lave-linge": {
    title: "Quelle capacité pour la maison ?",
    body: "7 kg pour deux personnes, 8 à 9 kg pour quatre, 10 kg et plus pour une famille nombreuse ou les couettes. Un essorage à 1 400 tr/min raccourcit nettement le séchage.",
  },
  "lave-vaisselle": {
    title: "Couverts, largeur, bruit",
    body: "Un couvert correspond à une assiette, un verre, un couteau, une fourchette et une cuillère. 45 cm pour les petits espaces, 60 cm pour une famille ; sous 45 dB, l'appareil tourne sans gêner.",
  },
  "cuisinieres-four": {
    title: "Gaz, vitrocéramique ou induction",
    body: "Le gaz reste le moins coûteux à l'usage et fonctionne sans électricité. La vitrocéramique est simple à nettoyer. L'induction est la plus réactive et la plus sûre, mais nécessite des casseroles compatibles.",
  },
  "micro-ondes": {
    title: "Solo, grill ou combiné",
    body: "Un solo suffit pour réchauffer. Le grill dore gratins et pizzas. Le combiné convection remplace un second four, au prix d'un encombrement plus important.",
  },
  climatiseurs: {
    title: "Calculer la puissance nécessaire",
    body: "Environ 100 BTU par mètre carré, à ajuster selon l'exposition et l'isolation. Un inverter module sa puissance et consomme moins qu'un appareil on/off de même capacité.",
  },
  televiseurs: {
    title: "Taille, recul, résolution",
    body: "Comptez 1,2 à 1,5 fois la diagonale en pouces pour le recul en centimètres. Le 4K se justifie au-delà de 43 pouces ; l'OLED apporte des noirs profonds, le QLED plus de luminosité.",
  },
  aspirateurs: {
    title: "Traîneau, balai ou robot",
    body: "Le traîneau reste le plus efficace sur les grands sols et les tapis. Le balai sans fil gagne sur la rapidité. Le robot entretient, mais ne remplace pas un aspirateur principal.",
  },
  "petits-electromenagers": {
    title: "Les appareils qu'on utilise vraiment",
    body: "Une bouilloire économe, un grille-pain à tiroir amovible et une friteuse à air chaud couvrent l'essentiel du quotidien sans encombrer le plan de travail.",
  },
  "machines-a-cafe": {
    title: "Grains, capsules ou filtre",
    body: "Les grains donnent le meilleur résultat et le coût par tasse le plus bas. Les capsules sont pratiques. La cafetière filtre convient aux grandes quantités et aux matins pressés.",
  },
  "mixeurs-robots": {
    title: "Pétrir, mixer, hacher",
    body: "Un robot pâtissier se choisit sur la puissance et la capacité du bol. Un blender sur la résistance du bol au choc thermique. Pour les petites quantités, un mixeur plongeant suffit.",
  },
  "chauffage-ventilation": {
    title: "Chauffer sans surconsommer",
    body: "Un radiateur à bain d'huile chauffe lentement mais garde la chaleur. Le céramique chauffe vite et brasse l'air. Pour une pièce de passage, un convecteur programmable suffit.",
  },
};

export const categoryKeywords: Record<string, string> = Object.fromEntries(
  (["refrigerateurs"] as string[]).map((slug) => [slug, slug]),
);

export type { Category };
