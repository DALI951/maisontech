"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/types";
import { useToast } from "./toast";

/**
 * Client-side commerce state: cart, wishlist, comparison and recently viewed.
 *
 * Everything is stored in localStorage under versioned keys so a future schema
 * change can migrate instead of crashing. Prices are NEVER trusted from here:
 * the cart/checkout screens re-fetch product data and totals from the server.
 */

const KEYS = {
  cart: "mt.cart.v1",
  wishlist: "mt.wishlist.v1",
  compare: "mt.compare.v1",
  recent: "mt.recent.v1",
} as const;

const MAX_RECENT = 8;
const MAX_COMPARE = 4;
const MAX_QUANTITY = 10;

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, value: unknown[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the session keeps working in memory */
  }
}

function sanitizeLines(value: unknown[]): CartLine[] {
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry as Partial<CartLine>;
    if (typeof candidate.productId !== "string") return [];
    const quantity = Number(candidate.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) return [];
    return [
      {
        productId: candidate.productId,
        quantity: Math.min(MAX_QUANTITY, Math.floor(quantity)),
        addedAt:
          typeof candidate.addedAt === "string" ? candidate.addedAt : new Date().toISOString(),
      },
    ];
  });
}

function sanitizeIds(value: unknown[]): string[] {
  return Array.from(new Set(value.filter((id): id is string => typeof id === "string")));
}

interface CommerceContextValue {
  ready: boolean;
  cart: CartLine[];
  cartCount: number;
  wishlist: string[];
  compare: string[];
  recent: string[];
  addToCart: (productId: string, options?: { quantity?: number; name?: string }) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  inCart: (productId: string) => number;
  toggleWishlist: (productId: string, name?: string) => boolean;
  isWishlisted: (productId: string) => boolean;
  toggleCompare: (productId: string, name?: string) => boolean;
  isCompared: (productId: string) => boolean;
  clearCompare: () => void;
  pushRecent: (productId: string) => void;
  clearWishlist: () => void;
}

const CommerceContext = createContext<CommerceContextValue | null>(null);

export function useCommerce(): CommerceContextValue {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce doit être utilisé dans <CommerceProvider>");
  return context;
}

export function CommerceProvider({ children }: { children: ReactNode }) {
  const { push } = useToast();
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  // Hydrate from storage after mount so the server HTML always matches.
  useEffect(() => {
    setCart(sanitizeLines(readArray<unknown>(KEYS.cart)));
    setWishlist(sanitizeIds(readArray<unknown>(KEYS.wishlist)));
    setCompare(sanitizeIds(readArray<unknown>(KEYS.compare)).slice(0, MAX_COMPARE));
    setRecent(sanitizeIds(readArray<unknown>(KEYS.recent)).slice(0, MAX_RECENT));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeArray(KEYS.cart, cart);
  }, [cart, ready]);
  useEffect(() => {
    if (ready) writeArray(KEYS.wishlist, wishlist);
  }, [wishlist, ready]);
  useEffect(() => {
    if (ready) writeArray(KEYS.compare, compare);
  }, [compare, ready]);
  useEffect(() => {
    if (ready) writeArray(KEYS.recent, recent);
  }, [recent, ready]);

  // Keep tabs in sync (cart badge on an already-open page).
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === KEYS.cart) setCart(sanitizeLines(readArray<unknown>(KEYS.cart)));
      if (event.key === KEYS.wishlist) setWishlist(sanitizeIds(readArray<unknown>(KEYS.wishlist)));
      if (event.key === KEYS.compare)
        setCompare(sanitizeIds(readArray<unknown>(KEYS.compare)).slice(0, MAX_COMPARE));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addToCart = useCallback(
    (productId: string, options?: { quantity?: number; name?: string }) => {
      const quantity = Math.max(1, Math.floor(options?.quantity ?? 1));
      setCart((current) => {
        const existing = current.find((line) => line.productId === productId);
        if (existing) {
          return current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) }
              : line,
          );
        }
        return [
          ...current,
          { productId, quantity: Math.min(MAX_QUANTITY, quantity), addedAt: new Date().toISOString() },
        ];
      });
      push({
        tone: "success",
        title: "Ajouté au panier",
        description: options?.name ?? "L'article a été ajouté à votre panier.",
      });
    },
    [push],
  );

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const next = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(quantity)));
    setCart((current) =>
      current.map((line) => (line.productId === productId ? { ...line, quantity: next } : line)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const inCart = useCallback(
    (productId: string) => cart.find((line) => line.productId === productId)?.quantity ?? 0,
    [cart],
  );

  const toggleWishlist = useCallback(
    (productId: string, name?: string) => {
      const exists = wishlist.includes(productId);
      setWishlist((current) =>
        exists ? current.filter((id) => id !== productId) : [...current, productId],
      );
      push({
        tone: exists ? "info" : "success",
        title: exists ? "Retiré des favoris" : "Ajouté aux favoris",
        description: name,
      });
      return !exists;
    },
    [push, wishlist],
  );

  const toggleCompare = useCallback(
    (productId: string, name?: string) => {
      if (compare.includes(productId)) {
        setCompare((current) => current.filter((id) => id !== productId));
        push({ tone: "info", title: "Retiré du comparateur", description: name });
        return false;
      }
      if (compare.length >= MAX_COMPARE) {
        push({
          tone: "error",
          title: "Comparateur complet",
          description: `Vous pouvez comparer ${MAX_COMPARE} appareils à la fois.`,
        });
        return false;
      }
      setCompare((current) => [...current, productId]);
      push({ tone: "success", title: "Ajouté au comparateur", description: name });
      return true;
    },
    [compare, push],
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );
  const isCompared = useCallback((productId: string) => compare.includes(productId), [compare]);

  const clearCompare = useCallback(() => setCompare([]), []);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  const pushRecent = useCallback((productId: string) => {
    setRecent((current) => [productId, ...current.filter((id) => id !== productId)].slice(0, MAX_RECENT));
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart],
  );

  const value = useMemo<CommerceContextValue>(
    () => ({
      ready,
      cart,
      cartCount,
      wishlist,
      compare,
      recent,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      inCart,
      toggleWishlist,
      isWishlisted,
      toggleCompare,
      isCompared,
      clearCompare,
      pushRecent,
      clearWishlist,
    }),
    [
      ready,
      cart,
      cartCount,
      wishlist,
      compare,
      recent,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      inCart,
      toggleWishlist,
      isWishlisted,
      toggleCompare,
      isCompared,
      clearCompare,
      pushRecent,
      clearWishlist,
    ],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export const COMMERCE_LIMITS = { MAX_COMPARE, MAX_QUANTITY, MAX_RECENT } as const;
