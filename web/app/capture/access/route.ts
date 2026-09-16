import { NextResponse } from "next/server";

import { LIVE_MICROTEST_ACCESS_COOKIE, hasValidLiveMicrotestAccess, isLiveMicrotestEnabled } from "@/lib/live-microtest";

export function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? undefined;
  if (!isLiveMicrotestEnabled() || !hasValidLiveMicrotestAccess(token)) return new NextResponse("Not found", { status: 404 });
  const publicOrigin = process.env.KOTS_PUBLIC_ORIGIN;
  if (!publicOrigin) return new NextResponse("Not found", { status: 404 });
  const home = new URL("/", publicOrigin);
  home.searchParams.set("private_capture", "1");
  home.searchParams.set("capture_token", token!);
  const response = NextResponse.redirect(home);
  response.cookies.set(LIVE_MICROTEST_ACCESS_COOKIE, token!, { httpOnly: true, sameSite: "strict", secure: true, path: "/", maxAge: 60 * 30 });
  return response;
}
