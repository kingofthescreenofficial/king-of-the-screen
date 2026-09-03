import { generateKeyPairSync, sign } from "node:crypto";

import bs58 from "bs58";
import { Keypair, Transaction } from "@solana/web3.js";
import { beforeEach, describe, expect, it } from "vitest";

import { closeDatabaseForTests, getDatabase } from "@/lib/database";
import { createPaymentIntent, createWalletChallenge, hashNetworkSource } from "@/lib/payment-protocol";

function walletFixture() {
  const keys = generateKeyPairSync("ed25519");
  const rawPublicKey = keys.publicKey.export({ format: "der", type: "spki" }).subarray(-32);
  return {
    address: bs58.encode(rawPublicKey),
    sign: (message: string) => bs58.encode(sign(null, Buffer.from(message), keys.privateKey)),
  };
}

function requestFixture(now: number) {
  const wallet = walletFixture();
  const challenge = createWalletChallenge(wallet.address, now);
  const treasury = Keypair.generate().publicKey.toBase58();
  const hotWallet = Keypair.generate().publicKey.toBase58();
  return {
    wallet,
    challenge,
    request: {
      walletAddress: wallet.address,
      rewardWalletAddress: wallet.address,
      challengeId: challenge.id,
      signature: wallet.sign(challenge.message),
      contentDigest: "a".repeat(64),
      termsVersion: "2026-09-03",
      sourceHash: hashNetworkSource("test-source"),
      quote: { priceUsdCents: 200, solUsdCents: 10_000, priceVersion: "fixture-v1" },
      recipients: { treasuryAddress: treasury, hotWalletAddress: hotWallet },
      recentBlockhash: "11111111111111111111111111111111",
      now,
    },
  };
}

beforeEach(() => {
  closeDatabaseForTests();
  getDatabase().exec("DELETE FROM payment_intent_attempts; DELETE FROM wallet_challenges; DELETE FROM payment_intents;");
});

describe("payment intent protocol", () => {
  it("binds a verified wallet challenge to an immutable two-transfer transaction", () => {
    const fixture = requestFixture(1_000);
    const intent = createPaymentIntent(fixture.request);
    const transaction = Transaction.from(Buffer.from(intent.serializedTransaction, "base64"));

    expect(intent.treasuryLamports + intent.hotWalletLamports).toBe(intent.totalLamports);
    expect(intent.expiresAt).toBe(91_000);
    expect(transaction.instructions).toHaveLength(4);
    expect(transaction.instructions[1].keys[1].pubkey.toBase58()).toBe(fixture.request.recipients.treasuryAddress);
    expect(transaction.instructions[2].keys[1].pubkey.toBase58()).toBe(fixture.request.recipients.hotWalletAddress);
    expect(transaction.instructions[1].data.readBigUInt64LE(4)).toBe(BigInt(intent.treasuryLamports));
    expect(transaction.instructions[2].data.readBigUInt64LE(4)).toBe(BigInt(intent.hotWalletLamports));
  });

  it("rejects a reused wallet challenge and keeps the existing reservation", () => {
    const first = requestFixture(1_000);
    createPaymentIntent(first.request);
    expect(() => createPaymentIntent(first.request)).toThrow("INVALID_WALLET_CHALLENGE");

    const second = requestFixture(1_001);
    expect(() => createPaymentIntent(second.request)).toThrow("AUCTION_RESERVED");
    expect(getDatabase().prepare("SELECT COUNT(*) AS count FROM payment_intents").get()).toEqual({ count: 1 });
  });

  it("expires reservations after 90 seconds", () => {
    const first = requestFixture(1_000);
    createPaymentIntent(first.request);
    const second = requestFixture(91_001);
    expect(createPaymentIntent(second.request).id).toBeTruthy();
  });
});
