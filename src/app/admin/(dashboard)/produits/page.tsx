import Link from "next/link";
import { IconArrowRight, IconSearch, IconSliders } from "@/components/icons";
import { ProductVisual } from "@/components/product/product-visual";
import { AdminPageHeader, AdminPanel, AdminTable } from "@/components/admin/ui";
import { ProductRowControls } from "@/components/admin/product-row-controls";
import { ButtonLink, Pagination } from "@/components/ui/primitives";
import { getStoreData } from "@/lib/catalog";
import { availabilityOf } from "@/lib/product";
import { formatTND } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = { title: "Produits" };

const PER_PAGE = 20;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = first(params.q).trim().toLowerCase();
  const category = first(params.categorie);
  const brand = first(params.marque);
  const stockFilter = first(params.stock);
  const page = Math.max(1, Number.parseInt(first(params.page), 10) || 1);

  const { products, categories, brands } = await getStoreData();
  const categoryName = new Map(categories.map((entry) => [entry.slug, entry.shortName]));
  const brandName = new Map(brands.map((entry) => [entry.slug, entry.name]));

  const filtered = products
    .filter((product) => {
      if (query) {
        const haystack = `${product.name} ${product.sku} ${product.brandSlug} ${product.subcategory}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (category && product.categorySlug !== category) return false;
      if (brand && product.brandSlug !== brand) return false;
      const availability = availabilityOf(product);
      if (stockFilter === "faible" && product.stock > 5) return false;
      if (stockFilter === "rupture" && availability !== "out_of_stock") return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const hrefFor = (nextPage: number) => {
    const searchParamsObj = new URLSearchParams();
    if (query) searchParamsObj.set("q", first(params.q));
    if (category) searchParamsObj.set("categorie", category);
    if (brand) searchParamsObj.set("marque", brand);
    if (stockFilter) searchParamsObj.set("stock", stockFilter);
    if (nextPage > 1) searchParamsObj.set("page", String(nextPage));
    const qs = searchParamsObj.toString();
    return qs ? `/admin/produits?${qs}` : "/admin/produits";
  };

  const activeFilters = [query, category, brand, stockFilter].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Produits"
        description={`${products.length} références. Modifiez le stock directement dans le tableau, les badges avec les pastilles, ou ouvrez la fiche complète.`}
        actions={
          <ButtonLink href="/admin/produits/nouveau" variant="dark" size="md">
            Nouveau produit
          </ButtonLink>
        }
      />

      <AdminPanel padded={false}>
        <form action="/admin/produits" method="get" className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_170px_170px_150px_auto]">
          <div className="relative">
            <IconSearch
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              name="q"
              defaultValue={first(params.q)}
              placeholder="Nom, SKU, sous-catégorie…"
              className="field-input pl-9"
              aria-label="Rechercher un produit"
            />
          </div>
          <select name="categorie" defaultValue={category} className="field-input" aria-label="Catégorie">
            <option value="">Toutes catégories</option>
            {categories.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.shortName}
              </option>
            ))}
          </select>
          <select name="marque" defaultValue={brand} className="field-input" aria-label="Marque">
            <option value="">Toutes marques</option>
            {brands.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.name}
              </option>
            ))}
          </select>
          <select name="stock" defaultValue={stockFilter} className="field-input" aria-label="Stock">
            <option value="">Tout stock</option>
            <option value="faible">Stock faible (≤ 5)</option>
            <option value="rupture">Rupture</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-field border border-navy bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-2"
            >
              <IconSliders size={14} />
              Filtrer
            </button>
            {activeFilters > 0 && (
              <Link
                href="/admin/produits"
                className="text-[11.5px] font-semibold text-ink-muted hover:text-accent-dark"
              >
                Effacer
              </Link>
            )}
          </div>
        </form>
      </AdminPanel>

      <AdminPanel
        title={`${filtered.length} produit${filtered.length > 1 ? "s" : ""} affiché${filtered.length > 1 ? "s" : ""}`}
        description={
          activeFilters > 0 ? "Filtres actifs — voir la ligne « Effacer »." : "Tri alphabétique."
        }
        padded={false}
      >
        <AdminTable
          head={["Produit", "Catégorie", "Prix", "Stock / badges", "Actions"]}
          empty={slice.length === 0}
        >
          {slice.map((product) => (
            <tr key={product.id} className="hover:bg-[#fafbfa]">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-tile border border-line bg-[#f4f6f5]">
                    <ProductVisual product={product} className="h-full w-full p-0.5" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/produits/${product.id}`}
                      className="line-clamp-1 text-[12.5px] font-semibold text-ink hover:text-accent-dark"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[10.5px] text-ink-muted">
                      {product.sku} · {brandName.get(product.brandSlug) ?? product.brandSlug}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5 text-[11.5px] text-ink-soft">
                {categoryName.get(product.categorySlug) ?? product.categorySlug}
                <span className="block text-[10.5px] text-ink-muted">{product.subcategory}</span>
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-[12px] font-semibold text-ink">
                {formatTND(product.price)}
                {product.originalPrice && (
                  <span className="block text-[10.5px] font-normal text-ink-muted line-through">
                    {formatTND(product.originalPrice)}
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-2.5">
                <span className="inline-flex items-center gap-1.5 text-[11.5px]">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      product.stock === 0
                        ? "bg-promo"
                        : product.stock <= 5
                          ? "bg-[#c98a1b]"
                          : "bg-[#14614a]"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-ink">{product.stock}</span>
                  <span className="text-ink-muted">en stock</span>
                </span>
              </td>
              <td className="px-4 py-2.5">
                <ProductRowControls
                  product={{
                    id: product.id,
                    name: product.name,
                    stock: product.stock,
                    featured: product.featured,
                    bestseller: product.bestseller,
                    isNew: product.isNew,
                  }}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminPanel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11.5px] text-ink-muted">
          Page {safePage} / {pageCount} · {PER_PAGE} produits par page
        </p>
        <Pagination page={safePage} pageCount={pageCount} hrefFor={hrefFor} />
      </div>

      <p className="text-[11px] leading-relaxed text-ink-muted">
        Supprimer un produit ne supprime pas les lignes de commandes déjà passées : l&apos;historique
        reste lisible.{" "}
        <Link href="/admin/categories" className="inline-flex items-center gap-1 font-semibold text-accent-dark hover:underline">
          Gérer les catégories
          <IconArrowRight size={11} />
        </Link>
      </p>
    </div>
  );
}
