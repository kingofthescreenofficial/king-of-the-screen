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

    const allKings = [state.currentKing, ...(state.hallOfFame || [])].filter(
      (k) => k.id !== "genesis_throne_origin"
    );
    const king = allKings[ordinal - 1] || state.currentKing;

    const nickname = (king.nickname || "Genesis King").replace(/[<>&"]/g, "");
    const tagline = (king.tagline || "forever KING").replace(/[<>&"]/g, "");
    const tribute = `$${(king.paidAmountUsd || 1).toFixed(2)} USD`;
    const tokenId = `KOTS-GENESIS-#${ordinal.toString().padStart(2, "0")}`;

    const svg = `<svg width="1000" height="1000" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#181828"/>
      <stop offset="100%" stop-color="#06060a"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
    <linearGradient id="cyberBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#facc15"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1000" height="1000" rx="40" fill="url(#bgGrad)"/>
  
  <!-- Outer Gold Frame -->
  <rect x="20" y="20" width="960" height="960" rx="32" stroke="url(#goldGrad)" stroke-width="8" fill="none"/>
  <rect x="36" y="36" width="928" height="928" rx="24" stroke="rgba(234,179,8,0.3)" stroke-width="2" fill="none"/>

  <!-- Glowing Corner Accents -->
  <circle cx="20" cy="20" r="12" fill="#facc15" filter="url(#glow)"/>
  <circle cx="980" cy="20" r="12" fill="#facc15" filter="url(#glow)"/>
  <circle cx="20" cy="980" r="12" fill="#facc15" filter="url(#glow)"/>
  <circle cx="980" cy="980" r="12" fill="#facc15" filter="url(#glow)"/>

  <!-- Top Header Badge -->
  <rect x="60" y="70" width="460" height="56" rx="28" fill="rgba(234,179,8,0.15)" stroke="#facc15" stroke-width="2"/>
  <text x="90" y="106" font-family="monospace, sans-serif" font-size="22" font-weight="900" fill="#fde047" letter-spacing="2">
    👑 MONARCH #${ordinal}/100
  </text>

  <rect x="640" y="70" width="300" height="56" rx="28" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="2"/>
  <text x="670" y="105" font-family="monospace, sans-serif" font-size="18" font-weight="800" fill="#34d399">
    ✓ ON-CHAIN VERIFIED
  </text>

  <!-- Center 3D Crown -->
  <text x="500" y="380" font-size="160" text-anchor="middle" filter="url(#glow)">👑</text>

  <!-- Monarch Nickname -->
  <text x="500" y="490" font-family="system-ui, sans-serif" font-size="56" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-1" filter="url(#glow)">
    ${nickname}
  </text>

  <!-- Royal Decree Tagline -->
  <text x="500" y="550" font-family="system-ui, sans-serif" font-size="28" font-style="italic" fill="#fef08a" text-anchor="middle">
    "${tagline}"
  </text>

  <!-- Central Relic Badge -->
  <rect x="350" y="600" width="300" height="42" rx="21" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="2"/>
  <text x="500" y="628" font-family="monospace, sans-serif" font-size="16" font-weight="900" fill="#c084fc" text-anchor="middle" letter-spacing="1">
    ULTRA RARE GENESIS RELIC
  </text>

  <!-- Bottom Stats Container -->
  <rect x="60" y="720" width="880" height="190" rx="24" fill="rgba(0,0,0,0.8)" stroke="url(#goldGrad)" stroke-width="3"/>

  <!-- Column 1: Tribute -->
  <text x="110" y="780" font-family="monospace, sans-serif" font-size="16" font-weight="700" fill="#9ca3af">TRIBUTE PAID</text>
  <text x="110" y="840" font-family="monospace, sans-serif" font-size="36" font-weight="900" fill="#facc15">${tribute}</text>
  <text x="110" y="875" font-family="monospace, sans-serif" font-size="14" fill="#6b7280">BNB SMART CHAIN</text>

  <!-- Column 2: Program status -->
  <text x="440" y="780" font-family="monospace, sans-serif" font-size="16" font-weight="700" fill="#9ca3af">KOTS PROGRAM</text>
  <text x="440" y="840" font-family="monospace, sans-serif" font-size="28" font-weight="900" fill="#34d399">TERMS PENDING</text>
  <text x="440" y="875" font-family="monospace, sans-serif" font-size="14" fill="#6b7280">NO TOKEN CLAIM IS LIVE</text>

  <!-- Column 3: Token ID -->
  <text x="730" y="780" font-family="monospace, sans-serif" font-size="16" font-weight="700" fill="#9ca3af">RELIC TOKEN ID</text>
  <text x="730" y="840" font-family="monospace, sans-serif" font-size="28" font-weight="900" fill="#c084fc">${tokenId}</text>
  <text x="730" y="875" font-family="monospace, sans-serif" font-size="14" fill="#6b7280">SERIES 1 OF 100</text>

  <!-- Bottom Brand Watermark -->
  <text x="500" y="955" font-family="monospace, sans-serif" font-size="14" font-weight="800" fill="#eab308" text-anchor="middle" letter-spacing="3">
    KING OF THE SCREEN — THE $1,000,000 MONUMENT
  </text>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new NextResponse("Error generating SVG", { status: 500 });
  }
}
