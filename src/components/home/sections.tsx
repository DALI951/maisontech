import Link from "next/link";
import {
  IconArrowRight,
  IconHeadset,
  IconShield,
  IconSparkle,
  IconTag,
  IconTruck,
  IconWallet,
} from "@/components/icons";
import { ProductVisual } from "@/components/product/product-visual";
import { Rating } from "@/components/ui/primitives";
import { formatTND } from "@/lib/money";
import type { Brand, Category, Product, StoreSettings } from "@/lib/types";
import { testimonials } from "@/data/content";

/* ------------------------------------------------------------ categories */

export function CategoryGrid({
  categories,
  counts,
  representatives,
}: {
  categories: Category[];
  counts: Record<string, number>;
  representatives: Record<string, Product | undefined>;
}) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {categories.map((category) => {
        const product = representatives[category.slug];
        return (
          <li key={category.slug}>
            <Link
              href={`/categorie/${category.slug}`}
              className="group flex h-full flex-col rounded-card border border-line bg-surface p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card"
            >
              <div className="relative flex aspect-[5/4] items-center justify-center rounded-tile bg-gradient-to-b from-[#f7f8f6] to-[#eef1ef]">
                {product ? (
                  <ProductVisual
                    product={product}
                    className="h-full w-full p-2.5 transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                ) : (
                  <span className="text-[11px] text-ink-muted">Visuel à venir</span>
                )}
              </div>
              <div className="flex flex-1 flex-col px-1 pb-0.5 pt-2">
                <p className="text-[12.5px] font-semibold leading-tight text-ink group-hover:text-accent-dark">
                  {category.shortName}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  {counts[category.slug] ?? 0} appareils
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* --------------------------------------------------------- trust badges */

const TRUST_ICONS: Record<string, React.ReactNode> = {
  truck: <IconTruck size={20} />,
  wallet: <IconWallet size={20} />,
  shield: <IconShield size={20} />,
  headset: <IconHeadset size={20} />,
};

export function TrustBadges({ badges }: { badges: StoreSettings["trustBadges"] }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((badge) => (
        <li
          key={badge.title}
          className="flex items-start gap-3 rounded-card border border-line bg-surface p-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
            {TRUST_ICONS[badge.icon] ?? <IconShield size={20} />}
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-ink">{badge.title}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">{badge.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------- promos */

export function PromoDuo({
  promotions,
  newArrivals,
}: {
  promotions: Product[];
  newArrivals: Product[];
}) {
  const promo = promotions[0];
  const fresh = newArrivals[0];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {promo && (
        <Link
          href="/promotions"
          className="group relative flex min-h-[210px] items-center gap-4 overflow-hidden rounded-panel bg-[#f7ece6] p-6 transition-shadow hover:shadow-card sm:p-7"
        >
          <div className="relative z-10 max-w-[62%]">
            <p className="eyebrow text-promo/80">Offres du moment</p>
            <h3 className="mt-2 text-[22px] font-bold leading-tight text-ink sm:text-[25px]">
              Jusqu'à{" "}
              <em className="font-display italic text-promo">
                -{Math.max(...promotions.map((product) => Math.round((((product.originalPrice ?? product.price) - product.price) / (product.originalPrice ?? product.price)) * 100)), 0)} %
              </em>{" "}
              sur une sélection
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              {promotions.length} appareils en promotion, quantités limitées.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-promo">
              Voir les promotions
              <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
          <div className="absolute -right-2 bottom-0 top-0 w-[45%]">
            <ProductVisual product={promo} className="h-full w-full p-4" />
          </div>
        </Link>
      )}

      {fresh && (
        <Link
          href="/produits?tri=nouveautes"
          className="group relative flex min-h-[210px] items-center gap-4 overflow-hidden rounded-panel bg-navy p-6 text-white transition-shadow hover:shadow-card sm:p-7"
        >
          <div className="relative z-10 max-w-[62%]">
            <p className="eyebrow text-accent-line">Nouveautés</p>
            <h3 className="mt-2 text-[22px] font-bold leading-tight text-white sm:text-[25px]">
              Les derniers appareils{" "}
              <em className="font-display italic text-accent-line">arrivés</em>
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-white/65">
              {newArrivals.length} modèles récemment ajoutés au catalogue.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white">
              Découvrir
              <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
          <div className="absolute -right-2 bottom-0 top-0 w-[45%]">
            <ProductVisual product={fresh} className="h-full w-full p-4" />
          </div>
        </Link>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- brands */

export function BrandStrip({ brands }: { brands: Brand[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {brands.map((brand) => (
        <li key={brand.slug}>
          <Link
            href={`/marques/${brand.slug}`}
            className="group flex h-full items-center gap-3 rounded-card border border-line bg-surface px-3.5 py-3 transition-colors hover:border-accent/40"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-[13px] font-extrabold text-white"
              style={{ backgroundColor: brand.accent }}
              aria-hidden="true"
            >
              {brand.name.slice(0, 1)}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-ink group-hover:text-accent-dark">
                {brand.name}
              </span>
              <span className="block truncate text-[11px] text-ink-muted">{brand.tagline}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------- testimonials */

export function Testimonials() {
  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((testimonial) => (
          <li key={testimonial.id} className="flex flex-col rounded-card border border-line bg-surface p-4">
            <Rating value={testimonial.rating} size={13} showValue={false} />
            <blockquote className="mt-2.5 flex-1 text-[13px] leading-relaxed text-ink-soft">
              « {testimonial.body} »
            </blockquote>
            <div className="mt-3 border-t border-line pt-2.5">
              <p className="text-[12.5px] font-semibold text-ink">{testimonial.author}</p>
              <p className="text-[11.5px] text-ink-muted">
                {testimonial.city} · {testimonial.product}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11.5px] text-ink-muted">
        Avis de démonstration : ils illustrent la mise en page et ne proviennent pas de clients réels.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- guides */

export function EditorialGuides({
  guides,
  hrefs,
}: {
  guides: { title: string; body: string }[];
  hrefs: string[];
}) {
  return (
    <ul className="grid gap-3 md:grid-cols-3">
      {guides.map((guide, index) => (
        <li key={guide.title}>
          <Link
            href={hrefs[index] ?? "/produits"}
            className="group flex h-full flex-col rounded-card border border-line bg-surface p-5 transition-colors hover:border-accent/40"
          >
            <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
              <IconSparkle size={16} />
            </span>
            <h3 className="text-[15px] font-semibold text-ink group-hover:text-accent-dark">
              {guide.title}
            </h3>
            <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-soft">{guide.body}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent-dark">
              Lire la sélection
              <IconArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------- price picks */

export function PricePicks({ products }: { products: Product[] }) {
  return (
    <ul className="divide-y divide-line rounded-card border border-line bg-surface">
      {products.slice(0, 4).map((product, index) => (
        <li key={product.id}>
          <Link href={`/produit/${product.slug}`} className="flex items-center gap-3 p-3 hover:bg-paper">
            <span className="w-5 shrink-0 text-center text-[13px] font-bold text-ink-muted">
              {index + 1}
            </span>
            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-[8px] border border-line bg-paper">
              <ProductVisual product={product} className="h-full w-full" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-ink">{product.name}</span>
              <span className="flex items-center gap-1 text-[11.5px] text-ink-muted">
                <IconTag size={12} />
                {product.price < 400 ? "Petit budget" : "Bon rapport qualité-prix"}
              </span>
            </span>
            <span className="shrink-0 text-[13px] font-bold text-ink">{formatTND(product.price)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
