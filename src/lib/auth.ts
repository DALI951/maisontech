import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PublicUser, Session, User } from "./types";
import { readDb, updateDb } from "./db";
import { createToken, hashPassword, verifyPassword } from "./password";

const COOKIE_NAME = "mt_session";
const SESSION_DAYS = 7;

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    addresses: user.addresses,
  };
}

function expiryFromNow(): Date {
  return new Date(Date.now() + SESSION_DAYS * 86_400_000);
}

export async function createSession(userId: string): Promise<Session> {
  return updateDb((database) => {
    const now = Date.now();
    database.sessions = database.sessions.filter(
      (session) => new Date(session.expiresAt).getTime() > now,
    );
    const session: Session = {
      token: createToken(),
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: expiryFromNow().toISOString(),
    };
    database.sessions.push(session);
    return session;
  });
}

export async function setSessionCookie(session: Session): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const database = await readDb();
  const session = database.sessions.find((entry) => entry.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) return null;

  const user = database.users.find((entry) => entry.id === session.userId);
  return user ? toPublicUser(user) : null;
}

/** Admin area guard. Server-enforced: never a client-side check. */
export async function requireAdmin(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/connexion?next=/admin");
  if (user.role !== "admin") redirect("/compte");
  return user;
}

/** Customer area guard: any signed-in user, admin included. */
export async function requireUser(nextPath = "/compte"): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  user?: PublicUser;
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const normalized = email.trim().toLowerCase();
  const database = await readDb();
  const user = database.users.find((entry) => entry.email.toLowerCase() === normalized);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "E-mail ou mot de passe incorrect." };
  }
  return { ok: true, user: toPublicUser(user) };
}

export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const existing = await updateDb((database) =>
    database.users.some((entry) => entry.email.toLowerCase() === email),
  );
  if (existing) {
    return { ok: false, error: "Un compte existe déjà avec cet e-mail." };
  }

  const user: User = {
    id: `user-${Date.now().toString(36)}`,
    fullName: input.fullName.trim(),
    email,
    passwordHash: hashPassword(input.password),
    role: "customer",
    createdAt: new Date().toISOString(),
    addresses: [],
  };

  await updateDb((database) => {
    database.users.push(user);
  });

  return { ok: true, user: toPublicUser(user) };
}

export async function logoutUser(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await updateDb((database) => {
      database.sessions = database.sessions.filter((session) => session.token !== token);
    });
  }
  await clearSessionCookie();
}

export async function getFullUser(): Promise<User | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const database = await readDb();
  return database.users.find((entry) => entry.id === user.id) ?? null;
}
