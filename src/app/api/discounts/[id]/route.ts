import { getAdminUser, jsonError, readJson, unauthorized } from "@/lib/api-auth";
import { updateDb } from "@/lib/db";
import { validateDiscount } from "@/lib/discount-admin";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const { id } = await params;
  const payload = await readJson<unknown>(request);
  const { value, errors } = validateDiscount(payload);
  if (!value) return jsonError("Vérifiez les champs du code promo.", 422, { fields: errors });

  const result = await updateDb((database) => {
    const discount = database.discounts.find((entry) => entry.id === id);
    if (!discount) return { error: "Code promo introuvable.", status: 404 as const };
    if (
      database.discounts.some(
        (entry) => entry.id !== id && entry.code.toUpperCase() === value.code,
      )
    ) {
      return { error: "Ce code existe déjà.", status: 409 as const };
    }
    Object.assign(discount, value);
    return { discount };
  });

  if (!("discount" in result) || !result.discount) {
    return jsonError(result.error ?? "Code promo introuvable.", result.status ?? 400);
  }
  return Response.json({ ok: true, discount: result.discount });
}

export async function DELETE(_request: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const { id } = await params;
  const removed = await updateDb((database) => {
    const index = database.discounts.findIndex((entry) => entry.id === id);
    if (index === -1) return null;
    return database.discounts.splice(index, 1)[0];
  });
  if (!removed) return jsonError("Code promo introuvable.", 404);
  return Response.json({ ok: true, removed: removed.code });
}
