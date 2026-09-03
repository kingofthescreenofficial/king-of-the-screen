import { NextResponse } from "next/server";
import { getAppState } from "@/lib/state";
import { getPublicCapabilities } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = getAppState();
  return NextResponse.json({ ...state, capabilities: getPublicCapabilities() }, {
    headers: {
      "Cache-Control": "public, s-maxage=1, stale-while-revalidate=2",
    },
  });
}
