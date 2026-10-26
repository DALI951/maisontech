import { logoutUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await logoutUser();
  return Response.json({ ok: true });
}
