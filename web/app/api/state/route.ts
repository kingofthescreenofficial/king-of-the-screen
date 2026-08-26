import { NextResponse } from "next/server";
import { getAppState } from "@/lib/state";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = getAppState();
  return NextResponse.json(state, {
    headers: {
      "Cache-Control": "public, s-maxage=1, stale-while-revalidate=2",
    },
  });
}
