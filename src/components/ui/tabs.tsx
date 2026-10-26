"use client";

import { useId, useRef, useState, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  /** Optional small counter, e.g. the number of reviews. */
  hint?: string;
  content: ReactNode;
}

/**
 * Accessible tab set used by the product page.
 * Keyboard: ← → Home End move between tabs, Tab moves into the panel.
 */
export function Tabs({ items, className = "" }: { items: TabItem[]; className?: string }) {
  const baseId = useId();
  const [active, setActive] = useState(items[0]?.id ?? "");
  const listRef = useRef<HTMLDivElement>(null);

  function focusTab(index: number) {
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    buttons?.[index]?.focus();
    buttons?.[index]?.click();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!items.length) return;
    const current = items.findIndex((item) => item.id === active);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab((current + 1) % items.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab((current - 1 + items.length) % items.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(items.length - 1);
    }
  }

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        aria-label="Informations sur le produit"
        onKeyDown={onKeyDown}
        className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line"
      >
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              className={`relative shrink-0 px-3.5 py-3 text-[13.5px] font-semibold transition-colors sm:px-4 ${
                selected ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {item.label}
              {item.hint && (
                <span className="ml-1.5 rounded-full bg-[#f0f2f1] px-1.5 py-0.5 text-[11px] font-semibold text-ink-soft">
                  {item.hint}
                </span>
              )}
              <span
                aria-hidden="true"
                className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-opacity ${
                  selected ? "bg-accent opacity-100" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
          className="pt-5 focus-visible:outline-offset-4"
        >
          {item.id === active ? item.content : null}
        </div>
      ))}
    </div>
  );
}
