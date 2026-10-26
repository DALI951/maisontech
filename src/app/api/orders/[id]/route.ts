import { getCurrentUser } from "@/lib/auth";
import { getAdminUser, jsonError, readJson } from "@/lib/api-auth";
import { getOrderById, isOrderStatus, updateOrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return jsonError("Connexion requise.", 401);
  const order = await getOrderById(id);
  if (!order) return jsonError("Commande introuvable.", 404);
  if (user.role !== "admin" && order.userId !== user.id) {
    return jsonError("Accès refusé.", 403);
  }
  return Response.json({ ok: true, order });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const payload = await readJson<{ status?: unknown; cancel?: unknown }>(request);
  if (!payload) return jsonError("Requête illisible.");

  const admin = await getAdminUser();
  const user = await getCurrentUser();
  if (!user) return jsonError("Connexion requise.", 401);

  const order = await getOrderById(id);
  if (!order) return jsonError("Commande introuvable.", 404);

  if (!admin) {
    // A customer may only cancel their own recent order — never change its status otherwise.
    if (order.userId !== user.id) return jsonError("Accès refusé.", 403);
    if (payload.cancel !== true) return jsonError("Action non autorisée.", 403);
    if (!["pending", "confirmed"].includes(order.status)) {
      return jsonError(
        "Cette commande ne peut plus être annulée (elle est déjà en préparation ou expédiée).",
        409,
      );
    }
    const cancelled = await updateOrderStatus(id, "cancelled");
    return Response.json({ ok: true, order: cancelled });
  }

  const status = admin && payload.cancel === true ? "cancelled" : payload.status;
  if (!isOrderStatus(status)) return jsonError("Statut inconnu.", 422);
  const updated = await updateOrderStatus(id, status);
  if (!updated) return jsonError("Commande introuvable.", 404);
  return Response.json({ ok: true, order: updated });
}
