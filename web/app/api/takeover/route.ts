import { NextResponse } from "next/server";

import { verifySolanaPayment, type StoredPaymentIntent } from "@/lib/blockchain";
import { getDatabase } from "@/lib/database";
import { isAuctionSettlementEnabled, isPaidTakeoverEnabled } from "@/lib/feature-flags";
import { fetchFinalizedSolanaPayment } from "@/lib/solana-settlement";
import { settleVerifiedPayment } from "@/lib/settlement";

function requireString(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 200) throw new Error("INVALID_SETTLEMENT_REQUEST");
  return value.trim();
}

export async function POST(request: Request) {
  if (!isPaidTakeoverEnabled()) {
    return NextResponse.json({ code: "PAYMENTS_DISABLED", error: "Paid takeovers are temporarily paused." }, { status: 503 });
  }
  if (!isAuctionSettlementEnabled()) {
    return NextResponse.json({ code: "SETTLEMENT_DISABLED", error: "Payment confirmation is temporarily paused." }, { status: 503 });
  }
  try {
    const body = await request.json() as { intentId?: unknown; signature?: unknown };
    const intentId = requireString(body.intentId);
    const signature = requireString(body.signature);
    const intent = getDatabase().prepare(`
      SELECT id, nonce, buyer_wallet, treasury_address, hot_wallet_address, treasury_lamports, hot_wallet_lamports, created_at, expires_at
      FROM payment_intents WHERE id = ?
    `).get(intentId) as {
      id: string; nonce: string; buyer_wallet: string; treasury_address: string; hot_wallet_address: string;
      treasury_lamports: number; hot_wallet_lamports: number; created_at: number; expires_at: number;
    } | undefined;
    if (!intent) return NextResponse.json({ code: "INTENT_NOT_FOUND", error: "Payment intent was not found." }, { status: 404 });
    const duplicate = getDatabase().prepare("SELECT intent_id FROM payments WHERE signature = ?").get(signature) as { intent_id: string | null } | undefined;
    if (duplicate && duplicate.intent_id !== intent.id) return NextResponse.json({ code: "REPLAYED_SIGNATURE", error: "Payment signature was already used." }, { status: 409 });
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) throw new Error("SOLANA_RPC_UNAVAILABLE");
    const transaction = await fetchFinalizedSolanaPayment(rpcUrl, signature);
    if (!transaction) return NextResponse.json({ code: "PAYMENT_NOT_FINALIZED", error: "Payment is not finalized yet." }, { status: 409 });
    const verification = verifySolanaPayment(transaction, {
      id: intent.id, nonce: intent.nonce, buyerWallet: intent.buyer_wallet, treasuryAddress: intent.treasury_address,
      operationsVaultAddress: intent.hot_wallet_address, treasuryLamports: intent.treasury_lamports,
      operationsVaultLamports: intent.hot_wallet_lamports, createdAt: intent.created_at, expiresAt: intent.expires_at,
    } satisfies StoredPaymentIntent, { signatureAlreadyUsed: Boolean(duplicate && duplicate.intent_id !== intent.id) });
    if (!verification.valid) return NextResponse.json({ code: verification.code, error: "Payment does not match the approved intent." }, { status: 409 });
    const result = settleVerifiedPayment({ intentId, signature, landedAt: (transaction.blockTime ?? 0) * 1000 });
    return NextResponse.json(result, { status: result.status === "SETTLED" ? 201 : 202 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "SETTLEMENT_FAILED";
    const status = code === "INVALID_SETTLEMENT_REQUEST" ? 400 : code === "SOLANA_RPC_UNAVAILABLE" ? 503 : 500;
    return NextResponse.json({ code, error: "Payment confirmation could not be completed." }, { status });
  }
}
