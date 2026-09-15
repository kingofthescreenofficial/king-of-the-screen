import { Connection } from "@solana/web3.js";
import { NextResponse } from "next/server";

import { buildStagingPaymentPreview } from "@/lib/staging-payment";
import { LIVE_MICROTEST_AMOUNT_USD_CENTS, hasLiveMicrotestAccessFromCookieHeader, isLiveMicrotestEnabled } from "@/lib/live-microtest";
import { getFreshSolQuote } from "@/lib/solana-quote";

export async function POST(request: Request) {
  if (!isLiveMicrotestEnabled() || !hasLiveMicrotestAccessFromCookieHeader(request.headers.get("cookie"))) {
    return NextResponse.json({ code: "LIVE_TEST_DISABLED" }, { status: 404 });
  }
  try {
    const body = await request.json() as { walletAddress?: unknown };
    if (typeof body.walletAddress !== "string" || !body.walletAddress.trim()) throw new Error("INVALID_WALLET");
    const treasuryAddress = process.env.SOLANA_TREASURY_ADDRESS;
    const operationsVaultAddress = process.env.SOLANA_OPERATIONS_VAULT_ADDRESS;
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!treasuryAddress || !operationsVaultAddress || !rpcUrl) throw new Error("LIVE_TEST_CONFIGURATION_UNAVAILABLE");
    const [quote, latestBlockhash] = await Promise.all([
      getFreshSolQuote(),
      new Connection(rpcUrl, "confirmed").getLatestBlockhash("confirmed"),
    ]);
    const totalLamports = Math.ceil((LIVE_MICROTEST_AMOUNT_USD_CENTS * 1_000_000_000) / quote.usdCents);
    const preview = buildStagingPaymentPreview({
      buyerWallet: body.walletAddress.trim(),
      treasuryAddress,
      operationsVaultAddress,
      totalLamports,
      recentBlockhash: latestBlockhash.blockhash,
      memo: `kots:live-microtest:${crypto.randomUUID()}`,
    });
    return NextResponse.json({ amountUsdCents: LIVE_MICROTEST_AMOUNT_USD_CENTS, cluster: "mainnet-beta", preview });
  } catch (error) {
    const code = error instanceof Error ? error.message : "LIVE_TEST_PREVIEW_FAILED";
    return NextResponse.json({ code, error: "The live microtest could not be prepared." }, { status: code === "INVALID_WALLET" ? 400 : 503 });
  }
}
