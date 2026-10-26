import { readJson } from "@/lib/api-auth";
import { updateDb } from "@/lib/db";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await readJson<{ email?: string }>(request);
  if (!payload?.email || !isValidEmail(payload.email)) {
    return Response.json(
      { ok: false, error: "Adresse e-mail invalide." },
      { status: 422 },
    );
  }

  const email = normalizeEmail(payload.email);
  const result = await updateDb((database) => {
    const existing = database.subscribers.find((entry) => entry.email === email);
    if (existing) return { already: true };
    database.subscribers.push({
      id: `sub-${Date.now().toString(36)}`,
      email,
      createdAt: new Date().toISOString(),
    });
    return { already: false };
  });

  return Response.json({ ok: true, already: result.already }, { status: result.already ? 200 : 201 });
}
