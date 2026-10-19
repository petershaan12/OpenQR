import { redirect } from "react-router";
import crypto from "crypto";

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET must be set in production");
}
const SECRET = process.env.SESSION_SECRET || "default_secret_for_development";

const MAX_AGE = 86400;

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function getUserFromCookie(request: Request): number | null {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;

  const [userIdStr, issuedAtStr, signature] = match[1].split(":");
  if (!userIdStr || !issuedAtStr || !signature) return null;

  const expected = Buffer.from(sign(`${userIdStr}:${issuedAtStr}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    return null;
  }
  if (Date.now() / 1000 - parseInt(issuedAtStr) > MAX_AGE) return null;
  return parseInt(userIdStr);
}

export function createSessionCookie(userId: number): string {
  const payload = `${userId}:${Math.floor(Date.now() / 1000)}`;
  return `session=${payload}:${sign(payload)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie(): string {
  return `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// ponytail: trusts Content-Length only; chunked bodies bypass it, so keep nginx client_max_body_size in front
const MAX_BODY_BYTES = 25 * 1024 * 1024;

export function assertBodySize(request: Request) {
  if (Number(request.headers.get("Content-Length") || 0) > MAX_BODY_BYTES) {
    throw new Response("Payload too large", { status: 413 });
  }
}

// ponytail: in-memory per process, resets on restart; move to Redis/DB if running multiple instances
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
const loginFailures = new Map<string, { count: number; first: number }>();

export function isLoginLocked(email: string): boolean {
  const entry = loginFailures.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() - entry.first > LOGIN_WINDOW_MS) {
    loginFailures.delete(email.toLowerCase());
    return false;
  }
  return entry.count >= LOGIN_MAX_FAILURES;
}

export function recordLoginFailure(email: string) {
  const key = email.toLowerCase();
  const now = Date.now();
  if (loginFailures.size > 10000) {
    for (const [k, v] of loginFailures) if (now - v.first > LOGIN_WINDOW_MS) loginFailures.delete(k);
  }
  const entry = loginFailures.get(key);
  if (!entry || now - entry.first > LOGIN_WINDOW_MS) loginFailures.set(key, { count: 1, first: now });
  else entry.count++;
}

export function clearLoginFailures(email: string) {
  loginFailures.delete(email.toLowerCase());
}

// Set when someone logs in with the seeded default password; cleared after a password change
export const DEFAULT_PASSWORD = "password";
export const MUST_CHANGE_COOKIE = "must_change_password";

export function mustChangePassword(request: Request): boolean {
  return /(?:^|;\s*)must_change_password=1/.test(request.headers.get("Cookie") || "");
}

export function mustChangePasswordCookie(on: boolean): string {
  return `${MUST_CHANGE_COOKIE}=${on ? 1 : ""}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${on ? MAX_AGE : 0}`;
}

export async function requireUser(request: Request): Promise<number> {
  assertBodySize(request);
  const userId = getUserFromCookie(request);
  if (!userId) {
    throw redirect("/login");
  }
  return userId;
}
