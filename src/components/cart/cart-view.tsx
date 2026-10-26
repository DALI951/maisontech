"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  IconAlert,
  IconArrowRight,
  IconCart,
  IconLock,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconShield,
  IconTag,
  IconTrash,
  IconTruck,
  IconWallet,
} from "@/components/icons";
import { ProductVisual } from "@/components/product/product-visual";
import { Alert, Button, ButtonLink, EmptyState, Skeleton } from "@/components/ui/primitives";
import { formatTND } from "@/lib/money";
import { availabilityOf } from "@/lib/product";
import { COUPON_STORAGE_KEY, useCartPricing } from "@/hooks/use-cart-pricing";
import { useCommerce } from "@/store/commerce";
import { useToast } from "@/store/toast";

export function CartView({
  demoCodes,
}: {
  demoCodes: { code: string; description: string }[];
}) {
  const { cart, ready, setQuantity, removeFromCart, clearCart, cartCount } = useCommerce();
  const { push } = useToast();

  const [codeInput, setCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  const { data, loading, error } = useCartPricing(appliedCode, attempt);

  // Remember an applied code across reloads; the server validates it again anyway.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COUPON_STORAGE_KEY);
      if (stored) {
        setAppliedCode(stored);
        setCodeInput(stored);
      }
    } catch {
      /* ignore blocked storage */
    }
  }, []);

  function applyCode(event: React.FormEvent) {
    event.preventDefault();
    const candidate = codeInput.trim().toUpperCase();
    if (!candidate) return;
    setAppliedCode(candidate);
    setAttempt((value) => value + 1);
    try {
      window.localStorage.setItem(COUPON_STORAGE_KEY, candidate);
    } catch {
      /* ignore */
    }
  }

  function removeCode() {
    setAppliedCode(undefined);
    setAttempt((value) => value + 1);
    setCodeInput("");
    try {
      window.localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  function changeQuantity(productId: string, next: number, max: number) {
    if (next < 1) return;
    if (next > max) {
      push({
        tone: "info",
        title: "Stock limité",
        description: `Vous ne pouvez pas commander plus de ${max} exemplaire${max > 1 ? "s" : ""}.`,
      });
      return;
    }
    setQuantity(productId, next);
  }

  if (!ready || (loading && !data)) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-card" />
          <Skeleton className="h-28 w-full rounded-card" />
          <Skeleton className="h-28 w-full rounded-card" />
        </div>
        <Skeleton className="h-72 w-full rounded-panel" />
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <EmptyState
        title="Votre panier est vide"
        description="Parcourez le catalogue et ajoutez un appareil : votre panier est conservé dans ce navigateur, même après la fermeture de l'onglet."
        icon={<IconCart size={26} />}
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ButtonLink href="/produits" variant="dark" size="md">
              Voir le catalogue
              <IconArrowRight size={15} />
            </ButtonLink>
            <ButtonLink href="/promotions" variant="secondary" size="md">
              Les promotions
            </ButtonLink>
          </div>
        }
      />
    );
  }

  const unavailable = data?.lines.filter((line) => !line.available) ?? [];
  const discount = data?.discount;
  const totals = data?.totals;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_346px] lg:items-start">
      <div className="min-w-0 space-y-3">
        {error && <Alert tone="error" title="Erreur">{error}</Alert>}

        {unavailable.length > 0 && (
          <Alert tone="warning" title="Certains articles ne sont plus disponibles">
            Ils sont conservés dans le panier mais ne seront ni commandés ni facturés. Retirez-les
            pour alléger la commande.
          </Alert>
        )}

        {data?.settings.demoBanner && (
          <div className="flex items-start gap-2.5 rounded-card border border-line bg-surface px-3.5 py-2.5 text-[12px] leading-relaxed text-ink-soft">
            <IconAlert size={15} className="mt-0.5 shrink-0 text-accent-dark" />
            <p>
              Panier de démonstration : les prix sont recalculés côté serveur, mais aucune commande
              n'est réellement transmise ni facturée.
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {data?.lines.map((line) => {
            const entry = line;
            const product = entry.product;
            const stock = availabilityOf(product);
            return (
              <li
                key={entry.productId}
                className={`rounded-card border bg-surface p-3.5 ${
                  entry.available ? "border-line" : "border-[#f0dcc2] bg-[#fdfaf6]"
                }`}
              >
                <div className="flex gap-3.5">
                  <Link
                    href={`/produit/${product.slug}`}
                    className="block w-[92px] shrink-0 overflow-hidden rounded-tile border border-line bg-gradient-to-b from-[#f7f8f6] to-[#eef1ef] sm:w-[112px]"
                    aria-label={product.name}
                  >
                    <div className="aspect-square">
                      <ProductVisual product={product} className="h-full w-full p-2" />
                    </div>
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/produit/${product.slug}`}
                          className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink hover:text-accent-dark"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-[11.5px] text-ink-muted">
                          {product.subcategory} · Réf. {product.id.slice(-6).toUpperCase()}
                        </p>
                        {!entry.available && (
                          <p className="mt-1 text-[11.5px] font-semibold text-[#96501a]">
                            Rupture de stock — non facturé
                          </p>
                        )}
                        {entry.available && stock === "low_stock" && (
                          <p className="mt-1 text-[11.5px] font-semibold text-[#96501a]">
                            Plus que {product.stock} en stock
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(entry.productId)}
                        aria-label={`Retirer ${product.name} du panier`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-field text-ink-muted transition-colors hover:bg-promo-soft hover:text-promo"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                      <div className="flex items-center gap-1">
                        <div className="flex h-9 items-center rounded-field border border-line-strong bg-surface">
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(entry.productId, entry.quantity - 1, entry.maxQuantity || 1)
                            }
                            disabled={entry.quantity <= 1}
                            aria-label="Diminuer la quantité"
                            className="flex h-full w-8 items-center justify-center text-ink-soft hover:text-accent-dark disabled:opacity-35"
                          >
                            <IconMinus size={13} />
                          </button>
                          <span className="w-8 text-center text-[13px] font-semibold text-ink">
                            {entry.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(entry.productId, entry.quantity + 1, entry.maxQuantity || 1)
                            }
                            disabled={!entry.available || entry.quantity >= (entry.maxQuantity || 1)}
                            aria-label="Augmenter la quantité"
                            className="flex h-full w-8 items-center justify-center text-ink-soft hover:text-accent-dark disabled:opacity-35"
                          >
                            <IconPlus size={13} />
                          </button>
                        </div>
                        <span className="ml-2 text-[11.5px] text-ink-muted">
                          {formatTND(product.price)} / unité
                        </span>
                      </div>
                      <p className="text-[14.5px] font-bold text-ink">
                        {entry.available ? formatTND(entry.lineTotal) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <ButtonLink href="/produits" variant="ghost" size="sm">
            ‹ Continuer mes achats
          </ButtonLink>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-ink-muted"
            onClick={() => {
              clearCart();
              removeCode();
            }}
          >
            <IconTrash size={14} />
            Vider le panier
          </Button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-[132px]">
        <div className="rounded-panel border border-line bg-surface p-5 shadow-card">
          <h2 className="text-[15px] font-bold text-ink">Récapitulatif</h2>

          <dl className="mt-3.5 space-y-2 text-[13px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-soft">
                Sous-total ({totals?.itemCount ?? 0} article{(totals?.itemCount ?? 0) > 1 ? "s" : ""})
              </dt>
              <dd className="font-semibold text-ink">{formatTND(totals?.subtotal ?? 0)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-soft">Livraison</dt>
              <dd className="font-semibold text-ink">
                {totals && totals.shipping > 0 ? formatTND(totals.shipping) : "Offerte"}
              </dd>
            </div>
            {totals && totals.discount > 0 && (
              <div className="flex items-center justify-between gap-3 text-[#14614a]">
                <dt className="flex items-center gap-1.5">
                  <IconTag size={13} />
                  Remise {discount?.code ? `(${discount.code})` : ""}
                </dt>
                <dd className="font-semibold">−{formatTND(totals.discount)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
            <span className="text-[13px] font-semibold text-ink">Total</span>
            <span className="text-[21px] font-extrabold tracking-tight text-navy">
              {formatTND(totals?.total ?? 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">
            TVA incluse à titre indicatif · frais de port calculés par le serveur
          </p>

          {totals && totals.freeShippingRemaining > 0 ? (
            <p className="mt-3 flex items-start gap-1.5 rounded-field bg-accent-soft/70 px-3 py-2 text-[11.5px] leading-relaxed text-[#0b5560]">
              <IconTruck size={14} className="mt-0.5 shrink-0" />
              <span>
                Encore <strong className="font-semibold">{formatTND(totals.freeShippingRemaining)}</strong>{" "}
                pour la livraison offerte.
              </span>
            </p>
          ) : (
            <p className="mt-3 flex items-start gap-1.5 rounded-field bg-[#edf7f2] px-3 py-2 text-[11.5px] leading-relaxed text-[#14614a]">
              <IconTruck size={14} className="mt-0.5 shrink-0" />
              Livraison offerte appliquée à cette commande.
            </p>
          )}

          {/* discount code */}
          <div className="mt-4">
            {discount?.valid ? (
              <div className="flex items-start justify-between gap-2 rounded-field border border-[#c6e3d5] bg-[#edf7f2] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-[#14614a]">
                    Code {discount.code} appliqué
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-[#14614a]/80">
                    {discount.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeCode}
                  className="shrink-0 text-[11.5px] font-semibold text-[#14614a] underline underline-offset-2"
                >
                  Retirer
                </button>
              </div>
            ) : (
              <form onSubmit={applyCode}>
                <label className="field-label" htmlFor="discount-code">
                  Code promo
                </label>
                <div className="flex gap-2">
                  <input
                    id="discount-code"
                    value={codeInput}
                    onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                    placeholder="BIENVENUE10"
                    autoComplete="off"
                    spellCheck={false}
                    className="field-input flex-1 uppercase placeholder:normal-case placeholder:text-ink-muted"
                    aria-invalid={discount?.kind === "error"}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="md"
                    disabled={loading || !codeInput.trim()}
                  >
                    {loading ? "…" : "Appliquer"}
                  </Button>
                </div>
                {discount?.kind === "error" && appliedCode && (
                  <p className="field-error" role="alert">
                    {discount.message}
                  </p>
                )}
                {demoCodes.length > 0 && (
                  <details className="mt-2 text-[11.5px] text-ink-muted">
                    <summary className="cursor-pointer font-semibold text-ink-soft hover:text-accent-dark">
                      Codes de démonstration
                    </summary>
                    <ul className="mt-1.5 space-y-1">
                      {demoCodes.map((entry) => (
                        <li key={entry.code} className="flex flex-wrap items-baseline gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCodeInput(entry.code)}
                            className="rounded bg-[#f0f2f1] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink hover:bg-accent-soft"
                          >
                            {entry.code}
                          </button>
                          <span>{entry.description}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </form>
            )}
          </div>

          <ButtonLink
            href="/commande"
            variant="primary"
            size="lg"
            className="mt-4 w-full"
            aria-disabled={!totals || totals.itemCount === 0}
          >
            <IconLock size={16} />
            Passer la commande
          </ButtonLink>

          <ul className="mt-3.5 space-y-2 text-[11.5px] text-ink-soft">
            <li className="flex items-center gap-2">
              <IconWallet size={14} className="shrink-0 text-accent-dark" />
              Paiement à la livraison disponible
            </li>
            <li className="flex items-center gap-2">
              <IconRefresh size={14} className="shrink-0 text-accent-dark" />
              Retours sous {data?.settings.shipping.returnsDays ?? 7} jours
            </li>
            <li className="flex items-center gap-2">
              <IconShield size={14} className="shrink-0 text-accent-dark" />
              Commande simulée, aucun débit
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
