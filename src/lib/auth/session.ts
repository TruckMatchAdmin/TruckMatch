import { createHmac, timingSafeEqual } from "crypto";

/**
 * Session signée (HMAC-SHA256) stockée dans un cookie httpOnly.
 * Le secret vient de SESSION_SECRET (ou, à défaut, de la clé service Supabase,
 * qui n'existe que côté serveur). Sans secret, aucune session n'est valide.
 */

export const SESSION_COOKIE = "tm_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 jours

export type SessionRole = "admin" | "company" | "driver";

export interface SessionUser {
  id: string;
  email: string;
  role: SessionRole;
  name: string;
  exp: number; // epoch secondes
  twoFactorVerifiedAt?: number; // epoch secondes de validation 2FA
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!secret) throw new Error("SESSION_SECRET manquant côté serveur.");
  return secret;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(user: Omit<SessionUser, "exp">): string {
  const full: SessionUser = { ...user, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const payload = b64url(JSON.stringify(full));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return null;
  }
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
    if (!user?.email || !user?.role || typeof user.exp !== "number") return null;
    if (user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch {
    return null;
  }
}

/** Lit et vérifie la session depuis l'en-tête Cookie de la requête. */
export function getSession(request: Request): SessionUser | null {
  const header = request.headers.get("cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  return verifySessionToken(decodeURIComponent(match[1]));
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
  sameSite: "lax" as const,
};

export const ADMIN_2FA_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 heures renouvelables

/** Vérifie si la session admin est valide et a été confirmée par 2FA depuis moins de 12h. */
export function isAdmin2FAValid(user: SessionUser | null): boolean {
  if (!user || user.role !== "admin") return false;
  if (!user.twoFactorVerifiedAt) return false;
  const now = Math.floor(Date.now() / 1000);
  return now - user.twoFactorVerifiedAt < ADMIN_2FA_MAX_AGE_SECONDS;
}

/** Comparaison de chaînes à temps constant (mots de passe). */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}
