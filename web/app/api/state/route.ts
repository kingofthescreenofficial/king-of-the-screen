import { NextResponse } from "next/server";
import { getAppState } from "@/lib/state";
import { getPublicCapabilities, isPublicCrownArchiveEnabled } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export async function GET() {
  const capabilities = getPublicCapabilities();
  if (!isPublicCrownArchiveEnabled()) {
    return NextResponse.json({
      mode: "PRE_LAUNCH",
      currentKing: null,
      hallOfFame: [],
      recentEvents: [],
      nextMinPriceUsd: null,
      capabilities,
    }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
  }
  const state = getAppState();
  return NextResponse.json({ ...state, capabilities }, {
    headers: {
      "Cache-Control": "public, s-maxage=1, stale-while-revalidate=2",
    },
  });
}
