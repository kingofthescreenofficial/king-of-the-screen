const fs = require('fs');

const file = 'web/lib/blockchain.ts';
let content = fs.readFileSync(file, 'utf8');

const importReplacement = `import { getAppState } from "./state";
import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = "https://api.mainnet-beta.solana.com";
const solConnection = new Connection(RPC_URL, "confirmed");`;

content = content.replace('import { getAppState } from "./state";', importReplacement);

const newSolVerify = `export async function verifySolanaTransaction(
  rawSignature: string,
  expectedRecipient: string,
  expectedAmountUsd?: number
): Promise<TxVerificationResult> {
  const cleanSig = sanitizeTxHash(rawSignature);

  if (!cleanSig || cleanSig.length < 32) {
    return { valid: false, reason: "Invalid transaction signature format." };
  }

  if (isTxHashAlreadyUsed(cleanSig)) {
    return { valid: false, reason: "This Solana signature has already been used." };
  }

  try {
    const tx = await solConnection.getParsedTransaction(cleanSig, { maxSupportedTransactionVersion: 0, commitment: "confirmed" });
    if (!tx) {
      return { valid: false, reason: "Transaction not found on Solana mainnet. Wait a few seconds or check the hash." };
    }

    // Very basic validation: just ensure the treasury received SOME sol in this tx.
    // To prevent 0 SOL spam or using other people's unrelated transactions.
    let foundTransfer = false;
    const recipientPubkey = expectedRecipient;
    
    // Check if any instruction is a transfer to our treasury
    if (tx.meta && tx.meta.postBalances && tx.meta.preBalances) {
       const accountKeys = tx.transaction.message.accountKeys.map(k => k.pubkey.toString());
       const recipientIndex = accountKeys.indexOf(recipientPubkey);
       
       if (recipientIndex !== -1) {
          const preBalance = tx.meta.preBalances[recipientIndex];
          const postBalance = tx.meta.postBalances[recipientIndex];
          const receivedLamports = postBalance - preBalance;
          
          if (receivedLamports > 0) {
             foundTransfer = true;
          }
       }
    }

    if (!foundTransfer) {
      return { valid: false, reason: "Transaction did not send SOL to the Treasury wallet." };
    }

    usedTxHashes.add(cleanSig.toLowerCase());
    return { valid: true, sender: "Solana Payer", recipient: expectedRecipient, chain: "SOLANA_CONFIRMED" };

  } catch (err: any) {
    console.error("Solana RPC error:", err.message);
    return { valid: false, reason: "Error verifying transaction with Solana network." };
  }
}`;

// Replace the old verifySolanaTransaction function
const oldSolVerifyRegex = /export async function verifySolanaTransaction[\s\S]*?chain: "SOLANA_CONFIRMED",\n  };\n}/;
content = content.replace(oldSolVerifyRegex, newSolVerify);

fs.writeFileSync(file, content);
console.log("Patched blockchain.ts");
