"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ProductRail } from "@/components/product/product-rail";
import { Skeleton } from "@/components/ui/primitives";
import { useCommerce } from "@/store/commerce";
import type { ProductSummary } from "@/lib/types";

/**
 * Remembers the last products viewed in localStorage and shows them once the
 * visitor leaves the current one. Renders nothing on a first visit.
 */
export function RecentlyViewed({
  currentId,
  brandNames,
}: {
  currentId: string;
  brandNames: Record<string, string>;
}) {
  const { recent, pushRecent, ready } = useCommerce();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    pushRecent(currentId);
  }, [ready, currentId, pushRecent]);

  const ids = useMemo(
    () => recent.filter((id) => id !== currentId).slice(0, 8),
    [recent, currentId],
  );
  const key = ids.join(",");

  useEffect(() => {
    if (!key) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/products?ids=${encodeURIComponent(key)}`)
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data: { products?: ProductSummary[] }) => {
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
  }, [key]);

  if (!key && !loading) return null;

  return (
    <section className="container-page mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Historique</p>
          <h2 className="mt-1.5 text-[22px] font-bold leading-tight text-ink sm:text-[25px]">
            Consultés récemment
          </h2>
        </div>
        <p className="hidden max-w-[260px] text-right text-[11.5px] leading-snug text-ink-muted sm:block">
          Stocké uniquement dans votre navigateur, jamais envoyé au serveur.
        </p>
      </div>

      <div className="mt-4">
        {loading && products.length === 0 ? (
          <div className="flex gap-3 overflow-hidden">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-[300px] w-[232px] shrink-0 rounded-card" />
            ))}
          </div>
        ) : (
          <ProductRail label="Produits consultés récemment">
            {products.map((product) => (
              <div key={product.id} className="w-[232px] shrink-0 snap-start sm:w-[248px]">
                <ProductCard
                  product={product}
                  brandName={brandNames[product.brandSlug] ?? ""}
                  compact
                />
              </div>
            ))}
          </ProductRail>
        )}
      </div>
    </section>
  );
}
