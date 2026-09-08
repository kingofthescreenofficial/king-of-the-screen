import { afterEach, describe, expect, it } from "vitest";

import { STAGING_ACCESS_COOKIE, hasStagingAccessFromCookieHeader, hasValidStagingAccess } from "@/lib/staging-access";

const originalToken = process.env.STAGING_ACCESS_TOKEN;

afterEach(() => {
  if (originalToken === undefined) delete process.env.STAGING_ACCESS_TOKEN;
  else process.env.STAGING_ACCESS_TOKEN = originalToken;
});

describe("staging access", () => {
  it("fails closed without an exact configured token", () => {
    process.env.STAGING_ACCESS_TOKEN = "test-token";

    expect(hasValidStagingAccess(undefined)).toBe(false);
    expect(hasValidStagingAccess("wrong-token")).toBe(false);
    expect(hasStagingAccessFromCookieHeader(`${STAGING_ACCESS_COOKIE}=wrong-token`)).toBe(false);
    expect(hasStagingAccessFromCookieHeader(`other=value; ${STAGING_ACCESS_COOKIE}=test-token`)).toBe(true);
  });

  it("fails closed when no staging token is configured", () => {
    delete process.env.STAGING_ACCESS_TOKEN;
    expect(hasValidStagingAccess("test-token")).toBe(false);
  });
});
