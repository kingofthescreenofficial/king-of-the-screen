import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { LiveMicrotestClient } from "@/components/LiveMicrotestClient";
import { LIVE_MICROTEST_ACCESS_COOKIE, hasValidLiveMicrotestAccess, isLiveMicrotestEnabled } from "@/lib/live-microtest";

export default async function LiveTestPage() {
  const cookieStore = await cookies();
  if (!isLiveMicrotestEnabled() || !hasValidLiveMicrotestAccess(cookieStore.get(LIVE_MICROTEST_ACCESS_COOKIE)?.value)) notFound();
  return <main className="min-h-screen bg-[#060a12] px-4 py-8 font-sans text-white sm:px-8 sm:py-12"><LiveMicrotestClient /></main>;
}
