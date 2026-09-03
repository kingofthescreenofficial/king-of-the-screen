import { NextResponse } from "next/server";

import { adminCookie, createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { password?: unknown };
    if (typeof body.password !== "string" || body.password.length > 256 || !verifyAdminPassword(body.password)) {
      return NextResponse.json({ code: "INVALID_CREDENTIALS", error: "Login failed." }, { status: 401 });
    }
    const session = createAdminSession();
    const response = NextResponse.json({ csrfToken: session.csrfToken });
    response.headers.set("Set-Cookie", adminCookie(session.token, session.expiresAt));
    return response;
  } catch {
    return NextResponse.json({ code: "LOGIN_UNAVAILABLE", error: "Login failed." }, { status: 503 });
  }
}
