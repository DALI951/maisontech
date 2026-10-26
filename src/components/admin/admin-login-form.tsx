"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconEye, IconSpinner } from "@/components/icons";
import { Alert, Button } from "@/components/ui/primitives";

interface LoginResponse {
  ok?: boolean;
  error?: string;
  user?: { role?: string };
}

export function AdminLoginForm({
  demoEmail,
  demoPassword,
}: {
  demoEmail: string;
  demoPassword: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");

    if (!email.trim() || !password) {
      setError("Renseignez l'e-mail et le mot de passe.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json().catch(() => null)) as LoginResponse | null;

      if (!response.ok) {
        setError(body?.error ?? "Connexion impossible.");
        return;
      }
      if (body?.user?.role !== "admin") {
        // Do not keep a customer session hanging around after a failed admin login.
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
        setError("Ce compte n'a pas les droits d'administration. Utilisez le compte démo admin.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Réseau indisponible. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-5">
      {error && (
        <div className="mb-3">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="field-label" htmlFor="admin-email">
            E-mail professionnel
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-input"
            placeholder="admin@maisontech.example"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="admin-password">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-input pr-11"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-field text-ink-muted hover:text-ink"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              aria-pressed={showPassword}
            >
              <IconEye size={16} />
            </button>
          </div>
        </div>
      </div>

      <Button type="submit" variant="dark" size="lg" className="mt-4 w-full" disabled={pending}>
        {pending ? <IconSpinner size={16} /> : null}
        Se connecter
      </Button>

      <button
        type="button"
        onClick={() => {
          setEmail(demoEmail);
          setPassword(demoPassword);
          setError("");
        }}
        className="mt-3 w-full rounded-field border border-dashed border-line-strong px-3 py-2 text-left text-[11.5px] leading-relaxed text-ink-soft transition-colors hover:border-accent hover:text-accent-dark"
      >
        <span className="font-semibold text-ink">Compte de démonstration</span> — cliquez pour
        remplir : {demoEmail} / {demoPassword}
      </button>
    </form>
  );
}
