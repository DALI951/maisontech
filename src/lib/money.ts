import { SITE } from "@/config/site";

/**
 * Tunisian dinar helpers.
 *
 * Money is stored as a number of dinars (max 3 decimals) but every calculation
 * is done in *millimes* (1 DT = 1000 millimes) so totals never drift through
 * binary floating point.
 */

const MILLIMES_PER_DINAR = 1000;

export function toMillimes(dinars: number): number {
  return Math.round(dinars * MILLIMES_PER_DINAR);
}

export function fromMillimes(millimes: number): number {
  return Math.round(millimes) / MILLIMES_PER_DINAR;
}

export function addMoney(...values: number[]): number {
  return fromMillimes(values.reduce((sum, value) => sum + toMillimes(value), 0));
}

export function multiplyMoney(value: number, quantity: number): number {
  return fromMillimes(toMillimes(value) * quantity);
}

export function percentOf(value: number, percent: number): number {
  return fromMillimes(Math.round((toMillimes(value) * percent) / 100));
}

const formatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
  useGrouping: true,
});

/** `1899` -> `"1 899 DT"`, `1899.5` -> `"1 899,500 DT"`. */
export function formatTND(value: number, options?: { withCurrency?: boolean }): string {
  const withCurrency = options?.withCurrency ?? true;
  const safe = Number.isFinite(value) ? value : 0;
  const rendered = formatter.format(fromMillimes(toMillimes(safe)));
  return withCurrency ? `${rendered} ${SITE.currencyLabel}` : rendered;
}

/** Splits a formatted amount so the currency can be styled separately. */
export function formatTNDParts(value: number): { amount: string; currency: string } {
  return { amount: formatTND(value, { withCurrency: false }), currency: SITE.currencyLabel };
}

export function discountPercent(price: number, originalPrice?: number | null): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function hasDiscount(price: number, originalPrice?: number | null): boolean {
  return discountPercent(price, originalPrice) > 0;
}
