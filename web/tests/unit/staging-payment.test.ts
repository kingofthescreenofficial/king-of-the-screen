import { Transaction } from "@solana/web3.js";
import { afterEach, describe, expect, it } from "vitest";

import { isStagingMode } from "@/lib/feature-flags";
import { buildStagingPaymentPreview } from "@/lib/staging-payment";

const originalEnvironment = { ...process.env };
const buyer = "11111111111111111111111111111111";
const treasury = "SysvarC1ock11111111111111111111111111111111";
const operations = "SysvarRent111111111111111111111111111111111";

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("staging payment boundary", () => {
  it("opens only for the explicit devnet staging configuration", () => {
    process.env.KOTS_RUNTIME_MODE = "staging";
    process.env.SOLANA_CLUSTER = "devnet";
    expect(isStagingMode()).toBe(true);

    process.env.SOLANA_CLUSTER = "mainnet-beta";
    expect(isStagingMode()).toBe(false);
  });

  it("builds an unsigned 80/20 devnet preview without sending it", () => {
    const preview = buildStagingPaymentPreview({
      buyerWallet: buyer,
      treasuryAddress: treasury,
      operationsVaultAddress: operations,
      totalLamports: 1_000,
      recentBlockhash: buyer,
      memo: "kots:staging:test",
    });

    expect(preview).toMatchObject({ totalLamports: 1_000, treasuryLamports: 800, operationsVaultLamports: 200 });
    const transaction = Transaction.from(Buffer.from(preview.serializedTransaction, "base64"));
    expect(transaction.instructions).toHaveLength(4);
    expect(transaction.signatures.every(({ signature }) => signature === null)).toBe(true);
  });
});
