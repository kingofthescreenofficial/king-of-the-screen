import { Connection } from "@solana/web3.js";
import { NextResponse } from "next/server";

import { LIVE_MICROTEST_AMOUNT_USD_CENTS, hasPrivateCaptureAccess, isLiveMicrotestEnabled } from "@/lib/live-microtest";
import { createPrivateCaptureIntent } from "@/lib/private-capture";
import { getFreshSolQuote } from "@/lib/solana-quote";

export async function POST(request: Request) {
  if (!isLiveMicrotestEnabled() || !hasPrivateCaptureAccess(request.headers.get("cookie"))) return NextResponse.json({ code: "PRIVATE_CAPTURE_DISABLED" }, { status: 404 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const treasuryAddress = process.env.SOLANA_TREASURY_ADDRESS;
    const operationsVaultAddress = process.env.SOLANA_OPERATIONS_VAULT_ADDRESS;
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!treasuryAddress || !operationsVaultAddress || !rpcUrl) throw new Error("PRIVATE_CAPTURE_CONFIGURATION_UNAVAILABLE");
    const [quote, blockhash] = await Promise.all([getFreshSolQuote(), new Connection(rpcUrl, "confirmed").getLatestBlockhash("confirmed")]);
    const intent = createPrivateCaptureIntent({ walletAddress: body.walletAddress, nickname: body.nickname, tagline: body.tagline, linkUrl: body.linkUrl, priceUsdCents: LIVE_MICROTEST_AMOUNT_USD_CENTS, solUsdCents: quote.usdCents, treasuryAddress, operationsVaultAddress, recentBlockhash: blockhash.blockhash });
    return NextResponse.json({ ...intent, amountUsdCents: LIVE_MICROTEST_AMOUNT_USD_CENTS, cluster: "mainnet-beta" }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PRIVATE_CAPTURE_PREPARATION_FAILED";
    const status = ["INVALID_CAPTURE_CONTENT", "INVALID_CAPTURE_PRICE"].includes(code) ? 400 : code === "PRIVATE_CAPTURE_RESERVED" ? 409 : 503;
    return NextResponse.json({ code, error: "The private capture could not be prepared." }, { status });
  }
}
