import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request?: Request) {
  if (!request || !requireAdmin(request)) return NextResponse.json({ code: "ADMIN_AUTH_REQUIRED", error: "Authentication is required." }, { status: 401 });
  return NextResponse.json(
    { capabilities: { paidTakeoverEnabled: false } },
  );
}
