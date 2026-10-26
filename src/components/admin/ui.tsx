import type { ReactNode } from "react";
import { formatShortDate } from "@/lib/format";
import { formatTND } from "@/lib/money";

/* ------------------------------------------------------------ page header */

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1 text-[22px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[26px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ------------------------------------------------------------------ panel */

export function AdminPanel({
  title,
  description,
  action,
  padded = true,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  padded?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-panel border border-line bg-surface ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="text-[13.5px] font-bold text-ink">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={padded ? "p-4" : ""}>{children}</div>
    </section>
  );
}

/* --------------------------------------------------------------- stat card */

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
        {icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-[21px] font-extrabold leading-none tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">{hint}</p>}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-card border border-line bg-surface p-3.5 transition-colors hover:border-accent-line"
      >
        {body}
      </a>
    );
  }
  return <div className="rounded-card border border-line bg-surface p-3.5">{body}</div>;
}

/* ------------------------------------------------------------------ charts */

export function RevenueChart({
  data,
  total,
}: {
  data: { date: string; revenue: number; orders: number }[];
  total: number;
}) {
  const max = Math.max(...data.map((entry) => entry.revenue), 1);
  const peak = data.reduce((best, entry) => (entry.revenue > best.revenue ? entry : best), data[0]);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[19px] font-extrabold leading-none tracking-tight text-ink">
            {formatTND(total)}
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">Chiffre d&apos;affaires sur 30 jours</p>
        </div>
        <p className="text-[11px] text-ink-muted">
          Pic : {formatTND(peak?.revenue ?? 0)} le {formatShortDate(peak?.date ?? new Date())}
        </p>
      </div>

      <div
        className="mt-3 flex h-[132px] items-end gap-[3px]"
        role="img"
        aria-label={`Histogramme du chiffre d'affaires des 30 derniers jours, total ${formatTND(total)}`}
      >
        {data.map((entry) => {
          const height = entry.revenue === 0 ? 2 : Math.max(4, Math.round((entry.revenue / max) * 100));
          return (
            <div key={entry.date} className="group relative flex h-full flex-1 items-end">
              <div
                className={`w-full rounded-t-[2px] transition-colors ${
                  entry.revenue === 0 ? "bg-[#e7eae9]" : "bg-accent/70 group-hover:bg-accent"
                }`}
                style={{ height: `${height}%` }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded border border-line bg-surface px-1.5 py-1 text-[10px] font-semibold text-ink shadow-lift group-hover:block">
                {formatShortDate(entry.date)} · {formatTND(entry.revenue)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 flex justify-between text-[10.5px] text-ink-muted">
        <span>{formatShortDate(data[0]?.date ?? new Date())}</span>
        <span>{formatShortDate(data[data.length - 1]?.date ?? new Date())}</span>
      </div>
    </div>
  );
}

export function StatusBars({
  counts,
  total,
}: {
  counts: { status: string; label: string; count: number }[];
  total: number;
}) {
  return (
    <ul className="space-y-2">
      {counts.map((entry) => {
        const percent = total > 0 ? Math.round((entry.count / total) * 100) : 0;
        return (
          <li key={entry.status}>
            <div className="flex items-baseline justify-between gap-2 text-[12px]">
              <span className="text-ink-soft">{entry.label}</span>
              <span className="font-semibold text-ink">
                {entry.count}
                <span className="ml-1 text-[10.5px] font-normal text-ink-muted">{percent}%</span>
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#eceeed]">
              <div
                className="h-full rounded-full bg-navy"
                style={{ width: `${Math.max(percent, entry.count > 0 ? 3 : 0)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ tables */

export function AdminTable({
  head,
  children,
  empty,
}: {
  head: string[];
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {head.map((label, index) => (
              <th
                key={label}
                scope="col"
                className={`whitespace-nowrap px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted ${
                  index === head.length - 1 ? "text-right" : ""
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {empty ? (
            <tr>
              <td colSpan={head.length} className="px-4 py-10 text-center text-[12.5px] text-ink-muted">
                Aucun résultat.
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
