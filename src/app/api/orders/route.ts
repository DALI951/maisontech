import { getCurrentUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/api-auth";
import { createOrder } from "@/lib/orders";
import { listOrdersForUser } from "@/lib/orders";
import { hasErrors, validateCheckout, type CheckoutInput } from "@/lib/validation";
import type { PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Connexion requise.", 401);
  const orders = await listOrdersForUser(user.id);
  return Response.json({ ok: true, orders });
}

export async function POST(request: Request) {
  const payload = await readJson<Partial<CheckoutInput> & { lines?: unknown; discountCode?: unknown }>(
    request,
  );
  if (!payload) return jsonError("Requête illisible.");

  const errors = validateCheckout(payload);
  if (hasErrors(errors)) {
    return jsonError("Vérifiez vos informations de livraison.", 422, { fields: errors });
  }
  if (payload.paymentMethod !== "cod" && payload.paymentMethod !== "bank_transfer" && payload.paymentMethod !== "online") {
    return jsonError("Mode de paiement inconnu.", 422, {
      fields: { paymentMethod: "Choisissez un mode de paiement." },
    });
  }

  const user = await getCurrentUser();
  const result = await createOrder({
    fullName: payload.fullName!,
    email: payload.email!,
    phone: payload.phone!,
    address: payload.address!,
    city: payload.city!,
    governorate: payload.governorate!,
    notes: payload.notes,
    paymentMethod: payload.paymentMethod as PaymentMethod,
    lines: Array.isArray(payload.lines)
      ? (payload.lines as { productId: string; quantity: number }[])
      : [],
    discountCode: typeof payload.discountCode === "string" ? payload.discountCode : undefined,
    userId: user?.id,
  });

  if (!result.ok || !result.order) {
    return jsonError(result.error ?? "Commande impossible.", 409);
  }

  return Response.json({ ok: true, order: result.order }, { status: 201 });
}
