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
  getDatabase().prepare(`INSERT INTO admin_sessions (id, token_hash, csrf_token, idle_expires_at, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(randomBytes(16).toString("hex"), hash(token), csrfToken, now + IDLE_MS, expiresAt, now, now);
  return { token, csrfToken, expiresAt };
}

export function adminCookie(token: string, expiresAt: number): string {
  return `${COOKIE_NAME}=${token}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Expires=${new Date(expiresAt).toUTCString()}`;
}

export function requireAdmin(request: Request, now = Date.now()): { sessionId: string; csrfToken: string } | null {
  const cookie = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!cookie?.[1]) return null;
  const session = getDatabase().prepare("SELECT id, csrf_token, idle_expires_at, expires_at, revoked_at FROM admin_sessions WHERE token_hash = ?")
    .get(hash(cookie[1])) as { id: string; csrf_token: string; idle_expires_at: number; expires_at: number; revoked_at: number | null } | undefined;
  if (!session || session.revoked_at || session.idle_expires_at < now || session.expires_at < now) return null;
  getDatabase().prepare("UPDATE admin_sessions SET idle_expires_at = ?, updated_at = ? WHERE id = ?").run(now + IDLE_MS, now, session.id);
  return { sessionId: session.id, csrfToken: session.csrf_token };
}

export function revokeAdminSession(request: Request, now = Date.now()): void {
  const cookie = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (cookie?.[1]) getDatabase().prepare("UPDATE admin_sessions SET revoked_at = ?, updated_at = ? WHERE token_hash = ?").run(now, now, hash(cookie[1]));
}
