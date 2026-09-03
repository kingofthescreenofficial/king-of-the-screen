import bs58 from "bs58";
import { describe, expect, it } from "vitest";

import { verifySolanaPayment, type SolanaPaymentFixture, type StoredPaymentIntent } from "@/lib/blockchain";

const intent: StoredPaymentIntent = { id: "intent-1", nonce: "nonce-1", buyerWallet: "buyer", treasuryAddress: "treasury", hotWalletAddress: "hot", treasuryLamports: 80, hotWalletLamports: 20, createdAt: 1_000_000, expiresAt: 1_090_000 };
const signature = bs58.encode(Buffer.alloc(64, 1));

function validFixture(): SolanaPaymentFixture {
  return {
    signature,
    confirmationStatus: "finalized",
    blockTime: 1_050,
    meta: { err: null, innerInstructions: [] },
    transaction: { message: { accountKeys: ["buyer"], instructions: [
      { program: "compute-budget" },
      { program: "system", parsed: { type: "transfer", info: { source: "buyer", destination: "treasury", lamports: 80 } } },
      { program: "system", parsed: { type: "transfer", info: { source: "buyer", destination: "hot", lamports: 20 } } },
      { program: "spl-memo", data: "kots:intent:intent-1:nonce-1" },
    ] } },
  };
}

describe("exact Solana payment verifier", () => {
  it("accepts only the exact finalized payment", () => expect(verifySolanaPayment(validFixture(), intent, { now: 1_080_000 })).toEqual({ valid: true }));
  it.each([
    ["underpaid treasury", (tx: SolanaPaymentFixture) => { tx.transaction.message.instructions[1].parsed!.info!.lamports = 79; }, "INVALID_TREASURY_TRANSFER"],
    ["missing hot transfer", (tx: SolanaPaymentFixture) => { tx.transaction.message.instructions[2].parsed!.info!.destination = "other"; }, "INVALID_HOT_WALLET_TRANSFER"],
    ["wrong memo", (tx: SolanaPaymentFixture) => { tx.transaction.message.instructions[3].data = "wrong"; }, "INVALID_MEMO"],
    ["failed transaction", (tx: SolanaPaymentFixture) => { tx.meta!.err = {}; }, "FAILED_TRANSACTION"],
    ["not finalized", (tx: SolanaPaymentFixture) => { tx.confirmationStatus = "confirmed"; }, "NOT_FINALIZED"],
    ["inner transfer", (tx: SolanaPaymentFixture) => { tx.meta!.innerInstructions = [{}]; }, "INNER_VALUE_MOVEMENT"],
    ["extra instruction", (tx: SolanaPaymentFixture) => { tx.transaction.message.instructions.push({ program: "system" }); }, "UNDECLARED_INSTRUCTION"],
  ])("rejects %s", (_name, mutate, code) => {
    const transaction = validFixture();
    mutate(transaction);
    expect(verifySolanaPayment(transaction, intent, { now: 1_080_000 })).toEqual({ valid: false, code });
  });
});
