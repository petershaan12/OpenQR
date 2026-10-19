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

export async function requireUser(request: Request): Promise<number> {
  const userId = getUserFromCookie(request);
  if (!userId) {
    throw redirect("/login");
  }
  return userId;
}
