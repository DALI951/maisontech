"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlert, IconArrowRight, IconCheck, IconEye, IconUser } from "@/components/icons";
import { Alert, Button } from "@/components/ui/primitives";
import { hasErrors, validateLogin, validateRegister, type FieldErrors } from "@/lib/validation";
import { useToast } from "@/store/toast";

interface AuthResponse {
  ok: boolean;
  error?: string;
  fields?: FieldErrors;
  user?: { fullName: string; role: "customer" | "admin" };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="field-error" id={id} role="alert">
      {message}
    </p>
  );
}

export function LoginForm({ next, demo }: { next?: string; demo: { email: string; password: string; role: string }[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const validation = validateLogin(values);
    if (hasErrors(validation)) {
      setErrors(validation);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as AuthResponse;
      if (!response.ok || !payload.ok) {
        setErrors(payload.fields ?? {});
        setFormError(payload.error ?? "Connexion impossible.");
        return;
      }
      push({ tone: "success", title: "Connexion réussie", description: payload.user?.fullName });
      const target = next && next.startsWith("/") ? next : payload.user?.role === "admin" ? "/admin" : "/compte";
      router.push(target);
      router.refresh();
    } catch {
      setFormError("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3.5">
      {formError && (
        <Alert tone="error" title="Connexion refusée">
          {formError}
        </Alert>
      )}

      <div>
        <label className="field-label" htmlFor="email">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => {
            setValues((current) => ({ ...current, email: event.target.value }));
            setErrors((current) => ({ ...current, email: "" }));
          }}
          aria-invalid={Boolean(errors.email)}
          placeholder="nom@domaine.tn"
          className="field-input"
        />
        <FieldError id="email-error" message={errors.email} />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label className="field-label" htmlFor="password">
            Mot de passe
          </label>
          <span className="mb-1.5 text-[11.5px] text-ink-muted">Démo : voir ci-dessous</span>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => {
              setValues((current) => ({ ...current, password: event.target.value }));
              setErrors((current) => ({ ...current, password: "" }));
            }}
            aria-invalid={Boolean(errors.password)}
            className="field-input pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-field text-ink-muted hover:text-accent-dark"
          >
            <IconEye size={15} />
          </button>
        </div>
        <FieldError id="password-error" message={errors.password} />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Connexion…" : "Se connecter"}
        {!busy && <IconArrowRight size={15} />}
      </Button>

      <p className="text-center text-[12.5px] text-ink-soft">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-accent-dark hover:underline">
          Créer un compte
        </Link>
      </p>

      {demo.length > 0 && (
        <div className="rounded-tile border border-line bg-[#f7f8f7] p-3">
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink">
            <IconUser size={13} />
            Comptes de démonstration
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {demo.map((account) => (
              <li key={account.email} className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-soft">
                <button
                  type="button"
                  onClick={() => setValues({ email: account.email, password: account.password })}
                  className="rounded bg-surface px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink ring-1 ring-line hover:ring-accent"
                >
                  {account.email}
                </button>
                <span className="font-mono text-[11px]">{account.password}</span>
                <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-dark">
                  {account.role}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-muted">
            Cliquez sur l'e-mail pour remplir le formulaire. Ces comptes n'existent que dans la
            démonstration.
          </p>
        </div>
      )}
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const { push } = useToast();
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    newsletter: true,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const validation = validateRegister(values);
    if (hasErrors(validation)) {
      setErrors(validation);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as AuthResponse;
      if (!response.ok || !payload.ok) {
        setErrors(payload.fields ?? {});
        setFormError(payload.error ?? "Inscription impossible.");
        return;
      }
      if (values.newsletter) {
        void fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        }).catch(() => undefined);
      }
      push({ tone: "success", title: "Compte créé", description: "Bienvenue chez MaisonTech (démo)." });
      router.push(next && next.startsWith("/") ? next : "/compte");
      router.refresh();
    } catch {
      setFormError("Inscription impossible. Vérifiez votre réseau.");
    } finally {
      setBusy(false);
    }
  }

  function update(key: keyof typeof values, value: string | boolean) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  const fields: { name: "fullName" | "email" | "password" | "confirm"; label: string; type?: string; autoComplete?: string; placeholder?: string; hint?: string }[] = [
    { name: "fullName", label: "Nom complet", autoComplete: "name", placeholder: "Sonia Ben Amor" },
    { name: "email", label: "Adresse e-mail", type: "email", autoComplete: "email", placeholder: "nom@domaine.tn" },
    {
      name: "password",
      label: "Mot de passe",
      type: "password",
      autoComplete: "new-password",
      hint: "8 caractères minimum, avec une lettre et un chiffre.",
    },
    { name: "confirm", label: "Confirmer le mot de passe", type: "password", autoComplete: "new-password" },
  ];

  return (
    <form onSubmit={submit} noValidate className="space-y-3.5">
      {formError && (
        <Alert tone="error" title="Inscription refusée">
          {formError}
        </Alert>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          <label className="field-label" htmlFor={field.name}>
            {field.label}
          </label>
          <input
            id={field.name}
            type={field.type ?? "text"}
            autoComplete={field.autoComplete}
            placeholder={field.placeholder}
            value={values[field.name]}
            onChange={(event) => update(field.name, event.target.value)}
            aria-invalid={Boolean(errors[field.name])}
            className="field-input"
          />
          {field.hint && !errors[field.name] && (
            <p className="mt-1 text-[11.5px] text-ink-muted">{field.hint}</p>
          )}
          <FieldError id={`${field.name}-error`} message={errors[field.name]} />
        </div>
      ))}

      <label className="flex items-start gap-2.5 rounded-field bg-[#f7f8f7] px-3 py-2.5 text-[12px] leading-relaxed text-ink-soft">
        <input
          type="checkbox"
          checked={values.newsletter}
          onChange={(event) => update("newsletter", event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#0e7c86]"
        />
        <span>
          Recevoir la lettre mensuelle (une fois par mois, aucune autre utilisation de l'e-mail).
        </span>
      </label>

      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Création…" : "Créer mon compte"}
        {!busy && <IconCheck size={16} />}
      </Button>

      <p className="text-center text-[12.5px] text-ink-soft">
        Déjà client ?{" "}
        <Link href="/connexion" className="font-semibold text-accent-dark hover:underline">
          Se connecter
        </Link>
      </p>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-muted">
        <IconAlert size={12} className="mt-0.5 shrink-0" />
        Démonstration : le compte est stocké dans la base locale de démo. N'utilisez pas un mot de
        passe réel.
      </p>
    </form>
  );
}
