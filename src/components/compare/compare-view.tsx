"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconArrowRight, IconCart, IconClose, IconScale, IconStar } from "@/components/icons";
import { ProductVisual } from "@/components/product/product-visual";
import { Badge, Button, ButtonLink, EmptyState, PriceTag, Skeleton } from "@/components/ui/primitives";
import { availabilityOf, AVAILABILITY_LABEL, dimensionsLabel } from "@/lib/product";
import { toMillimes } from "@/lib/money";
import { COMMERCE_LIMITS, useCommerce } from "@/store/commerce";
import type { Product } from "@/lib/types";

export function CompareView({ brandNames }: { brandNames: Record<string, string> }) {
  const { compare, ready, toggleCompare, clearCompare, addToCart } = useCommerce();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const key = compare.join(",");

  useEffect(() => {
    if (!ready) return;
    if (!key) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/products?full=1&ids=${encodeURIComponent(key)}`)
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data: { products?: Product[] }) => {
        if (!cancelled) setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, key]);

  const cheapest = useMemo(() => {
    if (products.length < 2) return null;
    return products.reduce((best, product) =>
      toMillimes(product.price) < toMillimes(best.price) ? product : best,
    ).id;
  }, [products]);

  // Union of specification labels, in the order they first appear.
  const specLabels = useMemo(() => {
    const seen = new Map<string, string>();
    for (const product of products) {
      for (const spec of product.specs) {
        if (!seen.has(spec.label)) seen.set(spec.label, spec.group ?? "general");
      }
    }
    return [...seen.entries()];
  }, [products]);

  if (!ready || (loading && products.length === 0 && compare.length > 0)) {
    return <Skeleton className="h-[420px] rounded-panel" />;
  }

  if (compare.length === 0) {
    return (
      <EmptyState
        title="Le comparateur est vide"
        description={`Ajoutez jusqu'à ${COMMERCE_LIMITS.MAX_COMPARE} appareils depuis les fiches produit ou les cartes du catalogue pour comparer prix, caractéristiques et disponibilité.`}
        icon={<IconScale size={26} />}
        action={
          <ButtonLink href="/produits" variant="dark" size="md">
            Choisir des appareils
            <IconArrowRight size={15} />
          </ButtonLink>
        }
      />
    );
  }

  const cell = "px-3 py-2.5 align-top text-[12.5px] text-ink";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-ink-soft">
          <strong className="font-semibold text-ink">{products.length}</strong> /{" "}
          {COMMERCE_LIMITS.MAX_COMPARE} appareils comparés
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={clearCompare}>
            <IconClose size={14} />
            Vider
          </Button>
          <ButtonLink href="/produits" variant="secondary" size="sm">
            Ajouter un appareil
          </ButtonLink>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-panel border border-line bg-surface">
        <table className="w-full min-w-[640px] border-collapse">
          <caption className="sr-only">Comparaison de {products.length} appareils</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-[150px] bg-[#f7f8f7] px-3 py-3 text-left">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                  Appareil
                </span>
              </th>
              {products.map((product) => (
                <th key={product.id} scope="col" className="bg-[#f7f8f7] px-3 py-3 text-left align-top">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleCompare(product.id, product.name)}
                      aria-label={`Retirer ${product.name} du comparateur`}
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-ink-muted hover:border-promo hover:text-promo"
                    >
                      <IconClose size={12} />
                    </button>
                    <Link href={`/produit/${product.slug}`} className="block w-[150px]">
                      <div className="h-[110px] overflow-hidden rounded-tile border border-line bg-gradient-to-b from-[#fbfcfb] to-[#eef1ef]">
                        <ProductVisual product={product} className="h-full w-full p-2" />
                      </div>
                      <p className="mt-2 line-clamp-2 text-[12.5px] font-semibold leading-snug text-ink hover:text-accent-dark">
                        {product.name}
                      </p>
                    </Link>
                    <p className="mt-0.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                      {brandNames[product.brandSlug] ?? product.brandSlug}
                    </p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line">
              <th scope="row" className="sticky left-0 z-10 bg-surface px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Prix
              </th>
              {products.map((product) => (
                <td key={product.id} className={cell}>
                  <PriceTag price={product.price} originalPrice={product.originalPrice} size="sm" />
                  {cheapest === product.id && (
                    <span className="mt-1 block w-fit rounded-full bg-[#edf7f2] px-2 py-0.5 text-[10.5px] font-semibold text-[#14614a]">
                      Prix le plus bas
                    </span>
                  )}
                </td>
              ))}
            </tr>

            <tr className="border-t border-line bg-[#fcfcfb]">
              <th scope="row" className="sticky left-0 z-10 bg-[#fcfcfb] px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Disponibilité
              </th>
              {products.map((product) => {
                const availability = availabilityOf(product);
                return (
                  <td key={product.id} className={cell}>
                    <Badge
                      tone={availability === "in_stock" ? "stock" : availability === "low_stock" ? "low" : "out"}
                    >
                      {AVAILABILITY_LABEL[availability]}
                    </Badge>
                  </td>
                );
              })}
            </tr>

            <tr className="border-t border-line">
              <th scope="row" className="sticky left-0 z-10 bg-surface px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Note
              </th>
              {products.map((product) => (
                <td key={product.id} className={cell}>
                  <span className="inline-flex items-center gap-1 text-[#c98a1b]">
                    <IconStar size={12} filled />
                    <span className="font-semibold text-ink">{product.rating.toFixed(1)}</span>
                    <span className="text-ink-muted">({product.reviewCount})</span>
                  </span>
                </td>
              ))}
            </tr>

            <tr className="border-t border-line bg-[#fcfcfb]">
              <th scope="row" className="sticky left-0 z-10 bg-[#fcfcfb] px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Classe énergie
              </th>
              {products.map((product) => (
                <td key={product.id} className={cell}>
                  {product.energyClass ?? "—"}
                </td>
              ))}
            </tr>

            <tr className="border-t border-line">
              <th scope="row" className="sticky left-0 z-10 bg-surface px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Dimensions
              </th>
              {products.map((product) => (
                <td key={product.id} className={cell}>
                  {dimensionsLabel(product)}
                </td>
              ))}
            </tr>

            <tr className="border-t border-line bg-[#fcfcfb]">
              <th scope="row" className="sticky left-0 z-10 bg-[#fcfcfb] px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Poids
              </th>
              {products.map((product) => (
                <td key={product.id} className={cell}>
                  {product.weightKg} kg
                </td>
              ))}
            </tr>

            <tr className="border-t border-line">
              <th scope="row" className="sticky left-0 z-10 bg-surface px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Garantie
              </th>
              {products.map((product) => (
                <td key={product.id} className={cell}>
                  {product.warranty}
                </td>
              ))}
            </tr>

            {specLabels.map(([label], index) => (
              <tr key={label} className={`border-t border-line ${index % 2 === 1 ? "bg-[#fcfcfb]" : ""}`}>
                <th
                  scope="row"
                  className={`sticky left-0 z-10 px-3 py-2.5 text-left text-[11.5px] font-semibold text-ink-muted ${
                    index % 2 === 1 ? "bg-[#fcfcfb]" : "bg-surface"
                  }`}
                >
                  {label}
                </th>
                {products.map((product) => {
                  const spec = product.specs.find((entry) => entry.label === label);
                  return (
                    <td key={product.id} className={cell}>
                      {spec?.value ?? <span className="text-line-strong">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr className="border-t border-line">
              <th scope="row" className="sticky left-0 z-10 bg-surface px-3 py-3 text-left">
                <span className="sr-only">Actions</span>
              </th>
              {products.map((product) => (
                <td key={product.id} className="px-3 py-3">
                  {product.stock > 0 ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addToCart(product.id, { name: product.name })}
                      className="w-full"
                    >
                      <IconCart size={14} />
                      Au panier
                    </Button>
                  ) : (
                    <ButtonLink href={`/produit/${product.slug}`} variant="secondary" size="sm" className="w-full">
                      Voir la fiche
                    </ButtonLink>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
        Les lignes « — » indiquent une caractéristique non renseignée pour cet appareil. Données de
        démonstration.
      </p>
    </div>
  );
}
