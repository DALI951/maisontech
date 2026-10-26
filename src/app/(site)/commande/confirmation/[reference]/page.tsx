import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconArrowRight,
  IconCheck,
  IconInfo,
  IconMail,
  IconPhone,
  IconTruck,
} from "@/components/icons";
import { ProductVisual } from "@/components/product/product-visual";
import { Badge, ButtonLink, Breadcrumbs } from "@/components/ui/primitives";
import { getOrderByReference } from "@/lib/orders";
import { getStoreData } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { PAYMENT_METHOD_LABEL } from "@/lib/format";
import { formatTND } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commande confirmée",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ reference: string }> };

export default async function ConfirmationPage({ params }: PageProps) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);
  if (!order) notFound();

  const { products, settings } = await getStoreData();
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const steps = [
    { label: "Commande enregistrée", done: true },
    { label: "Confirmation téléphonique", done: false },
    { label: "Préparation", done: false },
    { label: "Expédition", done: false },
    { label: "Livraison", done: false },
  ];

  return (
    <div className="container-page py-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Commande", href: "/commande" },
          { label: "Confirmation" },
        ]}
      />

      <div className="mt-5 overflow-hidden rounded-panel border border-line bg-surface">
        <div className="border-b border-line bg-[#f2f8f4] px-5 py-7 sm:px-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#14614a] text-white">
            <IconCheck size={24} />
          </span>
          <h1 className="mt-4 text-[25px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[30px]">
            Merci {order.customer.fullName.split(" ")[0]}, votre commande est enregistrée
          </h1>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
            Référence <strong className="font-semibold text-ink">{order.reference}</strong> ·{" "}
            {formatDate(order.createdAt)}. Conservez cette référence : elle permet de suivre la
            commande auprès du service client.
          </p>
          <div className="mt-3 inline-flex items-start gap-2 rounded-field border border-[#f0dcc2] bg-[#fdf6ec] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#8a4d15]">
            <IconInfo size={14} className="mt-0.5 shrink-0" />
            <p>
              Commande de démonstration : aucun paiement n'a été prélevé, aucun e-mail n'a été envoyé
              et aucun colis ne sera expédié.
            </p>
          </div>
        </div>

        <div className="grid gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <h2 className="text-[14px] font-bold text-ink">Suivi</h2>
            <ol className="mt-3 space-y-3">
              {steps.map((step, index) => (
                <li key={step.label} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      step.done
                        ? "bg-[#14614a] text-white"
                        : "border border-line-strong bg-surface text-ink-muted"
                    }`}
                  >
                    {step.done ? <IconCheck size={13} /> : index + 1}
                  </span>
                  <div>
                    <p className={`text-[13px] font-semibold ${step.done ? "text-ink" : "text-ink-muted"}`}>
                      {step.label}
                    </p>
                    {index === 0 && (
                      <p className="text-[11.5px] text-ink-muted">
                        {formatDate(order.createdAt)} · statut actuel
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <h2 className="mt-6 text-[14px] font-bold text-ink">Articles commandés</h2>
            <ul className="mt-3 divide-y divide-line rounded-tile border border-line">
              {order.items.map((item) => {
                const product = bySlug.get(item.slug);
                return (
                  <li key={item.productId} className="flex items-center gap-3 px-3.5 py-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-tile border border-line bg-[#f4f6f5]">
                      {product ? (
                        <ProductVisual product={product} className="h-full w-full p-1" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/produit/${item.slug}`}
                        className="line-clamp-1 text-[12.5px] font-semibold text-ink hover:text-accent-dark"
                      >
                        {item.name}
                      </Link>
                      <p className="text-[11px] text-ink-muted">
                        Quantité {item.quantity} · {formatTND(item.unitPrice)} / unité
                      </p>
                    </div>
                    <span className="text-[12.5px] font-semibold text-ink">
                      {formatTND(item.lineTotal)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-tile border border-line p-3.5">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                  <IconTruck size={14} className="text-accent-dark" />
                  Adresse de livraison
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                  {order.customer.fullName}
                  <br />
                  {order.customer.address}
                  <br />
                  {order.customer.city}, {order.customer.governorate}
                </p>
              </div>
              <div className="rounded-tile border border-line p-3.5">
                <p className="text-[12px] font-semibold text-ink">Contact</p>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-soft">
                  <IconPhone size={13} /> {order.customer.phone}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 break-all text-[12px] text-ink-soft">
                  <IconMail size={13} /> {order.customer.email}
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-3.5">
            <div className="rounded-panel border border-line bg-[#fafbfa] p-4">
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
                  <dd className="text-[15px] font-extrabold text-navy">{formatTND(order.total)}</dd>
                </div>
              </dl>
              <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5">
                <span className="text-[11.5px] text-ink-soft">Paiement</span>
                <Badge tone="neutral">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</Badge>
              </div>
              {order.simulated && (
                <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
                  Statut « simulé » : aucun encaissement, aucune facture fiscale.
                </p>
              )}
            </div>

            <div className="rounded-panel border border-line bg-surface p-4">
              <p className="text-[12.5px] font-semibold text-ink">Une question sur cette commande ?</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                {settings.supportHours}
              </p>
              <a
                href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}
                className="mt-2 block text-[13px] font-bold text-accent-dark hover:underline"
              >
                {settings.supportPhone}
              </a>
              <Link href="/contact" className="mt-1 block text-[12px] font-semibold text-ink-soft hover:text-accent-dark">
                Formulaire de contact →
              </Link>
            </div>

            <ButtonLink href="/produits" variant="dark" size="md" className="w-full">
              Continuer mes achats
              <IconArrowRight size={15} />
            </ButtonLink>
            <Link
              href="/compte/commandes"
              className="block text-center text-[12px] font-semibold text-ink-soft hover:text-accent-dark"
            >
              Retrouver mes commandes
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
