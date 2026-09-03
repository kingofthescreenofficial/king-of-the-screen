import { randomUUID } from "node:crypto";

import { getDatabase, withImmediateTransaction } from "@/lib/database";

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
  return withImmediateTransaction((database) => {
    const existing = database.prepare("SELECT id, status FROM payments WHERE signature = ?").get(input.signature) as { id: string; status: string } | undefined;
    if (existing) return existing.status === "SETTLED" ? { status: "SETTLED", paymentId: existing.id } : { status: "RECOVERY", paymentId: existing.id, reason: "existing_payment" };
    const intent = database.prepare("SELECT id, status, expires_at FROM payment_intents WHERE id = ?").get(input.intentId) as { id: string; status: string; expires_at: number } | undefined;
    if (!intent) throw new Error("INTENT_NOT_FOUND");
    const paymentId = randomUUID();
    database.prepare("INSERT INTO payments (id, intent_id, signature, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").run(paymentId, intent.id, input.signature, "VERIFIED", now, now);
    if (input.landedAt > intent.expires_at) return recordRecovery(paymentId, "late_payment", now);
    if (intent.status !== "RESERVED") return recordRecovery(paymentId, "stale_price_version", now);
    database.prepare("UPDATE payment_intents SET status = 'CONSUMED', updated_at = ? WHERE id = ?").run(now, intent.id);
    const reignId = randomUUID();
    database.prepare("INSERT INTO reigns (id, payment_id, created_at, updated_at) VALUES (?, ?, ?, ?)").run(reignId, paymentId, now, now);
    database.prepare("UPDATE payments SET status = 'SETTLED', updated_at = ? WHERE id = ?").run(now, paymentId);
    database.prepare("INSERT INTO outbox_events (id, event_type, aggregate_id, payload_json, status, created_at, updated_at) VALUES (?, 'reign.created', ?, ?, 'PENDING', ?, ?)").run(randomUUID(), reignId, JSON.stringify({ reignId }), now, now);
    return { status: "SETTLED", paymentId, reignId };
  });
}
