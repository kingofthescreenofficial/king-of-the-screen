import { NextResponse } from "next/server";

import { isPaidTakeoverEnabled } from "@/lib/feature-flags";

export async function POST() {
  if (!isPaidTakeoverEnabled()) {
    return NextResponse.json(
      { code: "PAYMENTS_DISABLED", error: "Paid takeovers are temporarily paused." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { code: "PAYMENT_INTENTS_NOT_READY", error: "Payment intent creation is not available." },
    { status: 503 },
  );
}
