import { NextRequest, NextResponse } from "next/server";

import { AUCTION_MANIFEST_V1 } from "@/lib/auction-manifest";
import { getAppState } from "@/lib/state";
import { isPublicCrownArchiveEnabled } from "@/lib/feature-flags";
import type { King } from "@/lib/types";

function publicOrigin(request: NextRequest): string {
  return process.env.KOTS_PUBLIC_ORIGIN?.replace(/\/$/, "") ?? request.nextUrl.origin;
}

function settledKings(): King[] {
  const state = getAppState();
  return [state.currentKing, ...state.hallOfFame]
    .filter((king) => king.cryptoCurrency === "SOL" && king.paidAmountUsd > 0)
    .sort((left, right) => left.crownedAt - right.crownedAt);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isPublicCrownArchiveEnabled()) return NextResponse.json({ code: "CROWN_ARCHIVE_DISABLED", error: "The public Crown archive is not available." }, { status: 503 });
  const { id } = await params;
  const ordinal = Number(id);
  if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > AUCTION_MANIFEST_V1.crownLimit) {
    return NextResponse.json({ code: "NFT_NOT_FOUND", error: "Status NFT was not found." }, { status: 404 });
  }
  const king = settledKings()[ordinal - 1];
  if (!king) return NextResponse.json({ code: "NFT_NOT_MINTABLE", error: "This Crown has not been settled." }, { status: 404 });

  const origin = publicOrigin(request);
  const imageUrl = `${origin}/api/nft/${ordinal}/image`;
  return NextResponse.json({
    name: `King of the Screen Crown #${ordinal} of ${AUCTION_MANIFEST_V1.crownLimit}`,
    symbol: "KOTSCROWN",
    description: "A status record for a completed King of the Screen Crown. It does not include token rights, revenue rights, or any promise of value.",
    image: imageUrl,
    external_url: origin,
    attributes: [
      { trait_type: "Crown Number", value: ordinal, max_value: AUCTION_MANIFEST_V1.crownLimit },
      { trait_type: "Display Name", value: king.nickname },
      { trait_type: "Public Message", value: king.tagline },
      { trait_type: "Price Paid USD", value: king.paidAmountUsd },
      { trait_type: "Payment Network", value: "Solana" },
      { trait_type: "Reward Wallet", value: king.rewardWalletAddress ?? "Not recorded" },
      { trait_type: "Crowned At", display_type: "date", value: Math.floor(king.crownedAt / 1000) },
    ],
    properties: { files: [{ uri: imageUrl, type: "image/svg+xml" }], category: "image" },
  }, { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
}
