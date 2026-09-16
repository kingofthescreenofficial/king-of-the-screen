import { randomUUID } from "node:crypto";

import { getDatabase, withImmediateTransaction } from "@/lib/database";
import { advanceAuctionState, getAppState, synchronizeRuntimeState } from "@/lib/state";
import { buildStagingPaymentPreview } from "@/lib/staging-payment";
import { verifySolanaPayment } from "@/lib/blockchain";
import { fetchFinalizedSolanaPayment } from "@/lib/solana-settlement";

const RESERVATION_TTL_MS = 5 * 60 * 1000;

export type PrivateCaptureIntent = {
  id: string; nonce: string; expiresAt: number; totalLamports: number; treasuryLamports: number;
  operationsVaultLamports: number; serializedTransaction: string;
};

type CaptureRow = {
  id: string; status: string; buyer_wallet: string; nickname: string; tagline: string; link_url: string | null;
  price_usd_cents: number; treasury_address: string; operations_vault_address: string; treasury_lamports: number;
  operations_vault_lamports: number; nonce: string; expires_at: number; created_at: number; signature: string | null; content_submission_id: string;
};

export function createPrivateCaptureIntent(input: {
  walletAddress: unknown; contentSubmissionId: unknown; priceUsdCents: number;
  solUsdCents: number; treasuryAddress: string; operationsVaultAddress: string; recentBlockhash: string; now?: number;
}): PrivateCaptureIntent {
  if (typeof input.walletAddress !== "string" || typeof input.contentSubmissionId !== "string") throw new Error("INVALID_CAPTURE_CONTENT");
  const walletAddress = input.walletAddress.trim();
  const submission = getDatabase().prepare("SELECT id, nickname, tagline, link_url FROM content_submissions WHERE id = ? AND status = 'APPROVED'").get(input.contentSubmissionId) as { id: string; nickname: string; tagline: string; link_url: string | null } | undefined;
  if (!submission) throw new Error("CONTENT_NOT_APPROVED");
  if (!Number.isSafeInteger(input.priceUsdCents) || input.priceUsdCents < 1 || !Number.isSafeInteger(input.solUsdCents) || input.solUsdCents < 1) throw new Error("INVALID_CAPTURE_PRICE");
  const now = input.now ?? Date.now();
  const totalLamports = Math.ceil((input.priceUsdCents * 1_000_000_000) / input.solUsdCents);
  const id = randomUUID();
  const nonce = randomUUID();
  const expiresAt = now + RESERVATION_TTL_MS;
  const preview = buildStagingPaymentPreview({ buyerWallet: walletAddress, treasuryAddress: input.treasuryAddress, operationsVaultAddress: input.operationsVaultAddress, totalLamports, recentBlockhash: input.recentBlockhash, memo: `kots:private-capture:${id}:${nonce}` });
  return withImmediateTransaction((database) => {
    database.prepare("UPDATE private_capture_intents SET status = 'EXPIRED', updated_at = ? WHERE status = 'RESERVED' AND expires_at < ?").run(now, now);
    const active = database.prepare("SELECT id FROM private_capture_intents WHERE status = 'RESERVED' AND expires_at >= ? LIMIT 1").get(now);
    if (active) throw new Error("PRIVATE_CAPTURE_RESERVED");
    database.prepare(`INSERT INTO private_capture_intents (id, status, buyer_wallet, nickname, tagline, link_url, price_usd_cents, sol_usd_cents, total_lamports, treasury_lamports, operations_vault_lamports, treasury_address, operations_vault_address, nonce, expires_at, serialized_transaction, content_submission_id, created_at, updated_at) VALUES (?, 'RESERVED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, walletAddress, submission.nickname, submission.tagline, submission.link_url, input.priceUsdCents, input.solUsdCents, preview.totalLamports, preview.treasuryLamports, preview.operationsVaultLamports, input.treasuryAddress, input.operationsVaultAddress, nonce, expiresAt, preview.serializedTransaction, submission.id, now, now);
    return { id, nonce, expiresAt, ...preview };
  });
}

export async function settlePrivateCapture(intentId: unknown, signature: unknown): Promise<{ status: "SETTLED"; king: string } | { status: "PENDING" | "REJECTED"; code: string }> {
  if (typeof intentId !== "string" || typeof signature !== "string") return { status: "REJECTED", code: "INVALID_CAPTURE_REQUEST" };
  const database = getDatabase();
  const intent = database.prepare("SELECT * FROM private_capture_intents WHERE id = ?").get(intentId) as CaptureRow | undefined;
  if (!intent) return { status: "REJECTED", code: "CAPTURE_NOT_FOUND" };
  if (intent.status === "SETTLED") return { status: "SETTLED", king: intent.nickname };
  if (intent.status !== "RESERVED") return { status: "REJECTED", code: "CAPTURE_NOT_ACTIVE" };
  const rpcUrl = process.env.SOLANA_RPC_URL;
  if (!rpcUrl) return { status: "REJECTED", code: "SOLANA_RPC_UNAVAILABLE" };
  const transaction = await fetchFinalizedSolanaPayment(rpcUrl, signature);
  if (!transaction) return { status: "PENDING", code: "NOT_FINALIZED" };
  const alreadyUsed = database.prepare("SELECT id FROM private_capture_intents WHERE signature = ?").get(signature);
  const verification = verifySolanaPayment(transaction, { id: intent.id, nonce: intent.nonce, memo: `kots:private-capture:${intent.id}:${intent.nonce}`, buyerWallet: intent.buyer_wallet, treasuryAddress: intent.treasury_address, operationsVaultAddress: intent.operations_vault_address, treasuryLamports: intent.treasury_lamports, operationsVaultLamports: intent.operations_vault_lamports, createdAt: intent.created_at, expiresAt: intent.expires_at }, { signatureAlreadyUsed: Boolean(alreadyUsed) });
  if (!verification.valid) return { status: "REJECTED", code: verification.code };
  return withImmediateTransaction((transactionDatabase) => {
    const current = transactionDatabase.prepare("SELECT * FROM private_capture_intents WHERE id = ?").get(intent.id) as CaptureRow;
    if (current.status === "SETTLED") return { status: "SETTLED" as const, king: current.nickname };
    const transition = advanceAuctionState(getAppState(), { nickname: current.nickname, tagline: current.tagline, link: current.link_url ?? undefined, mediaUrl: `/api/media/${current.content_submission_id}`, mediaType: "image", paidAmountUsd: current.price_usd_cents / 100, paidCryptoAmount: (current.treasury_lamports + current.operations_vault_lamports) / 1_000_000_000, cryptoCurrency: "SOL", countryCode: "🔒", rewardWalletAddress: current.buyer_wallet, txHash: signature }, Date.now(), { expectedPriceUsdCents: current.price_usd_cents, keepNextPrice: true });
    if (!transition.success) throw new Error(transition.error ?? "CAPTURE_TRANSITION_FAILED");
    transactionDatabase.prepare("UPDATE private_capture_intents SET status = 'SETTLED', signature = ?, updated_at = ? WHERE id = ? AND status = 'RESERVED'").run(signature, Date.now(), current.id);
    transactionDatabase.prepare("UPDATE content_submissions SET status = 'CROWNED', settled_at = ?, updated_at = ? WHERE id = ? AND status = 'APPROVED'").run(Date.now(), Date.now(), current.content_submission_id);
    transactionDatabase.prepare("INSERT INTO auction_state (id, state_json, created_at, updated_at) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at").run(JSON.stringify(transition.state), Date.now(), Date.now());
    synchronizeRuntimeState(transition.state);
    return { status: "SETTLED" as const, king: current.nickname };
  });
}
