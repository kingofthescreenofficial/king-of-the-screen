import { NextRequest, NextResponse } from "next/server";
import { executeDethronement, getAppState } from "@/lib/state";
import { moderateContent } from "@/lib/moderation";
import { verifyEvmTransaction, verifySolanaTransaction } from "@/lib/blockchain";
import fs from "fs";
import path from "path";

function normalizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nickname,
      tagline,
      link,
      mediaUrl,
      mediaType,
      paidAmountUsd,
      paidCryptoAmount,
      cryptoCurrency,
      txHash,
      countryCode,
      rewardWalletAddress,
    } = body;

    // 1. Basic validation
    if (!nickname || typeof nickname !== "string" || nickname.trim().length === 0) {
      return NextResponse.json({ error: "Nickname is required." }, { status: 400 });
    }

    if (!tagline || typeof tagline !== "string" || tagline.trim().length === 0) {
      return NextResponse.json({ error: "Tagline/Message is required." }, { status: 400 });
    }

    const state = getAppState();
    const cleanAmount = Number(paidAmountUsd);

    if (isNaN(cleanAmount) || cleanAmount < state.nextMinPriceUsd) {
      return NextResponse.json(
        { error: `Minimum bid is $${state.nextMinPriceUsd.toFixed(2)}. Your bid: $${cleanAmount || 0}` },
        { status: 400 }
      );
    }

    // 2. Strict On-Chain Transaction Verification
    if (!txHash || typeof txHash !== "string" || txHash.startsWith("tx_demo") || txHash.startsWith("tx_evm_") || txHash.startsWith("tx_solana_")) {
      return NextResponse.json(
        {
          error: `Please complete the crypto payment to ${state.walletConfig.evmAddress} and provide the real on-chain transaction hash (txHash).`,
        },
        { status: 400 }
      );
    }

    const isSolana = cryptoCurrency === "SOL";
    if (isSolana) {
      const solVerify = await verifySolanaTransaction(txHash, state.walletConfig.solanaAddress);
      if (!solVerify.valid) {
        return NextResponse.json(
          { error: solVerify.reason || "Solana transaction could not be verified on-chain." },
          { status: 400 }
        );
      }
    } else {
      const evmVerify = await verifyEvmTransaction(txHash, state.walletConfig.evmAddress, cleanAmount);
      if (!evmVerify.valid) {
        return NextResponse.json(
          { error: evmVerify.reason || `EVM transaction not verified for address ${state.walletConfig.evmAddress}.` },
          { status: 400 }
        );
      }
    }

    // 3. Safety & AI Content Moderation check
    const modResult = await moderateContent(`${nickname} - ${tagline}`, mediaUrl);
    if (!modResult.allowed) {
      return NextResponse.json(
        { error: `Moderation rejected: ${modResult.reason || "Content flagged as inappropriate."}` },
        { status: 400 }
      );
    }

    const normalizedLink = normalizeUrl(link);
    const minedTokens = Math.floor(cleanAmount * 25000);
    const resolvedRewardWallet = (rewardWalletAddress || "").trim() || (isSolana ? txHash : state.walletConfig.solanaAddress);

    // 4. Execute verified dethronement
    const result = executeDethronement({
      nickname: nickname.trim().slice(0, 30),
      tagline: tagline.trim().slice(0, 140),
      link: normalizedLink ? normalizedLink.slice(0, 200) : undefined,
      mediaUrl: mediaUrl?.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      mediaType: mediaType === "gif" ? "gif" : "image",
      paidAmountUsd: cleanAmount,
      paidCryptoAmount: Number(paidCryptoAmount) || (cleanAmount / 150),
      cryptoCurrency: cryptoCurrency || "USDT",
      txHash: txHash.trim(),
      countryCode: countryCode || "🌐",
      rewardWalletAddress: resolvedRewardWallet,
      airdropStatus: "QUEUED",
      minedTokens: minedTokens,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // 5. Append to airdrop dispatch queue log
    try {
      const queueEntry = {
        timestamp: new Date().toISOString(),
        kingId: result.state.currentKing.id,
        nickname: result.state.currentKing.nickname,
        rewardWallet: resolvedRewardWallet,
        minedTokens: minedTokens,
        paidUsd: cleanAmount,
        currency: cryptoCurrency,
        txHash: txHash.trim(),
        status: "QUEUED_FOR_AIRDROP",
      };
      const logDir = path.join(process.cwd(), "analytics");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      fs.appendFileSync(
        path.join(logDir, "airdrop_queue.jsonl"),
        JSON.stringify(queueEntry) + "\n",
        "utf-8"
      );
    } catch (logErr) {
      console.warn("Notice: Airdrop queue logged in memory/runtime");
    }

    return NextResponse.json({ success: true, state: result.state });
  } catch (err: any) {
    console.error("Takeover error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
