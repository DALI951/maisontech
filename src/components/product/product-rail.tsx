"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

/**
 * Horizontal product rail with arrow controls.
 * Native scroll-snap keeps it usable on touch and with the keyboard.
 */
export function ProductRail({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    function update() {
      if (!element) return;
      setAtStart(element.scrollLeft <= 4);
      setAtEnd(element.scrollLeft + element.clientWidth >= element.scrollWidth - 4);
    }
    update();
    element.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      element.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function scroll(direction: 1 | -1) {
    const element = ref.current;
    if (!element) return;
    element.scrollBy({ left: direction * Math.min(720, element.clientWidth * 0.85), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1"
      >
        {children}
      </div>

      <div className="pointer-events-none absolute -top-12 right-0 hidden gap-1.5 lg:flex">
        <button
          type="button"
          onClick={() => scroll(-1)}
          disabled={atStart}
          aria-label="Faire défiler vers la gauche"
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-surface text-ink transition-colors hover:border-accent hover:text-accent-dark disabled:opacity-35"
        >
          <IconChevronLeft size={17} />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          disabled={atEnd}
          aria-label="Faire défiler vers la droite"
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-surface text-ink transition-colors hover:border-accent hover:text-accent-dark disabled:opacity-35"
        >
          <IconChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}
