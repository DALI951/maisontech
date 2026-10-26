"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconAlert,
  IconArrowRight,
  IconCart,
  IconCheck,
  IconLock,
  IconTag,
  IconTruck,
  IconWallet,
} from "@/components/icons";
import { ProductVisual } from "@/components/product/product-visual";
import { Alert, Button, ButtonLink, EmptyState, Skeleton } from "@/components/ui/primitives";
import { COUPON_STORAGE_KEY, useCartPricing } from "@/hooks/use-cart-pricing";
import { formatTND } from "@/lib/money";
import { hasErrors, validateCheckout, type CheckoutInput, type FieldErrors } from "@/lib/validation";
import { useCommerce } from "@/store/commerce";
import { useToast } from "@/store/toast";
import type { PaymentMethod } from "@/lib/types";

interface OrderResponse {
  ok: boolean;
  order?: { reference: string };
  error?: string;
  fields?: FieldErrors;
}

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "cod",
    label: "Paiement à la livraison",
    description: "Vous réglez en espèces au livreur, à la réception de l'appareil.",
    icon: <IconWallet size={16} />,
  },
  {
    value: "bank_transfer",
    label: "Virement bancaire",
    description: "Les coordonnées bancaires sont communiquées après confirmation (démo).",
    icon: <IconTag size={16} />,
  },
  {
    value: "online",
    label: "Carte bancaire en ligne",
    description: "Indisponible dans cette démonstration : aucun prestataire de paiement n'est branché.",
    icon: <IconLock size={16} />,
  },
];

export function CheckoutForm({
  governorates,
  defaults,
  settings,
  authedName,
}: {
  governorates: readonly string[];
  defaults: Partial<CheckoutInput> & { governorate?: string };
  settings: {
    shipping: { flatRate: number; freeShippingThreshold: number; estimatedDays: string; returnsDays: number };
    payments: { cashOnDelivery: boolean; bankTransfer: boolean; onlinePayment: boolean };
  };
  authedName?: string;
}) {
  const router = useRouter();
  const { cart, ready, clearCart, cartCount } = useCommerce();
  const { push } = useToast();

  const [coupon, setCoupon] = useState<string | undefined>(undefined);
  const { data, loading, error: pricingError } = useCartPricing(coupon);

  const [values, setValues] = useState({
    fullName: defaults.fullName ?? "",
    email: defaults.email ?? "",
    phone: defaults.phone ?? "",
    address: defaults.address ?? "",
    city: defaults.city ?? "",
    governorate: defaults.governorate ?? "",
    notes: "",
    paymentMethod: (settings.payments.cashOnDelivery ? "cod" : "bank_transfer") as PaymentMethod,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COUPON_STORAGE_KEY);
      if (stored) setCoupon(stored);
    } catch {
      /* ignore */
    }
  }, []);

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const candidate: CheckoutInput = { ...values, notes: values.notes.trim() || undefined };
    const validation = validateCheckout(candidate);
    if (hasErrors(validation)) {
      setErrors(validation);
      setFormError("Certains champs demandent une correction avant de continuer.");
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...candidate,
          lines: cart.map((line) => ({ productId: line.productId, quantity: line.quantity })),
          discountCode: data?.discount.valid ? data.discount.code : undefined,
        }),
      });
      const payload = (await response.json()) as OrderResponse;

      if (!response.ok || !payload.ok || !payload.order) {
        setErrors(payload.fields ?? {});
        setFormError(payload.error ?? "La commande n'a pas pu être créée.");
        return;
      }

      clearCart();
      try {
        window.localStorage.removeItem(COUPON_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      push({
        tone: "success",
        title: "Commande enregistrée (démonstration)",
        description: `Référence ${payload.order.reference}. Aucun paiement n'a été prélevé.`,
      });
      router.push(`/commande/confirmation/${payload.order.reference}`);
    } catch {
      setFormError("Connexion impossible. Vérifiez votre réseau puis réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || (loading && !data && cartCount > 0)) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_346px]">
        <div className="space-y-3">
          <Skeleton className="h-64 w-full rounded-panel" />
          <Skeleton className="h-40 w-full rounded-panel" />
        </div>
        <Skeleton className="h-64 w-full rounded-panel" />
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <EmptyState
        title="Aucun article à commander"
        description="Ajoutez au moins un appareil à votre panier pour accéder au formulaire de commande."
        icon={<IconCart size={26} />}
        action={
          <ButtonLink href="/produits" variant="dark" size="md">
            Parcourir le catalogue
            <IconArrowRight size={15} />
          </ButtonLink>
        }
      />
    );
  }

  const totals = data?.totals;
  const field = (
    name: keyof typeof values,
    label: string,
    options?: { type?: string; placeholder?: string; autoComplete?: string; hint?: string },
  ) => (
    <div>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={options?.type ?? "text"}
        value={values[name] as string}
        onChange={(event) => update(name, event.target.value as never)}
        placeholder={options?.placeholder}
        autoComplete={options?.autoComplete}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className="field-input"
      />
      {options?.hint && !errors[name] && (
        <p className="mt-1 text-[11.5px] text-ink-muted">{options.hint}</p>
      )}
      {errors[name] && (
        <p className="field-error" id={`${name}-error`} role="alert">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_346px] lg:items-start">
      <div className="min-w-0 space-y-4">
        {formError && (
          <Alert tone="error" title="Commande non enregistrée">
            {formError}
          </Alert>
        )}

        {!authedName && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-line bg-surface px-4 py-3 text-[12.5px] text-ink-soft">
            <span>Vous commandez en invité. Connectez-vous pour retrouver la commande dans votre compte.</span>
            <Link href="/connexion" className="font-semibold text-accent-dark hover:underline">
              Se connecter
            </Link>
          </div>
        )}

        <section className="rounded-panel border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-bold text-ink">1. Coordonnées</h2>
            <span className="text-[11.5px] text-ink-muted">Champs obligatoires *</span>
          </div>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            {field("fullName", "Nom et prénom *", {
              autoComplete: "name",
              placeholder: "Sonia Ben Amor",
            })}
            {field("email", "Adresse e-mail *", {
              type: "email",
              autoComplete: "email",
              placeholder: "nom@domaine.tn",
            })}
            {field("phone", "Téléphone *", {
              type: "tel",
              autoComplete: "tel",
              placeholder: "20 123 456",
              hint: "Numéro tunisien à 8 chiffres.",
            })}
          </div>
        </section>

        <section className="rounded-panel border border-line bg-surface p-5">
          <h2 className="text-[15px] font-bold text-ink">2. Livraison</h2>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              {field("address", "Adresse complète *", {
                autoComplete: "street-address",
                placeholder: "12 rue de la Liberté, appartement 3",
              })}
            </div>
            {field("city", "Ville / localité *", {
              autoComplete: "address-level2",
              placeholder: "La Marsa",
            })}
            <div>
              <label className="field-label" htmlFor="governorate">
                Gouvernorat *
              </label>
              <select
                id="governorate"
                name="governorate"
                value={values.governorate}
                onChange={(event) => update("governorate", event.target.value)}
                aria-invalid={Boolean(errors.governorate)}
                className="field-input"
              >
                <option value="">Choisir…</option>
                {governorates.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
              {errors.governorate && (
                <p className="field-error" role="alert">
                  {errors.governorate}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="notes">
                Instructions de livraison (facultatif)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                maxLength={500}
                value={values.notes}
                onChange={(event) => update("notes", event.target.value)}
                placeholder="Étage, code d'accès, créneau souhaité…"
                aria-invalid={Boolean(errors.notes)}
                className="field-input resize-y"
              />
              {errors.notes && (
                <p className="field-error" role="alert">
                  {errors.notes}
                </p>
              )}
              <p className="mt-1 text-[11.5px] text-ink-muted">
                Livraison estimée : {settings.shipping.estimatedDays}.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-panel border border-line bg-surface p-5">
          <h2 className="text-[15px] font-bold text-ink">3. Paiement</h2>
          <div className="mt-3.5 space-y-2">
            {PAYMENT_OPTIONS.map((option) => {
              const disabled =
                (option.value === "cod" && !settings.payments.cashOnDelivery) ||
                (option.value === "bank_transfer" && !settings.payments.bankTransfer) ||
                option.value === "online";
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-tile border px-3.5 py-3 transition-colors ${
                    values.paymentMethod === option.value
                      ? "border-accent bg-accent-soft/50"
                      : "border-line hover:border-line-strong"
                  } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.value}
                    checked={values.paymentMethod === option.value}
                    disabled={disabled}
                    onChange={() => update("paymentMethod", option.value)}
                    className="mt-0.5 h-4 w-4 accent-[#0e7c86]"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                      {option.icon}
                      {option.label}
                      {disabled && (
                        <span className="rounded-full bg-[#f2f3f3] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                          indisponible
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-soft">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.paymentMethod && (
            <p className="field-error" role="alert">
              {errors.paymentMethod}
            </p>
          )}
          <div className="mt-4 flex items-start gap-2 rounded-field bg-[#f4f6f5] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-soft">
            <IconAlert size={14} className="mt-0.5 shrink-0" />
            <p>
              Démonstration : la commande est enregistrée localement, aucun paiement n'est encaissé
              et rien n'est expédié. Ne saisissez jamais de données de carte ici.
            </p>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-[132px]">
        <div className="rounded-panel border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[15px] font-bold text-ink">Votre commande</h2>
            <Link href="/panier" className="text-[11.5px] font-semibold text-accent-dark hover:underline">
              Modifier
            </Link>
          </div>

          <ul className="mt-3 max-h-[280px] space-y-2.5 overflow-y-auto pr-1">
            {data?.lines.map((line) => (
              <li key={line.productId} className="flex items-center gap-2.5">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-tile border border-line bg-[#f4f6f5]">
                  <ProductVisual product={line.product} className="h-full w-full p-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[12px] font-semibold text-ink">{line.product.name}</p>
                  <p className="text-[11px] text-ink-muted">Quantité {line.quantity}</p>
                </div>
                <span className="text-[12px] font-semibold text-ink">
                  {line.available ? formatTND(line.lineTotal) : "—"}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-3.5 space-y-2 border-t border-line pt-3 text-[12.5px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-soft">Sous-total</dt>
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
                <dt>Remise {data?.discount.code ? `(${data.discount.code})` : ""}</dt>
                <dd className="font-semibold">−{formatTND(totals.discount)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-2.5 flex items-baseline justify-between gap-3 border-t border-line pt-2.5">
            <span className="text-[13px] font-semibold text-ink">Total à payer</span>
            <span className="text-[20px] font-extrabold tracking-tight text-navy">
              {formatTND(totals?.total ?? 0)}
            </span>
          </div>

          {pricingError && (
            <p className="mt-2 text-[11.5px] text-[#8f2f18]" role="alert">
              {pricingError}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-4 w-full" disabled={submitting}>
            {submitting ? "Enregistrement…" : "Confirmer la commande"}
            {!submitting && <IconCheck size={16} />}
          </Button>

          <p className="mt-2 text-center text-[11px] leading-relaxed text-ink-muted">
            En confirmant, vous reconnaissez qu'il s'agit d'une commande de démonstration.
          </p>

          <ul className="mt-3.5 space-y-1.5 text-[11.5px] text-ink-soft">
            <li className="flex items-center gap-2">
              <IconTruck size={13} className="shrink-0 text-accent-dark" />
              Livraison {settings.shipping.estimatedDays}
            </li>
            <li className="flex items-center gap-2">
              <IconTag size={13} className="shrink-0 text-accent-dark" />
              Retours sous {settings.shipping.returnsDays} jours
            </li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
