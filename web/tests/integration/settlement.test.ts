import { beforeEach, describe, expect, it } from "vitest";

import { closeDatabaseForTests, getDatabase } from "@/lib/database";
import { settleVerifiedPayment } from "@/lib/settlement";

const now = 1_000;

beforeEach(() => {
  closeDatabaseForTests();
  getDatabase().exec("DELETE FROM settlement_recoveries; DELETE FROM outbox_events; DELETE FROM nft_mints; DELETE FROM reward_jobs; DELETE FROM reigns; DELETE FROM payments; DELETE FROM payment_intents;");
});

function reservedIntent(id = "intent") {
  getDatabase().prepare("INSERT INTO payment_intents (id, status, expires_at, created_at, updated_at) VALUES (?, 'RESERVED', ?, ?, ?)").run(id, 2_000, now, now);
}

describe("durable settlement", () => {
  it("creates one payment, reign and outbox event", () => {
    reservedIntent();
    const result = settleVerifiedPayment({ intentId: "intent", signature: "signature", landedAt: 1_500, now });
    expect(result.status).toBe("SETTLED");
    expect(getDatabase().prepare("SELECT COUNT(*) AS count FROM payments WHERE status = 'SETTLED'").get()).toEqual({ count: 1 });
    expect(getDatabase().prepare("SELECT COUNT(*) AS count FROM reigns").get()).toEqual({ count: 1 });
    expect(getDatabase().prepare("SELECT COUNT(*) AS count FROM outbox_events WHERE event_type = 'reign.created'").get()).toEqual({ count: 1 });
    expect(getDatabase().prepare("SELECT COUNT(*) AS count FROM reward_jobs WHERE status = 'PENDING_LAUNCH'").get()).toEqual({ count: 1 });
    expect(getDatabase().prepare("SELECT COUNT(*) AS count FROM outbox_events WHERE event_type = 'status-nft.requested'").get()).toEqual({ count: 1 });
  });

  it("returns the original payment on replay", () => {
    reservedIntent();
    const first = settleVerifiedPayment({ intentId: "intent", signature: "signature", landedAt: 1_500, now });
    const replay = settleVerifiedPayment({ intentId: "intent", signature: "signature", landedAt: 1_500, now: 1_100 });
    expect(replay).toMatchObject({ status: "SETTLED", paymentId: first.paymentId });
    expect(getDatabase().prepare("SELECT COUNT(*) AS count FROM outbox_events").get()).toEqual({ count: 2 });
    expect(getDatabase().prepare("SELECT COUNT(*) AS count FROM reward_jobs").get()).toEqual({ count: 1 });
  });

  it("records late payment for recovery without a reign", () => {
    reservedIntent();
    expect(settleVerifiedPayment({ intentId: "intent", signature: "late", landedAt: 2_001, now: 2_100 })).toMatchObject({ status: "RECOVERY", reason: "late_payment" });
    expect(getDatabase().prepare("SELECT COUNT(*) AS count FROM settlement_recoveries WHERE reason_code = 'late_payment'").get()).toEqual({ count: 1 });
    expect(getDatabase().prepare("SELECT COUNT(*) AS count FROM reigns").get()).toEqual({ count: 0 });
  });
});
