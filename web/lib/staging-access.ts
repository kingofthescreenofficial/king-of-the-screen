import { timingSafeEqual } from "node:crypto";

export const STAGING_ACCESS_COOKIE = "kots_staging_access";

export function hasValidStagingAccess(token: string | undefined): boolean {
  const expected = process.env.STAGING_ACCESS_TOKEN;
  if (!token || !expected) return false;
  const actualBytes = Buffer.from(token);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

export function hasStagingAccessFromCookieHeader(cookieHeader: string | null): boolean {
  const token = cookieHeader?.match(new RegExp(`(?:^|;\\s*)${STAGING_ACCESS_COOKIE}=([^;]+)`))?.[1];
  return hasValidStagingAccess(token);
}
