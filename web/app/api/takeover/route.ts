import { NextRequest, NextResponse } from "next/server";
import { executeDethronement, getAppState } from "@/lib/state";
import { moderateContent } from "@/lib/moderation";

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
    } = body;

    // Basic validation
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

    // Safety / AI Moderation check
    const modResult = await moderateContent(`${nickname} - ${tagline}`, mediaUrl);
    if (!modResult.allowed) {
      return NextResponse.json(
        { error: `Moderation rejected: ${modResult.reason || "Content flagged as inappropriate."}` },
        { status: 400 }
      );
    }

    const normalizedLink = normalizeUrl(link);

    // Execute dethronement
    const result = executeDethronement({
      nickname: nickname.trim().slice(0, 30),
      tagline: tagline.trim().slice(0, 140),
      link: normalizedLink ? normalizedLink.slice(0, 200) : undefined,
      mediaUrl: mediaUrl?.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      mediaType: mediaType === "gif" ? "gif" : "image",
      paidAmountUsd: cleanAmount,
      paidCryptoAmount: Number(paidCryptoAmount) || (cleanAmount / 150),
      cryptoCurrency: cryptoCurrency || "SOL",
      txHash: txHash || `tx_demo_${Date.now()}`,
      countryCode: countryCode || "🌐",
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, state: result.state });
  } catch (err: any) {
    console.error("Takeover error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
