"use client";

import { useState } from "react";
import { IconCheck } from "@/components/icons";
import { Alert, Button } from "@/components/ui/primitives";
import { useToast } from "@/store/toast";

type FieldErrors = Record<string, string>;

const EMPTY = { name: "", email: "", subject: "", message: "" };
const SUBJECTS = [
  "Question sur un produit",
  "Suivi de commande",
  "Livraison",
  "Retour ou garantie",
  "Facturation",
  "Autre demande",
];

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="field-error" id={id} role="alert">
      {message}
    </p>
  );
}

export function ContactForm() {
  const { push } = useToast();
  const [values, setValues] = useState({ ...EMPTY, subject: SUBJECTS[0] });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  function update(field: keyof typeof EMPTY, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setBusy(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string; fields?: FieldErrors };
      if (!response.ok || !payload.ok) {
        setErrors(payload.fields ?? {});
        setFormError(payload.error ?? "Envoi impossible. Réessayez dans un instant.");
        return;
      }
      setSent(true);
      setValues({ ...EMPTY, subject: SUBJECTS[0] });
      push({ tone: "success", title: "Message enregistré", description: "Démonstration : aucun e-mail n'est envoyé." });
    } catch {
      setFormError("Le serveur est injoignable. Vérifiez votre connexion puis réessayez.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <Alert tone="success" title="Message enregistré dans la démonstration">
          Votre message a été ajouté à la base de démonstration pour être consulté depuis l'administration. Aucun
          e-mail n'est réellement envoyé tant qu'aucun service d'envoi n'est configuré.
        </Alert>
        <Button variant="secondary" onClick={() => setSent(false)}>
          Écrire un autre message
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      {formError && (
        <Alert tone="error" title="Formulaire incomplet">
          {formError}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="contact-name">
            Nom complet
          </label>
          <input
            id="contact-name"
            className="field-input"
            autoComplete="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          <FieldError id="contact-name-error" message={errors.name} />
        </div>

        <div>
          <label className="field-label" htmlFor="contact-email">
            Adresse e-mail
          </label>
          <input
            id="contact-email"
            className="field-input"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
          <FieldError id="contact-email-error" message={errors.email} />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="contact-subject">
          Objet
        </label>
        <select
          id="contact-subject"
          className="field-input"
          value={values.subject}
          onChange={(event) => update("subject", event.target.value)}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
        >
          {SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        <FieldError id="contact-subject-error" message={errors.subject} />
      </div>

      <div>
        <label className="field-label" htmlFor="contact-message">
          Votre message
        </label>
        <textarea
          id="contact-message"
          className="field-input min-h-[148px] resize-y py-2.5"
          maxLength={2000}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : "contact-message-hint"}
        />
        <p className="mt-1 text-[11.5px] text-ink-muted" id="contact-message-hint">
          {values.message.length}/2000 caractères — 20 caractères minimum.
        </p>
        <FieldError id="contact-message-error" message={errors.message} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Envoi…" : "Envoyer le message"}
          {!busy && <IconCheck size={16} />}
        </Button>
        <p className="text-[11.5px] leading-snug text-ink-muted">
          Démonstration : le message est stocké localement, aucun e-mail n'est envoyé.
        </p>
      </div>
    </form>
  );
}
