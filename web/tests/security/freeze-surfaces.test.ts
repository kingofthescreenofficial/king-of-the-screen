import { afterEach, describe, expect, it } from "vitest";

import { GET as adminDashboard } from "@/app/api/admin/dashboard/route";
import { GET as takedownGet, POST as takedownPost } from "@/app/api/admin/takedown/route";
import { POST as createPaymentIntent } from "@/app/api/payment-intents/route";
import { POST as createWalletChallenge } from "@/app/api/payment-intents/challenge/route";
import { DELETE as deleteTelemetry, POST as postTelemetry } from "@/app/api/telemetry/route";
import { isPaidTakeoverEnabled } from "@/lib/feature-flags";

const originalPaymentFlag = process.env.PAID_TAKEOVER_ENABLED;

afterEach(() => {
  if (originalPaymentFlag === undefined) {
    delete process.env.PAID_TAKEOVER_ENABLED;
    return;
  }
  process.env.PAID_TAKEOVER_ENABLED = originalPaymentFlag;
});

describe("emergency payment freeze", () => {
  it("requires an explicit true value before paid takeovers are enabled", () => {
    delete process.env.PAID_TAKEOVER_ENABLED;
    expect(isPaidTakeoverEnabled()).toBe(false);

    process.env.PAID_TAKEOVER_ENABLED = "";
    expect(isPaidTakeoverEnabled()).toBe(false);

    process.env.PAID_TAKEOVER_ENABLED = "false";
    expect(isPaidTakeoverEnabled()).toBe(false);

    process.env.PAID_TAKEOVER_ENABLED = "enabled";
    expect(isPaidTakeoverEnabled()).toBe(false);

    process.env.PAID_TAKEOVER_ENABLED = "true";
    expect(isPaidTakeoverEnabled()).toBe(true);
  });

  it("closes payment intent creation while paid takeovers are paused", async () => {
    delete process.env.PAID_TAKEOVER_ENABLED;

    const response = await createPaymentIntent(new Request("http://localhost/api/payment-intents", { method: "POST" }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ code: "PAYMENTS_DISABLED" });
  });

  it("closes wallet challenges while paid takeovers are paused", async () => {
    delete process.env.PAID_TAKEOVER_ENABLED;
    const response = await createWalletChallenge(new Request("http://localhost/api/payment-intents/challenge", {
      method: "POST",
      body: JSON.stringify({ walletAddress: "11111111111111111111111111111111" }),
    }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ code: "PAYMENTS_DISABLED" });
  });
});

describe("frozen privileged endpoints", () => {
  it("rejects unauthenticated admin reads and destructive actions", async () => {
    for (const response of await Promise.all([adminDashboard(), takedownGet(), takedownPost()])) {
      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toMatchObject({ code: "ADMIN_AUTH_REQUIRED" });
    }
  });

  it("rejects signature, authorization and key telemetry before logging", async () => {
    for (const details of [
      { signature: "sensitive" },
      { authorization: "sensitive" },
      { privateKey: "sensitive" },
    ]) {
      const rejected = await postTelemetry(new Request("http://localhost/api/telemetry", {
        body: JSON.stringify({ type: "USER", event: "TRANSACTION_SENT", details }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }));

      expect(rejected.status).toBe(400);
      await expect(rejected.json()).resolves.toMatchObject({ code: "INVALID_TELEMETRY" });
    }

    const deletion = await deleteTelemetry();
    expect(deletion.status).toBe(401);
    await expect(deletion.json()).resolves.toMatchObject({ code: "ADMIN_AUTH_REQUIRED" });
  });
});
