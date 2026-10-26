"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { IconArrowRight, IconSearch, IconSpinner } from "@/components/icons";
import { ProductVisual } from "@/components/product/product-visual";
import { formatTND } from "@/lib/money";
import type { ProductSummary } from "@/lib/types";

interface SearchResponse {
  products: ProductSummary[];
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
  suggestions: string[];
  total: number;
}

export const EMPTY_SEARCH: SearchResponse = {
  products: [],
  categories: [],
  brands: [],
  suggestions: [],
  total: 0,
};

/**
 * Header search with server-backed suggestions.
 * Everything is fetched from /api/search, so the suggestions always match the
 * live catalogue (including admin edits) and accents are handled server-side.
 */
export function SearchBox({
  variant = "header",
  autoFocus = false,
  onNavigate,
  initialQuery = "",
}: {
  variant?: "header" | "page";
  autoFocus?: boolean;
  onNavigate?: () => void;
  initialQuery?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse>(EMPTY_SEARCH);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setData(EMPTY_SEARCH);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("search failed");
        const payload = (await response.json()) as SearchResponse;
        setData(payload);
        setActive(-1);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setData(EMPTY_SEARCH);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const term = query.trim();
  const showPanel = open && term.length >= 2;
  const items = data.products;

  function submit(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/recherche?q=${encodeURIComponent(clean)}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => Math.min(items.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(-1, current - 1));
    } else if (event.key === "Enter") {
      if (active >= 0 && items[active]) {
        event.preventDefault();
        setOpen(false);
        onNavigate?.();
        router.push(`/produit/${items[active].slug}`);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const height = variant === "page" ? "h-12" : "h-11";

  return (
    <form
      ref={containerRef}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (active >= 0 && items[active]) {
          setOpen(false);
          onNavigate?.();
          router.push(`/produit/${items[active].slug}`);
          return;
        }
        submit(query);
      }}
      className="relative w-full"
    >
      <label htmlFor={listId} className="sr-only">
        Rechercher un appareil
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
          <IconSearch size={18} />
        </span>
        <input
          id={listId}
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Rechercher : réfrigérateur, lave-linge, café…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={`${listId}-panel`}
          aria-autocomplete="list"
          className={`${height} w-full rounded-field border border-line-strong bg-paper/70 pl-10 pr-24 text-sm text-ink transition-colors placeholder:text-ink-muted hover:border-line-strong focus:border-accent focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-accent/15 [&::-webkit-search-cancel-button]:hidden`}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading && (
            <span className="text-ink-muted" aria-hidden="true">
              <IconSpinner size={16} />
            </span>
          )}
          <button
            type="submit"
            className="rounded-[7px] bg-navy px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-navy-2"
          >
            Chercher
          </button>
        </div>
      </div>

      {showPanel && (
        <div
          id={`${listId}-panel`}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-panel border border-line bg-surface shadow-lift"
        >
          {items.length > 0 ? (
            <ul className="max-h-[380px] overflow-y-auto py-1.5">
              {items.map((product, index) => (
                <li key={product.id} role="option" aria-selected={index === active}>
                  <Link
                    href={`/produit/${product.slug}`}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    onMouseEnter={() => setActive(index)}
                    className={`flex items-center gap-3 px-3 py-2 ${
                      index === active ? "bg-accent-soft/70" : "hover:bg-paper"
                    }`}
                  >
                    <span className="h-12 w-12 shrink-0 overflow-hidden rounded-[8px] border border-line bg-paper">
                      <ProductVisual product={product} className="h-full w-full" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">
                        {product.name}
                      </span>
                      <span className="block truncate text-[12px] text-ink-muted">
                        {product.subcategory}
                      </span>
                    </span>
                    <span className="shrink-0 text-[13px] font-bold text-ink">
                      {formatTND(product.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-5 text-[13px] text-ink-soft">
              {loading ? "Recherche en cours…" : "Aucun appareil ne correspond à cette recherche."}
            </p>
          )}

          {(data.categories.length > 0 || data.brands.length > 0) && (
            <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2.5">
              {data.categories.slice(0, 2).map((category) => (
                <Link
                  key={category.slug}
                  href={`/categorie/${category.slug}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="rounded-full border border-line bg-paper px-2.5 py-1 text-[11.5px] font-medium text-ink-soft hover:border-accent hover:text-accent-dark"
                >
                  Catégorie · {category.name}
                </Link>
              ))}
              {data.brands.slice(0, 2).map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/marques/${brand.slug}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="rounded-full border border-line bg-paper px-2.5 py-1 text-[11.5px] font-medium text-ink-soft hover:border-accent hover:text-accent-dark"
                >
                  Marque · {brand.name}
                </Link>
              ))}
            </div>
          )}

          <Link
            href={`/recherche?q=${encodeURIComponent(term)}`}
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="flex items-center justify-between gap-2 border-t border-line bg-paper/70 px-4 py-2.5 text-[12.5px] font-semibold text-accent-dark hover:bg-accent-soft"
          >
            <span>
              Voir tous les résultats{data.total > 0 ? ` (${data.total})` : ""} pour « {term} »
            </span>
            <IconArrowRight size={15} />
          </Link>
        </div>
      )}
    </form>
  );
}
