import Link from "next/link";
import { IconArrowRight, IconBox } from "@/components/icons";
import { Badge, ButtonLink, EmptyState } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_TONE, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { formatTND } from "@/lib/money";

export default async function AccountOrdersPage() {
  const user = await requireUser("/compte/commandes");
  const orders = await listOrdersForUser(user.id);

  return (
    <div>
      <header>
        <p className="eyebrow">Historique</p>
        <h1 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[28px]">
          Mes commandes
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          {orders.length === 0
            ? "Aucune commande enregistrée sur ce compte."
            : `${orders.length} commande${orders.length > 1 ? "s" : ""} simulée${orders.length > 1 ? "s" : ""} sur ce compte.`}
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Pas encore de commande"
            description="Passez une première commande de démonstration : elle apparaîtra ici avec son statut et son récapitulatif complet."
            icon={<IconBox size={24} />}
            action={
              <ButtonLink href="/produits" variant="dark" size="md">
                Découvrir les appareils
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-panel border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-bold text-ink">{order.reference}</p>
                    <Badge tone={ORDER_STATUS_TONE[order.status]}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                    <Badge tone="neutral">Simulée</Badge>
                  </div>
                  <p className="mt-1 text-[11.5px] text-ink-muted">
                    {formatDate(order.createdAt)} · {PAYMENT_METHOD_LABEL[order.paymentMethod]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[16px] font-extrabold tracking-tight text-navy">
                    {formatTND(order.total)}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {order.items.length} article{order.items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <p className="mt-2.5 line-clamp-1 text-[12.5px] text-ink-soft">
                {order.items.map((item) => `${item.quantity} × ${item.name}`).join(" · ")}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
                <span className="text-[11.5px] text-ink-muted">
                  Livraison : {order.customer.city}, {order.customer.governorate}
                </span>
                <Link
                  href={`/compte/commandes/${order.reference}`}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent-dark hover:underline"
                >
                  Voir le détail
                  <IconArrowRight size={13} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
