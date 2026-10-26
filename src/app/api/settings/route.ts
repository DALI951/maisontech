import { getAdminUser, jsonError, readJson, unauthorized } from "@/lib/api-auth";
import { updateDb } from "@/lib/db";
import type { StoreSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

/** PATCH /api/settings — admin only, partial merge of the storefront settings. */
export async function PATCH(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const payload = await readJson<Record<string, unknown>>(request);
  if (!payload) return jsonError("Requête illisible.");

  const fields: Record<string, string> = {};
  const numberOr = (value: unknown, name: string, min: number, max: number): number | null => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
      fields[name] = `Valeur attendue entre ${min} et ${max}.`;
      return null;
    }
    return parsed;
  };

  const updated = await updateDb((database) => {
    const settings = database.settings;

    if (typeof payload.announcements !== "undefined") {
      const list = Array.isArray(payload.announcements)
        ? payload.announcements.map((entry) => String(entry).trim()).filter(Boolean).slice(0, 5)
        : [];
      if (list.length === 0) fields.announcements = "Ajoutez au moins une annonce.";
      else settings.announcements = list;
    }
    if (typeof payload.supportPhone === "string") settings.supportPhone = payload.supportPhone.trim();
    if (typeof payload.supportEmail === "string") settings.supportEmail = payload.supportEmail.trim();
    if (typeof payload.supportHours === "string") settings.supportHours = payload.supportHours.trim();
    if (typeof payload.storeAddress === "string") settings.storeAddress = payload.storeAddress.trim();

    const shipping = payload.shipping as Partial<StoreSettings["shipping"]> | undefined;
    if (shipping && typeof shipping === "object") {
      if (shipping.flatRate !== undefined) {
        const value = numberOr(shipping.flatRate, "shipping.flatRate", 0, 500);
        if (value !== null) settings.shipping.flatRate = value;
      }
      if (shipping.freeShippingThreshold !== undefined) {
        const value = numberOr(shipping.freeShippingThreshold, "shipping.freeShippingThreshold", 0, 100_000);
        if (value !== null) settings.shipping.freeShippingThreshold = value;
      }
      if (shipping.expressRate !== undefined) {
        const value = numberOr(shipping.expressRate, "shipping.expressRate", 0, 500);
        if (value !== null) settings.shipping.expressRate = value;
      }
      if (typeof shipping.estimatedDays === "string") {
        settings.shipping.estimatedDays = shipping.estimatedDays.trim();
      }
      if (shipping.returnsDays !== undefined) {
        const value = numberOr(shipping.returnsDays, "shipping.returnsDays", 0, 90);
        if (value !== null) settings.shipping.returnsDays = Math.round(value);
      }
    }

    const payments = payload.payments as Partial<StoreSettings["payments"]> | undefined;
    if (payments && typeof payments === "object") {
      if (payments.cashOnDelivery !== undefined) {
        settings.payments.cashOnDelivery = Boolean(payments.cashOnDelivery);
      }
      if (payments.bankTransfer !== undefined) {
        settings.payments.bankTransfer = Boolean(payments.bankTransfer);
      }
      if (payments.onlinePayment !== undefined) {
        settings.payments.onlinePayment = Boolean(payments.onlinePayment);
      }
    }

    if (typeof payload.demoBanner === "boolean") settings.demoBanner = payload.demoBanner;

    const newsletter = payload.newsletter as Partial<StoreSettings["newsletter"]> | undefined;
    if (newsletter && typeof newsletter === "object") {
      if (typeof newsletter.heading === "string") settings.newsletter.heading = newsletter.heading.trim();
      if (typeof newsletter.description === "string") {
        settings.newsletter.description = newsletter.description.trim();
      }
      if (typeof newsletter.note === "string") settings.newsletter.note = newsletter.note.trim();
    }

    return settings;
  });

  if (Object.keys(fields).length > 0) {
    return jsonError("Certaines valeurs sont invalides.", 422, { fields });
  }

  return Response.json({ ok: true, settings: updated });
}
