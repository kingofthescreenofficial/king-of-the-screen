import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDatabase } from "@/lib/database";
import { getPublicCapabilities } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export async function GET(request?: Request) {
  if (!request || !requireAdmin(request)) return NextResponse.json({ code: "ADMIN_AUTH_REQUIRED", error: "Authentication is required." }, { status: 401 });
  const database = getDatabase();
  const count = (table: "content_submissions" | "payments" | "reward_jobs" | "settlement_recoveries") => (database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number }).count;
  const pendingNftJobs = (database.prepare("SELECT COUNT(*) AS count FROM reward_jobs WHERE status = 'PENDING_LAUNCH'").get() as { count: number }).count;
  const recoveries = (database.prepare("SELECT COUNT(*) AS count FROM settlement_recoveries WHERE status = 'OPEN'").get() as { count: number }).count;
  const recentSubmissions = database.prepare(`
    SELECT id, status, nickname, created_at, updated_at FROM content_submissions
    ORDER BY updated_at DESC LIMIT 20
  `).all();
  const recentRewards = database.prepare(`
    SELECT id, status, created_at, updated_at FROM reward_jobs
    ORDER BY updated_at DESC LIMIT 20
  `).all();
  const recentRecoveries = database.prepare(`
    SELECT payment_id, reason_code, status, created_at, updated_at FROM settlement_recoveries
    ORDER BY updated_at DESC LIMIT 20
  `).all();
  return NextResponse.json(
    {
      capabilities: getPublicCapabilities(),
      operations: {
        totalSubmissions: count("content_submissions"),
        totalPayments: count("payments"),
        totalRewardJobs: count("reward_jobs"),
        totalRecoveries: count("settlement_recoveries"),
        pendingNftJobs,
        openRecoveries: recoveries,
        recentSubmissions,
        recentRewards,
        recentRecoveries,
      },
    },
  );
}
