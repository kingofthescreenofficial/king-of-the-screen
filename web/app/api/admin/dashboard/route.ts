import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { code: "ADMIN_AUTH_REQUIRED", error: "Admin access is temporarily unavailable." },
    { status: 401 },
  );
}
