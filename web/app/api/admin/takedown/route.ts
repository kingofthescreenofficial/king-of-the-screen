import { NextRequest, NextResponse } from "next/server";
import { executeDethronement } from "@/lib/state";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "king_admin_purge_secret_2026";

/**
 * Emergency Admin Takedown Endpoint
 * Instantly replaces a violating King with Genesis King and purges bad content.
 * Usage: POST /api/admin/takedown with header { "x-admin-secret": "..." } or query param ?secret=...
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = req.headers.get("x-admin-secret") || searchParams.get("secret");

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = executeDethronement({
      nickname: "👑 Sovereign Origin",
      tagline: "The world's most contested digital screen is LIVE. Dethrone me to rule!",
      link: "https://x.com",
      mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      mediaType: "image",
      paidAmountUsd: 1,
      paidCryptoAmount: 0.005,
      cryptoCurrency: "SOL",
      txHash: `admin_purge_${Date.now()}`,
      countryCode: "🌐",
    });

    return NextResponse.json({
      success: true,
      message: "Emergency takedown executed. King reset to Genesis.",
      state: state.state,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
