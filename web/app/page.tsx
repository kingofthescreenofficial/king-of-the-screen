import { cookies } from "next/headers";
import { Crown, Trophy } from "lucide-react";

import { PrivateCaptureClient } from "@/components/PrivateCaptureClient";
import { LIVE_MICROTEST_ACCESS_COOKIE, hasValidLiveMicrotestAccess, isLiveMicrotestEnabled, isPublicPrivateCaptureEnabled } from "@/lib/live-microtest";
import { getAppState } from "@/lib/state";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ private_capture?: string; capture_token?: string }> }) {
  const state = getAppState();
  const params = await searchParams;
  const cookieStore = await cookies();
  const privateAccess = isPublicPrivateCaptureEnabled() || (params.private_capture === "1" && isLiveMicrotestEnabled() && hasValidLiveMicrotestAccess(params.capture_token) && hasValidLiveMicrotestAccess(cookieStore.get(LIVE_MICROTEST_ACCESS_COOKIE)?.value));
  const king = state.currentKing;
  return <main className="min-h-screen bg-[#08080c] px-4 py-6 font-mono text-white selection:bg-yellow-500 selection:text-black sm:py-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-yellow-500/20 pb-6 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><span className="rounded-lg border border-yellow-500/40 bg-yellow-500/20 p-1.5 text-yellow-400"><Crown className="h-5 w-5" /></span><h1 className="text-2xl font-black tracking-tight text-yellow-300 sm:text-3xl">KING OF THE SCREEN</h1></div><p className="mt-1 text-xs text-gray-400 sm:text-sm">One screen. One ruler. Hold it until you get dethroned.</p></div><span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-300">● PRODUCTION TEST. $0.95</span></header>
      <section className="relative overflow-hidden rounded-2xl border-2 border-yellow-500/60 bg-gradient-to-b from-[#141422] to-[#0d0d15] p-5 shadow-2xl sm:p-8"><div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" /><div className="relative mx-auto max-w-3xl text-center"><span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-yellow-300"><Trophy className="h-4 w-4" /> CURRENT KING</span><h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">{king.nickname}</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-xl">{king.tagline}</p>{king.link && <a href={king.link} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-bold text-cyan-200 underline">{king.link}</a>}</div><div className="relative mt-7 overflow-hidden rounded-xl border border-yellow-400/30 bg-black/60"><img src={king.mediaUrl} alt="Current King visual" className="h-56 w-full object-cover opacity-80 sm:h-80" /></div><div className="relative mt-5 grid gap-3 text-center sm:grid-cols-3"><div className="rounded-xl border border-white/10 bg-black/30 p-4"><span className="block text-xs text-slate-400">ARCHIVED CROWNS</span><b className="mt-1 block text-2xl text-yellow-300">{state.stats.settledCrownCount}</b></div><div className="rounded-xl border border-white/10 bg-black/30 p-4"><span className="block text-xs text-slate-400">TEST PRICE</span><b className="mt-1 block text-2xl text-yellow-300">$0.95</b></div><div className="rounded-xl border border-white/10 bg-black/30 p-4"><span className="block text-xs text-slate-400">NFT / KOTS</span><b className="mt-1 block text-2xl text-slate-300">OFF</b></div></div></section>
      {privateAccess ? <PrivateCaptureClient currentKing={king.nickname} token={params.capture_token} /> : null}
      <section className="rounded-2xl border border-white/10 bg-[#11111c] p-5 sm:p-7"><div className="flex items-center gap-2 text-lg font-black text-yellow-300"><Trophy className="h-5 w-5" /> CROWN ARCHIVE</div><div className="mt-4 space-y-3">{state.hallOfFame.length ? state.hallOfFame.slice(0, 10).map((entry) => <article key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-4"><div><b>{entry.nickname}</b><p className="mt-1 text-xs text-slate-400">{entry.tagline}</p></div><span className="text-sm font-bold text-yellow-200">${entry.paidAmountUsd.toFixed(2)}</span></article>) : <p className="py-6 text-center text-sm text-slate-500">No private capture has settled yet.</p>}</div></section>
      <footer className="pb-10 pt-2 text-center text-xs text-slate-500">King of the Screen. Production payment test. No NFT. No KOTS.</footer>
    </div>
  </main>;
}
