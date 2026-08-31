const fs = require('fs');

// Patch route.ts
const routeFile = 'web/app/api/takeover/route.ts';
let routeContent = fs.readFileSync(routeFile, 'utf8');
routeContent = routeContent.replace(
  'const solVerify = await verifySolanaTransaction(cleanTxHash, state.walletConfig.solanaAddress);',
  'const solVerify = await verifySolanaTransaction(cleanTxHash, state.walletConfig.solanaAddress, cleanAmount);'
);
fs.writeFileSync(routeFile, routeContent);

// Patch blockchain.ts
const bcFile = 'web/lib/blockchain.ts';
let bcContent = fs.readFileSync(bcFile, 'utf8');

const newVerifySolana = `export async function verifySolanaTransaction(
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

    let foundTransfer = false;
    let receivedLamports = 0;
    const recipientPubkey = expectedRecipient;
    
    if (tx.meta && tx.meta.postBalances && tx.meta.preBalances) {
       const accountKeys = tx.transaction.message.accountKeys.map(k => k.pubkey.toString());
       const recipientIndex = accountKeys.indexOf(recipientPubkey);
       
       if (recipientIndex !== -1) {
          const preBalance = tx.meta.preBalances[recipientIndex];
          const postBalance = tx.meta.postBalances[recipientIndex];
          receivedLamports = postBalance - preBalance;
          if (receivedLamports > 0) foundTransfer = true;
       }
    }

    if (!foundTransfer) {
      return { valid: false, reason: "Transaction did not send SOL to the Treasury wallet." };
    }

    // STRICT AMOUNT VERIFICATION
    if (expectedAmountUsd) {
       try {
           const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
           const data = await res.json();
           const solPrice = data?.solana?.usd || 150; // fallback
           const expectedSol = expectedAmountUsd / solPrice;
           const expectedLamports = expectedSol * 1_000_000_000;
           
           // Allow 10% slippage / exchange rate variance
           if (receivedLamports < expectedLamports * 0.90) {
               return { valid: false, reason: \`Transaction amount too low. Expected ~$\${expectedAmountUsd} (\${expectedSol.toFixed(3)} SOL), but received \${(receivedLamports / 1_000_000_000).toFixed(3)} SOL.\` };
           }
       } catch (e) {
           console.error("Price check failed, falling back to basic validation");
       }
    }

    usedTxHashes.add(cleanSig.toLowerCase());
    return { valid: true, sender: "Solana Payer", recipient: expectedRecipient, chain: "SOLANA_CONFIRMED" };

  } catch (err: any) {
    console.error("Solana RPC error:", err.message);
    return { valid: false, reason: "Error verifying transaction with Solana network." };
  }
}`;

const oldSolVerifyRegex = /export async function verifySolanaTransaction[\s\S]*?chain: "SOLANA_CONFIRMED"[\s\S]*?};\n}/;
bcContent = bcContent.replace(oldSolVerifyRegex, newVerifySolana);

fs.writeFileSync(bcFile, bcContent);
console.log("Patched strictly");
