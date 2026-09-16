import { NextResponse } from "next/server";

import { hasPrivateCaptureAccess, isLiveMicrotestEnabled } from "@/lib/live-microtest";
import { settlePrivateCapture } from "@/lib/private-capture";

export async function POST(request: Request) {
  if (!isLiveMicrotestEnabled() || !hasPrivateCaptureAccess(request.headers.get("cookie"))) return NextResponse.json({ code: "PRIVATE_CAPTURE_DISABLED" }, { status: 404 });
  try {
    const body = await request.json() as { intentId?: unknown; signature?: unknown };
    const result = await settlePrivateCapture(body.intentId, body.signature);
    if (result.status === "PENDING") return NextResponse.json(result, { status: 202 });
    if (result.status === "REJECTED") return NextResponse.json(result, { status: 422 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ code: "PRIVATE_CAPTURE_SETTLEMENT_FAILED", error: "The transaction could not be settled." }, { status: 503 });
  }
}
