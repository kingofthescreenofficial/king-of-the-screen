const MAX_QUOTE_AGE_MS = 60_000;
const MAX_DIVERGENCE_BPS = 200;

export type SolQuote = {
  usdCents: number;
  fetchedAt: number;
  version: string;
};

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

function toCents(value: unknown): number {
  const amount = typeof value === "string" || typeof value === "number" ? Number(value) : Number.NaN;
  const cents = Math.round(amount * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("INVALID_PRICE_QUOTE");
  return cents;
}

async function readCoinbase(fetcher: FetchLike): Promise<number> {
  const response = await fetcher("https://api.coinbase.com/v2/prices/SOL-USD/spot", { cache: "no-store" });
  if (!response.ok) throw new Error("COINBASE_QUOTE_UNAVAILABLE");
  const body = await response.json() as { data?: { amount?: unknown } };
  return toCents(body.data?.amount);
}

async function readKraken(fetcher: FetchLike): Promise<number> {
  const response = await fetcher("https://api.kraken.com/0/public/Ticker?pair=SOLUSD", { cache: "no-store" });
  if (!response.ok) throw new Error("KRAKEN_QUOTE_UNAVAILABLE");
  const body = await response.json() as { error?: unknown[]; result?: Record<string, { c?: unknown[] }> };
  if (body.error?.length || !body.result) throw new Error("KRAKEN_QUOTE_UNAVAILABLE");
  const ticker = Object.values(body.result)[0];
  return toCents(ticker?.c?.[0]);
}

export async function getFreshSolQuote(options: { fetcher?: FetchLike; now?: number } = {}): Promise<SolQuote> {
  const fetcher = options.fetcher ?? fetch;
  const fetchedAt = options.now ?? Date.now();
  const [coinbaseCents, krakenCents] = await Promise.all([readCoinbase(fetcher), readKraken(fetcher)]);
  const lower = Math.min(coinbaseCents, krakenCents);
  const divergenceBps = Math.round(((Math.max(coinbaseCents, krakenCents) - lower) * 10_000) / lower);
  if (divergenceBps > MAX_DIVERGENCE_BPS) throw new Error("DIVERGENT_PRICE_QUOTE");
  if (Date.now() - fetchedAt > MAX_QUOTE_AGE_MS) throw new Error("STALE_PRICE_QUOTE");
  return {
    usdCents: Math.round((coinbaseCents + krakenCents) / 2),
    fetchedAt,
    version: `coinbase-kraken:${fetchedAt}`,
  };
}
