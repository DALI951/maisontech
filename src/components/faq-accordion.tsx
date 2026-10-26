import { IconPlus } from "@/components/icons";
import type { FaqItem } from "@/data/content";

/**
 * Native <details> accordion: keyboard accessible, works without JavaScript,
 * and prints open. The plus icon rotates 45° when the item is open.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
      {items.map((item, index) => (
        <details key={item.id} className="group" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-[14px] font-semibold text-ink transition-colors hover:bg-paper [&::-webkit-details-marker]:hidden">
            <span className="flex items-start gap-2.5">
              <span className="mt-[1px] rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-accent-dark">
                {item.category}
              </span>
              <span>{item.question}</span>
            </span>
            <span className="shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-45">
              <IconPlus size={17} />
            </span>
          </summary>
          <div className="px-4 pb-4 text-[13px] leading-relaxed text-ink-soft">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
