import Link from "next/link";
import {
  IconAlert,
  IconArrowRight,
  IconBox,
  IconCart,
  IconChart,
  IconMail,
  IconPin,
  IconTag,
  IconUsers,
} from "@/components/icons";
import { Badge, ButtonLink } from "@/components/ui/primitives";
import { AdminPageHeader, AdminPanel, AdminTable, RevenueChart, StatCard, StatusBars } from "@/components/admin/ui";
import { ResetDemoButton } from "@/components/admin/reset-demo-button";
import { buildAdminStats } from "@/lib/admin";
import { readDb } from "@/lib/db";
import { formatDateTime, ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/format";
import { formatTND } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tableau de bord" };

export default async function AdminOverviewPage() {
  const database = await readDb();
  const stats = buildAdminStats(database);
  const last30 = stats.salesByDay.reduce((sum, day) => sum + day.revenue, 0);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Pilotage"
        title="Tableau de bord"
        description="Vue d'ensemble de la boutique de démonstration : ventes simulées, stocks, clients et codes promo."
        actions={
          <>
            <ResetDemoButton />
            <ButtonLink href="/admin/produits/nouveau" variant="dark" size="md">
              Nouveau produit
            </ButtonLink>
          </>
        }
      />

      <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <li>
          <StatCard
            label="CA 30 jours"
            value={formatTND(last30)}
            hint={`${stats.orderCount} commandes valides · panier moyen ${formatTND(stats.averageBasket)}`}
            icon={<IconChart size={14} />}
          />
        </li>
        <li>
          <StatCard
            label="Commandes à traiter"
            value={String(stats.pendingCount)}
            hint="Statut « en attente » — à confirmer par téléphone"
            icon={<IconBox size={14} />}
            href="/admin/commandes?statut=pending"
          />
        </li>
        <li>
          <StatCard
            label="CA livré"
            value={formatTND(stats.deliveredRevenue)}
            hint="Uniquement les commandes au statut « livrée »"
            icon={<IconCart size={14} />}
          />
        </li>
        <li>
          <StatCard
            label="Clients"
            value={String(stats.customerCount)}
            hint={`${stats.subscriberCount} abonné(s) newsletter`}
            icon={<IconUsers size={14} />}
            href="/admin/clients"
          />
        </li>
        <li>
          <StatCard
            label="Stocks à surveiller"
            value={`${stats.lowStockCount} / ${stats.outOfStockCount}`}
            hint="Stock faible / rupture de stock"
            icon={<IconAlert size={14} />}
            href="/admin/produits?stock=faible"
          />
        </li>
        <li>
          <StatCard
            label="Catalogue"
            value={String(stats.productCount)}
            hint={`${stats.openMessages} message(s) de contact non traité(s)`}
            icon={<IconMail size={14} />}
            href="/admin/produits"
          />
        </li>
      </ul>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <AdminPanel title="Ventes des 30 derniers jours" description="Commandes non annulées, par jour.">
          <RevenueChart data={stats.salesByDay} total={last30} />
        </AdminPanel>

        <AdminPanel title="Répartition des statuts" description={`${stats.orderCount} commandes valides.`}>
          <StatusBars counts={stats.statusCounts} total={database.orders.length} />
        </AdminPanel>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <AdminPanel
          title="Meilleures ventes"
          description="Par chiffre d'affaires simulé."
          action={
            <Link href="/admin/produits" className="text-[11.5px] font-semibold text-accent-dark hover:underline">
              Catalogue →
            </Link>
          }
        >
          {stats.topProducts.length === 0 ? (
            <p className="text-[12.5px] text-ink-muted">Aucune vente enregistrée.</p>
          ) : (
            <ol className="space-y-2.5">
              {stats.topProducts.map((product, index) => {
                const share = last30 > 0 ? Math.round((product.revenue / last30) * 100) : 0;
                return (
                  <li key={product.slug}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="min-w-0 truncate text-[12.5px] text-ink">
                        <span className="mr-1.5 text-ink-muted">{index + 1}.</span>
                        {product.name}
                      </span>
                      <span className="shrink-0 text-[12px] font-semibold text-ink">
                        {formatTND(product.revenue)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eceeed]">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(share, 2)}%` }} />
                      </div>
                      <span className="w-16 shrink-0 text-right text-[10.5px] text-ink-muted">
                        {product.units} u. · {share}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </AdminPanel>

        <AdminPanel title="Performance par catégorie" description="Unités vendues et CA simulé.">
          {stats.categoryPerformance.length === 0 ? (
            <p className="text-[12.5px] text-ink-muted">Aucune vente enregistrée.</p>
          ) : (
            <ul className="divide-y divide-line">
              {stats.categoryPerformance.map((category) => (
                <li key={category.slug} className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
                  <span className="min-w-0 truncate text-[12.5px] text-ink">{category.name}</span>
                  <span className="shrink-0 text-[11.5px] text-ink-soft">
                    {category.units} u. · <strong className="font-semibold text-ink">{formatTND(category.revenue)}</strong>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
        <AdminPanel title="Dernières commandes" padded={false}
          action={
            <Link href="/admin/commandes" className="text-[11.5px] font-semibold text-accent-dark hover:underline">
              Toutes les commandes →
            </Link>
          }
        >
          <AdminTable head={["Référence", "Client", "Date", "Statut", "Total"]}>
            {stats.recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-[#fafbfa]">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/commandes/${order.id}`}
                    className="text-[12px] font-semibold text-ink hover:text-accent-dark"
                  >
                    {order.reference}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-[12px] text-ink-soft">
                  {order.customer.fullName}
                  <span className="block text-[10.5px] text-ink-muted">{order.customer.governorate}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[11.5px] text-ink-muted">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="px-4 py-2.5">
                  <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right text-[12px] font-semibold text-ink">
                  {formatTND(order.total)}
                </td>
              </tr>
            ))}
          </AdminTable>
        </AdminPanel>

        <div className="space-y-3">
          <AdminPanel
            title="Ruptures et stocks faibles"
            action={
              <Link href="/admin/produits?stock=faible" className="text-[11.5px] font-semibold text-accent-dark hover:underline">
                Gérer →
              </Link>
            }
          >
            {stats.lowStock.length === 0 ? (
              <p className="text-[12.5px] text-ink-muted">Aucun stock critique.</p>
            ) : (
              <ul className="space-y-2">
                {stats.lowStock.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/produits/${product.id}`}
                      className="min-w-0 truncate text-[12px] text-ink hover:text-accent-dark"
                    >
                      {product.name}
                    </Link>
                    <Badge tone={product.stock <= 2 ? "promo" : "low"}>{product.stock} u.</Badge>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel
            title="Codes promo"
            action={
              <Link href="/admin/codes-promo" className="text-[11.5px] font-semibold text-accent-dark hover:underline">
                Gérer →
              </Link>
            }
          >
            <ul className="space-y-2">
              {stats.discountUsage.slice(0, 5).map((discount) => (
                <li key={discount.code} className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <IconTag size={12} className="shrink-0 text-ink-muted" />
                    <span className="truncate text-[12px] font-semibold text-ink">{discount.code}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-muted">
                    {discount.usedCount}
                    {discount.maxUses ? `/${discount.maxUses}` : ""} util.
                  </span>
                </li>
              ))}
            </ul>
          </AdminPanel>

          <AdminPanel title="Adresse & contact">
            <p className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-ink-soft">
              <IconPin size={13} className="mt-0.5 shrink-0" />
              {database.settings.storeAddress}
            </p>
            <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-ink-soft">
              <IconMail size={13} className="mt-0.5 shrink-0" />
              {database.settings.supportEmail}
            </p>
            <Link
              href="/admin/parametres"
              className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-accent-dark hover:underline"
            >
              Modifier les paramètres
              <IconArrowRight size={12} />
            </Link>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
