"use client";

import { useEffect, useState } from "react";
import type { CartResponse } from "@/lib/cart-types";
import { useCommerce } from "@/store/commerce";

export interface CartPricingState {
  data: CartResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Server-side pricing for the localStorage cart.
 * Used by the cart page and the checkout so both always show identical numbers.
 * `refreshToken` forces a re-fetch when the same code is submitted again.
 */
export function useCartPricing(code?: string, refreshToken = 0): CartPricingState {
  const { cart, ready } = useCommerce();
  const [state, setState] = useState<CartPricingState>({
    data: null,
    loading: true,
    error: null,
  });

  const key = JSON.stringify(
    cart.map((line) => ({ productId: line.productId, quantity: line.quantity })),
  );

  useEffect(() => {
    if (!ready) return;
    if (key === "[]") {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((previous) => ({ ...previous, loading: true, error: null }));

    void (async () => {
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: JSON.parse(key), code }),
        });
        const payload = (await response.json()) as CartResponse | { ok: false; error: string };
        if (cancelled) return;
        if (!response.ok || !("ok" in payload) || !payload.ok) {
          setState((previous) => ({
            data: previous.data,
            loading: false,
            error: "error" in payload ? payload.error : "Le panier n'a pas pu être recalculé.",
          }));
          return;
        }
        setState({ data: payload, loading: false, error: null });
      } catch {
        if (!cancelled) {
          setState((previous) => ({
            data: previous.data,
            loading: false,
            error: "Connexion impossible. Vérifiez votre réseau et réessayez.",
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, key, code, refreshToken]);

  return state;
}

export const COUPON_STORAGE_KEY = "mt.coupon.v1";
