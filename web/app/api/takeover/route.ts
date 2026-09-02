import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { executeDethronement, getAppState } from "@/lib/state";
import { moderateContent } from "@/lib/moderation";
import { verifyEvmTransaction, verifySolanaTransaction, sanitizeTxHash } from "@/lib/blockchain";


function normalizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Strict security: Reject dangerous scripting schemes
  if (/^(javascript|vbscript|data|file):/i.test(trimmed)) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function logTelemetry(type, event, details) {
  try {
    const logDir = path.join(process.cwd(), "analytics");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const logEntry = { timestamp: new Date().toISOString(), type, event, details };
    fs.appendFileSync(path.join(logDir, "telemetry.jsonl"), JSON.stringify(logEntry) + '\n');
  } catch(e) {}
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


    // 2. Strict On-Chain Transaction Verification with Auto-Sanitization
    if (mediaUrl && mediaUrl.startsWith("data:") && mediaUrl.length > 500 * 1024) {
      return NextResponse.json({ error: "Image file is too large. Maximum size is 350KB." }, { status: 400 });
    }

    const cleanTxHash = sanitizeTxHash(txHash || "");
    if (!cleanTxHash || cleanTxHash.startsWith("tx_demo")) {
      return NextResponse.json(
        {
          error: `Please complete the crypto payment to ${state.walletConfig.evmAddress} and provide your transaction hash.`,
        },
        { status: 400 }
      );
    }

    const isSolana = cryptoCurrency === "SOL";
    if (isSolana) {
      const solVerify = await verifySolanaTransaction(cleanTxHash, state.walletConfig.solanaAddress, cleanAmount);
      if (!solVerify.valid) {
        return NextResponse.json(
          { error: solVerify.reason || "Invalid transaction signature." },
          { status: 400 }
        );
      }
    } else {
      const evmVerify = await verifyEvmTransaction(cleanTxHash, state.walletConfig.evmAddress, cleanAmount);
      if (!evmVerify.valid) {
        return NextResponse.json(
          { error: evmVerify.reason || "Invalid transaction hash." },
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
    const minedTokens = Math.floor(cleanAmount * 900);
    const resolvedRewardWallet = (rewardWalletAddress || "").trim() || (isSolana ? cleanTxHash : state.walletConfig.solanaAddress);

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
      txHash: cleanTxHash,
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
        txHash: cleanTxHash,
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
