import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconArrowRight,
  IconHeadset,
  IconInfo,
  IconRefresh,
  IconShield,
  IconStar,
  IconTruck,
  IconWallet,
} from "@/components/icons";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductCard } from "@/components/product/product-card";
import { ProductRail } from "@/components/product/product-rail";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { Tabs } from "@/components/ui/tabs";
import { Badge, Breadcrumbs, ButtonLink, Rating } from "@/components/ui/primitives";
import { SITE } from "@/config/site";
import {
  getCategoryBySlug,
  getProductBySlug,
  getRelatedProducts,
  getReviewsForProduct,
  getStoreData,
} from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { dimensionsLabel, productDiscount } from "@/lib/product";
import { formatTND } from "@/lib/money";
import type { Product, Review } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Appareil introuvable", robots: { index: false } };
  }
  const { brands } = await getStoreData();
  const brand = brands.find((entry) => entry.slug === product.brandSlug);
  const title = `${product.name} — ${brand?.name ?? "MaisonTech"}`;
  const description = `${product.shortDescription} ${product.warranty}. Livraison en Tunisie, paiement à la livraison. Prix : ${formatTND(product.price)}.`;

  return {
    title,
    description,
    alternates: { canonical: `/produit/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE.name}`,
      description,
      url: `/produit/${product.slug}`,
      siteName: SITE.name,
    },
    twitter: { card: "summary", title, description },
  };
}

const SPEC_GROUP_LABEL: Record<string, string> = {
  performance: "Performance",
  dimensions: "Dimensions & poids",
  energy: "Énergie & consommation",
  features: "Équipements",
  general: "Informations générales",
};

const SPEC_GROUP_ORDER = ["performance", "features", "energy", "dimensions", "general"];

function Specifications({ product }: { product: Product }) {
  const groups = SPEC_GROUP_ORDER.map((group) => ({
    group,
    label: SPEC_GROUP_LABEL[group] ?? group,
    rows: product.specs.filter((spec) => (spec.group ?? "general") === group),
  })).filter((entry) => entry.rows.length > 0);

  const extra = [
    { label: "Dimensions (L × H × P)", value: dimensionsLabel(product) },
    { label: "Poids net", value: `${product.weightKg} kg` },
    ...(product.energyClass
      ? [{ label: "Classe énergétique", value: `Classe ${product.energyClass}` }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {groups.map((entry) => (
        <section key={entry.group}>
          <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            {entry.label}
          </h3>
          <dl className="mt-2.5 overflow-hidden rounded-tile border border-line">
            {entry.rows.map((spec, index) => (
              <div
                key={`${spec.label}-${index}`}
                className={`grid grid-cols-1 gap-1 px-3.5 py-2.5 text-[13px] sm:grid-cols-[220px_1fr] sm:gap-4 ${
                  index % 2 === 0 ? "bg-surface" : "bg-[#fafbfa]"
                }`}
              >
                <dt className="text-ink-muted">{spec.label}</dt>
                <dd className="font-medium text-ink">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <section>
        <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink-muted">
          Repères de la fiche
        </h3>
        <dl className="mt-2.5 overflow-hidden rounded-tile border border-line">
          {extra.map((row, index) => (
            <div
              key={row.label}
              className={`grid grid-cols-1 gap-1 px-3.5 py-2.5 text-[13px] sm:grid-cols-[220px_1fr] sm:gap-4 ${
                index % 2 === 0 ? "bg-surface" : "bg-[#fafbfa]"
              }`}
            >
              <dt className="text-ink-muted">{row.label}</dt>
              <dd className="font-medium text-ink">{row.value}</dd>
            </div>
          ))}
          <div className="grid grid-cols-1 gap-1 border-t border-line px-3.5 py-2.5 text-[13px] sm:grid-cols-[220px_1fr] sm:gap-4">
            <dt className="text-ink-muted">Référence</dt>
            <dd className="font-medium text-ink">{product.sku}</dd>
          </div>
        </dl>
        <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
          Caractéristiques de démonstration, générées pour ce catalogue fictif. Vérifiez toujours la
          fiche du fabricant avant un achat réel.
        </p>
      </section>
    </div>
  );
}

function ReviewList({ reviews, product }: { reviews: Review[]; product: Product }) {
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));
  const max = Math.max(1, ...distribution.map((entry) => entry.count));

  return (
    <div className="rounded-panel border border-line bg-surface p-5 sm:p-6" id="avis">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="lg:w-[240px] lg:shrink-0">
          <p className="eyebrow">Avis clients</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-[38px] font-extrabold leading-none tracking-tight text-navy">
              {product.rating.toFixed(1)}
            </span>
            <span className="pb-1 text-[13px] text-ink-muted">/ 5</span>
          </div>
          <div className="mt-1.5">
            <Rating value={product.rating} showValue={false} />
          </div>
          <p className="mt-1.5 text-[12px] text-ink-muted">
            {product.reviewCount} avis cumulés · {reviews.length} commentaire
            {reviews.length > 1 ? "s" : ""} publié{reviews.length > 1 ? "s" : ""}
          </p>

          <ul className="mt-4 space-y-1.5">
            {distribution.map((entry) => (
              <li key={entry.star} className="flex items-center gap-2 text-[11.5px] text-ink-soft">
                <span className="w-3 text-right font-semibold text-ink">{entry.star}</span>
                <IconStar size={11} filled className="text-[#c98a1b]" />
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eef0ef]">
                  <span
                    className="block h-full rounded-full bg-[#c98a1b]"
                    style={{ width: `${Math.round((entry.count / max) * 100)}%` }}
                  />
                </span>
                <span className="w-4 text-right text-ink-muted">{entry.count}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">
            Avis de démonstration rédigés pour ce catalogue fictif. Aucun avis réel n'est collecté.
          </p>
        </div>

        <ul className="min-w-0 flex-1 space-y-4">
          {reviews.length === 0 && (
            <li className="rounded-tile border border-dashed border-line-strong px-4 py-6 text-[13px] text-ink-muted">
              Aucun commentaire publié pour cet appareil.
            </li>
          )}
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent-dark">
                  {review.author
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="text-[13px] font-semibold text-ink">{review.author}</span>
                <span className="text-[11.5px] text-ink-muted">{review.city}</span>
                <span className="text-[11.5px] text-ink-muted">· {formatDate(review.date)}</span>
                <span className="ml-auto flex items-center gap-0.5 text-[#c98a1b]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconStar key={star} size={12} filled={star <= review.rating} />
                  ))}
                </span>
              </div>
              <p className="mt-2 text-[13.5px] font-semibold text-ink">{review.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{review.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [{ brands, categories, settings }, category, reviews, related] = await Promise.all([
    getStoreData(),
    getCategoryBySlug(product.categorySlug),
    getReviewsForProduct(product.slug),
    getRelatedProducts(product, 4),
  ]);

  const brand = brands.find((entry) => entry.slug === product.brandSlug);
  const brandNames = Object.fromEntries(brands.map((entry) => [entry.slug, entry.name]));
  const discount = productDiscount(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: brand?.name ?? SITE.name },
    category: category?.name,
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(3),
      priceCurrency: SITE.currency,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE.url}/produit/${product.slug}`,
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  const descriptionTab = (
    <div className="max-w-3xl space-y-3.5 text-[13.5px] leading-relaxed text-ink-soft">
      {product.description.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            Points forts
          </span>
          {product.tags.map((tag) => (
            <Badge key={tag} tone="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  const shippingTab = (
    <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
      {[
        {
          icon: <IconTruck size={17} />,
          title: "Livraison",
          body: `Expédition sous 48 h ouvrées, livraison estimée en ${settings.shipping.estimatedDays} partout en Tunisie. Frais de port : ${formatTND(settings.shipping.flatRate)}, offerts dès ${formatTND(settings.shipping.freeShippingThreshold)} d'achat.`,
        },
        {
          icon: <IconWallet size={17} />,
          title: "Paiement",
          body: "Paiement à la livraison ou virement bancaire selon les options activées dans la démonstration. Aucun paiement en ligne n'est encaissé.",
        },
        {
          icon: <IconRefresh size={17} />,
          title: `Retours ${settings.shipping.returnsDays} jours`,
          body: "Appareil non installé, dans son emballage d'origine, avec la facture. Les frais de retour peuvent être à la charge du client — politique fictive à valider.",
        },
        {
          icon: <IconShield size={17} />,
          title: product.warranty,
          body: "Garantie constructeur indiquée à titre illustratif. Le service après-vente réel dépendrait du distributeur agréé en Tunisie.",
        },
      ].map((entry) => (
        <div key={entry.title} className="rounded-tile border border-line bg-surface p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <span className="text-accent-dark">{entry.icon}</span>
            {entry.title}
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{entry.body}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pb-6">
      <script
        type="application/ld+json"
        // Structured data mirrors the demo record exactly; no invented reviews.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-page pt-5">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Catalogue", href: "/produits" },
            ...(category
              ? [{ label: category.name, href: `/categorie/${category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />
      </div>

      <div className="container-page mt-4">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,470px)] lg:gap-8 xl:gap-12">
          <div className="min-w-0">
            <ProductGallery
              product={product}
              badge={discount > 0 ? `-${discount} %` : product.isNew ? "Nouveau" : undefined}
            />
          </div>
          <div className="min-w-0">
            <PurchasePanel
              product={product}
              brandName={brand?.name ?? product.brandSlug}
              categoryName={category?.name ?? product.categorySlug}
              settings={settings}
            />
          </div>
        </div>
      </div>

      <div className="container-page mt-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="min-w-0 rounded-panel border border-line bg-surface p-5 sm:p-6">
            <Tabs
              items={[
                { id: "description", label: "Description", content: descriptionTab },
                {
                  id: "specs",
                  label: "Caractéristiques",
                  hint: String(product.specs.length),
                  content: <Specifications product={product} />,
                },
                { id: "livraison", label: "Livraison & garantie", content: shippingTab },
              ]}
            />
          </div>

          <aside className="space-y-3.5">
            {brand && (
              <div className="rounded-panel border border-line bg-surface p-4">
                <p className="eyebrow">La marque</p>
                <p className="mt-1.5 text-[15px] font-bold text-ink">{brand.name}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{brand.tagline}</p>
                <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
                  {brand.origin} · marque fictive
                </p>
                <Link
                  href={`/marques/${brand.slug}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent-dark hover:underline"
                >
                  Voir la marque
                  <IconArrowRight size={14} />
                </Link>
              </div>
            )}

            <div className="rounded-panel border border-line bg-surface p-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <IconHeadset size={16} className="text-accent-dark" />
                Besoin d'un conseil ?
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
                {settings.supportHours}. Un conseiller vous aide à dimensionner l'appareil avant
                l'achat.
              </p>
              <a
                href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}
                className="mt-2.5 inline-block text-[13px] font-bold text-accent-dark hover:underline"
              >
                {settings.supportPhone}
              </a>
              <Link
                href="/contact"
                className="mt-1 block text-[12px] font-semibold text-ink-soft hover:text-accent-dark"
              >
                Écrire au service client →
              </Link>
            </div>

            <div className="rounded-panel border border-line bg-[#f4f6f5] p-4">
              <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-soft">
                <IconInfo size={14} className="mt-0.5 shrink-0" />
                Fiche de démonstration : prix, stock et caractéristiques sont fictifs et modifiables
                depuis l'administration.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <div className="container-page mt-6">
        <ReviewList reviews={reviews} product={product} />
      </div>

      {related.length > 0 && (
        <section className="container-page mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Vous aimerez aussi</p>
              <h2 className="mt-1.5 text-[22px] font-bold leading-tight text-ink sm:text-[25px]">
                Appareils proches
              </h2>
            </div>
            {category && (
              <ButtonLink href={`/categorie/${category.slug}`} variant="ghost" size="sm">
                Tout {category.shortName.toLowerCase()}
                <IconArrowRight size={15} />
              </ButtonLink>
            )}
          </div>
          <div className="mt-4">
            <ProductRail label="Appareils proches">
              {related.map((entry) => (
                <div key={entry.id} className="w-[232px] shrink-0 snap-start sm:w-[248px]">
                  <ProductCard product={entry} brandName={brandNames[entry.brandSlug] ?? ""} compact />
                </div>
              ))}
            </ProductRail>
          </div>
        </section>
      )}

      <RecentlyViewed currentId={product.id} brandNames={brandNames} />
    </div>
  );
}
