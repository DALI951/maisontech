import type { PublicUser } from "./types";
import { getCurrentUser } from "./auth";

/** Admin guard for route handlers. Returns null when the caller is not an admin. */
export async function getAdminUser(): Promise<PublicUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return Response.json({ ok: false, error: message, ...extra }, { status });
}

export function unauthorized() {
  return jsonError("Authentification requise.", 401);
}

export function forbidden() {
  return jsonError("Accès réservé à l'administration.", 403);
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
