import type { CartLineView, CartTotals, DiscountCode, StoreSettings } from "./types";
import { readDb } from "./db";
import { computeTotals, evaluateDiscountCode, type DiscountEvaluation } from "./pricing";
import { multiplyMoney } from "./money";

export interface CartViewResult {
  lines: CartLineView[];
  totals: CartTotals;
  discount: DiscountEvaluation;
  settings: StoreSettings;
}

export interface CartLineInput {
  productId?: unknown;
  quantity?: unknown;
  addedAt?: unknown;
}

export const MAX_LINE_QUANTITY = 10;

/** Normalises untrusted cart payloads coming from localStorage or the API. */
export function sanitizeCartLines(input: unknown): { productId: string; quantity: number }[] {
  if (!Array.isArray(input)) return [];
  const merged = new Map<string, number>();
  for (const entry of input as CartLineInput[]) {
    if (!entry || typeof entry !== "object") continue;
    if (typeof entry.productId !== "string") continue;
    const quantity = Math.floor(Number(entry.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) continue;
    merged.set(entry.productId, (merged.get(entry.productId) ?? 0) + quantity);
  }
  return [...merged.entries()].map(([productId, quantity]) => ({
    productId,
    quantity: Math.min(MAX_LINE_QUANTITY, quantity),
  }));
}

/**
 * Rebuilds the cart from the database: prices, stock and discount are always
 * authoritative on the server. The client only ever sends ids and quantities.
 */
export async function buildCartView(
  input: { productId: string; quantity: number }[],
  code?: string,
  now: Date = new Date(),
): Promise<CartViewResult> {
  const database = await readDb();
  const settings = database.settings;
  const products = new Map(database.products.map((product) => [product.id, product]));

  const lines: CartLineView[] = input.flatMap((entry) => {
    const product = products.get(entry.productId);
    if (!product) return [];
    const maxQuantity = Math.min(MAX_LINE_QUANTITY, Math.max(0, product.stock));
    const quantity = Math.max(1, Math.min(entry.quantity, maxQuantity || 1));
    return [
      {
        productId: product.id,
        quantity,
        addedAt: now.toISOString(),
        product,
        lineTotal: multiplyMoney(product.price, product.stock > 0 ? quantity : 0),
        available: product.stock > 0,
        maxQuantity,
      },
    ];
  });

  // The discount only ever applies to what can actually be bought.
  const payableSubtotal = lines
    .filter((line) => line.available)
    .reduce((sum, line) => sum + line.lineTotal, 0);

  const normalized = code?.trim().toUpperCase();
  const found: DiscountCode | undefined = normalized
    ? database.discounts.find((entry) => entry.code.toUpperCase() === normalized)
    : undefined;
  const discount = evaluateDiscountCode(found, payableSubtotal, now);
  const totals = computeTotals(lines, settings, discount);

  return { lines, totals, discount, settings };
}
