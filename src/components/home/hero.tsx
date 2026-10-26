"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrowRight, IconChevronLeft, IconChevronRight, IconTag } from "@/components/icons";
import { ProductVisual } from "@/components/product/product-visual";
import { formatTND } from "@/lib/money";
import type { HeroSlide, Product } from "@/lib/types";

export function Hero({
  slides,
  products,
}: {
  slides: HeroSlide[];
  products: Product[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), 7500);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[Math.min(index, slides.length - 1)];
  const product = products.find((entry) => entry.slug === slide.productSlug);
  const navy = slide.theme === "navy";

  return (
    <section
      aria-label="À la une"
      className="container-page pt-4 sm:pt-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`relative overflow-hidden rounded-panel border ${
          navy
            ? "border-navy bg-navy text-white"
            : "border-line bg-gradient-to-br from-[#f1f5f3] via-[#eef2f1] to-[#e4ebe8]"
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -right-24 -top-28 h-[420px] w-[420px] rounded-full blur-3xl ${
            navy ? "bg-accent/25" : "bg-accent/10"
          }`}
        />
        {product && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -right-16 bottom-[-60px] h-[360px] w-[360px] rounded-full ${
              navy ? "bg-white/[0.04]" : "bg-white/60"
            }`}
          />
        )}

        <div className="relative grid gap-6 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-4 lg:px-12 lg:py-14">
          <div className="max-w-xl">
            <p className={`eyebrow ${navy ? "text-accent-line" : ""}`}>{slide.eyebrow}</p>
            <h1
              className={`mt-3 text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-[42px] lg:text-[46px] ${
                navy ? "text-white" : "text-navy"
              }`}
            >
              {slide.title}{" "}
              <em className={`font-display font-normal italic ${navy ? "text-accent-line" : "text-accent"}`}>
                {slide.titleAccent}
              </em>
            </h1>
            <p
              className={`mt-4 max-w-md text-[14.5px] leading-relaxed ${
                navy ? "text-white/70" : "text-ink-soft"
              }`}
            >
              {slide.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                href={slide.ctaHref}
                className={`inline-flex h-11 items-center gap-2 rounded-field px-5 text-[14px] font-semibold transition-colors ${
                  navy
                    ? "bg-white text-navy hover:bg-accent-soft"
                    : "bg-navy text-white hover:bg-navy-2"
                }`}
              >
                {slide.ctaLabel}
                <IconArrowRight size={17} />
              </Link>
              <Link
                href="/produits"
                className={`inline-flex h-11 items-center rounded-field border px-4 text-[13.5px] font-semibold transition-colors ${
                  navy
                    ? "border-white/25 text-white/85 hover:border-white/60 hover:text-white"
                    : "border-line-strong bg-surface/70 text-ink hover:border-accent hover:text-accent-dark"
                }`}
              >
                Tout le catalogue
              </Link>
            </div>

            {slide.discountLabel && (
              <p
                className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                  navy ? "bg-white/10 text-white/85" : "bg-promo-soft text-promo"
                }`}
              >
                <IconTag size={14} />
                {slide.discountLabel}
                {slide.expiresAt && (
                  <span className={navy ? "font-normal text-white/55" : "font-normal text-ink-muted"}>
                    · jusqu'au{" "}
                    {new Date(slide.expiresAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                )}
              </p>
            )}
          </div>

          {product && (
            <div className="relative">
              <div
                className={`relative mx-auto flex h-[230px] w-full max-w-[420px] items-center justify-center rounded-[24px] border sm:h-[300px] lg:h-[340px] ${
                  navy ? "border-white/10 bg-white/[0.05]" : "border-white/80 bg-white/70"
                }`}
              >
                <ProductVisual
                  product={product}
                  className="h-full w-full p-6 drop-shadow-[0_18px_30px_rgba(12,27,42,0.14)]"
                />
                <div
                  className={`absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 rounded-tile px-3.5 py-2.5 backdrop-blur ${
                    navy ? "bg-white/10 text-white" : "bg-surface/90 text-ink shadow-card"
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${navy ? "text-white/55" : "text-ink-muted"}`}>
                      Sélection
                    </p>
                    <p className="truncate text-[12.5px] font-semibold">{product.name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-bold">{formatTND(product.price)}</p>
                    {product.originalPrice && (
                      <p className={`text-[11px] line-through ${navy ? "text-white/45" : "text-ink-muted"}`}>
                        {formatTND(product.originalPrice)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {slides.length > 1 && (
          <div className="relative flex items-center justify-between gap-4 px-5 pb-4 sm:px-8 lg:px-12">
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Diapositives">
              {slides.map((entry, position) => (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={position === index}
                  aria-label={entry.eyebrow}
                  onClick={() => setIndex(position)}
                  className={`h-1.5 rounded-full transition-all ${
                    position === index
                      ? navy
                        ? "w-7 bg-white"
                        : "w-7 bg-navy"
                      : navy
                        ? "w-1.5 bg-white/35 hover:bg-white/60"
                        : "w-1.5 bg-navy/25 hover:bg-navy/50"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
                aria-label="Diapositive précédente"
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  navy
                    ? "border-white/25 text-white hover:bg-white/10"
                    : "border-line-strong bg-surface text-ink hover:border-accent hover:text-accent-dark"
                }`}
              >
                <IconChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIndex((current) => (current + 1) % slides.length)}
                aria-label="Diapositive suivante"
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  navy
                    ? "border-white/25 text-white hover:bg-white/10"
                    : "border-line-strong bg-surface text-ink hover:border-accent hover:text-accent-dark"
                }`}
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
