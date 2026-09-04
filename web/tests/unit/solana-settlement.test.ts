import { describe, expect, it } from "vitest";

import { parseSolanaPayment } from "@/lib/solana-settlement";

describe("Solana settlement RPC parser", () => {
  it("normalizes a jsonParsed transaction and preserves its memo", () => {
    const transaction = parseSolanaPayment("signature", {
      blockTime: 100,
      meta: { err: null, innerInstructions: [] },
      transaction: { message: { accountKeys: [{ pubkey: "buyer" }], instructions: [{ program: "spl-memo", parsed: "kots:intent:id:nonce" }] } },
    });

    expect(transaction).toMatchObject({
      confirmationStatus: "finalized",
      transaction: { message: { accountKeys: ["buyer"], instructions: [{ data: "kots:intent:id:nonce" }] } },
    });
  });

  it("rejects an incomplete RPC response", () => {
    expect(parseSolanaPayment("signature", { meta: { err: null } })).toBeNull();
  });
});
