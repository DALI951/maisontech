import Link from "next/link";
import {
  IconArrowRight,
  IconBox,
  IconCart,
  IconHeart,
  IconPin,
  IconTruck,
} from "@/components/icons";
import { Badge, ButtonLink, EmptyState } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";
import { formatDate, formatShortDate, ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/format";
import { formatTND } from "@/lib/money";

export default async function AccountOverviewPage() {
  const user = await requireUser();
  const orders = await listOrdersForUser(user.id);

  const active = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled",
  );
  const spent = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  const recent = orders.slice(0, 3);

  const stats = [
    { label: "Commandes", value: String(orders.length), icon: <IconBox size={16} /> },
    { label: "En cours", value: String(active.length), icon: <IconTruck size={16} /> },
    { label: "Adresses", value: String(user.addresses.length), icon: <IconPin size={16} /> },
    { label: "Total dépensé (démo)", value: formatTND(spent), icon: <IconCart size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Espace client</p>
        <h1 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[28px]">
          Bonjour {user.fullName.split(" ")[0]}
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          Membre depuis le {formatDate(user.createdAt)}. Toutes les données de ce compte sont
          fictives et stockées localement.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label} className="rounded-card border border-line bg-surface p-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
              {stat.icon}
            </span>
            <p className="mt-2.5 text-[17px] font-extrabold leading-none tracking-tight text-ink">
              {stat.value}
            </p>
            <p className="mt-1 text-[11.5px] text-ink-muted">{stat.label}</p>
          </li>
        ))}
      </ul>

      <section className="rounded-panel border border-line bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-bold text-ink">Dernières commandes</h2>
          {orders.length > 0 && (
            <Link
              href="/compte/commandes"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent-dark hover:underline"
            >
              Tout voir
              <IconArrowRight size={13} />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Aucune commande pour l'instant"
              description="Vos commandes de démonstration apparaîtront ici avec leur statut et leur récapitulatif."
              icon={<IconBox size={22} />}
              action={
                <ButtonLink href="/produits" variant="dark" size="md">
                  Parcourir le catalogue
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/compte/commandes/${order.reference}`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-3 transition-colors hover:bg-[#fafbfa]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-ink">{order.reference}</p>
                    <p className="text-[11.5px] text-ink-muted">
                      {formatShortDate(order.createdAt)} · {order.items.length} article
                      {order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
                  <span className="w-[90px] text-right text-[13px] font-bold text-ink">
                    {formatTND(order.total)}
                  </span>
                  <IconArrowRight size={14} className="text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/compte/adresses"
          className="group rounded-panel border border-line bg-surface p-4 transition-colors hover:border-accent"
        >
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
            <IconPin size={16} className="text-accent-dark" />
            Gérer mes adresses
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
            {user.addresses.length === 0
              ? "Aucune adresse enregistrée : ajoutez-en une pour gagner du temps à la commande."
              : `${user.addresses.length} adresse${user.addresses.length > 1 ? "s" : ""} enregistrée${user.addresses.length > 1 ? "s" : ""}.`}
          </p>
        </Link>
        <Link
          href="/favoris"
          className="group rounded-panel border border-line bg-surface p-4 transition-colors hover:border-accent"
        >
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
            <IconHeart size={16} className="text-accent-dark" />
            Mes favoris
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
            Retrouvez les appareils gardés de côté, prêts à rejoindre le panier.
          </p>
        </Link>
      </div>
    </div>
  );
}
