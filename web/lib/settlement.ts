import { randomUUID } from "node:crypto";

import { getDatabase, withImmediateTransaction } from "@/lib/database";
import { DEFAULT_STATE, advanceAuctionState, synchronizeRuntimeState } from "@/lib/state";
import type { AppState } from "@/lib/types";

export type SettlementInput = { intentId: string; signature: string; landedAt: number; now?: number };
export type SettlementResult = { status: "SETTLED" | "RECOVERY"; paymentId: string; reignId?: string; reason?: string };

export function recordRecovery(paymentId: string, reason: string, now: number): SettlementResult {
  getDatabase().prepare(`
    INSERT INTO settlement_recoveries (id, payment_id, reason_code, status, resolution_history_json, created_at, updated_at)
    VALUES (?, ?, ?, 'OPEN', '[]', ?, ?)
    ON CONFLICT(payment_id) DO NOTHING
  `).run(randomUUID(), paymentId, reason, now, now);
  return { status: "RECOVERY", paymentId, reason };
}

export function settleVerifiedPayment(input: SettlementInput): SettlementResult {
  const now = input.now ?? Date.now();
  const outcome = withImmediateTransaction((database): SettlementResult & { state?: AppState } => {
    const existing = database.prepare("SELECT id, status FROM payments WHERE signature = ?").get(input.signature) as { id: string; status: string } | undefined;
    if (existing) return existing.status === "SETTLED" ? { status: "SETTLED", paymentId: existing.id } : { status: "RECOVERY", paymentId: existing.id, reason: "existing_payment" };
    const intent = database.prepare(`
      SELECT payment_intents.id, payment_intents.status, payment_intents.expires_at, payment_intents.price_usd_cents,
        payment_intents.total_lamports, payment_intents.reward_wallet, payment_intents.content_submission_id,
        content_submissions.nickname, content_submissions.tagline, content_submissions.link_url,
        content_submissions.media_mime, content_submissions.status AS submission_status
      FROM payment_intents
      LEFT JOIN content_submissions ON content_submissions.id = payment_intents.content_submission_id
      WHERE payment_intents.id = ?
    `).get(input.intentId) as {
      id: string; status: string; expires_at: number; price_usd_cents: number; total_lamports: number;
      reward_wallet: string; content_submission_id: string | null; nickname: string | null; tagline: string | null;
      link_url: string | null; media_mime: string | null; submission_status: string | null;
    } | undefined;
    if (!intent) throw new Error("INTENT_NOT_FOUND");
    const paymentId = randomUUID();
    database.prepare("INSERT INTO payments (id, intent_id, signature, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").run(paymentId, intent.id, input.signature, "VERIFIED", now, now);
    if (input.landedAt > intent.expires_at) return recordRecovery(paymentId, "late_payment", now);
    if (intent.status !== "RESERVED") return recordRecovery(paymentId, "stale_price_version", now);
    if (!intent.content_submission_id || intent.submission_status !== "APPROVED" || !intent.nickname || !intent.tagline || !intent.media_mime) return recordRecovery(paymentId, "content_not_approved", now);
    const storedState = database.prepare("SELECT state_json FROM auction_state WHERE id = 1").get() as { state_json: string } | undefined;
    const previousState = storedState ? JSON.parse(storedState.state_json) as AppState : JSON.parse(JSON.stringify(DEFAULT_STATE)) as AppState;
    const transition = advanceAuctionState(previousState, {
      nickname: intent.nickname,
      tagline: intent.tagline,
      link: intent.link_url ?? undefined,
      mediaUrl: `/api/media/${intent.content_submission_id}`,
      mediaType: intent.media_mime === "image/gif" ? "gif" : "image",
      paidAmountUsd: intent.price_usd_cents / 100,
      paidCryptoAmount: intent.total_lamports / 1_000_000_000,
      cryptoCurrency: "SOL",
      countryCode: "🌐",
      rewardWalletAddress: intent.reward_wallet,
      txHash: input.signature,
    }, now);
    if (!transition.success) return recordRecovery(paymentId, transition.error ?? "state_transition_failed", now);
    database.prepare("UPDATE payment_intents SET status = 'CONSUMED', updated_at = ? WHERE id = ?").run(now, intent.id);
    database.prepare("UPDATE content_submissions SET status = 'CROWNED', settled_at = ?, updated_at = ? WHERE id = ?").run(now, now, intent.content_submission_id);
    database.prepare(`
      INSERT INTO auction_state (id, state_json, created_at, updated_at)
      VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at
    `).run(JSON.stringify(transition.state), now, now);
    const reignId = randomUUID();
    database.prepare("INSERT INTO reigns (id, payment_id, created_at, updated_at) VALUES (?, ?, ?, ?)").run(reignId, paymentId, now, now);
    database.prepare("UPDATE payments SET status = 'SETTLED', updated_at = ? WHERE id = ?").run(now, paymentId);
    database.prepare("INSERT INTO outbox_events (id, event_type, aggregate_id, payload_json, status, created_at, updated_at) VALUES (?, 'reign.created', ?, ?, 'PENDING', ?, ?)").run(randomUUID(), reignId, JSON.stringify({ reignId }), now, now);
    const rewardJobId = randomUUID();
    database.prepare("INSERT INTO reward_jobs (id, idempotency_key, status, created_at, updated_at) VALUES (?, ?, 'PENDING_LAUNCH', ?, ?)").run(rewardJobId, `status-nft:${reignId}`, now, now);
    database.prepare("INSERT INTO outbox_events (id, event_type, aggregate_id, payload_json, status, created_at, updated_at) VALUES (?, 'status-nft.requested', ?, ?, 'PENDING', ?, ?)").run(randomUUID(), rewardJobId, JSON.stringify({ reignId, rewardJobId }), now, now);
    return { status: "SETTLED", paymentId, reignId, state: transition.state };
  });
  if (outcome.state) synchronizeRuntimeState(outcome.state);
  if (outcome.status === "SETTLED") return outcome.reignId ? { status: outcome.status, paymentId: outcome.paymentId, reignId: outcome.reignId } : { status: outcome.status, paymentId: outcome.paymentId };
  return outcome.reason ? { status: outcome.status, paymentId: outcome.paymentId, reason: outcome.reason } : { status: outcome.status, paymentId: outcome.paymentId };
}
