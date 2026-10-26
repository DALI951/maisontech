import { readJson } from "@/lib/api-auth";
import { updateDb } from "@/lib/db";
import { isValidEmail } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await readJson<{
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }>(request);
  if (!payload) {
    return Response.json({ ok: false, error: "Requête illisible." }, { status: 400 });
  }

  const fields: Record<string, string> = {};
  const name = (payload.name ?? "").trim();
  const email = (payload.email ?? "").trim();
  const subject = (payload.subject ?? "").trim();
  const message = (payload.message ?? "").trim();

  if (name.length < 3) fields.name = "Indiquez votre nom.";
  if (!isValidEmail(email)) fields.email = "Adresse e-mail invalide.";
  if (subject.length < 3) fields.subject = "Précisez l'objet de votre message.";
  if (message.length < 20) fields.message = "Votre message doit faire au moins 20 caractères.";
  if (message.length > 2000) fields.message = "Message trop long (2 000 caractères maximum).";

  if (Object.keys(fields).length > 0) {
    return Response.json({ ok: false, error: "Vérifiez le formulaire.", fields }, { status: 422 });
  }

  const stored = await updateDb((database) => {
    const entry = {
      id: `msg-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      name,
      email: email.toLowerCase(),
      subject,
      message,
      handled: false,
    };
    database.messages.unshift(entry);
    return entry;
  });

  return Response.json(
    {
      ok: true,
      id: stored.id,
      note:
        "Message enregistré dans la démonstration. Aucun e-mail n'est envoyé : configurez un service d'envoi avant la mise en ligne.",
    },
    { status: 201 },
  );
}
