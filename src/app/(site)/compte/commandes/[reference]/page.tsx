import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconHeadset,
  IconMail,
  IconPhone,
  IconPin,
  IconTruck,
  IconWallet,
} from "@/components/icons";
import { ProductVisual } from "@/components/product/product-visual";
import { Alert, Badge, ButtonLink } from "@/components/ui/primitives";
import { CancelOrderButton } from "@/components/account/cancel-order-button";
import { requireUser } from "@/lib/auth";
import { getStoreData } from "@/lib/catalog";
import { formatDate, formatDateTime, ORDER_STATUS_LABEL, ORDER_STATUS_STEPS, ORDER_STATUS_TONE, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { formatTND } from "@/lib/money";
import { getOrderByReference } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Détail de la commande",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ reference: string }> };

export default async function AccountOrderDetailPage({ params }: PageProps) {
  const { reference } = await params;
  const user = await requireUser(`/compte/commandes/${reference.toUpperCase()}`);

  const order = await getOrderByReference(reference);
  // Someone else's order must look exactly like a missing one.
  if (!order || order.userId !== user.id) notFound();

  const { products, settings } = await getStoreData();
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const cancelled = order.status === "cancelled";
  const currentStep = ORDER_STATUS_STEPS.indexOf(order.status);

  return (
    <div>
      <header>
        <Link
          href="/compte/commandes"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-soft hover:text-accent-dark"
        >
          ← Toutes mes commandes
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[28px]">
            {order.reference}
          </h1>
          <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
          {order.simulated && <Badge tone="neutral">Commande simulée</Badge>}
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          Passée le {formatDate(order.createdAt)} · dernière mise à jour le{" "}
          {formatDateTime(order.updatedAt)}
        </p>
      </header>

      {order.simulated && (
        <div className="mt-4">
          <Alert tone="warning">
            Commande de démonstration : aucun paiement n&apos;a été prélevé, aucun e-mail n&apos;a été
            envoyé et aucun colis ne sera expédié. Les statuts sont gérés depuis l&apos;administration.
          </Alert>
        </div>
      )}

      {cancelled ? (
        <div className="mt-4">
          <Alert tone="error" title="Commande annulée">
            Cette commande a été annulée le {formatDate(order.updatedAt)}. Si un article vous
            intéresse toujours, il est de nouveau disponible au catalogue.
          </Alert>
        </div>
      ) : (
        <section className="mt-4 rounded-panel border border-line bg-surface p-4" aria-label="Suivi de la commande">
          <h2 className="text-[13px] font-bold text-ink">Suivi de la commande</h2>
          <ol className="mt-3 grid gap-2 sm:grid-cols-5">
            {ORDER_STATUS_STEPS.map((step, index) => {
              const done = index <= currentStep;
              const isCurrent = index === currentStep;
              return (
                <li
                  key={step}
                  className={`rounded-tile border p-2.5 ${
                    isCurrent
                      ? "border-accent-line bg-accent-soft"
                      : done
                        ? "border-[#c6e3d5] bg-[#f2f8f4]"
                        : "border-line bg-[#fafbfa]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                      done ? "bg-[#14614a] text-white" : "border border-line-strong text-ink-muted"
                    }`}
                  >
                    {done ? <IconCheck size={13} /> : index + 1}
                  </span>
                  <p
                    className={`mt-1.5 text-[12px] font-semibold ${
                      done ? "text-ink" : "text-ink-muted"
                    }`}
                  >
                    {ORDER_STATUS_LABEL[step]}
                  </p>
                  {isCurrent && <p className="text-[10.5px] text-accent-dark">Statut actuel</p>}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
        <div className="min-w-0 space-y-4">
          <section className="rounded-panel border border-line bg-surface">
            <h2 className="border-b border-line px-4 py-3 text-[13px] font-bold text-ink">
              Articles ({order.items.length})
            </h2>
            <ul className="divide-y divide-line">
              {order.items.map((item) => {
                const product = bySlug.get(item.slug);
                return (
                  <li key={item.productId} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-tile border border-line bg-[#f4f6f5]">
                      {product ? (
                        <ProductVisual product={product} className="h-full w-full p-1" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/produit/${item.slug}`}
                        className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-ink hover:text-accent-dark"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        {formatTND(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-ink">{formatTND(item.lineTotal)}</p>
                      {product && (
                        <Link
                          href={`/produit/${item.slug}`}
                          className="text-[11px] font-semibold text-accent-dark hover:underline"
                        >
                          Voir le produit
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-panel border border-line bg-surface p-4">
              <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink">
                <IconTruck size={14} className="text-accent-dark" />
                Adresse de livraison
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                {order.customer.fullName}
                <br />
                {order.customer.address}
                <br />
                {order.customer.city}, {order.customer.governorate}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-soft">
                <IconPhone size={13} /> {order.customer.phone}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 break-all text-[12px] text-ink-soft">
                <IconMail size={13} /> {order.customer.email}
              </p>
            </section>

            <section className="rounded-panel border border-line bg-surface p-4">
              <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink">
                <IconWallet size={14} className="text-accent-dark" />
                Paiement et livraison
              </p>
              <dl className="mt-2 space-y-1.5 text-[12px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-soft">Mode de paiement</dt>
                  <dd className="font-semibold text-ink">
                    {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-soft">Frais de port</dt>
                  <dd className="font-semibold text-ink">
                    {order.shipping > 0 ? formatTND(order.shipping) : "Offerts"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-soft">Délai estimé</dt>
                  <dd className="font-semibold text-ink">{settings.shipping.estimatedDays}</dd>
                </div>
              </dl>
              {order.customer.notes && (
                <div className="mt-2.5 border-t border-line pt-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    Note du client
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                    {order.customer.notes}
                  </p>
                </div>
              )}
            </section>
          </div>

          {!cancelled && order.status === "pending" && (
            <div className="flex items-start gap-2 rounded-field border border-[#f0dcc2] bg-[#fdf6ec] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#8a4d15]">
              <IconAlert size={14} className="mt-0.5 shrink-0" />
              <p>
                Votre commande est en attente. Nous vous appelons au {order.customer.phone} pour la
                confirmer. Un changement d&apos;avis ? Contactez le service client avec la référence{" "}
                <strong className="font-semibold">{order.reference}</strong>.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-3.5">
          <section className="rounded-panel border border-line bg-[#fafbfa] p-4">
            <h2 className="text-[13px] font-bold text-ink">Récapitulatif</h2>
            <dl className="mt-2.5 space-y-1.5 text-[12.5px]">
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
              <div className="flex justify-between gap-2 border-t border-line pt-1.5">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="text-[16px] font-extrabold text-navy">{formatTND(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-panel border border-line bg-surface p-4">
            <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
              <IconHeadset size={14} className="text-accent-dark" />
              Besoin d&apos;aide ?
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{settings.supportHours}</p>
            <a
              href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}
              className="mt-2 block text-[13px] font-bold text-accent-dark hover:underline"
            >
              {settings.supportPhone}
            </a>
            <Link
              href="/contact"
              className="mt-1 block text-[12px] font-semibold text-ink-soft hover:text-accent-dark"
            >
              Formulaire de contact →
            </Link>
            <Link
              href="/livraison"
              className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-ink-soft hover:text-accent-dark"
            >
              <IconPin size={12} /> Conditions de livraison
            </Link>
          </section>

          <ButtonLink href="/produits" variant="dark" size="md" className="w-full">
            Continuer mes achats
            <IconArrowRight size={15} />
          </ButtonLink>

          {(order.status === "pending" || order.status === "confirmed") && (
            <CancelOrderButton orderId={order.id} reference={order.reference} />
          )}
        </aside>
      </div>
    </div>
  );
}
