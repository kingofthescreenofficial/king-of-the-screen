import { NextResponse } from "next/server";
import { getAppState } from "@/lib/state";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const state = getAppState();
  return NextResponse.json(state, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
