"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconPencil, IconPlus, IconSpinner, IconTrash } from "@/components/icons";
import { Alert, Badge, Button } from "@/components/ui/primitives";
import { validateCategory } from "@/lib/category-admin";
import type { Category } from "@/lib/types";
import { useToast } from "@/store/toast";

interface FormState {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  sortOrder: string;
  featured: boolean;
}

const EMPTY: FormState = {
  name: "",
  shortName: "",
  tagline: "",
  description: "",
  sortOrder: "99",
  featured: false,
};

export function CategoryManager({
  initial,
  counts,
}: {
  initial: Category[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const { push } = useToast();

  const [categories, setCategories] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const ordered = useMemo(
    () => categories.slice().sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fr")),
    [categories],
  );

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
    setForm({ ...EMPTY, sortOrder: String((ordered[ordered.length - 1]?.sortOrder ?? 0) + 10) });
    setErrors({});
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      shortName: category.shortName,
      tagline: category.tagline,
      description: category.description,
      sortOrder: String(category.sortOrder),
      featured: category.featured,
    });
    setErrors({});
    setFormError("");
    setFormOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const payload = { ...form, sortOrder: Number(form.sortOrder) };
    const local = validateCategory(payload);
    if (!local.value) {
      setErrors(local.errors);
      setFormError("Corrigez les champs signalés.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch(editingId ? `/api/categories/${editingId}` : "/api/categories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string; fields?: Record<string, string>; category?: Category }
        | null;
      if (!response.ok) {
        if (body?.fields) setErrors(body.fields);
        throw new Error(body?.error ?? "Enregistrement impossible.");
      }

      if (editingId && body?.category) {
        setCategories((current) =>
          current.map((entry) => (entry.id === editingId ? body.category! : entry)),
        );
        push({ tone: "success", title: "Catégorie mise à jour" });
      } else if (body?.category) {
        setCategories((current) => [...current, body.category!]);
        push({ tone: "success", title: `Catégorie « ${body.category.shortName} » créée` });
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

  async function patchFull(category: Category, changes: Partial<Category>, successTitle: string) {
    setBusyId(category.id);
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...category, ...changes }),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string; category?: Category }
        | null;
      if (!response.ok || !body?.category) throw new Error(body?.error ?? "Modification impossible.");
      setCategories((current) =>
        current.map((entry) => (entry.id === category.id ? body.category! : entry)),
      );
      push({ tone: "success", title: successTitle });
      router.refresh();
      return body.category;
    } catch (error) {
      push({
        tone: "error",
        title: "Modification impossible",
        description: error instanceof Error ? error.message : undefined,
      });
      return null;
    } finally {
      setBusyId(null);
    }
  }

  async function move(category: Category, direction: -1 | 1) {
    const index = ordered.findIndex((entry) => entry.id === category.id);
    const neighbour = ordered[index + direction];
    if (!neighbour) return;

    // Swap the two sort orders so the storefront order changes predictably.
    const firstOrder = category.sortOrder;
    const secondOrder = neighbour.sortOrder;
    setBusyId(category.id);
    try {
      const responses = await Promise.all([
        fetch(`/api/categories/${category.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...category, sortOrder: secondOrder }),
        }),
        fetch(`/api/categories/${neighbour.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...neighbour, sortOrder: firstOrder }),
        }),
      ]);
      if (responses.some((response) => !response.ok)) throw new Error("Réorganisation impossible.");
      setCategories((current) =>
        current.map((entry) =>
          entry.id === category.id
            ? { ...entry, sortOrder: secondOrder }
            : entry.id === neighbour.id
              ? { ...entry, sortOrder: firstOrder }
              : entry,
        ),
      );
      router.refresh();
    } catch (error) {
      push({
        tone: "error",
        title: "Réorganisation impossible",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(category: Category) {
    const count = counts[category.slug] ?? 0;
    const confirmed = window.confirm(
      count > 0
        ? `« ${category.shortName} » contient ${count} produit(s) : la suppression sera refusée tant qu'ils existent.\n\nContinuer ?`
        : `Supprimer la catégorie « ${category.shortName} » ?`,
    );
    if (!confirmed) return;

    setBusyId(category.id);
    try {
      const response = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error ?? "Suppression impossible.");
      setCategories((current) => current.filter((entry) => entry.id !== category.id));
      router.refresh();
      push({ tone: "success", title: "Catégorie supprimée" });
    } catch (error) {
      push({
        tone: "error",
        title: "Suppression refusée",
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
          {categories.length} catégories — l&apos;ordre définit le menu de la boutique.
        </p>
        <Button type="button" variant="dark" size="md" onClick={openNew} disabled={formOpen}>
          <IconPlus size={15} />
          Nouvelle catégorie
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={submit} noValidate className="rounded-panel border border-line bg-surface p-4">
          <h2 className="text-[14px] font-bold text-ink">
            {editingId ? "Modifier la catégorie" : "Créer une catégorie"}
          </h2>
          {formError && (
            <div className="mt-3">
              <Alert tone="error">{formError}</Alert>
            </div>
          )}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="c-name">
                Nom *
              </label>
              <input
                id="c-name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                className="field-input"
                placeholder="Robot pâtissier"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && (
                <p className="field-error" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="c-shortName">
                Nom court (menu)
              </label>
              <input
                id="c-shortName"
                value={form.shortName}
                onChange={(event) => update("shortName", event.target.value)}
                className="field-input"
                placeholder="Robots"
                aria-invalid={Boolean(errors.shortName)}
              />
              {errors.shortName && (
                <p className="field-error" role="alert">
                  {errors.shortName}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="c-tagline">
                Accroche *
              </label>
              <input
                id="c-tagline"
                value={form.tagline}
                onChange={(event) => update("tagline", event.target.value)}
                className="field-input"
                placeholder="Pâtisser comme un chef, sans effort"
                aria-invalid={Boolean(errors.tagline)}
              />
              {errors.tagline && (
                <p className="field-error" role="alert">
                  {errors.tagline}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="c-description">
                Description *
              </label>
              <textarea
                id="c-description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                rows={3}
                className="field-input"
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description && (
                <p className="field-error" role="alert">
                  {errors.description}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="c-sortOrder">
                Ordre d&apos;affichage
              </label>
              <input
                id="c-sortOrder"
                type="number"
                value={form.sortOrder}
                onChange={(event) => update("sortOrder", event.target.value)}
                className="field-input"
                aria-invalid={Boolean(errors.sortOrder)}
              />
              {errors.sortOrder && (
                <p className="field-error" role="alert">
                  {errors.sortOrder}
                </p>
              )}
            </div>
            <label className="flex items-end gap-2 pb-2 text-[12.5px] text-ink-soft">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update("featured", event.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              Mettre en avant sur l&apos;accueil
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <Button type="submit" variant="primary" size="md" disabled={pending}>
              {pending ? <IconSpinner size={15} /> : null}
              {editingId ? "Enregistrer" : "Créer la catégorie"}
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
                {["Ordre", "Catégorie", "Produits", "Accueil", "Actions"].map((label, index) => (
                  <th
                    key={label}
                    scope="col"
                    className={`whitespace-nowrap px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted ${
                      index === 4 ? "text-right" : ""
                    }`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ordered.map((category, index) => (
                <tr key={category.id} className="hover:bg-[#fafbfa]">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <span className="w-7 text-[11px] tabular-nums text-ink-muted">
                        {category.sortOrder}
                      </span>
                      <button
                        type="button"
                        onClick={() => move(category, -1)}
                        disabled={index === 0 || busyId === category.id}
                        aria-label={`Monter ${category.shortName}`}
                        className="flex h-7 w-6 items-center justify-center rounded text-ink-muted hover:bg-[#f2f4f3] hover:text-ink disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(category, 1)}
                        disabled={index === ordered.length - 1 || busyId === category.id}
                        aria-label={`Descendre ${category.shortName}`}
                        className="flex h-7 w-6 items-center justify-center rounded text-ink-muted hover:bg-[#f2f4f3] hover:text-ink disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-[12.5px] font-semibold text-ink">{category.name}</p>
                    <p className="text-[10.5px] text-ink-muted">
                      /{category.slug} · {category.tagline}
                    </p>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/admin/produits?categorie=${category.slug}`}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink hover:text-accent-dark"
                    >
                      {counts[category.slug] ?? 0}
                      <IconArrowRight size={11} />
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        patchFull(
                          category,
                          { featured: !category.featured },
                          category.featured ? "Retirée de l'accueil" : "Mise en avant activée",
                        )
                      }
                      disabled={busyId === category.id}
                      aria-pressed={category.featured}
                      className={`rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide transition-colors ${
                        category.featured
                          ? "border-navy bg-navy text-white"
                          : "border-line-strong text-ink-muted hover:border-accent hover:text-accent-dark"
                      }`}
                    >
                      {category.featured ? "En avant" : "Standard"}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => openEdit(category)}
                        disabled={busyId === category.id}
                      >
                        <IconPencil size={12} />
                        Modifier
                      </Button>
                      <button
                        type="button"
                        onClick={() => remove(category)}
                        disabled={busyId === category.id}
                        aria-label={`Supprimer ${category.shortName}`}
                        className="flex h-8 w-8 items-center justify-center rounded-field text-ink-muted hover:bg-promo-soft hover:text-promo"
                      >
                        {busyId === category.id ? <IconSpinner size={13} /> : <IconTrash size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-ink-muted">
        Le slug d&apos;une catégorie (dans l&apos;URL) est figé à la création pour ne pas casser les
        liens existants. Une catégorie vide n&apos;apparaît pas dans les rails de la page d&apos;accueil.
      </p>
    </div>
  );
}
