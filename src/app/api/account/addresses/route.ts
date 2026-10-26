import { getCurrentUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/api-auth";
import { updateDb } from "@/lib/db";
import { hasErrors, validateAddress } from "@/lib/validation";
import type { Address } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Connexion requise.", 401);
  return Response.json({ ok: true, addresses: user.addresses });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Connexion requise.", 401);

  const payload = await readJson<Partial<Address>>(request);
  if (!payload) return jsonError("Requête illisible.");

  const errors = validateAddress(payload);
  if (hasErrors(errors)) return jsonError("Vérifiez l'adresse.", 422, { fields: errors });

  const address: Address = {
    id: `addr-${Date.now().toString(36)}`,
    label: (payload.label ?? "Adresse").trim() || "Adresse",
    fullName: payload.fullName!.trim(),
    phone: payload.phone!.trim(),
    address: payload.address!.trim(),
    city: payload.city!.trim(),
    governorate: payload.governorate!.trim(),
    isDefault: Boolean(payload.isDefault),
  };

  const saved = await updateDb((database) => {
    const record = database.users.find((entry) => entry.id === user.id);
    if (!record) return null;
    if (record.addresses.length >= 8) return null;
    if (address.isDefault || record.addresses.length === 0) {
      address.isDefault = true;
      for (const entry of record.addresses) entry.isDefault = false;
    }
    record.addresses.push(address);
    return address;
  });

  if (!saved) return jsonError("Impossible d'ajouter l'adresse (8 maximum).", 409);
  return Response.json({ ok: true, address: saved }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Connexion requise.", 401);
  const payload = await readJson<{
    id?: string;
    makeDefault?: boolean;
    label?: string;
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    governorate?: string;
    isDefault?: boolean;
  }>(request);
  if (!payload?.id) return jsonError("Adresse manquante.");

  const edits = Boolean(
    payload.label !== undefined ||
      payload.fullName !== undefined ||
      payload.phone !== undefined ||
      payload.address !== undefined ||
      payload.city !== undefined ||
      payload.governorate !== undefined,
  );

  if (edits) {
    const errors = validateAddress(payload);
    if (hasErrors(errors)) return jsonError("Vérifiez l'adresse.", 422, { fields: errors });
  }

  const result = await updateDb((database) => {
    const record = database.users.find((entry) => entry.id === user.id);
    if (!record) return null;
    const target = record.addresses.find((entry) => entry.id === payload.id);
    if (!target) return null;

    if (edits) {
      target.label = (payload.label ?? target.label).trim() || "Adresse";
      target.fullName = payload.fullName!.trim();
      target.phone = payload.phone!.trim();
      target.address = payload.address!.trim();
      target.city = payload.city!.trim();
      target.governorate = payload.governorate!.trim();
    }

    const wantsDefault = Boolean(payload.makeDefault || payload.isDefault);
    if (wantsDefault) {
      for (const entry of record.addresses) entry.isDefault = entry.id === target.id;
    } else if (payload.isDefault === false && target.isDefault && record.addresses.length > 1) {
      // Never leave the book without a default address.
      for (const entry of record.addresses) entry.isDefault = false;
      record.addresses[0].isDefault = true;
    }

    return record.addresses;
  });

  if (!result) return jsonError("Adresse introuvable.", 404);
  return Response.json({ ok: true, addresses: result });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Connexion requise.", 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("Adresse manquante.");

  const result = await updateDb((database) => {
    const record = database.users.find((entry) => entry.id === user.id);
    if (!record) return null;
    const before = record.addresses.length;
    record.addresses = record.addresses.filter((entry) => entry.id !== id);
    if (record.addresses.length === before) return null;
    if (record.addresses.length > 0 && !record.addresses.some((entry) => entry.isDefault)) {
      record.addresses[0].isDefault = true;
    }
    return record.addresses;
  });

  if (!result) return jsonError("Adresse introuvable.", 404);
  return Response.json({ ok: true, addresses: result });
}
