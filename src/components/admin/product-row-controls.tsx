"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconSpinner, IconTrash } from "@/components/icons";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/store/toast";

interface RowProduct {
  id: string;
  name: string;
  stock: number;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
}

export function ProductRowControls({ product }: { product: RowProduct }) {
  const router = useRouter();
  const { push } = useToast();
  const [stock, setStock] = useState(String(product.stock));
  const [savingStock, setSavingStock] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [flags, setFlags] = useState({
    featured: product.featured,
    bestseller: product.bestseller,
    isNew: product.isNew,
  });
  const dirty = stock !== String(product.stock);

  async function patch(body: Record<string, unknown>, successTitle: string) {
    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) throw new Error(payload?.error ?? "Mise à jour impossible.");
    push({ tone: "success", title: successTitle });
    router.refresh();
  }

  async function saveStock() {
    const value = Number(stock);
    if (!Number.isInteger(value) || value < 0 || value > 9999) {
      push({ tone: "error", title: "Stock invalide", description: "Entier entre 0 et 9 999." });
      return;
    }
    setSavingStock(true);
    try {
      await patch({ stock: value }, "Stock mis à jour");
    } catch (error) {
      setStock(String(product.stock));
      push({
        tone: "error",
        title: "Stock non enregistré",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSavingStock(false);
    }
  }

  async function toggleFlag(key: keyof typeof flags) {
    const next = !flags[key];
    setFlags((current) => ({ ...current, [key]: next }));
    try {
      await patch({ [key]: next }, next ? "Badge activé" : "Badge retiré");
    } catch (error) {
      setFlags((current) => ({ ...current, [key]: !next }));
      push({
        tone: "error",
        title: "Modification refusée",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  async function remove() {
    const confirmed = window.confirm(
      `Supprimer définitivement « ${product.name} » du catalogue ?\n\nLes commandes existantes gardent leur historique.`,
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Suppression impossible.");
      push({ tone: "success", title: "Produit supprimé" });
      router.refresh();
    } catch (error) {
      push({
        tone: "error",
        title: "Suppression impossible",
        description: error instanceof Error ? error.message : undefined,
      });
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={9999}
          value={stock}
          onChange={(event) => setStock(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && dirty) {
              event.preventDefault();
              void saveStock();
            }
          }}
          aria-label={`Stock de ${product.name}`}
          className={`h-8 w-16 rounded-field border px-2 text-center text-[12px] font-semibold tabular-nums ${
            dirty ? "border-accent text-ink" : "border-line-strong text-ink-soft"
          }`}
        />
        {dirty ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={saveStock}
            disabled={savingStock}
            className="h-8 px-2"
            aria-label="Enregistrer le stock"
          >
            {savingStock ? <IconSpinner size={12} /> : <IconCheck size={12} />}
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        {(["featured", "bestseller", "isNew"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleFlag(key)}
            aria-pressed={flags[key]}
            title={
              key === "featured" ? "Mise en avant" : key === "bestseller" ? "Meilleure vente" : "Nouveauté"
            }
            className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
              flags[key]
                ? "border-navy bg-navy text-white"
                : "border-line-strong text-ink-muted hover:border-accent hover:text-accent-dark"
            }`}
          >
            {key === "featured" ? "Ved." : key === "bestseller" ? "Best" : "New"}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={remove}
        disabled={deleting}
        aria-label={`Supprimer ${product.name}`}
        className="flex h-8 w-8 items-center justify-center rounded-field text-ink-muted transition-colors hover:bg-promo-soft hover:text-promo "
      >
        {deleting ? <IconSpinner size={13} /> : <IconTrash size={14} />}
      </button>
    </div>
  );
}
