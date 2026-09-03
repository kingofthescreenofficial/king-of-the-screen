import { NextResponse } from "next/server";
import { requireAdminMutation } from "@/lib/admin-auth";

function unavailable() {
  return NextResponse.json(
    { code: "ADMIN_AUTH_REQUIRED", error: "Admin access is temporarily unavailable." },
    { status: 401 },
  );
}

export async function GET() {
  return unavailable();
}

export async function POST(request?: Request) {
  if (!request || !requireAdminMutation(request)) return unavailable();
  return NextResponse.json({ code: "TAKEDOWN_NOT_READY", error: "Takedown is temporarily unavailable." }, { status: 503 });
}
