"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconPencil, IconPlus, IconSpinner, IconTrash } from "@/components/icons";
import { Alert, Badge, Button } from "@/components/ui/primitives";
import { formatShortDate } from "@/lib/format";
import { formatTND } from "@/lib/money";
import { validateDiscount } from "@/lib/discount-admin";
import type { DiscountCode } from "@/lib/types";
import { useToast } from "@/store/toast";

const TYPE_LABEL: Record<DiscountCode["type"], string> = {
  percent: "Pourcentage",
  fixed: "Montant fixe",
  free_shipping: "Livraison offerte",
};

interface FormState {
  code: string;
  description: string;
  type: DiscountCode["type"];
  value: string;
  minOrder: string;
  expiresAt: string;
  maxUses: string;
  active: boolean;
}

const EMPTY: FormState = {
  code: "",
  description: "",
  type: "percent",
  value: "10",
  minOrder: "0",
  expiresAt: "",
  maxUses: "",
  active: true,
};

function toDateInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function statusOf(discount: DiscountCode): { label: string; tone: "stock" | "out" | "low" } {
  if (!discount.active) return { label: "Inactif", tone: "out" };
  if (discount.expiresAt && new Date(discount.expiresAt).getTime() < Date.now()) {
    return { label: "Expiré", tone: "low" };
  }
  if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
    return { label: "Épuisé", tone: "low" };
  }
  return { label: "Actif", tone: "stock" };
}

export function DiscountManager({ initial }: { initial: DiscountCode[] }) {
  const router = useRouter();
  const { push } = useToast();

  const [discounts, setDiscounts] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  };

  function openNew() {
    setEditingId(null);
    setForm(EMPTY);
    setErrors({});
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(discount: DiscountCode) {
    setEditingId(discount.id);
    setForm({
      code: discount.code,
      description: discount.description,
      type: discount.type,
      value: String(discount.value),
      minOrder: String(discount.minOrder),
      expiresAt: toDateInput(discount.expiresAt),
      maxUses: discount.maxUses === null ? "" : String(discount.maxUses),
      active: discount.active,
    });
    setErrors({});
    setFormError("");
    setFormOpen(true);
  }

  function payloadOf(state: FormState) {
    return {
      code: state.code,
      description: state.description,
      type: state.type,
      value: Number(state.value.replace(",", ".")),
      minOrder: Number(state.minOrder.replace(",", ".") || 0),
      expiresAt: state.expiresAt ? new Date(`${state.expiresAt}T23:59:59`).toISOString() : null,
      maxUses: state.maxUses.trim() === "" ? null : Number(state.maxUses),
      active: state.active,
    };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const payload = payloadOf(form);
    const local = validateDiscount(payload);
    if (Object.keys(local.errors).length > 0 || !local.value) {
      setErrors(local.errors);
      setFormError("Corrigez les champs signalés.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch(
        editingId ? `/api/discounts/${editingId}` : "/api/discounts",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; fields?: Record<string, string>; discount?: DiscountCode }
        | null;
      if (!response.ok) {
        if (body?.fields) setErrors(body.fields);
        throw new Error(body?.error ?? "Enregistrement impossible.");
      }

      if (editingId) {
        setDiscounts((current) =>
          current.map((entry) => (entry.id === editingId && body?.discount ? body.discount : entry)),
        );
        push({ tone: "success", title: "Code promo mis à jour" });
      } else if (body?.discount) {
        setDiscounts((current) => [...current, body.discount!]);
        push({ tone: "success", title: `Code ${body.discount.code} créé` });
      }
      setFormOpen(false);
      setEditingId(null);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setPending(false);
    }
  }

  async function toggleActive(discount: DiscountCode) {
    setBusyId(discount.id);
    try {
      const response = await fetch(`/api/discounts/${discount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...discount, active: !discount.active }),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string; discount?: DiscountCode }
        | null;
      if (!response.ok || !body?.discount) throw new Error(body?.error ?? "Modification impossible.");
      setDiscounts((current) =>
        current.map((entry) => (entry.id === discount.id ? body.discount! : entry)),
      );
      router.refresh();
      push({
        tone: "success",
        title: `Code ${discount.code} ${body.discount.active ? "activé" : "désactivé"}`,
      });
    } catch (error) {
      push({
        tone: "error",
        title: "Modification impossible",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(discount: DiscountCode) {
    const confirmed = window.confirm(
      `Supprimer le code ${discount.code} ?\n\nLes commandes passées avec ce code gardent leur remise.`,
    );
    if (!confirmed) return;
    setBusyId(discount.id);
    try {
      const response = await fetch(`/api/discounts/${discount.id}`, { method: "DELETE" });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error ?? "Suppression impossible.");
      setDiscounts((current) => current.filter((entry) => entry.id !== discount.id));
      router.refresh();
      push({ tone: "success", title: `Code ${discount.code} supprimé` });
    } catch (error) {
      push({
        tone: "error",
        title: "Suppression impossible",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] text-ink-soft">
          {discounts.length} code{discounts.length > 1 ? "s" : ""} — les codes actifs sont proposés
          dans le panier.
        </p>
        <Button type="button" variant="dark" size="md" onClick={openNew} disabled={formOpen}>
          <IconPlus size={15} />
          Nouveau code
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={submit} noValidate className="rounded-panel border border-line bg-surface p-4">
          <h2 className="text-[14px] font-bold text-ink">
            {editingId ? "Modifier le code" : "Créer un code promo"}
          </h2>
          {formError && (
            <div className="mt-3">
              <Alert tone="error">{formError}</Alert>
            </div>
          )}

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="field-label" htmlFor="d-code">
                Code *
              </label>
              <input
                id="d-code"
                value={form.code}
                onChange={(event) => update("code", event.target.value.toUpperCase())}
                className="field-input font-mono uppercase"
                placeholder="BIENVENUE10"
                aria-invalid={Boolean(errors.code)}
              />
              {errors.code && (
                <p className="field-error" role="alert">
                  {errors.code}
                </p>
              )}
            </div>
            <div className="lg:col-span-2">
              <label className="field-label" htmlFor="d-description">
                Description *
              </label>
              <input
                id="d-description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                className="field-input"
                placeholder="10 % sur la première commande"
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description && (
                <p className="field-error" role="alert">
                  {errors.description}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="d-type">
                Type d&apos;offre
              </label>
              <select
                id="d-type"
                value={form.type}
                onChange={(event) => update("type", event.target.value as DiscountCode["type"])}
                className="field-input"
              >
                {(Object.keys(TYPE_LABEL) as DiscountCode["type"][]).map((type) => (
                  <option key={type} value={type}>
                    {TYPE_LABEL[type]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="d-value">
                Valeur {form.type === "percent" ? "(%)" : form.type === "fixed" ? "(DT)" : ""}
              </label>
              <input
                id="d-value"
                type="number"
                step="0.001"
                value={form.value}
                onChange={(event) => update("value", event.target.value)}
                className="field-input"
                disabled={form.type === "free_shipping"}
                aria-invalid={Boolean(errors.value)}
              />
              {errors.value && (
                <p className="field-error" role="alert">
                  {errors.value}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="d-minOrder">
                Panier minimum (DT)
              </label>
              <input
                id="d-minOrder"
                type="number"
                step="0.001"
                value={form.minOrder}
                onChange={(event) => update("minOrder", event.target.value)}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="d-expiresAt">
                Fin de validité
              </label>
              <input
                id="d-expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(event) => update("expiresAt", event.target.value)}
                className="field-input"
              />
              {errors.expiresAt && (
                <p className="field-error" role="alert">
                  {errors.expiresAt}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="d-maxUses">
                Utilisations maximum
              </label>
              <input
                id="d-maxUses"
                type="number"
                value={form.maxUses}
                onChange={(event) => update("maxUses", event.target.value)}
                placeholder="Illimité"
                className="field-input"
                aria-invalid={Boolean(errors.maxUses)}
              />
              {errors.maxUses && (
                <p className="field-error" role="alert">
                  {errors.maxUses}
                </p>
              )}
            </div>
            <label className="flex items-end gap-2 pb-2 text-[12.5px] text-ink-soft">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => update("active", event.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              Code actif
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <Button type="submit" variant="primary" size="md" disabled={pending}>
              {pending ? <IconSpinner size={15} /> : null}
              {editingId ? "Enregistrer" : "Créer le code"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                setFormOpen(false);
                setEditingId(null);
              }}
              disabled={pending}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-panel border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                {["Code", "Offre", "Conditions", "Utilisations", "Statut", "Actions"].map((label, index) => (
                  <th
                    key={label}
                    scope="col"
                    className={`whitespace-nowrap px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted ${
                      index === 5 ? "text-right" : ""
                    }`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[12.5px] text-ink-muted">
                    Aucun code promo.
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => {
                  const status = statusOf(discount);
                  return (
                    <tr key={discount.id} className="hover:bg-[#fafbfa]">
                      <td className="px-4 py-2.5">
                        <p className="font-mono text-[12px] font-bold text-ink">{discount.code}</p>
                        <p className="text-[10.5px] text-ink-muted">{discount.description}</p>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-ink-soft">
                        {discount.type === "percent"
                          ? `−${discount.value} %`
                          : discount.type === "fixed"
                            ? `−${formatTND(discount.value)}`
                            : "Livraison offerte"}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-ink-soft">
                        <span className="block">
                          Min. {discount.minOrder > 0 ? formatTND(discount.minOrder) : "aucun"}
                        </span>
                        <span className="block text-ink-muted">
                          {discount.expiresAt
                            ? `Jusqu'au ${formatShortDate(discount.expiresAt)}`
                            : "Sans date de fin"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-ink-soft">
                        {discount.usedCount}
                        {discount.maxUses !== null ? ` / ${discount.maxUses}` : ""}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(discount)}
                            disabled={busyId === discount.id}
                          >
                            {busyId === discount.id ? (
                              <IconSpinner size={12} />
                            ) : null}
                            {discount.active ? "Désactiver" : "Activer"}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => openEdit(discount)}
                            disabled={busyId === discount.id}
                          >
                            <IconPencil size={12} />
                            Modifier
                          </Button>
                          <button
                            type="button"
                            onClick={() => remove(discount)}
                            disabled={busyId === discount.id}
                            aria-label={`Supprimer le code ${discount.code}`}
                            className="flex h-8 w-8 items-center justify-center rounded-field text-ink-muted hover:bg-promo-soft hover:text-promo"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
