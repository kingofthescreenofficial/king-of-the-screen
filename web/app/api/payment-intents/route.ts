import { NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";

import { isPaidTakeoverEnabled } from "@/lib/feature-flags";
import { createPaymentIntent, hashNetworkSource } from "@/lib/payment-protocol";
import { getFreshSolQuote } from "@/lib/solana-quote";
import { AUCTION_MANIFEST_V1, getCrownPriceCents } from "@/lib/auction-manifest";
import { getAppState } from "@/lib/state";

type IntentBody = {
  walletAddress?: unknown;
  rewardWalletAddress?: unknown;
  challengeId?: unknown;
  signature?: unknown;
  contentDigest?: unknown;
  termsVersion?: unknown;
};

function requireString(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw new Error("INVALID_INTENT_REQUEST");
  return value.trim();
}

export async function POST(request: Request) {
  if (!isPaidTakeoverEnabled()) {
    return NextResponse.json(
      { code: "PAYMENTS_DISABLED", error: "Paid takeovers are temporarily paused." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json() as IntentBody;
    const termsVersion = requireString(body.termsVersion);
    if (!process.env.KOTS_TERMS_VERSION || termsVersion !== process.env.KOTS_TERMS_VERSION) {
      return NextResponse.json({ code: "STALE_TERMS", error: "Current terms acceptance is required." }, { status: 409 });
    }
    const state = getAppState();
    const nextOrdinal = (state.stats.settledCrownCount ?? 0) + 1;
    if (nextOrdinal > AUCTION_MANIFEST_V1.crownLimit) {
      return NextResponse.json({ code: "CROWN_SERIES_COMPLETE", error: "The 100 Crown series is complete." }, { status: 409 });
    }
    const hotWalletAddress = process.env.SOLANA_HOT_WALLET_ADDRESS;
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!hotWalletAddress || !rpcUrl) throw new Error("PAYMENT_CONFIGURATION_UNAVAILABLE");

    const [quote, latestBlockhash] = await Promise.all([
      getFreshSolQuote(),
      new Connection(rpcUrl, "finalized").getLatestBlockhash("finalized"),
    ]);
    const priceUsdCents = getCrownPriceCents(nextOrdinal);
    const intent = createPaymentIntent({
      walletAddress: requireString(body.walletAddress),
      rewardWalletAddress: requireString(body.rewardWalletAddress),
      challengeId: requireString(body.challengeId),
      signature: requireString(body.signature),
      contentDigest: requireString(body.contentDigest),
      termsVersion,
      sourceHash: hashNetworkSource(request.headers.get("x-forwarded-for") ?? "unknown"),
      quote: { priceUsdCents, solUsdCents: quote.usdCents, priceVersion: AUCTION_MANIFEST_V1.version },
      recipients: { treasuryAddress: state.walletConfig.solanaAddress, hotWalletAddress },
      recentBlockhash: latestBlockhash.blockhash,
    });
    return NextResponse.json(intent, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PAYMENT_INTENT_FAILED";
    const statuses: Record<string, number> = {
      AUCTION_RESERVED: 409,
      INVALID_WALLET_CHALLENGE: 401,
      WALLET_RATE_LIMITED: 429,
      SOURCE_RATE_LIMITED: 429,
      INVALID_INTENT_REQUEST: 400,
      PAYMENT_CONFIGURATION_UNAVAILABLE: 503,
    };
    return NextResponse.json({ code, error: "Payment intent could not be created." }, { status: statuses[code] ?? 503 });
  }
}
