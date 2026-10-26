"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { IconChevronDown, IconClose, IconSliders } from "@/components/icons";
import { AVAILABILITY_LABEL } from "@/lib/product";
import { PER_PAGE_OPTIONS, type CatalogFacets } from "@/lib/catalog-shared";
import { SORT_LABELS } from "@/lib/catalog-params";
import type { Availability } from "@/lib/types";

interface SelectedFilters {
  brands: string[];
  availability: Availability[];
  energies: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale: boolean;
  isNew: boolean;
}

function useParamNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function apply(updates: Record<string, string | undefined>, options: { resetPage?: boolean } = {}) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    if (options.resetPage !== false) next.delete("page");
    const query = next.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return { apply, pending, params };
}

export function FilterPanel({
  facets,
  brands,
  selected,
  activeCount,
}: {
  facets: CatalogFacets;
  brands: { slug: string; name: string }[];
  selected: SelectedFilters;
  activeCount: number;
}) {
  const { apply, pending } = useParamNavigation();
  const [open, setOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(selected.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(selected.maxPrice?.toString() ?? "");

  function toggleList(key: "marque" | "dispo" | "energie", value: string, current: string[]) {
    const next = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];
    apply({ [key]: next.length ? next.join(",") : undefined });
  }

  const activeEnergyValues = new Set(selected.energies);
  const activeAvailability = new Set(selected.availability);
  const brandCount = new Map(facets.brands.map((brand) => [brand.slug, brand.count]));

  return (
    <div className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between rounded-field border border-line-strong bg-surface px-3.5 text-[13.5px] font-semibold text-ink lg:hidden"
      >
        <span className="flex items-center gap-2">
          <IconSliders size={17} />
          Filtres
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1.5 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        <IconChevronDown
          size={16}
          className={`text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`${open ? "block" : "hidden"} mt-3 space-y-5 lg:mt-0 lg:block`}>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em] text-ink">
            <IconSliders size={15} />
            Filtres
          </h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                apply({
                  marque: undefined,
                  dispo: undefined,
                  energie: undefined,
                  "prix-min": undefined,
                  "prix-max": undefined,
                  promo: undefined,
                  nouveau: undefined,
                });
              }}
              className="text-[11.5px] font-medium text-ink-muted hover:text-promo"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <section className="rounded-card border border-line bg-surface p-3.5">
          <h3 className="mb-2.5 text-[12.5px] font-semibold text-ink">Prix (DT)</h3>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              apply({
                "prix-min": minPrice || undefined,
                "prix-max": maxPrice || undefined,
              });
            }}
            className="flex items-end gap-2"
          >
            <label className="flex-1">
              <span className="mb-1 block text-[11px] text-ink-muted">Min</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder={String(Math.floor(facets.priceMin))}
                className="field-input h-9 px-2 text-[13px]"
              />
            </label>
            <span className="pb-2 text-ink-muted">–</span>
            <label className="flex-1">
              <span className="mb-1 block text-[11px] text-ink-muted">Max</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder={String(Math.ceil(facets.priceMax))}
                className="field-input h-9 px-2 text-[13px]"
              />
            </label>
            <button
              type="submit"
              className="h-9 rounded-field bg-navy px-2.5 text-[12px] font-semibold text-white hover:bg-navy-2"
            >
              OK
            </button>
          </form>
        </section>

        {brands.length > 0 && (
          <section className="rounded-card border border-line bg-surface p-3.5">
            <h3 className="mb-2 text-[12.5px] font-semibold text-ink">Marques</h3>
            <ul className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {facets.brands.map((facet) => {
                const brand = brands.find((entry) => entry.slug === facet.slug);
                const checked = selected.brands.includes(facet.slug);
                return (
                  <li key={facet.slug}>
                    <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-soft hover:text-ink">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleList("marque", facet.slug, selected.brands)}
                        className="h-3.5 w-3.5 accent-accent"
                      />
                      <span className="flex-1">{brand?.name ?? facet.name}</span>
                      <span className="text-[11px] text-ink-muted">
                        {brandCount.get(facet.slug) ?? facet.count}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="rounded-card border border-line bg-surface p-3.5">
          <h3 className="mb-2 text-[12.5px] font-semibold text-ink">Disponibilité</h3>
          <ul className="space-y-1.5">
            {(["in_stock", "low_stock", "out_of_stock"] as Availability[]).map((value) => (
              <li key={value}>
                <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-soft hover:text-ink">
                  <input
                    type="checkbox"
                    checked={activeAvailability.has(value)}
                    onChange={() => toggleList("dispo", value, selected.availability)}
                    className="h-3.5 w-3.5 accent-accent"
                  />
                  <span className="flex-1">{AVAILABILITY_LABEL[value]}</span>
                  <span className="text-[11px] text-ink-muted">{facets.availability[value] ?? 0}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        {facets.energies.length > 0 && (
          <section className="rounded-card border border-line bg-surface p-3.5">
            <h3 className="mb-2 text-[12.5px] font-semibold text-ink">Classe énergétique</h3>
            <ul className="grid grid-cols-2 gap-1.5">
              {facets.energies.map((energy) => (
                <li key={energy.value}>
                  <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-soft hover:text-ink">
                    <input
                      type="checkbox"
                      checked={activeEnergyValues.has(energy.value)}
                      onChange={() => toggleList("energie", energy.value, selected.energies)}
                      className="h-3.5 w-3.5 accent-accent"
                    />
                    <span>{energy.value}</span>
                    <span className="ml-auto text-[11px] text-ink-muted">{energy.count}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-2 rounded-card border border-line bg-surface p-3.5">
          <label className="flex cursor-pointer items-center justify-between gap-2 text-[12.5px] text-ink-soft">
            <span>Uniquement en promotion</span>
            <input
              type="checkbox"
              checked={selected.onSale}
              onChange={() => apply({ promo: selected.onSale ? undefined : "1" })}
              className="h-4 w-4 accent-accent"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-2 text-[12.5px] text-ink-soft">
            <span>Nouveautés seulement</span>
            <input
              type="checkbox"
              checked={selected.isNew}
              onChange={() => apply({ nouveau: selected.isNew ? undefined : "1" })}
              className="h-4 w-4 accent-accent"
            />
          </label>
        </section>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-full rounded-field bg-navy px-4 py-2.5 text-[13px] font-semibold text-white lg:hidden"
        >
          Voir les {facets.total} résultats
        </button>
      </div>
    </div>
  );
}

export function SortBar({
  total,
  page,
  pageCount,
  perPage,
  sortParam,
  fixedSort = false,
  pending,
}: {
  total: number;
  page: number;
  pageCount: number;
  perPage: number;
  sortParam: string;
  fixedSort?: boolean;
  pending?: boolean;
}) {
  const { apply } = useParamNavigation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
      <p className="text-[12.5px] text-ink-soft">
        <strong className="font-semibold text-ink">{total}</strong>{" "}
        {total > 1 ? "appareils" : "appareil"}
        {pageCount > 1 && (
          <span className="text-ink-muted">
            {" "}
            · page {page} sur {pageCount}
          </span>
        )}
        {pending && <span className="ml-2 text-ink-muted">· mise à jour…</span>}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-[12px] text-ink-muted">
          Trier par
          <span className="relative">
            <select
              value={sortParam}
              disabled={fixedSort}
              onChange={(event) => apply({ tri: event.target.value }, { resetPage: false })}
              className="h-9 appearance-none rounded-field border border-line-strong bg-surface pl-2.5 pr-7 text-[12.5px] font-medium text-ink disabled:opacity-60"
              aria-label="Trier les produits"
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={14}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted"
            />
          </span>
        </label>

        <label className="flex items-center gap-1.5 text-[12px] text-ink-muted">
          <span className="hidden sm:inline">Par page</span>
          <span className="relative">
            <select
              value={perPage}
              onChange={(event) => apply({ "par-page": event.target.value })}
              className="h-9 appearance-none rounded-field border border-line-strong bg-surface pl-2.5 pr-7 text-[12.5px] font-medium text-ink"
              aria-label="Nombre de produits par page"
            >
              {PER_PAGE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={14}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted"
            />
          </span>
        </label>
      </div>
    </div>
  );
}

export function ActiveFilterChips({ chips }: { chips: { label: string; href: string }[] }) {
  if (chips.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <li key={chip.label}>
          <a
            href={chip.href}
            className="inline-flex items-center gap-1 rounded-full border border-accent-line bg-accent-soft px-2.5 py-1 text-[11.5px] font-medium text-accent-dark hover:border-accent"
          >
            {chip.label}
            <IconClose size={12} />
          </a>
        </li>
      ))}
    </ul>
  );
}
