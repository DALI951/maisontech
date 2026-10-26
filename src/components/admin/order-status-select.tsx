"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/icons";
import { ORDER_STATUS_LABEL, ORDER_STATUS_STEPS } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { useToast } from "@/store/toast";

const OPTIONS: OrderStatus[] = [...ORDER_STATUS_STEPS, "cancelled"];

export function OrderStatusSelect({
  orderId,
  status,
  reference,
  compact = false,
}: {
  orderId: string;
  status: OrderStatus;
  reference: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [value, setValue] = useState<OrderStatus>(status);
  const [pending, setPending] = useState(false);

  async function change(next: OrderStatus) {
    if (next === value) return;
    if (next === "cancelled") {
      const confirmed = window.confirm(
        `Annuler la commande ${reference} ?\n\nLe stock des articles sera remis en vente.`,
      );
      if (!confirmed) return;
    }

    const previous = value;
    setValue(next);
    setPending(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error ?? "Changement de statut impossible.");
      push({
        tone: "success",
        title: `${reference} → ${ORDER_STATUS_LABEL[next]}`,
        description: next === "cancelled" ? "Stock réintégré au catalogue." : undefined,
      });
      router.refresh();
    } catch (error) {
      setValue(previous);
      push({
        tone: "error",
        title: "Statut non modifié",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="relative inline-flex items-center gap-1.5">
      <select
        value={value}
        onChange={(event) => change(event.target.value as OrderStatus)}
        disabled={pending}
        aria-label={`Statut de la commande ${reference}`}
        className={`rounded-field border border-line-strong bg-surface font-semibold text-ink transition-colors hover:border-accent focus:border-accent ${
          compact ? "h-8 pl-2 pr-6 text-[11.5px]" : "h-10 pl-3 pr-8 text-[12.5px]"
        }`}
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {ORDER_STATUS_LABEL[option]}
          </option>
        ))}
      </select>
      {pending && <IconSpinner size={13} className="text-ink-muted" />}
    </span>
  );
}
