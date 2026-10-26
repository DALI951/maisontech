import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowRight, IconMail, IconPhone, IconPin, IconTruck, IconWallet } from "@/components/icons";
import { AdminPageHeader, AdminPanel } from "@/components/admin/ui";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { ProductVisual } from "@/components/product/product-visual";
import { Badge } from "@/components/ui/primitives";
import { readDb } from "@/lib/db";
import { formatDateTime, ORDER_STATUS_LABEL, ORDER_STATUS_STEPS, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { formatTND } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = { title: "Détail commande" };

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const database = await readDb();
  const order = database.orders.find(
    (entry) => entry.id === id || entry.reference.toUpperCase() === id.toUpperCase(),
  );
  if (!order) notFound();

  const bySlug = new Map(database.products.map((product) => [product.slug, product]));
  const customer = database.users.find((user) => user.id === order.userId);
  const currentStep = ORDER_STATUS_STEPS.indexOf(order.status);
  const cancelled = order.status === "cancelled";
  const timeline = currentStep >= 0 ? ORDER_STATUS_STEPS : ORDER_STATUS_STEPS.slice(0, 1);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Commande"
        title={order.reference}
        description={`Créée le ${formatDateTime(order.createdAt)} · dernière modification le ${formatDateTime(order.updatedAt)}`}
        actions={
          <>
            <OrderStatusSelect orderId={order.id} status={order.status} reference={order.reference} />
            <Link
              href="/admin/commandes"
              className="text-[12px] font-semibold text-ink-soft hover:text-accent-dark"
            >
              ← Toutes les commandes
            </Link>
          </>
        }
      />

      {order.simulated && (
        <p className="rounded-field border border-[#f0dcc2] bg-[#fdf6ec] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-[#8a4d15]">
          Commande de démonstration : aucun paiement encaissé, aucune facture fiscale, aucune
          expédition réelle. Changer le statut ne déclenche aucune notification.
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="min-w-0 space-y-4">
          <AdminPanel
            title={`Articles (${order.items.length})`}
            description="Prix figés au moment de la commande."
            padded={false}
          >
            <ul className="divide-y divide-line">
              {order.items.map((item) => {
                const product = bySlug.get(item.slug);
                return (
                  <li key={item.productId} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-tile border border-line bg-[#f4f6f5]">
                      {product ? <ProductVisual product={product} className="h-full w-full p-0.5" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      {product ? (
                        <Link
                          href={`/admin/produits/${product.id}`}
                          className="line-clamp-1 text-[12.5px] font-semibold text-ink hover:text-accent-dark"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <p className="line-clamp-1 text-[12.5px] font-semibold text-ink">
                          {item.name} <span className="font-normal text-ink-muted">(supprimé)</span>
                        </p>
                      )}
                      <p className="text-[11px] text-ink-muted">
                        {formatTND(item.unitPrice)} × {item.quantity}
                        {product && ` · stock restant ${product.stock}`}
                      </p>
                    </div>
                    <span className="text-[12.5px] font-semibold text-ink">{formatTND(item.lineTotal)}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="space-y-1.5 border-t border-line px-4 py-3 text-[12.5px]">
              <div className="flex justify-between gap-2">
                <dt className="text-ink-soft">Sous-total</dt>
                <dd className="font-semibold text-ink">{formatTND(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-soft">Livraison</dt>
                <dd className="font-semibold text-ink">
                  {order.shipping > 0 ? formatTND(order.shipping) : "Offerte"}
                </dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between gap-2 text-[#14614a]">
                  <dt>Remise {order.discountCode ? `(${order.discountCode})` : ""}</dt>
                  <dd className="font-semibold">−{formatTND(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-2 border-t border-line pt-2">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="text-[16px] font-extrabold text-navy">{formatTND(order.total)}</dd>
              </div>
            </dl>
          </AdminPanel>

          <AdminPanel title="Suivi">
            {cancelled ? (
              <p className="text-[12.5px] text-ink-soft">
                Commande annulée le {formatDateTime(order.updatedAt)} — le stock a été réintégré.
              </p>
            ) : (
              <ol className="grid gap-2 sm:grid-cols-5">
                {timeline.map((step, index) => {
                  const done = index <= currentStep;
                  return (
                    <li
                      key={step}
                      className={`rounded-tile border p-2.5 ${
                        index === currentStep
                          ? "border-accent-line bg-accent-soft"
                          : done
                            ? "border-[#c6e3d5] bg-[#f2f8f4]"
                            : "border-line bg-[#fafbfa]"
                      }`}
                    >
                      <p className={`text-[11.5px] font-semibold ${done ? "text-ink" : "text-ink-muted"}`}>
                        {index + 1}. {ORDER_STATUS_LABEL[step]}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
            <p className="mt-2.5 text-[11px] text-ink-muted">
              Statut actuel : <strong className="font-semibold text-ink">{ORDER_STATUS_LABEL[order.status]}</strong>
            </p>
          </AdminPanel>
        </div>

        <div className="space-y-4">
          <AdminPanel title="Client">
            <p className="text-[13px] font-semibold text-ink">{order.customer.fullName}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-soft">
              <IconPhone size={13} /> {order.customer.phone}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 break-all text-[12px] text-ink-soft">
              <IconMail size={13} /> {order.customer.email}
            </p>
            <p className="mt-0.5 flex items-start gap-1.5 text-[12px] text-ink-soft">
              <IconPin size={13} className="mt-0.5 shrink-0" />
              {order.customer.address}, {order.customer.city} ({order.customer.governorate})
            </p>
            <div className="mt-2.5 flex items-center gap-2 border-t border-line pt-2.5">
              {customer ? (
                <>
                  <Badge tone="neutral">{customer.role === "admin" ? "Admin" : "Client"}</Badge>
                  <Link
                    href={`/admin/clients?q=${encodeURIComponent(customer.email)}`}
                    className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-accent-dark hover:underline"
                  >
                    Voir la fiche
                    <IconArrowRight size={11} />
                  </Link>
                </>
              ) : (
                <Badge tone="neutral">Commande invité</Badge>
              )}
            </div>
          </AdminPanel>

          <AdminPanel title="Paiement et livraison">
            <dl className="space-y-1.5 text-[12px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-ink-soft">
                  <IconWallet size={13} /> Paiement
                </dt>
                <dd className="font-semibold text-ink">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-ink-soft">
                  <IconTruck size={13} /> Livraison
                </dt>
                <dd className="font-semibold text-ink">
                  {order.shipping > 0 ? formatTND(order.shipping) : "Offerte"}
                </dd>
              </div>
            </dl>
            {order.customer.notes && (
              <div className="mt-2.5 border-t border-line pt-2.5">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
                  Note du client
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{order.customer.notes}</p>
              </div>
            )}
          </AdminPanel>

          <AdminPanel title="Action rapide">
            <p className="text-[11.5px] leading-relaxed text-ink-soft">
              Passer la commande en « annulée » remet automatiquement chaque article en stock.
            </p>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
