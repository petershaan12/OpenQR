import { redirect } from "react-router";
import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "default_secret_for_development";

function sign(userId: number): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(String(userId))
    .digest("hex");
}

export function getUserFromCookie(request: Request): number | null {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;

  const [userIdStr, signature] = match[1].split(":");
  if (!userIdStr || !signature) return null;

  const userId = parseInt(userIdStr);
  if (sign(userId) !== signature) {
    return null;
  }
  return userId;
}

export function createSessionCookie(userId: number): string {
  const signature = sign(userId);
  return `session=${userId}:${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
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
