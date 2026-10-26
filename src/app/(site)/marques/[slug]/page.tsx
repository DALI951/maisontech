import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowRight } from "@/components/icons";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs, ButtonLink, EmptyState } from "@/components/ui/primitives";
import { brandBySlug } from "@/data/brands";
import { getBrandBySlug, getStoreData } from "@/lib/catalog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = brandBySlug(slug);
  if (!brand) return { title: "Marque introuvable" };
  return {
    title: brand.name,
    description: brand.description,
    alternates: { canonical: `/marques/${brand.slug}` },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const { products, categories } = await getStoreData();
  const brandProducts = products
    .filter((product) => product.brandSlug === brand.slug)
    .sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || b.rating - a.rating);

  const categoryNames = new Map(categories.map((category) => [category.slug, category.name]));
  const categoryCount = brandProducts.reduce<Record<string, number>>((accumulator, product) => {
    accumulator[product.categorySlug] = (accumulator[product.categorySlug] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Marques", href: "/marques" },
          { label: brand.name },
        ]}
      />

      <section className="mt-4 overflow-hidden rounded-panel border border-line bg-surface">
        <div className="h-2 w-full" style={{ backgroundColor: brand.accent }} aria-hidden="true" />
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-[12px] text-[17px] font-extrabold text-white"
                style={{ backgroundColor: brand.accent }}
                aria-hidden="true"
              >
                {brand.name.slice(0, 1)}
              </span>
              <div>
                <h1 className="text-[27px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[33px]">
                  {brand.name}
                </h1>
                <p className="text-[12.5px] font-medium text-ink-muted">
                  {brand.tagline} · {brand.origin}
                </p>
              </div>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-soft">{brand.description}</p>
            <p className="mt-3 text-[11.5px] text-ink-muted">
              Marque fictive : les appareils, prix et caractéristiques sont des données de
              démonstration.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <p className="text-[28px] font-extrabold leading-none text-navy">{brandProducts.length}</p>
            <p className="text-[11.5px] uppercase tracking-[0.12em] text-ink-muted">appareils</p>
            <ButtonLink href={`/produits?marque=${brand.slug}`} variant="secondary" size="sm">
              Filtrer dans le catalogue
              <IconArrowRight size={15} />
            </ButtonLink>
          </div>
        </div>
      </section>

      {Object.keys(categoryCount).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {Object.entries(categoryCount).map(([categorySlug, count]) => (
            <Link
              key={categorySlug}
              href={`/categorie/${categorySlug}`}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] text-ink-soft hover:border-accent hover:text-accent-dark"
            >
              {categoryNames.get(categorySlug) ?? categorySlug} · {count}
            </Link>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-[19px] font-bold text-ink">
        La sélection {brand.name}
        <span className="ml-2 text-[13px] font-normal text-ink-muted">
          {brandProducts.length} appareils
        </span>
      </h2>

      {brandProducts.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {brandProducts.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} brandName={brand.name} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <EmptyState
            title="Aucun appareil pour cette marque"
            description="Cette marque n'a pas encore de produit publié dans le catalogue de démonstration."
            action={
              <ButtonLink href="/produits" variant="dark">
                Voir tous les appareils
              </ButtonLink>
            }
          />
        </div>
      )}
    </div>
  );
}
