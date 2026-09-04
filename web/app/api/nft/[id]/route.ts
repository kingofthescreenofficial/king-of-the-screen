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
    const imageUrl = `https://king-of-the-screen.vercel.app/api/nft/${ordinal}/image`;

    const metadata = {
      name: `King of the Screen — Monarch #${ordinal} of 100`,
      symbol: "KOTSNFT",
      description: `Status NFT for a completed King of the Screen reign. Token claims and payments are not live. Monarch: ${targetKing.nickname}.`,
      image: imageUrl,
      external_url: "https://king-of-the-screen.vercel.app",
      attributes: [
        {
          trait_type: "Monarch Rank",
          value: `#${ordinal} of 100`,
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
          value: "Series 1-of-100",
        },
      ],
      properties: {
        files: [
          {
            uri: imageUrl,
            type: "image/png",
          },
        ],
        category: "image",
        creators: [
          {
            address: "0x36f1bBa134797da5Ec5CaF9ed4634903980CA305",
            share: 100,
          },
        ],
      },
    };

    return NextResponse.json(metadata, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate NFT metadata" }, { status: 500 });
  }
}
