import { timingSafeEqual } from "node:crypto";

export const LIVE_MICROTEST_ACCESS_COOKIE = "kots_live_microtest_access";
export const LIVE_MICROTEST_AMOUNT_USD_CENTS = 95;

function matches(value: string | undefined, expected: string | undefined): boolean {
  if (!value || !expected) return false;
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isLiveMicrotestEnabled(): boolean {
  return process.env.LIVE_MICROTEST_ENABLED === "true" && process.env.SOLANA_CLUSTER === "mainnet-beta";
}

export function isPublicPrivateCaptureEnabled(): boolean {
  return isLiveMicrotestEnabled() && process.env.PUBLIC_PRIVATE_CAPTURE_ENABLED === "true";
}

export function hasValidLiveMicrotestAccess(token: string | undefined): boolean {
  return matches(token, process.env.LIVE_MICROTEST_ACCESS_TOKEN);
}

export function hasLiveMicrotestAccessFromCookieHeader(cookieHeader: string | null): boolean {
  const token = cookieHeader?.match(new RegExp(`(?:^|;\\s*)${LIVE_MICROTEST_ACCESS_COOKIE}=([^;]+)`))?.[1];
  return hasValidLiveMicrotestAccess(token);
}

export function hasPrivateCaptureAccess(cookieHeader: string | null): boolean {
  return isPublicPrivateCaptureEnabled() || hasLiveMicrotestAccessFromCookieHeader(cookieHeader);
}
