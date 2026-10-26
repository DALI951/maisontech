import Link from "next/link";
import { IconPin, IconSearch } from "@/components/icons";
import { AdminPageHeader, AdminPanel, AdminTable } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { readDb } from "@/lib/db";
import { formatShortDate } from "@/lib/format";
import { formatTND } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = { title: "Clients" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = first(params.q).trim().toLowerCase();

  const database = await readDb();

  const rows = database.users
    .map((user) => {
      const orders = database.orders.filter((order) => order.userId === user.id);
      const valid = orders.filter((order) => order.status !== "cancelled");
      const spent = valid.reduce((sum, order) => sum + order.total, 0);
      const last = orders
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
      return { user, orderCount: orders.length, spent, last };
    })
    .filter((row) => {
      if (!query) return true;
      return `${row.user.fullName} ${row.user.email}`.toLowerCase().includes(query);
    })
    .sort((a, b) => b.spent - a.spent);

  const totalCustomers = database.users.filter((user) => user.role === "customer").length;
  const guestOrders = database.orders.filter((order) => !order.userId).length;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Relation client"
        title="Clients"
        description={`${totalCustomers} comptes clients et ${guestOrders} commande(s) passée(s) en invité. Les comptes de démonstration sont créés au premier lancement.`}
      />

      <AdminPanel padded={false}>
        <form action="/admin/clients" method="get" className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <IconSearch
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              name="q"
              defaultValue={first(params.q)}
              placeholder="Nom ou e-mail…"
              className="field-input h-10 pl-9"
              aria-label="Rechercher un client"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-field border border-line-strong px-3 text-[12.5px] font-semibold text-ink-soft hover:border-accent hover:text-accent-dark"
          >
            Rechercher
          </button>
        </form>

        <AdminTable
          head={["Client", "Rôle", "Commandes", "Total dépensé", "Dernière commande", "Adresses"]}
          empty={rows.length === 0}
        >
          {rows.map(({ user, orderCount, spent, last }) => (
            <tr key={user.id} className="hover:bg-[#fafbfa]">
              <td className="px-4 py-2.5">
                <p className="text-[12.5px] font-semibold text-ink">{user.fullName}</p>
                <p className="text-[10.5px] text-ink-muted">{user.email}</p>
              </td>
              <td className="px-4 py-2.5">
                <Badge tone={user.role === "admin" ? "new" : "neutral"}>
                  {user.role === "admin" ? "Admin" : "Client"}
                </Badge>
              </td>
              <td className="px-4 py-2.5 text-[12px] font-semibold text-ink">
                {orderCount}
                <span className="ml-1 text-[10.5px] font-normal text-ink-muted">
                  depuis {formatShortDate(user.createdAt)}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-[12px] font-semibold text-ink">
                {formatTND(spent)}
              </td>
              <td className="px-4 py-2.5 text-[11.5px] text-ink-muted">
                {last ? (
                  <Link
                    href={`/admin/commandes/${last.id}`}
                    className="font-semibold text-ink hover:text-accent-dark"
                  >
                    {last.reference}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-1 text-[11.5px] text-ink-soft">
                  <IconPin size={12} />
                  {user.addresses.length}
                  {user.addresses.some((address) => address.isDefault) && (
                    <span className="text-[10.5px] text-ink-muted">
                      · {user.addresses.find((address) => address.isDefault)?.city}
                    </span>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminPanel>

      <p className="text-[11px] leading-relaxed text-ink-muted">
        Les données clients sont fictives (noms, e-mails et villes générés). Aucun mot de passe
        n&apos;est lisible ici : seuls des hachages scrypt sont stockés.
      </p>
    </div>
  );
}
