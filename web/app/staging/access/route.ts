import { NextResponse } from "next/server";

import { isStagingMode } from "@/lib/feature-flags";
import { STAGING_ACCESS_COOKIE, hasValidStagingAccess } from "@/lib/staging-access";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? undefined;
  if (!isStagingMode() || !hasValidStagingAccess(token)) return new NextResponse(null, { status: 404 });
  const stagingUrl = new URL("/staging", request.url);
  stagingUrl.searchParams.set("staging_access_token", token!);
  const response = NextResponse.redirect(stagingUrl, 303);
  response.cookies.set(STAGING_ACCESS_COOKIE, token!, {
    httpOnly: true,
    maxAge: 30 * 60,
    path: "/",
    sameSite: "lax",
    secure: false,
  });
  return response;
}
