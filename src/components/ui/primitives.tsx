import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { IconStar } from "@/components/icons";
import { discountPercent, formatTND } from "@/lib/money";

/* ---------------------------------------------------------------- buttons */

type Variant = "primary" | "dark" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-accent text-white border border-accent hover:bg-accent-dark hover:border-accent-dark shadow-[0_1px_2px_rgba(12,27,42,.12)]",
  dark: "bg-navy text-white border border-navy hover:bg-navy-2 hover:border-navy-2",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-accent hover:text-accent-dark",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-accent-soft hover:text-accent-dark",
  danger: "bg-surface text-promo border border-promo/30 hover:bg-promo-soft",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-3 text-[13px] gap-1.5 rounded-field",
  md: "h-11 px-4 text-sm gap-2 rounded-field",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-field",
};

const baseClass =
  "inline-flex items-center justify-center font-semibold transition-colors duration-150 disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

/* ----------------------------------------------------------------- badges */

type BadgeTone = "promo" | "new" | "stock" | "low" | "out" | "neutral" | "accent";

const badgeTone: Record<BadgeTone, string> = {
  promo: "bg-promo text-white",
  new: "bg-navy text-white",
  stock: "bg-accent-soft text-accent-dark border border-accent-line",
  low: "bg-[#fdf3e6] text-[#96501a] border border-[#f0dcc2]",
  out: "bg-[#f2f3f3] text-ink-soft border border-line",
  neutral: "bg-[#f2f4f3] text-ink-soft border border-line",
  accent: "bg-navy text-white",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide ${badgeTone[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ price */

export function PriceTag({
  price,
  originalPrice,
  size = "md",
  showDiscount = false,
}: {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
}) {
  const percent = discountPercent(price, originalPrice);
  const sizeMap = {
    sm: "text-[15px]",
    md: "text-[17px]",
    lg: "text-[28px]",
  } as const;

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`font-bold tracking-tight text-ink ${sizeMap[size]}`}>
        {formatTND(price)}
      </span>
      {percent > 0 && (
        <>
          <span className="text-[13px] text-ink-muted line-through">{formatTND(originalPrice!)}</span>
          {showDiscount && (
            <span className="rounded-full bg-promo-soft px-2 py-0.5 text-[11px] font-bold text-promo">
              -{percent} %
            </span>
          )}
        </>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- rating */

export function Rating({
  value,
  count,
  size = 14,
  showValue = true,
  label,
}: {
  value: number;
  count?: number;
  size?: number;
  showValue?: boolean;
  label?: string;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-1.5" aria-label={`Note ${value.toFixed(1)} sur 5`}>
      <span className="flex items-center gap-0.5 text-[#c98a1b]">
        {[1, 2, 3, 4, 5].map((star) => (
          <IconStar key={star} size={size} filled={star <= rounded} />
        ))}
      </span>
      {showValue && <span className="text-[12.5px] font-semibold text-ink">{value.toFixed(1)}</span>}
      {typeof count === "number" && (
        <span className="text-[12px] text-ink-muted">
          ({count} {count === 1 ? "avis" : "avis"}
          {label ? ` ${label}` : ""})
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ breadcrumbs */

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-[12.5px] text-ink-soft">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-line-strong">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-accent-dark hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------ section head */

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end ${
        align === "center" ? "sm:justify-between" : "sm:justify-between"
      }`}
    >
      <div className={align === "center" ? "mx-auto text-center sm:mx-0 sm:text-left" : ""}>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-[26px] font-bold leading-tight text-ink sm:text-[30px]">{title}</h2>
        {description && (
          <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-ink-soft">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ----------------------------------------------------------------- states */

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-panel border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning" | "success" | "error";
  title?: string;
  children: ReactNode;
}) {
  const tones = {
    info: "border-accent-line bg-accent-soft/60 text-[#0b5560]",
    warning: "border-[#f0dcc2] bg-[#fdf6ec] text-[#8a4d15]",
    success: "border-[#c6e3d5] bg-[#edf7f2] text-[#14614a]",
    error: "border-[#f0cfc7] bg-[#fdf1ee] text-[#8f2f18]",
  } as const;
  return (
    <div className={`rounded-field border px-4 py-3 text-[13.5px] leading-relaxed ${tones[tone]}`} role="status">
      {title && <p className="mb-1 font-semibold">{title}</p>}
      {children}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-field ${className}`} aria-hidden="true" />;
}

/* ------------------------------------------------------------- pagination */

export function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;
  const pages: (number | "gap")[] = [];
  for (let index = 1; index <= pageCount; index += 1) {
    if (index === 1 || index === pageCount || Math.abs(index - page) <= 1) pages.push(index);
    else if (pages[pages.length - 1] !== "gap") pages.push("gap");
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 pt-2">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-field border border-line-strong bg-surface text-sm font-semibold hover:border-accent hover:text-accent-dark"
          aria-label="Page précédente"
        >
          ‹
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-field border border-line text-sm text-ink-muted opacity-50">
          ‹
        </span>
      )}

      {pages.map((entry, index) =>
        entry === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-ink-muted">
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={hrefFor(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={`flex h-10 min-w-10 items-center justify-center rounded-field border px-2 text-sm font-semibold ${
              entry === page
                ? "border-navy bg-navy text-white"
                : "border-line-strong bg-surface hover:border-accent hover:text-accent-dark"
            }`}
          >
            {entry}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link
          href={hrefFor(page + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-field border border-line-strong bg-surface text-sm font-semibold hover:border-accent hover:text-accent-dark"
          aria-label="Page suivante"
        >
          ›
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-field border border-line text-sm text-ink-muted opacity-50">
          ›
        </span>
      )}
    </nav>
  );
}

/* -------------------------------------------------------------- energy tag */

export function EnergyBadge({ energyClass }: { energyClass: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
      <span className="flex h-5 min-w-8 items-center justify-center rounded-[4px] bg-[#1c6b4b] px-1.5 text-[10.5px] font-bold text-white">
        {energyClass}
      </span>
      Classe énergétique
    </span>
  );
}
