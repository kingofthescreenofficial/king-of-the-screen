/**
 * High-Availability Zero-Cost On-Chain Blockchain Transaction Verification Engine
 * Multi-RPC Fallback Architecture for Base, Ethereum, Polygon, BSC, and Solana.
 */

const EVM_RPC_ENDPOINTS = [
  "https://mainnet.base.org", // Primary Base Mainnet (sub-cent gas)
  "https://base.publicnode.com", // Base Fallback 1
  "https://base.llamarpc.com", // Base Fallback 2
  "https://1rpc.io/base", // Base Fallback 3
  "https://ethereum.publicnode.com", // Ethereum Mainnet Primary
  "https://rpc.ankr.com/eth", // Ethereum Fallback 1
  "https://1rpc.io/eth", // Ethereum Fallback 2
  "https://polygon-rpc.com", // Polygon PoS
  "https://binance.llamarpc.com", // BSC Mainnet
  "https://arbitrum.llamarpc.com", // Arbitrum One
];

const SOLANA_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-mainnet.rpc.extrnode.com",
  "https://rpc.ankr.com/solana",
];

// Anti-Replay Cache (In-Memory Set)
const usedTxHashes = new Set<string>();

export interface TxVerificationResult {
  valid: boolean;
  reason?: string;
  sender?: string;
  recipient?: string;
  valueEth?: number;
}

/**
 * Fast RPC fetcher with 3500ms timeout per endpoint
 */
async function fetchWithTimeout(url: string, body: any, timeoutMs: number = 3500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
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

  // Prevent double-spend replay attacks
  if (usedTxHashes.has(cleanHash.toLowerCase())) {
    return {
      valid: false,
      reason: "This transaction hash has already been used for a previous throne takeover.",
    };
  }

  // Iterate through redundant RPC endpoints
  for (const rpcUrl of EVM_RPC_ENDPOINTS) {
    try {
      const txData = await fetchWithTimeout(rpcUrl, {
        jsonrpc: "2.0",
        method: "eth_getTransactionByHash",
        params: [cleanHash],
        id: 1,
      });

      const tx = txData?.result;

      if (tx && tx.hash) {
        // Fetch receipt to confirm successful on-chain execution
        const receiptData = await fetchWithTimeout(rpcUrl, {
          jsonrpc: "2.0",
          method: "eth_getTransactionReceipt",
          params: [cleanHash],
          id: 2,
        });

        const receipt = receiptData?.result;

        if (!receipt || receipt.status !== "0x1") {
          return {
            valid: false,
            reason: "Transaction was found on-chain but status is not successful (failed or still pending).",
          };
        }

        // Check native transfer recipient
        const toAddress = (tx.to || "").toLowerCase();
        const isDirectRecipient = toAddress === cleanRecipient;

        // Check ERC-20 Transfer event (USDT, USDC, etc.)
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
            reason: `Transaction recipient does not match destination wallet ${expectedRecipient}.`,
          };
        }

        // Mark as used to prevent replays
        usedTxHashes.add(cleanHash.toLowerCase());

        return {
          valid: true,
          sender: tx.from,
          recipient: tx.to,
        };
      }
    } catch (e) {
      // Endpoint timed out or errored, try next RPC in pool
      continue;
    }
  }

  return {
    valid: false,
    reason: "Transaction not found across Base, Ethereum, BSC, or Polygon networks. Please verify the transaction succeeded in your wallet.",
  };
}

/**
 * Verifies a Solana transaction signature with redundant RPCs
 */
export async function verifySolanaTransaction(
  signature: string,
  expectedRecipient: string
): Promise<TxVerificationResult> {
  const cleanSig = signature.trim();

  if (cleanSig.length < 64) {
    return { valid: false, reason: "Invalid Solana transaction signature format." };
  }

  if (usedTxHashes.has(cleanSig.toLowerCase())) {
    return { valid: false, reason: "This Solana transaction has already been used." };
  }

  for (const rpcUrl of SOLANA_RPC_ENDPOINTS) {
    try {
      const data = await fetchWithTimeout(rpcUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [cleanSig, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }],
      });

      if (data?.result && !data.result.meta?.err) {
        usedTxHashes.add(cleanSig.toLowerCase());
        return { valid: true };
      }
    } catch (e) {
      continue;
    }
  }

  return {
    valid: false,
    reason: "Solana transaction signature could not be verified on-chain. Please verify finality on Solscan.",
  };
}
