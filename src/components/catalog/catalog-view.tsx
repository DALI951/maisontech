import Link from "next/link";
import type { ReactNode } from "react";
import { IconInfo, IconSearch } from "@/components/icons";
import {
  ActiveFilterChips,
  FilterPanel,
  SortBar,
} from "@/components/catalog/catalog-controls";
import { ProductCard } from "@/components/product/product-card";
import {
  Breadcrumbs,
  ButtonLink,
  EmptyState,
  Pagination,
} from "@/components/ui/primitives";
import { getStoreData, listProducts } from "@/lib/catalog";
import { AVAILABILITY_LABEL } from "@/lib/product";
import {
  buildHref,
  parseCatalogParams,
  type SearchParamsRecord,
} from "@/lib/catalog-params";
import { formatTND } from "@/lib/money";
import type { SortKey } from "@/lib/catalog";
import type { CatalogFilters } from "@/lib/catalog";

/**
 * Shared listing layout used by /produits, /categorie/[slug], /promotions and
 * /recherche. Filters, sorting and pagination live in the URL so every view is
 * shareable, crawlable and works without JavaScript.
 */
export async function CatalogView({
  basePath,
  title,
  eyebrow,
  description,
  breadcrumbs,
  searchParams,
  category,
  fixedSort,
  editorial,
  notice,
  headerExtra,
  force,
}: {
  basePath: string;
  title: string;
  eyebrow?: string;
  description?: string;
  breadcrumbs: { label: string; href?: string }[];
  searchParams: SearchParamsRecord;
  category?: string;
  fixedSort?: SortKey;
  editorial?: { title: string; body: string };
  notice?: ReactNode;
  headerExtra?: ReactNode;
  force?: Partial<CatalogFilters>;
}) {
  const parsed = parseCatalogParams(searchParams, { category, fixedSort });
  const [result, { brands }] = await Promise.all([
    listProducts({ ...parsed.filters, ...force }),
    getStoreData(),
  ]);

  const sortParam = parsed.sortParam;
  const perPage = parsed.filters.perPage ?? 12;
  const selectedBrands = parsed.filters.brands ?? [];
  const selectedAvailability = parsed.filters.availability ?? [];
  const selectedEnergies = parsed.filters.energies ?? [];

  const baseParams = {
    q: parsed.query,
    tri: sortParam !== "pertinence" && !fixedSort ? sortParam : undefined,
    "par-page": perPage !== 12 ? String(perPage) : undefined,
    marque: selectedBrands,
    dispo: selectedAvailability,
    energie: selectedEnergies,
    "prix-min": parsed.filters.minPrice,
    "prix-max": parsed.filters.maxPrice,
    promo: parsed.filters.onSale ? "1" : undefined,
    nouveau: parsed.filters.isNew ? "1" : undefined,
  } as const;

  const brandNames = new Map(brands.map((brand) => [brand.slug, brand.name]));
  const chips: { label: string; href: string }[] = [];

  for (const slug of selectedBrands) {
    chips.push({
      label: brandNames.get(slug) ?? slug,
      href: buildHref(basePath, {
        ...baseParams,
        marque: selectedBrands.filter((entry) => entry !== slug),
      }),
    });
  }
  for (const value of selectedAvailability) {
    chips.push({
      label: AVAILABILITY_LABEL[value],
      href: buildHref(basePath, {
        ...baseParams,
        dispo: selectedAvailability.filter((entry) => entry !== value),
      }),
    });
  }
  for (const value of selectedEnergies) {
    chips.push({
      label: `Classe ${value}`,
      href: buildHref(basePath, {
        ...baseParams,
        energie: selectedEnergies.filter((entry) => entry !== value),
      }),
    });
  }
  if (parsed.filters.minPrice !== undefined || parsed.filters.maxPrice !== undefined) {
    chips.push({
      label: `Prix : ${parsed.filters.minPrice ?? 0} – ${parsed.filters.maxPrice ?? "∞"} DT`,
      href: buildHref(basePath, {
        ...baseParams,
        "prix-min": undefined,
        "prix-max": undefined,
      }),
    });
  }
  if (parsed.filters.onSale) {
    chips.push({
      label: "En promotion",
      href: buildHref(basePath, { ...baseParams, promo: undefined }),
    });
  }
  if (parsed.filters.isNew) {
    chips.push({
      label: "Nouveautés",
      href: buildHref(basePath, { ...baseParams, nouveau: undefined }),
    });
  }
  if (parsed.query) {
    chips.push({
      label: `Recherche : « ${parsed.query} »`,
      href: buildHref(basePath, { ...baseParams, q: undefined }),
    });
  }

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h1 className="text-[27px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[34px]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{description}</p>
          )}
        </div>
        {headerExtra}
      </div>

      {notice && <div className="mt-4">{notice}</div>}

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-[132px] lg:w-[250px]">
          <FilterPanel
            facets={result.facets}
            brands={brands.map((brand) => ({ slug: brand.slug, name: brand.name }))}
            selected={{
              brands: selectedBrands,
              availability: selectedAvailability,
              energies: selectedEnergies,
              minPrice: parsed.filters.minPrice,
              maxPrice: parsed.filters.maxPrice,
              onSale: Boolean(parsed.filters.onSale),
              isNew: Boolean(parsed.filters.isNew),
            }}
            activeCount={parsed.activeCount}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <SortBar
            total={result.total}
            page={result.page}
            pageCount={result.pageCount}
            perPage={result.perPage}
            sortParam={sortParam}
            fixedSort={Boolean(fixedSort)}
          />

          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ActiveFilterChips chips={chips} />
              <Link
                href={basePath}
                className="text-[11.5px] font-semibold text-ink-muted underline decoration-line-strong underline-offset-2 hover:text-promo"
              >
                Tout effacer
              </Link>
            </div>
          )}

          {result.items.length > 0 ? (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {result.items.map((product) => (
                <li key={product.id}>
                  <ProductCard
                    product={product}
                    brandName={brandNames.get(product.brandSlug) ?? ""}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="Aucun appareil ne correspond"
                description="Essayez d'élargir la fourchette de prix, de retirer une marque ou de désactiver un filtre. Le catalogue complet reste accessible en un clic."
                icon={<IconSearch size={24} />}
                action={
                  <ButtonLink href={basePath} variant="dark" size="md">
                    Réinitialiser les filtres
                  </ButtonLink>
                }
              />
            </div>
          )}

          <div className="mt-6">
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              hrefFor={(page) => buildHref(basePath, { ...baseParams, page: page === 1 ? undefined : page })}
            />
          </div>

          {result.total > 0 && (
            <p className="mt-4 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-ink-muted">
              <IconInfo size={14} className="mt-0.5 shrink-0" />
              Prix affichés en dinars tunisiens, TVA incluse à titre indicatif. Disponibilité et
              livraison simulées : vérifiez la fiche produit avant de commander.
              {result.facets.priceMin > 0 && (
                <span className="whitespace-nowrap">
                  Fourchette actuelle : {formatTND(result.facets.priceMin)} –{" "}
                  {formatTND(result.facets.priceMax)}.
                </span>
              )}
            </p>
          )}

          {editorial && (
            <section className="mt-8 rounded-panel border border-line bg-surface p-5 sm:p-6">
              <h2 className="text-[17px] font-bold text-ink">{editorial.title}</h2>
              <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-soft">
                {editorial.body}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
