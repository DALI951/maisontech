import { createSession, registerUser, setSessionCookie } from "@/lib/auth";
import { readJson } from "@/lib/api-auth";
import { hasErrors, validateRegister } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await readJson<{
    fullName?: string;
    email?: string;
    password?: string;
    confirm?: string;
    newsletter?: boolean;
  }>(request);
  if (!payload) {
    return Response.json({ ok: false, error: "Requête illisible." }, { status: 400 });
  }

  const errors = validateRegister(payload);
  if (hasErrors(errors)) {
    return Response.json({ ok: false, error: "Champs invalides.", fields: errors }, { status: 422 });
  }

  const result = await registerUser({
    fullName: payload.fullName!,
    email: payload.email!,
    password: payload.password!,
  });
  if (!result.ok || !result.user) {
    return Response.json({ ok: false, error: result.error ?? "Inscription impossible." }, { status: 409 });
  }

  const session = await createSession(result.user.id);
  await setSessionCookie(session);

  return Response.json({ ok: true, user: result.user }, { status: 201 });
}
