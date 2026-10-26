"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconPencil, IconPin, IconPlus, IconSpinner, IconTrash } from "@/components/icons";
import { Alert, Badge, Button, EmptyState } from "@/components/ui/primitives";
import { GOVERNORATES } from "@/config/site";
import type { Address } from "@/lib/types";
import { validateAddress, type FieldErrors } from "@/lib/validation";
import { useToast } from "@/store/toast";

const MAX_ADDRESSES = 8;

const EMPTY_FORM = {
  label: "Domicile",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  governorate: "",
  isDefault: false,
};

type FormState = typeof EMPTY_FORM;

interface AddressResponse {
  ok?: boolean;
  address?: Address;
  addresses?: Address[];
  error?: string;
  fields?: FieldErrors;
}

export function AddressBook({ initial }: { initial: Address[] }) {
  const router = useRouter();
  const { push } = useToast();

  const [addresses, setAddresses] = useState<Address[]>(initial);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const full = addresses.length >= MAX_ADDRESSES;

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, isDefault: addresses.length === 0 });
    setErrors({});
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      governorate: address.governorate,
      isDefault: address.isDefault,
    });
    setErrors({});
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setErrors({});
    setFormError("");
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const validation = validateAddress(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setFormError("Vérifiez les champs signalés avant d'enregistrer.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const response = await fetch("/api/account/addresses", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...form }),
        });
        const body = (await response.json().catch(() => null)) as AddressResponse | null;
        if (!response.ok) {
          if (body?.fields) setErrors(body.fields);
          throw new Error(body?.error ?? "Enregistrement impossible.");
        }
        await reload();
        push({ tone: "success", title: "Adresse mise à jour" });
      } else {
        const response = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const body = (await response.json().catch(() => null)) as AddressResponse | null;
        if (!response.ok) {
          if (body?.fields) setErrors(body.fields);
          throw new Error(body?.error ?? "Ajout impossible.");
        }
        await reload();
        push({ tone: "success", title: "Adresse ajoutée" });
      }
      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  const reload = useCallback(async () => {
    const response = await fetch("/api/account/addresses", { cache: "no-store" }).catch(() => null);
    if (response?.ok) {
      const body = (await response.json().catch(() => null)) as AddressResponse | null;
      if (body?.addresses) setAddresses(body.addresses);
    }
    // Keep the server components (dashboard counters, checkout prefill) in sync.
    router.refresh();
  }, [router]);

  async function makeDefault(address: Address) {
    if (address.isDefault) return;
    setBusyId(address.id);
    try {
      const response = await fetch("/api/account/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: address.id, makeDefault: true }),
      });
      const body = (await response.json().catch(() => null)) as AddressResponse | null;
      if (!response.ok) throw new Error(body?.error ?? "Mise à jour impossible.");
      setAddresses(
        (current) =>
          body?.addresses ?? current.map((entry) => ({ ...entry, isDefault: entry.id === address.id })),
      );
      router.refresh();
      push({ tone: "success", title: "Adresse par défaut mise à jour" });
    } catch (error) {
      push({
        tone: "error",
        title: "Impossible de mettre à jour",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(address: Address) {
    const confirmed = window.confirm(`Supprimer l'adresse « ${address.label} » ?`);
    if (!confirmed) return;
    setBusyId(address.id);
    try {
      const response = await fetch(`/api/account/addresses?id=${encodeURIComponent(address.id)}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => null)) as AddressResponse | null;
      if (!response.ok) throw new Error(body?.error ?? "Suppression impossible.");
      setAddresses(body?.addresses ?? addresses.filter((entry) => entry.id !== address.id));
      if (editingId === address.id) closeForm();
      router.refresh();
      push({ tone: "success", title: "Adresse supprimée" });
    } catch (error) {
      push({
        tone: "error",
        title: "Impossible de supprimer",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusyId(null);
    }
  }

  const counter = useMemo(
    () => `${addresses.length} / ${MAX_ADDRESSES} adresses enregistrées`,
    [addresses.length],
  );

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Carnet d&apos;adresses</p>
          <h1 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-[-0.025em] text-navy sm:text-[28px]">
            Mes adresses
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            {counter}. L&apos;adresse par défaut est proposée automatiquement au moment de la
            commande.
          </p>
        </div>
        <Button
          type="button"
          variant="dark"
          size="md"
          onClick={openNew}
          disabled={full || formOpen}
          title={full ? "Limite de 8 adresses atteinte" : undefined}
        >
          <IconPlus size={15} />
          Nouvelle adresse
        </Button>
      </header>

      {formOpen && (
        <form
          onSubmit={submit}
          noValidate
          className="mt-5 rounded-panel border border-line bg-surface p-5"
        >
          <h2 className="text-[15px] font-bold text-ink">
            {editingId ? "Modifier l'adresse" : "Ajouter une adresse"}
          </h2>
          {formError && (
            <div className="mt-3">
              <Alert tone="error">{formError}</Alert>
            </div>
          )}

          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="label">
                Libellé
              </label>
              <input
                id="label"
                value={form.label}
                onChange={(event) => update("label", event.target.value)}
                className="field-input"
                placeholder="Domicile, Bureau, Maison des parents…"
                maxLength={40}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="fullName">
                Nom et prénom *
              </label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={(event) => update("fullName", event.target.value)}
                className="field-input"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
              />
              {errors.fullName && (
                <p className="field-error" id="fullName-error" role="alert">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="field-label" htmlFor="phone">
                Téléphone *
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                className="field-input"
                autoComplete="tel"
                placeholder="22 123 456"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <p className="field-error" id="phone-error" role="alert">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="address">
                Adresse (rue, numéro, immeuble, étage) *
              </label>
              <input
                id="address"
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
                className="field-input"
                autoComplete="street-address"
                placeholder="12 rue de Marseille, immeuble B, 3e étage"
                aria-invalid={Boolean(errors.address)}
                aria-describedby={errors.address ? "address-error" : undefined}
              />
              {errors.address && (
                <p className="field-error" id="address-error" role="alert">
                  {errors.address}
                </p>
              )}
            </div>

            <div>
              <label className="field-label" htmlFor="city">
                Ville *
              </label>
              <input
                id="city"
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                className="field-input"
                autoComplete="address-level2"
                placeholder="Ben Arous"
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? "city-error" : undefined}
              />
              {errors.city && (
                <p className="field-error" id="city-error" role="alert">
                  {errors.city}
                </p>
              )}
            </div>

            <div>
              <label className="field-label" htmlFor="governorate">
                Gouvernorat *
              </label>
              <select
                id="governorate"
                value={form.governorate}
                onChange={(event) => update("governorate", event.target.value)}
                className="field-input"
                aria-invalid={Boolean(errors.governorate)}
                aria-describedby={errors.governorate ? "governorate-error" : undefined}
              >
                <option value="">Choisir…</option>
                {GOVERNORATES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {errors.governorate && (
                <p className="field-error" id="governorate-error" role="alert">
                  {errors.governorate}
                </p>
              )}
            </div>
          </div>

          <label className="mt-4 flex items-start gap-2.5 text-[12.5px] text-ink-soft">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => update("isDefault", event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-accent"
            />
            <span>Utiliser cette adresse par défaut pour mes prochaines commandes.</span>
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? <IconSpinner size={15} /> : null}
              {editingId ? "Enregistrer les modifications" : "Enregistrer l'adresse"}
            </Button>
            <Button type="button" variant="secondary" size="md" onClick={closeForm} disabled={saving}>
              Annuler
            </Button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Aucune adresse enregistrée"
            description="Ajoutez une adresse pour accélérer vos prochaines commandes : elle sera proposée automatiquement au moment du paiement."
            icon={<IconPin size={24} />}
            action={
              <Button type="button" variant="dark" size="md" onClick={openNew}>
                <IconPlus size={15} />
                Ajouter ma première adresse
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <li
              key={address.id}
              className={`rounded-panel border bg-surface p-4 ${
                address.isDefault ? "border-accent-line" : "border-line"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-bold text-ink">
                    {address.label}
                    {address.isDefault && <Badge tone="stock">Par défaut</Badge>}
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                    {address.fullName}
                    <br />
                    {address.address}
                    <br />
                    {address.city}, {address.governorate}
                  </p>
                  <p className="mt-1.5 text-[12px] text-ink-muted">{address.phone}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                {!address.isDefault && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => makeDefault(address)}
                    disabled={busyId === address.id}
                  >
                    {busyId === address.id ? <IconSpinner size={13} /> : null}
                    Par défaut
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(address)}
                  disabled={busyId === address.id}
                >
                  <IconPencil size={13} />
                  Modifier
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => remove(address)}
                  disabled={busyId === address.id}
                  className="ml-auto"
                >
                  <IconTrash size={13} />
                  Supprimer
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-[11.5px] leading-relaxed text-ink-muted">
        Ces adresses sont fictives et servent uniquement à la démonstration. Aucune donnée n&apos;est
        transmise à un transporteur.
      </p>
    </div>
  );
}
