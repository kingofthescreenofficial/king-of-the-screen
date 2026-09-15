import { NextResponse } from "next/server";

import { LIVE_MICROTEST_ACCESS_COOKIE, hasValidLiveMicrotestAccess, isLiveMicrotestEnabled } from "@/lib/live-microtest";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? undefined;
  if (!isLiveMicrotestEnabled() || !hasValidLiveMicrotestAccess(token)) return new NextResponse(null, { status: 404 });
  const liveTestPath = `/live-test?${new URLSearchParams({ live_test_token: token! }).toString()}`;
  const response = new NextResponse(null, { headers: { location: liveTestPath }, status: 303 });
  response.cookies.set(LIVE_MICROTEST_ACCESS_COOKIE, token!, {
    httpOnly: true,
    maxAge: 15 * 60,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  return response;
}
