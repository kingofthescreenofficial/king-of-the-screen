import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { getDatabase } from "@/lib/database";

const COOKIE_NAME = "kots_admin_session";
const IDLE_MS = 30 * 60 * 1000;
const ABSOLUTE_MS = 8 * 60 * 60 * 1000;

function hash(value: string): string { return createHash("sha256").update(value).digest("hex"); }

export function verifyAdminPassword(password: string): boolean {
  const configured = process.env.KOTS_ADMIN_PASSWORD_HASH;
  if (!configured || !configured.startsWith("scrypt$")) return false;
  const [, salt, expected] = configured.split("$");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 32).toString("hex");
  return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

export function createAdminSession(now = Date.now()): { token: string; csrfToken: string; expiresAt: number } {
  if (!process.env.KOTS_SESSION_SECRET || process.env.KOTS_SESSION_SECRET.length < 32) throw new Error("ADMIN_CONFIGURATION_UNAVAILABLE");
  const token = randomBytes(32).toString("base64url");
  const csrfToken = randomBytes(32).toString("base64url");
  const expiresAt = now + ABSOLUTE_MS;
  getDatabase().prepare(`INSERT INTO admin_sessions (id, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?)`)
    .run(JSON.stringify({ tokenHash: hash(token), csrfToken, idleExpiresAt: now + IDLE_MS }), expiresAt, now, now);
  return { token, csrfToken, expiresAt };
}

export function adminCookie(token: string, expiresAt: number): string {
  return `${COOKIE_NAME}=${token}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Expires=${new Date(expiresAt).toUTCString()}`;
}
