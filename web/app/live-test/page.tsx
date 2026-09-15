import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { LiveMicrotestClient } from "@/components/LiveMicrotestClient";
import { LIVE_MICROTEST_ACCESS_COOKIE, hasValidLiveMicrotestAccess, isLiveMicrotestEnabled } from "@/lib/live-microtest";
import { buildPhantomBrowseUrl } from "@/lib/phantom-browser";

export default async function LiveTestPage({ searchParams }: { searchParams: Promise<{ live_test_token?: string }> }) {
  const cookieStore = await cookies();
  const params = await searchParams;
  const token = params.live_test_token;
  if (!token || !isLiveMicrotestEnabled() || !hasValidLiveMicrotestAccess(cookieStore.get(LIVE_MICROTEST_ACCESS_COOKIE)?.value) || !hasValidLiveMicrotestAccess(token)) notFound();
  const origin = process.env.KOTS_PUBLIC_ORIGIN;
  if (!origin) notFound();
  const accessUrl = new URL("/live-test/access", origin);
  accessUrl.searchParams.set("token", token);
  const phantomBrowseUrl = buildPhantomBrowseUrl(accessUrl.toString(), origin);
  return <main className="min-h-screen bg-[#060a12] px-4 py-8 font-sans text-white sm:px-8 sm:py-12"><LiveMicrotestClient phantomBrowseUrl={phantomBrowseUrl} /></main>;
}
