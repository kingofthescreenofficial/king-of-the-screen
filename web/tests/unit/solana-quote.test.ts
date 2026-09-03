import { describe, expect, it } from "vitest";

import { getFreshSolQuote } from "@/lib/solana-quote";

function quoteFetcher(coinbase: unknown, kraken: unknown) {
  return async (url: string) => new Response(JSON.stringify(url.includes("coinbase")
    ? { data: { amount: coinbase } }
    : { error: [], result: { SOLUSD: { c: [kraken] } } }), { status: 200 });
}

describe("server SOL quotes", () => {
  it("accepts two close independent quotes", async () => {
    const quote = await getFreshSolQuote({ fetcher: quoteFetcher("100.00", "101.00"), now: Date.now() });
    expect(quote.usdCents).toBe(10_050);
    expect(quote.version).toContain("coinbase-kraken");
  });

  it("rejects materially divergent quotes", async () => {
    await expect(getFreshSolQuote({ fetcher: quoteFetcher("100.00", "110.00"), now: Date.now() }))
      .rejects.toThrow("DIVERGENT_PRICE_QUOTE");
  });
});
