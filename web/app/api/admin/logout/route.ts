import { NextResponse } from "next/server";

import { revokeAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  revokeAdminSession(request);
  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", "kots_admin_session=; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
  return response;
}
