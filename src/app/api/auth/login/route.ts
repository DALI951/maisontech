import { loginUser, createSession, setSessionCookie } from "@/lib/auth";
import { readJson } from "@/lib/api-auth";
import { validateLogin, hasErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await readJson<{ email?: string; password?: string }>(request);
  if (!payload) {
    return Response.json({ ok: false, error: "Requête illisible." }, { status: 400 });
  }

  const errors = validateLogin({ email: payload.email, password: payload.password });
  if (hasErrors(errors)) {
    return Response.json({ ok: false, error: "Champs invalides.", fields: errors }, { status: 422 });
  }

  const result = await loginUser(payload.email!, payload.password!);
  if (!result.ok || !result.user) {
    return Response.json(
      { ok: false, error: result.error ?? "Connexion impossible." },
      { status: 401 },
    );
  }

  const session = await createSession(result.user.id);
  await setSessionCookie(session);

  return Response.json({ ok: true, user: result.user });
}
