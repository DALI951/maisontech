import { getAdminUser, unauthorized } from "@/lib/api-auth";
import { buildAdminStats } from "@/lib/admin";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const database = await readDb();
  return Response.json({ ok: true, stats: buildAdminStats(database) });
}
