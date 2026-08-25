import { NextRequest, NextResponse } from "next/server";
import { resetToGenesis } from "@/lib/state";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "king_admin_purge_secret_2026";

function handlePurge(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = req.headers.get("x-admin-secret") || searchParams.get("secret");
  const fullReset = searchParams.get("full") === "true";

  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized. Invalid secret key." }, { status: 401 });
  }

  const state = resetToGenesis(fullReset);

  return NextResponse.json({
    success: true,
    message: fullReset
      ? "Full platform reset executed. All stats and screen set back to Genesis."
      : "Emergency takedown executed. The screen has been reset to Genesis King.",
    state,
  });
}

export async function GET(req: NextRequest) {
  return handlePurge(req);
}

export async function POST(req: NextRequest) {
  return handlePurge(req);
}
