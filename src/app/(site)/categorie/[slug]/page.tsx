import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/catalog-view";
import { categoryEditorial } from "@/data/content";
import { getStoreData } from "@/lib/catalog";
import type { SearchParamsRecord } from "@/lib/catalog-params";
import { countByCategory } from "@/lib/catalog";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsRecord>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getStoreData();
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) return { title: "Catégorie introuvable" };
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/categorie/${category.slug}` },
    openGraph: { title: `${category.name} · MaisonTech`, description: category.description },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const { categories, products } = await getStoreData();
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) notFound();

  const counts = countByCategory(products);
  const editorial = categoryEditorial[category.slug];

  return (
    <CatalogView
      basePath={`/categorie/${category.slug}`}
      eyebrow="Catégorie"
      title={category.name}
      description={category.description}
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Catalogue", href: "/produits" },
        { label: category.shortName },
      ]}
      searchParams={query}
      category={category.slug}
      editorial={editorial}
      headerExtra={
        <div className="rounded-card border border-line bg-surface px-4 py-2.5 text-[12.5px] text-ink-soft">
          <strong className="font-semibold text-ink">{counts[category.slug] ?? 0}</strong> appareils ·{" "}
          {category.tagline}
        </div>
      }
    />
  );
}
