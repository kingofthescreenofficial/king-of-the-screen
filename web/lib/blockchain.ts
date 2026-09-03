import bs58 from "bs58";

export type StoredPaymentIntent = { id: string; nonce: string; buyerWallet: string; treasuryAddress: string; hotWalletAddress: string; treasuryLamports: number; hotWalletLamports: number; createdAt: number; expiresAt: number };
type ParsedInstruction = { program?: string; programId?: string; parsed?: { type?: string; info?: { source?: string; destination?: string; lamports?: number } }; data?: string };
export type SolanaPaymentFixture = { signature: string; confirmationStatus: "processed" | "confirmed" | "finalized"; blockTime: number | null; meta: { err: unknown; innerInstructions?: unknown[] | null } | null; transaction: { message: { accountKeys: Array<{ pubkey: string } | string>; instructions: ParsedInstruction[] } } };
export type PaymentVerification = { valid: true } | { valid: false; code: string };

function signatureValid(signature: string): boolean { try { return bs58.decode(signature).length === 64; } catch { return false; } }
function compute(instruction: ParsedInstruction): boolean { return instruction.program === "compute-budget" || instruction.programId === "ComputeBudget111111111111111111111111111111"; }
function transfer(instruction: ParsedInstruction, source: string, destination: string, lamports: number): boolean { const info = instruction.parsed?.info; return instruction.program === "system" && instruction.parsed?.type === "transfer" && info?.source === source && info.destination === destination && info.lamports === lamports; }
function memo(instruction: ParsedInstruction, intent: StoredPaymentIntent): boolean { return (instruction.program === "spl-memo" || instruction.programId === "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr") && (instruction.parsed?.info?.source ?? instruction.data ?? "") === `kots:intent:${intent.id}:${intent.nonce}`; }

export function verifySolanaPayment(transaction: SolanaPaymentFixture, intent: StoredPaymentIntent, options: { now?: number; signatureAlreadyUsed?: boolean } = {}): PaymentVerification {
  const now = options.now ?? Date.now();
  if (!signatureValid(transaction.signature)) return { valid: false, code: "INVALID_SIGNATURE" };
  if (options.signatureAlreadyUsed) return { valid: false, code: "REPLAYED_SIGNATURE" };
  if (transaction.confirmationStatus !== "finalized") return { valid: false, code: "NOT_FINALIZED" };
  if (!transaction.meta || transaction.meta.err) return { valid: false, code: "FAILED_TRANSACTION" };
  if (transaction.meta.innerInstructions?.length) return { valid: false, code: "INNER_VALUE_MOVEMENT" };
  if (now > intent.expiresAt) return { valid: false, code: "EXPIRED_INTENT" };
  const blockTime = transaction.blockTime ? transaction.blockTime * 1000 : 0;
  if (blockTime < intent.createdAt - 120_000 || blockTime > intent.expiresAt) return { valid: false, code: "STALE_BLOCK_TIME" };
  const payer = transaction.transaction.message.accountKeys[0];
  if ((typeof payer === "string" ? payer : payer?.pubkey) !== intent.buyerWallet) return { valid: false, code: "WRONG_FEE_PAYER" };
  const [budget, treasury, hot, intentMemo, ...extra] = transaction.transaction.message.instructions;
  if (extra.length || !compute(budget)) return { valid: false, code: "UNDECLARED_INSTRUCTION" };
  if (!transfer(treasury, intent.buyerWallet, intent.treasuryAddress, intent.treasuryLamports)) return { valid: false, code: "INVALID_TREASURY_TRANSFER" };
  if (!transfer(hot, intent.buyerWallet, intent.hotWalletAddress, intent.hotWalletLamports)) return { valid: false, code: "INVALID_HOT_WALLET_TRANSFER" };
  if (!memo(intentMemo, intent)) return { valid: false, code: "INVALID_MEMO" };
  return { valid: true };
}
