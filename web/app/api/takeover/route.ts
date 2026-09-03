import { NextResponse } from "next/server";

import { isPaidTakeoverEnabled } from "@/lib/feature-flags";

export async function POST(_request?: Request) {
  if (!isPaidTakeoverEnabled()) {
    return NextResponse.json({ code: "PAYMENTS_DISABLED", error: "Paid takeovers are temporarily paused." }, { status: 503 });
  }
  return NextResponse.json({ code: "PAYMENT_CONFIRMATION_NOT_READY", error: "Payment confirmation is temporarily unavailable." }, { status: 503 });
}
