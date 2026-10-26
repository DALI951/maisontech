"use client";

import { useState } from "react";
import { IconChevronLeft, IconChevronRight, IconZoom } from "@/components/icons";
import { ProductVisual } from "@/components/product/product-visual";
import type { Product } from "@/lib/types";

const VARIANTS = [
  { id: "front", label: "Vue d'ensemble" },
  { id: "detail", label: "Détail" },
  { id: "blueprint", label: "Schéma & dimensions" },
] as const;

type Variant = (typeof VARIANTS)[number]["id"];

export function ProductGallery({ product, badge }: { product: Product; badge?: string }) {
  const [variant, setVariant] = useState<Variant>("front");
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  function move(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  }

  function step(direction: 1 | -1) {
    const index = VARIANTS.findIndex((entry) => entry.id === variant);
    const next = (index + direction + VARIANTS.length) % VARIANTS.length;
    setVariant(VARIANTS[next].id);
  }

  return (
    <div className="lg:sticky lg:top-[132px]">
      <div className="overflow-hidden rounded-panel border border-line bg-surface">
        <div
          className="group relative aspect-square cursor-zoom-in overflow-hidden bg-gradient-to-b from-[#f8f9f7] to-[#eef1ef]"
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={move}
        >
          <ProductVisual
            product={product}
            variant={variant}
            className="h-full w-full p-8 transition-transform duration-200 ease-out"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-opacity"
            style={{
              backgroundImage: zoomed
                ? undefined
                : "radial-gradient(circle at center, rgba(255,255,255,0.35), transparent 60%)",
            }}
          />

          {badge && (
            <span className="absolute left-4 top-4 rounded-full bg-promo px-2.5 py-1 text-[11px] font-bold text-white">
              {badge}
            </span>
          )}

          <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            <IconZoom size={13} />
            Survolez pour agrandir
          </span>

          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Visuel précédent"
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-card transition-colors hover:border-accent hover:text-accent-dark"
          >
            <IconChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Visuel suivant"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-card transition-colors hover:border-accent hover:text-accent-dark"
          >
            <IconChevronRight size={17} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-line p-3">
          {VARIANTS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setVariant(entry.id)}
              aria-pressed={variant === entry.id}
              aria-label={entry.label}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-tile border bg-paper transition-colors ${
                variant === entry.id
                  ? "border-accent ring-2 ring-accent/20"
                  : "border-line hover:border-line-strong"
              }`}
            >
              <ProductVisual
                product={product}
                variant={entry.id}
                className="h-full w-full p-1.5"
              />
            </button>
          ))}
          <p className="ml-auto hidden max-w-[150px] self-center text-[10.5px] leading-snug text-ink-muted sm:block">
            Illustrations vectorielles de démonstration — aucune photo réelle.
          </p>
        </div>
      </div>
    </div>
  );
}
