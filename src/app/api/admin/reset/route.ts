import { getAdminUser, jsonError, unauthorized } from "@/lib/api-auth";
import { resetDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/admin/reset — throws away demo edits and restores the seed data. */
export async function POST() {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();

  const database = await resetDb();
  return Response.json({
    ok: true,
    products: database.products.length,
    orders: database.orders.length,
    users: database.users.length,
  });
}

export async function GET() {
  return jsonError("Méthode non autorisée : utilisez POST pour réinitialiser.", 405);
}
