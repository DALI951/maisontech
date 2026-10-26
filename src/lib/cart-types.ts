import type { CartTotals, ProductSummary, StoreSettings } from "./types";
import type { DiscountEvaluation } from "./pricing";

/**
 * Response contract shared by /api/cart and /api/orders preview calls.
 * Keeping it in one place means the client screens cannot drift from the server.
 */

export interface CartLineResponse {
  productId: string;
  quantity: number;
  lineTotal: number;
  available: boolean;
  maxQuantity: number;
  product: ProductSummary;
}

export interface CartResponse {
  ok: true;
  lines: CartLineResponse[];
  totals: CartTotals;
  discount: DiscountEvaluation;
  settings: {
    shipping: StoreSettings["shipping"];
    payments: StoreSettings["payments"];
    demoBanner: boolean;
  };
}

export interface ApiError {
  ok: false;
  error: string;
  fields?: Record<string, string>;
}
