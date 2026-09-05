import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/state/route";
import { POST } from "@/app/api/takeover/route";

describe("public state route", () => {
  it("returns a safe pre-launch projection until the public archive is explicitly enabled", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      mode: "PRE_LAUNCH",
      currentKing: null,
      hallOfFame: [],
      recentEvents: [],
      nextMinPriceUsd: null,
      capabilities: { paidTakeoverEnabled: false },
    });
    expect(body).not.toHaveProperty("walletConfig");
    expect(body).not.toHaveProperty("stats");
  });
});

describe("takeover route validation", () => {
  it("rejects an empty request before it can change the crown", async () => {
    const request = new Request("http://localhost/api/takeover", {
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({
      code: "PAYMENTS_DISABLED",
      error: "Paid takeovers are temporarily paused.",
    });
  });
});
