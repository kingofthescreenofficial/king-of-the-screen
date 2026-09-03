import { NextResponse } from "next/server";

import { isPaidTakeoverEnabled } from "@/lib/feature-flags";
import { createWalletChallenge } from "@/lib/payment-protocol";

export async function POST(request: Request) {
  if (!isPaidTakeoverEnabled()) {
    return NextResponse.json(
      { code: "PAYMENTS_DISABLED", error: "Paid takeovers are temporarily paused." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json() as { walletAddress?: unknown };
    if (typeof body.walletAddress !== "string") throw new Error("INVALID_WALLET");
    return NextResponse.json(createWalletChallenge(body.walletAddress), { status: 201 });
  } catch {
    return NextResponse.json({ code: "INVALID_WALLET", error: "A valid Solana wallet address is required." }, { status: 400 });
  }
}
