import type { ParsedInstruction, SolanaPaymentFixture } from "@/lib/blockchain";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : null;
}

function string(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parsedInstruction(value: unknown): ParsedInstruction | null {
  const item = record(value);
  if (!item) return null;
  const parsedText = string(item.parsed);
  const parsed = record(item.parsed) ? {
    type: string(record(item.parsed)?.type),
    info: record(record(item.parsed)?.info) ? {
      source: string(record(record(item.parsed)?.info)?.source),
      destination: string(record(record(item.parsed)?.info)?.destination),
      lamports: typeof record(record(item.parsed)?.info)?.lamports === "number" ? record(record(item.parsed)?.info)?.lamports as number : undefined,
    } : undefined,
  } : undefined;
  return { program: string(item.program), programId: string(item.programId), parsed, data: string(item.data) ?? parsedText };
}

export function parseSolanaPayment(signature: string, value: unknown): SolanaPaymentFixture | null {
  const root = record(value);
  const transaction = record(root?.transaction);
  const message = record(transaction?.message);
  const meta = record(root?.meta);
  const accountKeys = Array.isArray(message?.accountKeys) ? message?.accountKeys : null;
  const instructions = Array.isArray(message?.instructions) ? message?.instructions.map(parsedInstruction) : null;
  if (!transaction || !message || !meta || !accountKeys?.length || !instructions || instructions.some((instruction) => !instruction)) return null;
  const normalizedKeys = accountKeys.map((key) => typeof key === "string" ? key : string(record(key)?.pubkey)).filter((key): key is string => Boolean(key));
  if (normalizedKeys.length !== accountKeys.length) return null;
  const blockTime = root?.blockTime;
  if (blockTime !== null && typeof blockTime !== "number") return null;
  return {
    signature,
    confirmationStatus: "finalized",
    blockTime: blockTime ?? null,
    meta: { err: meta.err ?? null, innerInstructions: Array.isArray(meta.innerInstructions) ? meta.innerInstructions : null },
    transaction: { message: { accountKeys: normalizedKeys, instructions: instructions as ParsedInstruction[] } },
  };
}

export async function fetchFinalizedSolanaPayment(rpcUrl: string, signature: string): Promise<SolanaPaymentFixture | null> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getTransaction", params: [signature, { encoding: "jsonParsed", commitment: "finalized", maxSupportedTransactionVersion: 0 }] }),
  });
  if (!response.ok) throw new Error("SOLANA_RPC_UNAVAILABLE");
  const body = await response.json() as { error?: unknown; result?: unknown };
  if (body.error) throw new Error("SOLANA_RPC_UNAVAILABLE");
  if (!body.result) return null;
  return parseSolanaPayment(signature, body.result);
}
