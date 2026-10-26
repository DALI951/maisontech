import type { CartLineView, CartTotals, DiscountCode, StoreSettings } from "./types";
import { addMoney, fromMillimes, percentOf, toMillimes } from "./money";

export interface DiscountEvaluation {
  valid: boolean;
  code?: string;
  discount: number;
  freeShipping: boolean;
  message: string;
  kind: "none" | "ok" | "error";
}

export const NO_DISCOUNT: DiscountEvaluation = {
  valid: false,
  discount: 0,
  freeShipping: false,
  message: "",
  kind: "none",
};

/** Server *and* client use this, so the number in the cart always matches the API. */
export function computeTotals(
  lines: CartLineView[],
  settings: StoreSettings,
  discount: DiscountEvaluation = NO_DISCOUNT,
  shippingOverride?: number,
): CartTotals {
  const payable = lines.filter((line) => line.available);
  const itemCount = payable.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = addMoney(...payable.map((line) => line.lineTotal));

  let shipping = fromMillimes(toMillimes(settings.shipping.flatRate));
  if (subtotal <= 0) shipping = 0;
  else if (
    settings.shipping.freeShippingThreshold > 0 &&
    subtotal >= settings.shipping.freeShippingThreshold
  ) {
    shipping = 0;
  }
  if (discount.freeShipping) shipping = 0;
  if (typeof shippingOverride === "number") shipping = shippingOverride;

  const discountValue = discount.valid ? Math.min(discount.discount, subtotal) : 0;
  const total = Math.max(0, addMoney(subtotal, shipping, -discountValue));

  return {
    itemCount,
    subtotal,
    shipping,
    discount: discountValue,
    total,
    freeShippingRemaining: Math.max(
      0,
      fromMillimes(toMillimes(settings.shipping.freeShippingThreshold) - toMillimes(subtotal)),
    ),
  };
}

function startOfToday(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/** Validates a code against the cart. Pure function, safe on the server. */
export function evaluateDiscountCode(
  code: DiscountCode | undefined,
  subtotal: number,
  now: Date = new Date(),
): DiscountEvaluation {
  if (!code) {
    return {
      valid: false,
      discount: 0,
      freeShipping: false,
      message: "Ce code promo n'existe pas ou n'est plus disponible.",
      kind: "error",
    };
  }
  if (!code.active) {
    return {
      valid: false,
      discount: 0,
      freeShipping: false,
      message: "Ce code promo est désactivé.",
      kind: "error",
      code: code.code,
    };
  }
  if (code.expiresAt && new Date(code.expiresAt).getTime() < startOfToday(now)) {
    return {
      valid: false,
      discount: 0,
      freeShipping: false,
      message: "Ce code promo a expiré.",
      kind: "error",
      code: code.code,
    };
  }
  if (code.maxUses !== null && code.usedCount >= code.maxUses) {
    return {
      valid: false,
      discount: 0,
      freeShipping: false,
      message: "Ce code promo a atteint sa limite d'utilisation.",
      kind: "error",
      code: code.code,
    };
  }
  if (subtotal < code.minOrder) {
    return {
      valid: false,
      discount: 0,
      freeShipping: false,
      message: `Ce code s'applique à partir de ${code.minOrder} DT d'achat.`,
      kind: "error",
      code: code.code,
    };
  }

  let discount = 0;
  let freeShipping = false;
  if (code.type === "percent") discount = percentOf(subtotal, code.value);
  else if (code.type === "fixed") discount = Math.min(code.value, subtotal);
  else if (code.type === "free_shipping") freeShipping = true;

  if (code.type === "free_shipping") discount = 0;

  return {
    valid: true,
    code: code.code,
    discount,
    freeShipping,
    message:
      code.type === "free_shipping"
        ? "Livraison offerte appliquée."
        : `Code ${code.code} appliqué : ${code.description}.`,
    kind: "ok",
  };
}

export function payableSubtotal(lines: CartLineView[]): number {
  return addMoney(...lines.filter((line) => line.available).map((line) => line.lineTotal));
}
