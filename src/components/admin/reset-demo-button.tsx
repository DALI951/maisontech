"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconRefresh, IconSpinner } from "@/components/icons";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/store/toast";

export function ResetDemoButton() {
  const router = useRouter();
  const { push } = useToast();
  const [pending, setPending] = useState(false);

  async function reset() {
    const confirmed = window.confirm(
      "Réinitialiser toutes les données de démonstration ?\n\nProduits, stocks, commandes, clients et codes promo seront restaurés à leur état d'origine. Les modifications faites dans l'administration seront perdues.",
    );
    if (!confirmed) return;

    setPending(true);
    try {
      const response = await fetch("/api/admin/reset", { method: "POST" });
      const body = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; products?: number; orders?: number }
        | null;
      if (!response.ok) throw new Error(body?.error ?? "Réinitialisation impossible.");
      push({
        tone: "success",
        title: "Données réinitialisées",
        description: `${body?.products ?? 0} produits et ${body?.orders ?? 0} commandes restaurés.`,
      });
      router.refresh();
    } catch (error) {
      push({
        tone: "error",
        title: "Échec de la réinitialisation",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="secondary" size="md" onClick={reset} disabled={pending}>
      {pending ? <IconSpinner size={15} /> : <IconRefresh size={15} />}
      Réinitialiser la démo
    </Button>
  );
}
