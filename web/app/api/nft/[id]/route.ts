import { NextRequest, NextResponse } from "next/server";
import { getAppState } from "@/lib/state";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ordinal = parseInt(id, 10) || 1;
    const state = getAppState();

    // Find monarch in hall of fame or current king
    const allKings = [state.currentKing, ...(state.hallOfFame || [])].filter(
      (k) => k.id !== "genesis_throne_origin"
    );

    const targetKing = allKings[ordinal - 1] || state.currentKing;

    const metadata = {
      name: `King of the Screen — Genesis Monarch #${ordinal} of 25`,
      symbol: "KINGNFT",
      description: `Official 1-of-25 Genesis Digital Relic awarded for ruling the world's most contested $1,000,000 digital screen. Monarch: ${targetKing.nickname}.`,
      image: targetKing.mediaUrl || "https://king-of-the-screen.vercel.app/king_token_logo.jpg",
      external_url: "https://king-of-the-screen.vercel.app",
      attributes: [
        {
          trait_type: "Monarch Rank",
          value: `#${ordinal} of 25`,
        },
        {
          trait_type: "Ruler Nickname",
          value: targetKing.nickname,
        },
        {
          trait_type: "Tribute Paid (USD)",
          value: `$${targetKing.paidAmountUsd.toFixed(2)}`,
        },
        {
          trait_type: "Currency",
          value: targetKing.cryptoCurrency || "USDT",
        },
        {
          trait_type: "Royal Decree",
          value: targetKing.tagline,
        },
        {
          trait_type: "Collection Tier",
          value: "Genesis 1-of-25 Ultra Rare",
        },
      ],
      properties: {
        files: [
          {
            uri: targetKing.mediaUrl || "https://king-of-the-screen.vercel.app/king_token_logo.jpg",
            type: "image/jpeg",
          },
        ],
        category: "image",
        creators: [
          {
            address: state.walletConfig.solanaAddress,
            share: 100,
          },
        ],
      },
    };

    return NextResponse.json(metadata, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate NFT metadata" }, { status: 500 });
  }
}
