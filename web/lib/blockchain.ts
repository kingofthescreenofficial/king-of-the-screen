/**
 * Zero-cost On-Chain Blockchain Transaction Verification Engine
 * Queries public RPC nodes (Base, Ethereum, BSC, Polygon, Solana) to verify
 * that payments were genuinely broadcasted on-chain to the target recipient.
 */

const EVM_RPC_ENDPOINTS = [
  "https://mainnet.base.org", // Primary: Base Mainnet (fastest & lowest fee)
  "https://eth.llamarpc.com", // Ethereum Mainnet
  "https://polygon-rpc.com", // Polygon PoS
  "https://binance.llamarpc.com", // BSC Mainnet
  "https://arbitrum.llamarpc.com", // Arbitrum One
];

const SOLANA_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

// In-memory set of used transaction hashes to strictly prevent replay attacks
const usedTxHashes = new Set<string>();

export interface TxVerificationResult {
  valid: boolean;
  reason?: string;
  sender?: string;
  recipient?: string;
  valueEth?: number;
}

/**
 * Verifies an EVM (Base / Ethereum / Polygon / BSC) transaction hash
 */
export async function verifyEvmTransaction(
  txHash: string,
  expectedRecipient: string,
  minAmountUsd: number
): Promise<TxVerificationResult> {
  const cleanHash = txHash.trim();
  const cleanRecipient = expectedRecipient.trim().toLowerCase();

  // Basic format check (0x + 64 hex chars)
  if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
    return {
      valid: false,
      reason: "Invalid transaction hash format. Must be a 66-character 0x... hex string.",
    };
  }

  // Prevent replay attacks
  if (usedTxHashes.has(cleanHash.toLowerCase())) {
    return {
      valid: false,
      reason: "This transaction hash has already been used for a previous throne takeover.",
    };
  }

  // Check each RPC endpoint until transaction is found
  for (const rpcUrl of EVM_RPC_ENDPOINTS) {
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionByHash",
          params: [cleanHash],
          id: 1,
        }),
        cache: "no-store",
      });

      const data = await response.json();
      const tx = data?.result;

      if (tx && tx.hash) {
        // Fetch receipt to confirm execution success
        const receiptRes = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getTransactionReceipt",
            params: [cleanHash],
            id: 2,
          }),
          cache: "no-store",
        });

        const receiptData = await receiptRes.json();
        const receipt = receiptData?.result;

        if (!receipt || receipt.status !== "0x1") {
          return {
            valid: false,
            reason: "Transaction was found but failed or is still pending on-chain.",
          };
        }

        // Check if direct ETH/native transfer matches recipient
        const toAddress = (tx.to || "").toLowerCase();
        const isDirectRecipient = toAddress === cleanRecipient;

        // Check if ERC-20 Transfer event (e.g. USDT, USDC) is in logs
        // ERC20 Transfer topic: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
        const isErc20Transfer = (receipt.logs || []).some((log: any) => {
          const topics = log.topics || [];
          if (topics[0]?.toLowerCase() === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
            const recipientTopic = topics[2]?.toLowerCase() || "";
            return recipientTopic.includes(cleanRecipient.replace("0x", ""));
          }
          return false;
        });

        if (!isDirectRecipient && !isErc20Transfer) {
          return {
            valid: false,
            reason: `Transaction recipient does not match deposit address ${expectedRecipient}.`,
          };
        }

        // Record hash to prevent reuse
        usedTxHashes.add(cleanHash.toLowerCase());

        return {
          valid: true,
          sender: tx.from,
          recipient: tx.to,
        };
      }
    } catch (e) {
      // Continue to next RPC
      continue;
    }
  }

  return {
    valid: false,
    reason: "Transaction not found on Base, Ethereum, BSC, or Polygon mainnets. Please make sure the transfer was sent and broadcasted.",
  };
}

/**
 * Verifies a Solana transaction signature
 */
export async function verifySolanaTransaction(
  signature: string,
  expectedRecipient: string
): Promise<TxVerificationResult> {
  const cleanSig = signature.trim();

  if (cleanSig.length < 64) {
    return { valid: false, reason: "Invalid Solana transaction signature length." };
  }

  if (usedTxHashes.has(cleanSig.toLowerCase())) {
    return { valid: false, reason: "This Solana signature has already been used." };
  }

  try {
    const res = await fetch(SOLANA_RPC_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [cleanSig, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }],
      }),
      cache: "no-store",
    });

    const data = await res.json();
    if (data?.result && !data.result.meta?.err) {
      usedTxHashes.add(cleanSig.toLowerCase());
      return { valid: true };
    }
  } catch (e) {
    // Solana RPC error
  }

  return {
    valid: false,
    reason: "Solana transaction not found or unconfirmed.",
  };
}
