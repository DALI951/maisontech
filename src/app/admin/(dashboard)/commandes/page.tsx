import Link from "next/link";
import { IconSearch } from "@/components/icons";
import { AdminPageHeader, AdminPanel, AdminTable } from "@/components/admin/ui";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Badge, Pagination } from "@/components/ui/primitives";
import { readDb } from "@/lib/db";
import { formatDateTime, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { formatTND } from "@/lib/money";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Commandes" };

const PER_PAGE = 20;

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmées" },
  { value: "preparing", label: "En préparation" },
  { value: "shipped", label: "Expédiées" },
  { value: "delivered", label: "Livrées" },
  { value: "cancelled", label: "Annulées" },
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = first(params.statut);
  const query = first(params.q).trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(first(params.page), 10) || 1);

  const database = await readDb();
  const orders = database.orders
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const counts = new Map<string, number>();
  for (const order of orders) counts.set(order.status, (counts.get(order.status) ?? 0) + 1);

  const filtered = orders.filter((order) => {
    if (status && order.status !== status) return false;
    if (query) {
      const haystack = `${order.reference} ${order.customer.fullName} ${order.customer.email} ${order.customer.city}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const revenue = filtered
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  const hrefFor = (nextPage: number) => {
    const next = new URLSearchParams();
    if (status) next.set("statut", status);
    if (query) next.set("q", first(params.q));
    if (nextPage > 1) next.set("page", String(nextPage));
    const qs = next.toString();
    return qs ? `/admin/commandes?${qs}` : "/admin/commandes";
  };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Ventes"
        title="Commandes"
        description="Toutes les commandes de démonstration. Le statut se change directement dans le tableau ; annuler remet le stock en vente."
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.value ? (counts.get(filter.value) ?? 0) : orders.length;
          const active = status === filter.value;
          const href = filter.value
            ? `/admin/commandes?statut=${filter.value}${query ? `&q=${encodeURIComponent(first(params.q))}` : ""}`
            : `/admin/commandes${query ? `?q=${encodeURIComponent(first(params.q))}` : ""}`;
          return (
            <Link
              key={filter.value || "all"}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                active
                  ? "border-navy bg-navy text-white"
                  : "border-line-strong bg-surface text-ink-soft hover:border-accent hover:text-accent-dark"
              }`}
            >
              {filter.label}
              <span className={`text-[10.5px] ${active ? "text-white/70" : "text-ink-muted"}`}>{count}</span>
            </Link>
          );
        })}
      </div>

      <AdminPanel padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3">
          <form action="/admin/commandes" method="get" className="flex min-w-0 flex-1 items-center gap-2">
            {status && <input type="hidden" name="statut" value={status} />}
            <div className="relative min-w-0 flex-1 sm:max-w-sm">
              <IconSearch
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              />
              <input
                type="search"
                name="q"
                defaultValue={first(params.q)}
                placeholder="Référence, client, e-mail, ville…"
                className="field-input h-10 pl-9"
                aria-label="Rechercher une commande"
              />
            </div>
            <button
              type="submit"
              className="h-10 rounded-field border border-line-strong px-3 text-[12.5px] font-semibold text-ink-soft hover:border-accent hover:text-accent-dark"
            >
              Rechercher
            </button>
          </form>
          <p className="text-[11.5px] text-ink-muted">
            {filtered.length} commande{filtered.length > 1 ? "s" : ""} · CA{" "}
            <strong className="font-semibold text-ink">{formatTND(revenue)}</strong>
          </p>
        </div>

        <AdminTable
          head={["Référence", "Client", "Date", "Paiement", "Statut", "Total"]}
          empty={slice.length === 0}
        >
          {slice.map((order) => (
            <tr key={order.id} className="hover:bg-[#fafbfa]">
              <td className="px-4 py-2.5">
                <Link
                  href={`/admin/commandes/${order.id}`}
                  className="text-[12px] font-semibold text-ink hover:text-accent-dark"
                >
                  {order.reference}
                </Link>
                <span className="block text-[10.5px] text-ink-muted">
                  {order.items.length} article{order.items.length > 1 ? "s" : ""}
                </span>
              </td>
              <td className="px-4 py-2.5 text-[12px] text-ink-soft">
                <span className="line-clamp-1 text-ink">{order.customer.fullName}</span>
                <span className="block text-[10.5px] text-ink-muted">
                  {order.customer.city}, {order.customer.governorate}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-[11.5px] text-ink-muted">
                {formatDateTime(order.createdAt)}
              </td>
              <td className="px-4 py-2.5 text-[11.5px] text-ink-soft">
                {PAYMENT_METHOD_LABEL[order.paymentMethod]}
                {order.simulated && <Badge tone="neutral" className="ml-1">Démo</Badge>}
              </td>
              <td className="px-4 py-2.5">
                <OrderStatusSelect
                  orderId={order.id}
                  status={order.status}
                  reference={order.reference}
                  compact
                />
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-right text-[12px] font-semibold text-ink">
                {formatTND(order.total)}
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminPanel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11.5px] text-ink-muted">
          Page {safePage} / {pageCount} · {PER_PAGE} commandes par page
        </p>
        <Pagination page={safePage} pageCount={pageCount} hrefFor={hrefFor} />
      </div>
    </div>
  );
}
