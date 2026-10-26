"use client";

import { useState } from "react";
import { IconArrowRight, IconCheck } from "@/components/icons";
import { Button } from "@/components/ui/primitives";
import { isValidEmail } from "@/lib/validation";

export function NewsletterForm({
  note,
  compact = false,
}: {
  note?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setState("error");
      setMessage("Vérifiez votre adresse e-mail (ex. nom@domaine.tn).");
      return;
    }
    setState("loading");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; already?: boolean };
      if (!response.ok || !payload.ok) {
        setState("error");
        setMessage(payload.error ?? "Inscription impossible pour le moment.");
        return;
      }
      setState("done");
      setMessage(
        payload.already
          ? "Cette adresse est déjà inscrite — rien de plus à faire."
          : "Inscription enregistrée. Aucun e-mail ne sera envoyé : c'est une démonstration.",
      );
      setEmail("");
    } catch {
      setState("error");
      setMessage("Le serveur n'a pas répondu. Réessayez dans un instant.");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-start gap-2.5 rounded-field border border-[#c6e3d5] bg-[#edf7f2] px-4 py-3 text-[13px] text-[#14614a]">
        <IconCheck size={17} />
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <div className={`flex flex-col gap-2 ${compact ? "sm:flex-row" : "sm:flex-row"}`}>
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Adresse e-mail
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (state === "error") setState("idle");
            }}
            placeholder="vous@exemple.tn"
            aria-invalid={state === "error"}
            className="field-input h-11"
            autoComplete="email"
          />
        </div>
        <Button type="submit" size="md" disabled={state === "loading"} className="sm:w-auto">
          {state === "loading" ? "Inscription…" : "Je m'inscris"}
          {state !== "loading" && <IconArrowRight size={16} />}
        </Button>
      </div>
      {state === "error" ? (
        <p className="field-error">{message}</p>
      ) : (
        note && <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">{note}</p>
      )}
    </form>
  );
}
