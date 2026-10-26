"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  IconAlert,
  IconBolt,
  IconCart,
  IconCheck,
  IconCopy,
  IconHeart,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconScale,
  IconShield,
  IconTruck,
  IconWallet,
} from "@/components/icons";
import { Badge, Button, PriceTag, Rating } from "@/components/ui/primitives";
import { formatTND, multiplyMoney } from "@/lib/money";
import {
  AVAILABILITY_DETAIL,
  AVAILABILITY_LABEL,
  availabilityOf,
  energyColor,
} from "@/lib/product";
import { COMMERCE_LIMITS, useCommerce } from "@/store/commerce";
import { useToast } from "@/store/toast";
import type { Product, StoreSettings } from "@/lib/types";

/**
 * Buy box: quantity, add to cart, wishlist / comparison and the reassurance
 * block. It only sends ids and quantities — every price is re-computed by the
 * server when the cart or an order is created.
 */
export function PurchasePanel({
  product,
  brandName,
  categoryName,
  settings,
}: {
  product: Product;
  brandName: string;
  categoryName: string;
  settings: StoreSettings;
}) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted, toggleCompare, isCompared, compare } =
    useCommerce();
  const { push } = useToast();

  const availability = availabilityOf(product);
  const purchasable = availability !== "out_of_stock";
  const hardLimit = Math.max(1, Math.min(product.stock, COMMERCE_LIMITS.MAX_QUANTITY));
  const [quantity, setQuantity] = useState(1);

  const wishlisted = isWishlisted(product.id);
  const compared = isCompared(product.id);
  const lineTotal = multiplyMoney(product.price, quantity);

  const { shipping } = settings;
  const missingForFreeShipping = Math.max(0, shipping.freeShippingThreshold - lineTotal);
  const freeShippingProgress =
    shipping.freeShippingThreshold > 0
      ? Math.min(100, Math.round((lineTotal / shipping.freeShippingThreshold) * 100))
      : 100;

  function changeQuantity(next: number) {
    setQuantity(Math.max(1, Math.min(hardLimit, next)));
  }

  function handleAdd(buyNow = false) {
    if (!purchasable) return;
    addToCart(product.id, { quantity, name: product.name });
    if (buyNow) router.push("/panier");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      push({ tone: "success", title: "Lien copié", description: "Le lien de cette fiche est prêt à partager." });
    } catch {
      push({ tone: "info", title: "Copie impossible", description: "Copiez l'adresse depuis la barre du navigateur." });
    }
  }

  const badges: { label: string; tone: "promo" | "new" | "low" | "out" }[] = [];
  if (product.originalPrice && product.originalPrice > product.price) {
    const percent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    badges.push({ label: `-${percent} %`, tone: "promo" });
  }
  if (product.isNew) badges.push({ label: "Nouveau", tone: "new" });
  if (availability === "low_stock") badges.push({ label: "Stock limité", tone: "low" });
  if (availability === "out_of_stock") badges.push({ label: "Épuisé", tone: "out" });

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/marques/${product.brandSlug}`}
          className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-dark hover:underline"
        >
          {brandName}
        </Link>
        <span className="text-[11px] text-line-strong">•</span>
        <span className="text-[11px] text-ink-muted">Réf. {product.sku}</span>
        {badges.map((badge) => (
          <Badge key={badge.label} tone={badge.tone}>
            {badge.label}
          </Badge>
        ))}
      </div>

      <h1 className="mt-2 text-[25px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[31px]">
        {product.name}
      </h1>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Rating value={product.rating} count={product.reviewCount} />
        <a href="#avis" className="text-[12.5px] font-semibold text-accent-dark hover:underline">
          Lire les avis
        </a>
      </div>

      <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
        {product.shortDescription}
      </p>

      <div className="mt-5 rounded-panel border border-line bg-surface p-4 shadow-card sm:p-5">
        <PriceTag
          price={product.price}
          originalPrice={product.originalPrice}
          size="lg"
          showDiscount
        />
        <p className="mt-1.5 text-[12px] text-ink-muted">
          Prix TTC indicatif, TVA incluse. Livraison{" "}
          {missingForFreeShipping > 0
            ? `offerte dès ${formatTND(shipping.freeShippingThreshold)} d'achat`
            : "offerte sur cette commande"}
          .
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${
              availability === "in_stock"
                ? "bg-[#2f7a45]"
                : availability === "low_stock"
                  ? "bg-[#c98a1b]"
                  : "bg-line-strong"
            }`}
          />
          <p className="text-[13px] font-semibold text-ink">{AVAILABILITY_LABEL[availability]}</p>
          <span className="text-[12.5px] text-ink-muted">· {AVAILABILITY_DETAIL[availability]}</span>
        </div>

        {purchasable ? (
          <>
            <div className="mt-4 flex flex-wrap items-stretch gap-2.5">
              <div className="flex h-11 items-center rounded-field border border-line-strong bg-surface">
                <button
                  type="button"
                  onClick={() => changeQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  aria-label="Diminuer la quantité"
                  className="flex h-full w-10 items-center justify-center text-ink-soft transition-colors hover:text-accent-dark disabled:opacity-35"
                >
                  <IconMinus size={15} />
                </button>
                <label className="sr-only" htmlFor="quantity">
                  Quantité
                </label>
                <input
                  id="quantity"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={hardLimit}
                  value={quantity}
                  onChange={(event) => {
                    const parsed = Number(event.target.value);
                    changeQuantity(Number.isFinite(parsed) ? parsed : 1);
                  }}
                  className="h-full w-11 [appearance:textfield] border-x border-line bg-transparent text-center text-[14px] font-semibold text-ink outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => changeQuantity(quantity + 1)}
                  disabled={quantity >= hardLimit}
                  aria-label="Augmenter la quantité"
                  className="flex h-full w-10 items-center justify-center text-ink-soft transition-colors hover:text-accent-dark disabled:opacity-35"
                >
                  <IconPlus size={15} />
                </button>
              </div>

              <Button
                type="button"
                size="md"
                className="h-11 flex-1 min-w-[180px]"
                onClick={() => handleAdd(false)}
              >
                <IconCart size={16} />
                Ajouter au panier
              </Button>

              <Button
                type="button"
                variant="dark"
                size="md"
                className="h-11"
                onClick={() => handleAdd(true)}
              >
                <IconBolt size={16} />
                Acheter
              </Button>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toggleWishlist(product.id, product.name)}
                aria-pressed={wishlisted}
                className={`inline-flex h-9 items-center gap-1.5 rounded-field border px-3 text-[12.5px] font-semibold transition-colors ${
                  wishlisted
                    ? "border-promo/30 bg-promo-soft text-promo"
                    : "border-line-strong bg-surface text-ink-soft hover:border-accent hover:text-accent-dark"
                }`}
              >
                <IconHeart size={15} />
                {wishlisted ? "Dans les favoris" : "Ajouter aux favoris"}
              </button>
              <button
                type="button"
                onClick={() => toggleCompare(product.id, product.name)}
                aria-pressed={compared}
                className={`inline-flex h-9 items-center gap-1.5 rounded-field border px-3 text-[12.5px] font-semibold transition-colors ${
                  compared
                    ? "border-accent bg-accent-soft text-accent-dark"
                    : "border-line-strong bg-surface text-ink-soft hover:border-accent hover:text-accent-dark"
                }`}
              >
                <IconScale size={15} />
                {compared ? "Dans le comparateur" : "Comparer"}
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex h-9 items-center gap-1.5 rounded-field border border-transparent px-2 text-[12.5px] font-semibold text-ink-soft hover:text-accent-dark"
              >
                <IconCopy size={15} />
                Partager
              </button>
              {compare.length > 0 && (
                <Link
                  href="/comparer"
                  className="text-[12px] font-semibold text-accent-dark underline underline-offset-2"
                >
                  Voir le comparateur ({compare.length})
                </Link>
              )}
            </div>

            <p className="mt-2 text-[11.5px] text-ink-muted">
              {quantity > 1 ? (
                <>
                  Total pour {quantity} appareils : <strong className="text-ink">{formatTND(lineTotal)}</strong>
                </>
              ) : (
                <>Maximum {hardLimit} exemplaire{hardLimit > 1 ? "s" : ""} par commande.</>
              )}
            </p>
          </>
        ) : (
          <div className="mt-4">
            <div className="flex items-start gap-2 rounded-field border border-line bg-paper px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-soft">
              <IconAlert size={15} className="mt-0.5 shrink-0 text-ink-muted" />
              <p>
                Cet appareil est momentanément indisponible. Ajoutez-le à vos favoris pour le
                retrouver, ou consultez les modèles proches ci-dessous.
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => toggleWishlist(product.id, product.name)}
              >
                <IconHeart size={15} />
                {wishlisted ? "Dans les favoris" : "Suivre l'appareil"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => toggleCompare(product.id, product.name)}
              >
                <IconScale size={15} />
                Comparer
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* free shipping progress */}
      <div className="mt-4 rounded-panel border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <IconTruck size={16} className="text-accent-dark" />
            Livraison {shipping.estimatedDays}
          </p>
          <span className="text-[12.5px] font-semibold text-ink-soft">
            {formatTND(shipping.flatRate)}
          </span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#eef0ef]">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
          {missingForFreeShipping > 0 ? (
            <>
              Plus que{" "}
              <strong className="font-semibold text-ink">{formatTND(missingForFreeShipping)}</strong>{" "}
              pour la livraison offerte en Tunisie continentale.
            </>
          ) : (
            <>Livraison offerte sur cette commande 🎉</>
          )}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="flex items-start gap-2.5 rounded-tile border border-line bg-surface px-3.5 py-3">
          <IconRefresh size={16} className="mt-0.5 shrink-0 text-accent-dark" />
          <div>
            <dt className="text-[12.5px] font-semibold text-ink">Retours {shipping.returnsDays} jours</dt>
            <dd className="text-[11.5px] leading-relaxed text-ink-muted">
              Appareil non installé, emballage d'origine.
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-tile border border-line bg-surface px-3.5 py-3">
          <IconShield size={16} className="mt-0.5 shrink-0 text-accent-dark" />
          <div>
            <dt className="text-[12.5px] font-semibold text-ink">{product.warranty}</dt>
            <dd className="text-[11.5px] leading-relaxed text-ink-muted">
              Conditions de démonstration, à confirmer.
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-tile border border-line bg-surface px-3.5 py-3">
          <IconWallet size={16} className="mt-0.5 shrink-0 text-accent-dark" />
          <div>
            <dt className="text-[12.5px] font-semibold text-ink">Paiement à la livraison</dt>
            <dd className="text-[11.5px] leading-relaxed text-ink-muted">
              {settings.payments.cashOnDelivery ? "Disponible dans cette démo." : "Désactivé."}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-tile border border-line bg-surface px-3.5 py-3">
          <IconCheck size={16} className="mt-0.5 shrink-0 text-accent-dark" />
          <div>
            <dt className="text-[12.5px] font-semibold text-ink">Catégorie</dt>
            <dd className="text-[11.5px] leading-relaxed text-ink-muted">
              <Link href={`/categorie/${product.categorySlug}`} className="hover:text-accent-dark hover:underline">
                {categoryName}
              </Link>{" "}
              · {product.subcategory}
            </dd>
          </div>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {product.energyClass && (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
            <span
              className="flex h-5 min-w-8 items-center justify-center rounded-[4px] px-1.5 text-[10.5px] font-bold text-white"
              style={{ backgroundColor: energyColor(product.energyClass) }}
            >
              {product.energyClass}
            </span>
            Classe énergétique (indicative)
          </span>
        )}
        {product.colors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-muted">Coloris illustratifs :</span>
            <span className="flex items-center gap-1.5">
              {product.colors.map((color) => (
                <span
                  key={color.name}
                  title={color.name}
                  aria-label={color.name}
                  role="img"
                  className="h-4 w-4 rounded-full border border-line-strong"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </span>
          </div>
        )}
      </div>

      <p className="mt-4 rounded-field bg-[#f4f6f5] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-muted">
        Démonstration : ce bouton n'encaisse aucun paiement. La commande créée est simulée et
        n'entraîne ni expédition ni débit.
      </p>
    </div>
  );
}
