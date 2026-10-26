"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/icons";
import { Alert, Button } from "@/components/ui/primitives";
import type { StoreSettings } from "@/lib/types";
import { useToast } from "@/store/toast";

interface FormState {
  announcements: string;
  supportPhone: string;
  supportEmail: string;
  supportHours: string;
  storeAddress: string;
  flatRate: string;
  freeShippingThreshold: string;
  expressRate: string;
  estimatedDays: string;
  returnsDays: string;
  cashOnDelivery: boolean;
  bankTransfer: boolean;
  onlinePayment: boolean;
  demoBanner: boolean;
  newsletterHeading: string;
  newsletterDescription: string;
  newsletterNote: string;
}

function toState(settings: StoreSettings): FormState {
  return {
    announcements: settings.announcements.join("\n"),
    supportPhone: settings.supportPhone,
    supportEmail: settings.supportEmail,
    supportHours: settings.supportHours,
    storeAddress: settings.storeAddress,
    flatRate: String(settings.shipping.flatRate),
    freeShippingThreshold: String(settings.shipping.freeShippingThreshold),
    expressRate: String(settings.shipping.expressRate),
    estimatedDays: settings.shipping.estimatedDays,
    returnsDays: String(settings.shipping.returnsDays),
    cashOnDelivery: settings.payments.cashOnDelivery,
    bankTransfer: settings.payments.bankTransfer,
    onlinePayment: settings.payments.onlinePayment,
    demoBanner: settings.demoBanner,
    newsletterHeading: settings.newsletter.heading,
    newsletterDescription: settings.newsletter.description,
    newsletterNote: settings.newsletter.note,
  };
}

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const { push } = useToast();

  const [form, setForm] = useState<FormState>(() => toState(settings));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors({});
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const payload = {
      announcements: form.announcements
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      supportPhone: form.supportPhone,
      supportEmail: form.supportEmail,
      supportHours: form.supportHours,
      storeAddress: form.storeAddress,
      shipping: {
        flatRate: Number(form.flatRate),
        freeShippingThreshold: Number(form.freeShippingThreshold),
        expressRate: Number(form.expressRate),
        estimatedDays: form.estimatedDays,
        returnsDays: Number(form.returnsDays),
      },
      payments: {
        cashOnDelivery: form.cashOnDelivery,
        bankTransfer: form.bankTransfer,
        onlinePayment: form.onlinePayment,
      },
      demoBanner: form.demoBanner,
      newsletter: {
        heading: form.newsletterHeading,
        description: form.newsletterDescription,
        note: form.newsletterNote,
      },
    };

    if (payload.announcements.length === 0) {
      setErrors({ announcements: "Ajoutez au moins une annonce." });
      setFormError("Le bandeau d'annonces ne peut pas être vide.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string; fields?: Record<string, string> }
        | null;
      if (!response.ok) {
        if (body?.fields) setErrors(body.fields);
        throw new Error(body?.error ?? "Enregistrement impossible.");
      }
      push({
        tone: "success",
        title: "Paramètres enregistrés",
        description: "Les changements sont visibles immédiatement sur la boutique.",
      });
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setPending(false);
    }
  }

  const error = (key: string) =>
    errors[key] ? (
      <p className="field-error" role="alert">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {formError && (
        <Alert tone="error" title="Paramètres non enregistrés">
          {formError}
        </Alert>
      )}

      <section className="rounded-panel border border-line bg-surface p-4">
        <h2 className="text-[14px] font-bold text-ink">Boutique et support</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="s-announcements">
              Bandeau d&apos;annonces <span className="font-normal text-ink-muted">(une par ligne, 5 max)</span>
            </label>
            <textarea
              id="s-announcements"
              value={form.announcements}
              onChange={(event) => update("announcements", event.target.value)}
              rows={3}
              className="field-input"
              aria-invalid={Boolean(errors.announcements)}
            />
            {error("announcements")}
          </div>
          <div>
            <label className="field-label" htmlFor="s-supportPhone">
              Téléphone du service client
            </label>
            <input
              id="s-supportPhone"
              value={form.supportPhone}
              onChange={(event) => update("supportPhone", event.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="s-supportEmail">
              E-mail du service client
            </label>
            <input
              id="s-supportEmail"
              type="email"
              value={form.supportEmail}
              onChange={(event) => update("supportEmail", event.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="s-supportHours">
              Horaires
            </label>
            <input
              id="s-supportHours"
              value={form.supportHours}
              onChange={(event) => update("supportHours", event.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="s-storeAddress">
              Adresse du magasin
            </label>
            <input
              id="s-storeAddress"
              value={form.storeAddress}
              onChange={(event) => update("storeAddress", event.target.value)}
              className="field-input"
            />
          </div>
        </div>
      </section>

      <section className="rounded-panel border border-line bg-surface p-4">
        <h2 className="text-[14px] font-bold text-ink">Livraison</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="field-label" htmlFor="s-flatRate">
              Frais standard (DT)
            </label>
            <input
              id="s-flatRate"
              type="number"
              step="0.001"
              value={form.flatRate}
              onChange={(event) => update("flatRate", event.target.value)}
              className="field-input"
            />
            {error("shipping.flatRate")}
          </div>
          <div>
            <label className="field-label" htmlFor="s-freeShipping">
              Livraison offerte dès (DT)
            </label>
            <input
              id="s-freeShipping"
              type="number"
              step="0.001"
              value={form.freeShippingThreshold}
              onChange={(event) => update("freeShippingThreshold", event.target.value)}
              className="field-input"
            />
            {error("shipping.freeShippingThreshold")}
          </div>
          <div>
            <label className="field-label" htmlFor="s-expressRate">
              Frais express (DT)
            </label>
            <input
              id="s-expressRate"
              type="number"
              step="0.001"
              value={form.expressRate}
              onChange={(event) => update("expressRate", event.target.value)}
              className="field-input"
            />
            {error("shipping.expressRate")}
          </div>
          <div>
            <label className="field-label" htmlFor="s-returnsDays">
              Délai de retour (jours)
            </label>
            <input
              id="s-returnsDays"
              type="number"
              value={form.returnsDays}
              onChange={(event) => update("returnsDays", event.target.value)}
              className="field-input"
            />
            {error("shipping.returnsDays")}
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="field-label" htmlFor="s-estimatedDays">
              Délai de livraison affiché
            </label>
            <input
              id="s-estimatedDays"
              value={form.estimatedDays}
              onChange={(event) => update("estimatedDays", event.target.value)}
              className="field-input"
              placeholder="24 à 72 h selon le gouvernorat"
            />
          </div>
        </div>
      </section>

      <section className="rounded-panel border border-line bg-surface p-4">
        <h2 className="text-[14px] font-bold text-ink">Paiement</h2>
        <div className="mt-3 space-y-2">
          {(
            [
              ["cashOnDelivery", "Paiement à la livraison"],
              ["bankTransfer", "Virement bancaire"],
              ["onlinePayment", "Paiement en ligne (non branché en démo)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-start gap-2.5 text-[12.5px] text-ink-soft">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(event) => update(key, event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-accent"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
          Tant que le bandeau de démonstration est actif, la commande avec paiement en ligne est
          refusée côté serveur, même si l&apos;option est cochée.
        </p>
        <label className="mt-3 flex items-start gap-2.5 border-t border-line pt-3 text-[12.5px] text-ink-soft">
          <input
            type="checkbox"
            checked={form.demoBanner}
            onChange={(event) => update("demoBanner", event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-accent"
          />
          <span>
            Afficher la mention « boutique de démonstration » et bloquer le paiement en ligne
          </span>
        </label>
      </section>

      <section className="rounded-panel border border-line bg-surface p-4">
        <h2 className="text-[14px] font-bold text-ink">Newsletter</h2>
        <div className="mt-3 grid gap-3">
          <div>
            <label className="field-label" htmlFor="s-newsletterHeading">
              Titre
            </label>
            <input
              id="s-newsletterHeading"
              value={form.newsletterHeading}
              onChange={(event) => update("newsletterHeading", event.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="s-newsletterDescription">
              Description
            </label>
            <textarea
              id="s-newsletterDescription"
              value={form.newsletterDescription}
              onChange={(event) => update("newsletterDescription", event.target.value)}
              rows={2}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="s-newsletterNote">
              Note légale
            </label>
            <input
              id="s-newsletterNote"
              value={form.newsletterNote}
              onChange={(event) => update("newsletterNote", event.target.value)}
              className="field-input"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="dark" size="lg" disabled={pending}>
          {pending ? <IconSpinner size={16} /> : null}
          Enregistrer les paramètres
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => {
            setForm(toState(settings));
            setErrors({});
            setFormError("");
          }}
          disabled={pending}
        >
          Rétablir les valeurs affichées
        </Button>
      </div>
    </form>
  );
}
