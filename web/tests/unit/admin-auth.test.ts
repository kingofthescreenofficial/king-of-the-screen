import { scryptSync } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import { adminCookie, createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";
import { closeDatabaseForTests } from "@/lib/database";

afterEach(() => {
  delete process.env.KOTS_ADMIN_PASSWORD_HASH;
  delete process.env.KOTS_SESSION_SECRET;
  closeDatabaseForTests();
});

describe("admin authentication", () => {
  it("fails closed without configuration", () => {
    expect(verifyAdminPassword("password")).toBe(false);
    expect(() => createAdminSession()).toThrow("ADMIN_CONFIGURATION_UNAVAILABLE");
  });

  it("creates a secure cookie only after valid password verification", () => {
    const salt = "fixture-salt";
    process.env.KOTS_ADMIN_PASSWORD_HASH = `scrypt$${salt}$${scryptSync("fixture-password", salt, 32).toString("hex")}`;
    process.env.KOTS_SESSION_SECRET = "a".repeat(32);
    expect(verifyAdminPassword("fixture-password")).toBe(true);
    expect(verifyAdminPassword("wrong-password")).toBe(false);
    const session = createAdminSession(1_000);
    const cookie = adminCookie(session.token, session.expiresAt);
    expect(cookie).toContain("Path=/admin");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Strict");
  });
});
