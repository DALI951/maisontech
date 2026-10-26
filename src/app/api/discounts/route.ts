import { getAdminUser, jsonError, readJson, unauthorized } from "@/lib/api-auth";
import { readDb, updateDb } from "@/lib/db";
import { validateDiscount } from "@/lib/discount-admin";
import type { DiscountCode } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const database = await readDb();
  return Response.json({ ok: true, discounts: database.discounts });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const payload = await readJson<unknown>(request);
  const { value, errors } = validateDiscount(payload);
  if (!value) return jsonError("Vérifiez les champs du code promo.", 422, { fields: errors });

  const created = await updateDb((database) => {
    if (database.discounts.some((entry) => entry.code.toUpperCase() === value.code)) {
      return { error: "Ce code existe déjà." as const };
    }
    const discount: DiscountCode = {
      id: `dc-${Date.now().toString(36)}`,
      usedCount: 0,
      ...value,
    };
    database.discounts.push(discount);
    return { discount };
  });

  if ("error" in created && created.error) {
    return jsonError(created.error, 409, { fields: { code: created.error } });
  }
  return Response.json({ ok: true, discount: created.discount }, { status: 201 });
}
