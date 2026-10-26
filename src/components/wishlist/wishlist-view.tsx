"use client";

import { useEffect, useMemo, useState } from "react";
import { IconArrowRight, IconCart, IconHeart, IconTrash } from "@/components/icons";
import { ProductCard } from "@/components/product/product-card";
import { Button, ButtonLink, EmptyState, Skeleton } from "@/components/ui/primitives";
import { useCommerce } from "@/store/commerce";
import { useToast } from "@/store/toast";
import type { ProductSummary } from "@/lib/types";

export function WishlistView({ brandNames }: { brandNames: Record<string, string> }) {
  const { wishlist, ready, clearWishlist, addToCart } = useCommerce();
  const { push } = useToast();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const key = wishlist.join(",");

  useEffect(() => {
    if (!ready) return;
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
  }, [ready, key]);

  const available = useMemo(() => products.filter((product) => product.stock > 0), [products]);

  if (!ready || (loading && products.length === 0 && wishlist.length > 0)) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-[330px] rounded-card" />
        ))}
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <EmptyState
        title="Aucun favori pour l'instant"
        description="Touchez le cœur sur une fiche produit pour la garder de côté. Les favoris restent dans ce navigateur, sans compte obligatoire."
        icon={<IconHeart size={26} />}
        action={
          <ButtonLink href="/produits" variant="dark" size="md">
            Découvrir le catalogue
            <IconArrowRight size={15} />
          </ButtonLink>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3">
        <p className="text-[12.5px] text-ink-soft">
          <strong className="font-semibold text-ink">{products.length}</strong> appareil
          {products.length > 1 ? "s" : ""} en favori · {available.length} disponible
          {available.length > 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={available.length === 0}
            onClick={() => {
              available.forEach((product) => addToCart(product.id, { name: product.name }));
              push({
                tone: "success",
                title: "Favoris ajoutés au panier",
                description: `${available.length} appareil${available.length > 1 ? "s" : ""} disponible${available.length > 1 ? "s" : ""}.`,
              });
            }}
          >
            <IconCart size={14} />
            Tout ajouter au panier
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={clearWishlist}>
            <IconTrash size={14} />
            Vider les favoris
          </Button>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} brandName={brandNames[product.brandSlug] ?? ""} />
          </li>
        ))}
      </ul>
    </div>
  );
}
