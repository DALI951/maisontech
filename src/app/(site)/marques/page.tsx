import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { Breadcrumbs } from "@/components/ui/primitives";
import { getStoreData } from "@/lib/catalog";
import { countByCategory } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Nos marques",
  description:
    "Dix marques de démonstration, chacune spécialisée dans un univers : froid, lavage, cuisson, climatisation, image ou petit électroménager.",
  alternates: { canonical: "/marques" },
};

export default async function BrandsPage() {
  const { brands, products } = await getStoreData();
  const byBrand = products.reduce<Record<string, number>>((accumulator, product) => {
    accumulator[product.brandSlug] = (accumulator[product.brandSlug] ?? 0) + 1;
    return accumulator;
  }, {});
  const byCategory = countByCategory(products);

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Marques" }]} />

      <div className="mt-4 max-w-2xl">
        <p className="eyebrow">Marques</p>
        <h1 className="mt-1.5 text-[30px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[36px]">
          Dix maisons, dix spécialités
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          Toutes les marques présentées ici sont fictives, créées uniquement pour cette
          démonstration. Aucune spécification de fabricant réel n'est revendiquée.
        </p>
      </div>

      <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <li key={brand.slug}>
            <Link
              href={`/marques/${brand.slug}`}
              className="group flex h-full flex-col rounded-card border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-[11px] text-[15px] font-extrabold text-white"
                  style={{ backgroundColor: brand.accent }}
                  aria-hidden="true"
                >
                  {brand.name.slice(0, 1)}
                </span>
                <div>
                  <h2 className="text-[16px] font-bold text-ink group-hover:text-accent-dark">
                    {brand.name}
                  </h2>
                  <p className="text-[11.5px] text-ink-muted">{brand.tagline}</p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-[12.5px] leading-relaxed text-ink-soft">
                {brand.description}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[11.5px] text-ink-muted">
                  {byBrand[brand.slug] ?? 0} appareils
                </span>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent-dark">
                  Voir la marque
                  <IconArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-panel border border-line bg-surface p-5">
        <h2 className="text-[15px] font-bold text-ink">Parcourir autrement</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Object.entries(byCategory).length > 0 &&
            Object.keys(byCategory).map((slug) => (
              <Link
                key={slug}
                href={`/categorie/${slug}`}
                className="rounded-full border border-line bg-paper px-3 py-1.5 text-[12.5px] text-ink-soft hover:border-accent hover:text-accent-dark"
              >
                {slug.replace(/-/g, " ")}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
