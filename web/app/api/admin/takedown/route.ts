import { NextResponse } from "next/server";

function unavailable() {
  return NextResponse.json(
    { code: "ADMIN_AUTH_REQUIRED", error: "Admin access is temporarily unavailable." },
    { status: 401 },
  );
}

export async function GET() {
  return unavailable();
}

export async function POST() {
  return unavailable();
}
