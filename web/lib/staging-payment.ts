import { ComputeBudgetProgram, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";

const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export type StagingPaymentPreviewInput = {
  buyerWallet: string;
  treasuryAddress: string;
  operationsVaultAddress: string;
  totalLamports: number;
  recentBlockhash: string;
  memo: string;
};

export type StagingPaymentPreview = {
  totalLamports: number;
  treasuryLamports: number;
  operationsVaultLamports: number;
  serializedTransaction: string;
};

function key(value: string): PublicKey {
  return new PublicKey(value);
}

export function buildStagingPaymentPreview(input: StagingPaymentPreviewInput): StagingPaymentPreview {
  if (!Number.isSafeInteger(input.totalLamports) || input.totalLamports < 2) throw new Error("INVALID_STAGING_AMOUNT");
  const buyer = key(input.buyerWallet);
  const treasury = key(input.treasuryAddress);
  const operations = key(input.operationsVaultAddress);
  const treasuryLamports = Math.floor(input.totalLamports * 0.8);
  const operationsVaultLamports = input.totalLamports - treasuryLamports;
  const transaction = new Transaction({ feePayer: buyer, recentBlockhash: input.recentBlockhash });
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
    SystemProgram.transfer({ fromPubkey: buyer, toPubkey: treasury, lamports: treasuryLamports }),
    SystemProgram.transfer({ fromPubkey: buyer, toPubkey: operations, lamports: operationsVaultLamports }),
    new TransactionInstruction({ keys: [], programId: MEMO_PROGRAM, data: Buffer.from(input.memo) }),
  );
  return {
    totalLamports: input.totalLamports,
    treasuryLamports,
    operationsVaultLamports,
    serializedTransaction: transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64"),
  };
}
