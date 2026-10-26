"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/icons";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/store/toast";

export function CancelOrderButton({
  orderId,
  reference,
}: {
  orderId: string;
  reference: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, setPending] = useState(false);

  async function cancel() {
    const confirmed = window.confirm(
      `Annuler la commande ${reference} ?\n\nLes articles seront remis en vente. Cette action est définitive.`,
    );
    if (!confirmed) return;

    setPending(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel: true }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error ?? "Annulation impossible.");
      push({ tone: "success", title: "Commande annulée", description: "Le stock a été réintégré." });
      router.refresh();
    } catch (error) {
      push({
        tone: "error",
        title: "Annulation impossible",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="danger" size="md" onClick={cancel} disabled={pending} className="w-full">
      {pending ? <IconSpinner size={15} /> : null}
      Annuler cette commande
    </Button>
  );
}
