"use client";

import Link from "next/link";
import { IconCart, IconHeart, IconScale } from "@/components/icons";
import { ProductVisual } from "@/components/product/product-visual";
import { Badge, PriceTag, Rating } from "@/components/ui/primitives";
import { availabilityOf } from "@/lib/product";
import { useCommerce } from "@/store/commerce";
import type { Product, ProductSummary } from "@/lib/types";

export type CardProduct = ProductSummary | Product;

export function ProductCard({
  product,
  brandName,
  className = "",
  compact = false,
}: {
  product: CardProduct;
  brandName: string;
  className?: string;
  compact?: boolean;
}) {
  const { addToCart, toggleWishlist, isWishlisted, toggleCompare, isCompared } = useCommerce();
  const availability = availabilityOf(product);
  const purchasable = availability !== "out_of_stock";
  const wishlisted = isWishlisted(product.id);
  const compared = isCompared(product.id);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift ${className}`}
    >
      <div className="relative">
        <Link
          href={`/produit/${product.slug}`}
          className="block bg-gradient-to-b from-[#f7f8f6] to-[#eef1ef]"
          aria-label={product.name}
        >
          <div className="relative aspect-[4/3] w-full">
            <ProductVisual
              product={product}
              className="h-full w-full p-4 transition-transform duration-300 group-hover:scale-[1.035]"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 && <Badge tone="promo">-{discount} %</Badge>}
          {product.isNew && !discount && <Badge tone="new">Nouveau</Badge>}
          {availability === "low_stock" && <Badge tone="low">Stock limité</Badge>}
          {availability === "out_of_stock" && <Badge tone="out">Épuisé</Badge>}
        </div>

        <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id, product.name)}
            aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
            aria-pressed={wishlisted}
              className={`flex h-8 w-8 items-center justify-center rounded-full border bg-surface/90 backdrop-blur transition-colors ${
              wishlisted
                ? "border-promo/30 bg-promo-soft text-promo"
                : "border-line text-ink-soft hover:border-accent hover:text-accent-dark"
            }`}
          >
            <IconHeart size={16} />
          </button>
          <button
            type="button"
            onClick={() => toggleCompare(product.id, product.name)}
            aria-label={compared ? "Retirer du comparateur" : "Comparer cet appareil"}
            aria-pressed={compared}
            className={`flex h-8 w-8 items-center justify-center rounded-full border bg-surface/90 backdrop-blur transition-all ${
              compared
                ? "border-accent text-accent-dark"
                : "border-line text-ink-soft opacity-0 hover:border-accent hover:text-accent-dark focus-visible:opacity-100 group-hover:opacity-100"
            }`}
          >
            <IconScale size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          {brandName}
        </p>
        <h3 className={`mt-1 font-semibold leading-snug text-ink ${compact ? "text-[13.5px]" : "text-[14.5px]"}`}>
          <Link href={`/produit/${product.slug}`} className="line-clamp-2 hover:text-accent-dark">
            {product.name}
          </Link>
        </h3>

        {!compact && (
          <div className="mt-1.5">
            <Rating value={product.rating} count={product.reviewCount} size={12} showValue={false} />
          </div>
        )}

        <div className="mt-auto pt-3">
          <PriceTag price={product.price} originalPrice={product.originalPrice} size="sm" />

          <div className="mt-2.5">
            {purchasable ? (
              <button
                type="button"
                onClick={() => addToCart(product.id, { name: product.name })}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-field border border-line-strong bg-surface text-[12.5px] font-semibold text-ink transition-colors hover:border-accent hover:bg-accent hover:text-white"
              >
                <IconCart size={15} />
                Ajouter au panier
              </button>
            ) : (
              <Link
                href={`/produit/${product.slug}`}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-field border border-line bg-paper text-[12.5px] font-semibold text-ink-soft"
              >
                Voir la fiche
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
