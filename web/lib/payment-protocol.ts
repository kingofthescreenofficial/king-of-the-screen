import { createHash, randomUUID, verify } from "node:crypto";

import bs58 from "bs58";
import { ComputeBudgetProgram, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";

import { getDatabase, withImmediateTransaction } from "@/lib/database";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const INTENT_TTL_MS = 90 * 1000;
const WALLET_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const SOURCE_ATTEMPT_WINDOW_MS = 5 * 60 * 1000;
const WALLET_ATTEMPT_LIMIT = 3;
const SOURCE_ATTEMPT_LIMIT = 10;
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export type PaymentQuote = {
  priceUsdCents: number;
  solUsdCents: number;
  priceVersion: string;
};

export type PaymentRecipients = {
  treasuryAddress: string;
  hotWalletAddress: string;
};

export type PaymentIntentRequest = {
  walletAddress: string;
  rewardWalletAddress: string;
  challengeId: string;
  signature: string;
  contentDigest: string;
  termsVersion: string;
  sourceHash: string;
  quote: PaymentQuote;
  recipients: PaymentRecipients;
  recentBlockhash: string;
  now?: number;
};

export type PaymentIntent = {
  id: string;
  nonce: string;
  expiresAt: number;
  totalLamports: number;
  treasuryLamports: number;
  hotWalletLamports: number;
  serializedTransaction: string;
};

function asPublicKey(address: string): PublicKey {
  return new PublicKey(address);
}

function isValidDigest(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}

export function createWalletChallenge(walletAddress: string, now = Date.now()) {
  asPublicKey(walletAddress);
  const id = randomUUID();
  const nonce = randomUUID();
  const message = `KOTS payment intent challenge\nchallenge:${id}\nnonce:${nonce}`;
  const expiresAt = now + CHALLENGE_TTL_MS;
  getDatabase().prepare(`
    INSERT INTO wallet_challenges (id, wallet_address, nonce, message, expires_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, walletAddress, nonce, message, expiresAt, now, now);
  return { id, message, expiresAt };
}

function verifyChallenge(challengeId: string, walletAddress: string, signature: string, now: number): boolean {
  const challenge = getDatabase().prepare(`
    SELECT wallet_address, message, expires_at, used_at FROM wallet_challenges WHERE id = ?
  `).get(challengeId) as { wallet_address: string; message: string; expires_at: number; used_at: number | null } | undefined;
  if (!challenge || challenge.wallet_address !== walletAddress || challenge.used_at || challenge.expires_at < now) return false;

  try {
    const publicKey = asPublicKey(walletAddress).toBytes();
    const verified = verify(null, Buffer.from(challenge.message), {
      key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(publicKey)]),
      format: "der",
      type: "spki",
    }, Buffer.from(bs58.decode(signature)));
    if (!verified) return false;
    getDatabase().prepare("UPDATE wallet_challenges SET used_at = ?, updated_at = ? WHERE id = ? AND used_at IS NULL").run(now, now, challengeId);
    return true;
  } catch {
    return false;
  }
}

function quoteToLamports(priceUsdCents: number, solUsdCents: number): number {
  if (!Number.isSafeInteger(priceUsdCents) || priceUsdCents <= 0 || !Number.isSafeInteger(solUsdCents) || solUsdCents <= 0) {
    throw new Error("Invalid server price quote.");
  }
  return Math.ceil((priceUsdCents * 1_000_000_000) / solUsdCents);
}

function enforceReservationLimits(walletAddress: string, sourceHash: string, now: number): void {
  const database = getDatabase();
  database.prepare("DELETE FROM payment_intent_attempts WHERE created_at < ?").run(now - WALLET_ATTEMPT_WINDOW_MS);
  const walletAttempts = (database.prepare("SELECT COUNT(*) AS count FROM payment_intent_attempts WHERE wallet_address = ? AND created_at >= ?").get(walletAddress, now - WALLET_ATTEMPT_WINDOW_MS) as { count: number }).count;
  const sourceAttempts = (database.prepare("SELECT COUNT(*) AS count FROM payment_intent_attempts WHERE source_hash = ? AND created_at >= ?").get(sourceHash, now - SOURCE_ATTEMPT_WINDOW_MS) as { count: number }).count;
  if (walletAttempts >= WALLET_ATTEMPT_LIMIT) throw new Error("WALLET_RATE_LIMITED");
  if (sourceAttempts >= SOURCE_ATTEMPT_LIMIT) throw new Error("SOURCE_RATE_LIMITED");
  database.prepare("INSERT INTO payment_intent_attempts (id, wallet_address, source_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").run(randomUUID(), walletAddress, sourceHash, now, now);
}

function buildUnsignedTransaction(intentId: string, nonce: string, buyer: PublicKey, recipients: PaymentRecipients, totalLamports: number, treasuryLamports: number, recentBlockhash: string): string {
  const transaction = new Transaction({ feePayer: buyer, recentBlockhash });
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
    SystemProgram.transfer({ fromPubkey: buyer, toPubkey: asPublicKey(recipients.treasuryAddress), lamports: treasuryLamports }),
    SystemProgram.transfer({ fromPubkey: buyer, toPubkey: asPublicKey(recipients.hotWalletAddress), lamports: totalLamports - treasuryLamports }),
    new TransactionInstruction({ keys: [], programId: MEMO_PROGRAM, data: Buffer.from(`kots:intent:${intentId}:${nonce}`) }),
  );
  return transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64");
}

export function createPaymentIntent(request: PaymentIntentRequest): PaymentIntent {
  const now = request.now ?? Date.now();
  if (!isValidDigest(request.contentDigest) || !request.termsVersion || !request.sourceHash) throw new Error("INVALID_INTENT_REQUEST");
  const buyer = asPublicKey(request.walletAddress);
  asPublicKey(request.rewardWalletAddress);
  asPublicKey(request.recipients.treasuryAddress);
  asPublicKey(request.recipients.hotWalletAddress);

  return withImmediateTransaction(() => {
    if (!verifyChallenge(request.challengeId, request.walletAddress, request.signature, now)) throw new Error("INVALID_WALLET_CHALLENGE");
    enforceReservationLimits(request.walletAddress, request.sourceHash, now);
    const database = getDatabase();
    const activeIntent = database.prepare("SELECT id FROM payment_intents WHERE status = 'RESERVED' AND expires_at > ? AND cancelled_at IS NULL LIMIT 1").get(now);
    if (activeIntent) throw new Error("AUCTION_RESERVED");

    const totalLamports = quoteToLamports(request.quote.priceUsdCents, request.quote.solUsdCents);
    const treasuryLamports = Math.floor(totalLamports * 0.8);
    const hotWalletLamports = totalLamports - treasuryLamports;
    const id = randomUUID();
    const nonce = randomUUID();
    const expiresAt = now + INTENT_TTL_MS;
    const serializedTransaction = buildUnsignedTransaction(id, nonce, buyer, request.recipients, totalLamports, treasuryLamports, request.recentBlockhash);
    database.prepare(`
      INSERT INTO payment_intents (
        id, status, buyer_wallet, reward_wallet, content_digest, terms_version, price_usd_cents,
        sol_usd_cents, total_lamports, treasury_lamports, hot_wallet_lamports, treasury_address,
        hot_wallet_address, nonce, expires_at, price_version, serialized_transaction, created_at, updated_at
      ) VALUES (?, 'RESERVED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, request.walletAddress, request.rewardWalletAddress, request.contentDigest, request.termsVersion,
      request.quote.priceUsdCents, request.quote.solUsdCents, totalLamports, treasuryLamports, hotWalletLamports,
      request.recipients.treasuryAddress, request.recipients.hotWalletAddress, nonce, expiresAt, request.quote.priceVersion,
      serializedTransaction, now, now);
    return { id, nonce, expiresAt, totalLamports, treasuryLamports, hotWalletLamports, serializedTransaction };
  });
}

export function hashNetworkSource(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}
