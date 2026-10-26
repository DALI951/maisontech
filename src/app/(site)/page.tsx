import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconInfo } from "@/components/icons";
import { FaqAccordion } from "@/components/faq-accordion";
import { Hero } from "@/components/home/hero";
import {
  BrandStrip,
  CategoryGrid,
  EditorialGuides,
  PromoDuo,
  Testimonials,
  TrustBadges,
} from "@/components/home/sections";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { ProductCard } from "@/components/product/product-card";
import { ProductRail } from "@/components/product/product-rail";
import { ButtonLink, SectionHeader } from "@/components/ui/primitives";
import { categoryEditorial, HOME_FAQS } from "@/data/content";
import { countByCategory, getFeaturedProducts, getStoreData } from "@/lib/catalog";
import { SITE } from "@/config/site";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [{ products, categories, brands, settings }, featured] = await Promise.all([
    getStoreData(),
    getFeaturedProducts(),
  ]);

  const sortedCategories = categories.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const counts = countByCategory(products);
  const representatives = Object.fromEntries(
    sortedCategories.map((category) => [
      category.slug,
      products.find((product) => product.categorySlug === category.slug),
    ]),
  ) as Record<string, Product | undefined>;
  const brandNames = new Map(brands.map((brand) => [brand.slug, brand.name]));

  const guideSlugs = ["refrigerateurs", "lave-linge", "climatiseurs"];
  const guides = guideSlugs
    .map((slug) => categoryEditorial[slug])
    .filter((guide): guide is { title: string; body: string } => Boolean(guide));

  const railCard = (product: Product) => (
    <div key={product.id} className="w-[232px] shrink-0 snap-start sm:w-[248px]">
      <ProductCard product={product} brandName={brandNames.get(product.brandSlug) ?? ""} compact />
    </div>
  );

  return (
    <div className="pb-4">
      <Hero slides={settings.hero} products={products} />

      <div className="container-page">
        <div className="mt-4 flex items-start gap-2.5 rounded-field border border-line bg-surface px-3.5 py-2.5 text-[12px] leading-relaxed text-ink-soft">
          <IconInfo size={16} className="mt-0.5 shrink-0 text-accent-dark" />
          <p>
            <strong className="font-semibold text-ink">Boutique de démonstration.</strong> Les
            produits, marques et prix sont fictifs ; les commandes sont simulées et aucun paiement
            n'est encaissé. Le catalogue reste entièrement modifiable depuis l'administration.
          </p>
        </div>
      </div>

      <section className="container-page mt-6">
        <TrustBadges badges={settings.trustBadges} />
      </section>

      <section className="container-page mt-12">
        <SectionHeader
          eyebrow="Le catalogue"
          title="Tout pour la maison, par catégorie"
          description="Douze rayons, des réfrigérateurs aux machines à café. Chaque fiche détaille les caractéristiques utiles avant l'achat."
          action={
            <ButtonLink href="/produits" variant="secondary" size="sm">
              Tout le catalogue
              <IconArrowRight size={15} />
            </ButtonLink>
          }
        />
        <div className="mt-5">
          <CategoryGrid
            categories={sortedCategories}
            counts={counts}
            representatives={representatives}
          />
        </div>
      </section>

      <section className="container-page mt-12">
        <SectionHeader
          eyebrow="Les plus vendus"
          title="Ce que les clients choisissent"
          description="Une sélection des appareils les plus commandés de la démonstration."
          action={
            <ButtonLink href="/produits?tri=popularite" variant="ghost" size="sm">
              Voir plus
              <IconArrowRight size={15} />
            </ButtonLink>
          }
        />
        <div className="mt-5">
          <ProductRail label="Meilleures ventes">
            {featured.bestsellers.map(railCard)}
          </ProductRail>
        </div>
      </section>

      <section className="container-page mt-12">
        <PromoDuo promotions={featured.promotions} newArrivals={featured.newArrivals} />
      </section>

      <section className="container-page mt-12">
        <SectionHeader
          eyebrow="Promotions"
          title="Les prix baissent, pas la qualité"
          description="Remises de démonstration appliquées directement sur le prix affiché."
          action={
            <ButtonLink href="/promotions" variant="ghost" size="sm">
              Toutes les promos
              <IconArrowRight size={15} />
            </ButtonLink>
          }
        />
        <div className="mt-5">
          <ProductRail label="Promotions en cours">
            {featured.promotions.map(railCard)}
          </ProductRail>
        </div>
      </section>

      <section className="container-page mt-12">
        <SectionHeader
          eyebrow="Guides d'achat"
          title="Choisir sans se tromper"
          description="Trois repères concrets pour dimensionner un appareil avant de comparer les modèles."
        />
        <div className="mt-5">
          <EditorialGuides guides={guides} hrefs={guideSlugs.map((slug) => `/categorie/${slug}`)} />
        </div>
      </section>

      <section className="container-page mt-12">
        <SectionHeader
          eyebrow="Nouveautés"
          title="Fraîchement arrivés en rayon"
          action={
            <ButtonLink href="/produits?tri=nouveautes" variant="ghost" size="sm">
              Voir les nouveautés
              <IconArrowRight size={15} />
            </ButtonLink>
          }
        />
        <div className="mt-5">
          <ProductRail label="Nouveautés">{featured.newArrivals.map(railCard)}</ProductRail>
        </div>
      </section>

      <section className="container-page mt-12">
        <SectionHeader
          eyebrow="Les marques"
          title="Dix marques de démonstration"
          description="Toutes fictives, pensées pour illustrer une boutique multi-marques. Aucune spécification réelle n'est revendiquée."
          action={
            <ButtonLink href="/marques" variant="ghost" size="sm">
              Toutes les marques
              <IconArrowRight size={15} />
            </ButtonLink>
          }
        />
        <div className="mt-5">
          <BrandStrip brands={brands} />
        </div>
      </section>

      <section className="container-page mt-12">
        <SectionHeader
          eyebrow="Recommandés"
          title="Les mieux notés du catalogue"
          description="Classement basé sur les notes de démonstration et le nombre d'avis affichés."
          action={
            <ButtonLink href="/produits?tri=note" variant="ghost" size="sm">
              Voir le classement
              <IconArrowRight size={15} />
            </ButtonLink>
          }
        />
        <div className="mt-5">
          <ProductRail label="Appareils recommandés">{featured.recommended.map(railCard)}</ProductRail>
        </div>
      </section>

      <section className="container-page mt-12">
        <SectionHeader eyebrow="Avis clients" title="Ce qu'on en dit" />
        <div className="mt-5">
          <Testimonials />
        </div>
      </section>

      <section className="container-page mt-12">
        <div className="grid gap-6 rounded-panel border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">Newsletter</p>
            <h2 className="mt-2 text-[24px] font-bold leading-tight text-ink sm:text-[27px]">
              {settings.newsletter.heading}
            </h2>
            <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
              {settings.newsletter.description}
            </p>
          </div>
          <div>
            <NewsletterForm note={settings.newsletter.note} />
          </div>
        </div>
      </section>

      <section className="container-page mt-12">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow">Questions fréquentes</p>
            <h2 className="mt-2 text-[24px] font-bold leading-tight text-ink sm:text-[27px]">
              Livraison, paiement, garantie
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
              Les réponses ci-contre décrivent le fonctionnement de cette démonstration, pas une
              politique commerciale réelle.
            </p>
            <Link
              href="/faq"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-dark hover:underline"
            >
              Toutes les questions
              <IconArrowRight size={15} />
            </Link>
          </div>
          <FaqAccordion items={HOME_FAQS} />
        </div>
      </section>
    </div>
  );
}
