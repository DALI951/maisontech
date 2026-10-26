import type { Metadata } from "next";
import Link from "next/link";
import { CatalogView } from "@/components/catalog/catalog-view";
import { SearchBox } from "@/components/layout/search-box";
import { Breadcrumbs } from "@/components/ui/primitives";
import { IconSearch } from "@/components/icons";
import { getStoreData } from "@/lib/catalog";
import type { SearchParamsRecord } from "@/lib/catalog-params";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Recherchez un appareil par nom, marque, catégorie ou caractéristique.",
  robots: { index: false, follow: true },
};

const POPULAR = [
  "réfrigérateur nofrost",
  "lave-linge 10 kg",
  "climatiseur inverter",
  "four induction",
  "machine à café grain",
  "aspirateur balai",
  "téléviseur 55 pouces",
  "friteuse sans huile",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
  const { categories } = await getStoreData();

  if (!query) {
    return (
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Recherche" }]} />
        <div className="mx-auto mt-8 max-w-2xl text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
            <IconSearch size={24} />
          </span>
          <h1 className="text-[27px] font-extrabold tracking-[-0.025em] text-navy sm:text-[32px]">
            Que cherchez-vous ?
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
            Tapez un nom d'appareil, une marque ou une caractéristique (« nofrost », « 8 kg »,
            « induction »). La recherche ignore les accents et la casse.
          </p>
          <div className="mx-auto mt-6 max-w-xl text-left">
            <SearchBox variant="page" autoFocus />
          </div>

          <div className="mt-8 text-left">
            <p className="eyebrow mb-2">Recherches fréquentes</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR.map((term) => (
                <Link
                  key={term}
                  href={`/recherche?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft hover:border-accent hover:text-accent-dark"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 text-left">
            <p className="eyebrow mb-2">Parcourir par catégorie</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categorie/${category.slug}`}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft hover:border-accent hover:text-accent-dark"
                >
                  {category.shortName}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CatalogView
      basePath="/recherche"
      eyebrow="Résultats de recherche"
      title={`« ${query} »`}
      description="Résultats classés par pertinence. Utilisez les filtres pour affiner par marque, prix ou disponibilité."
      breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Recherche", href: "/recherche" }]}
      searchParams={params}
    />
  );
}
