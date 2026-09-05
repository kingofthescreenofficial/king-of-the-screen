import { Connection } from "@solana/web3.js";
import { NextResponse } from "next/server";

import { getApprovedContentSubmission } from "@/lib/content-submissions";
import { isStagingMode } from "@/lib/feature-flags";
import { buildStagingPaymentPreview } from "@/lib/staging-payment";

const STAGING_TOTAL_LAMPORTS = 5_000_000;

export async function POST(request: Request) {
  if (!isStagingMode()) return NextResponse.json({ code: "STAGING_DISABLED", error: "Staging is unavailable." }, { status: 404 });
  try {
    const body = await request.json() as { walletAddress?: unknown; contentSubmissionId?: unknown };
    if (typeof body.walletAddress !== "string" || !body.walletAddress.trim()) throw new Error("INVALID_WALLET");
    if (typeof body.contentSubmissionId !== "string" || !getApprovedContentSubmission(body.contentSubmissionId)) throw new Error("INVALID_CONTENT_SUBMISSION");
    const treasuryAddress = process.env.SOLANA_TREASURY_ADDRESS;
    const operationsVaultAddress = process.env.SOLANA_OPERATIONS_VAULT_ADDRESS;
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!treasuryAddress || !operationsVaultAddress || !rpcUrl) throw new Error("STAGING_CONFIGURATION_UNAVAILABLE");
    const { blockhash } = await new Connection(rpcUrl, "confirmed").getLatestBlockhash("confirmed");
    const preview = buildStagingPaymentPreview({
      buyerWallet: body.walletAddress.trim(),
      treasuryAddress,
      operationsVaultAddress,
      totalLamports: STAGING_TOTAL_LAMPORTS,
      recentBlockhash: blockhash,
      memo: `kots:staging:${crypto.randomUUID()}`,
    });
    return NextResponse.json({ cluster: "devnet", preview });
  } catch (error) {
    const code = error instanceof Error ? error.message : "STAGING_PREVIEW_FAILED";
    const status = code === "INVALID_WALLET" || code === "INVALID_CONTENT_SUBMISSION" ? 400 : 503;
    return NextResponse.json({ code, error: "A staging payment preview could not be prepared." }, { status });
  }
}
