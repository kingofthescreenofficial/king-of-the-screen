import { notFound } from "next/navigation";

import { StagingTakeoverClient } from "@/components/StagingTakeoverClient";
import { isStagingMode } from "@/lib/feature-flags";

export default function StagingPage() {
  if (!isStagingMode()) notFound();
  return (
    <main className="min-h-screen bg-[#060a12] px-4 py-8 font-sans text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-5 text-xs font-bold tracking-[.16em] text-slate-400"><span>KING OF THE SCREEN</span><span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-cyan-200">DEVNET STAGING. NO BROADCAST.</span></div>
        <StagingTakeoverClient />
      </div>
    </main>
  );
}
