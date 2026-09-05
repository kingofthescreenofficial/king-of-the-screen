import { randomUUID } from "node:crypto";

import { PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

import { getApprovedContentSubmission } from "@/lib/content-submissions";
import { getDatabase } from "@/lib/database";
import { isStagingMode } from "@/lib/feature-flags";

export async function POST(request: Request) {
  if (!isStagingMode()) return NextResponse.json({ code: "STAGING_DISABLED", error: "Staging is unavailable." }, { status: 404 });
  try {
    const body = await request.json() as { walletAddress?: unknown; displayName?: unknown; message?: unknown; contentSubmissionId?: unknown };
    if (typeof body.walletAddress !== "string" || typeof body.displayName !== "string" || typeof body.message !== "string" || typeof body.contentSubmissionId !== "string") throw new Error("INVALID_NFT_PREVIEW");
    new PublicKey(body.walletAddress);
    if (!getApprovedContentSubmission(body.contentSubmissionId)) throw new Error("INVALID_NFT_PREVIEW");
    const now = Date.now();
    const id = randomUUID();
    getDatabase().prepare("INSERT INTO reward_jobs (id, idempotency_key, status, created_at, updated_at) VALUES (?, ?, 'STAGING_PREVIEW', ?, ?)")
      .run(id, `staging-status-nft:${id}`, now, now);
    return NextResponse.json({ id, status: "STAGING_PREVIEW", message: "No NFT was minted or sent." }, { status: 201 });
  } catch {
    return NextResponse.json({ code: "INVALID_NFT_PREVIEW", error: "A valid devnet wallet and display details are required." }, { status: 400 });
  }
}
