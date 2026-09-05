import { Crown, Flame, Gem, Globe, ShieldCheck, Target, Trophy, Zap } from "lucide-react";
import { buildPrelaunchDisplay } from "@/lib/prelaunch-display";

const milestones = ["PRE-LAUNCH", "SCREEN", "ARCHIVE", "STATUS", "REVIEW"];
const steps = [
  { number: "1", label: "Wallet", tone: "border-purple-500/40 bg-purple-500/20 text-purple-400" },
  { number: "2", label: "Screen", tone: "border-yellow-500/40 bg-yellow-500/20 text-yellow-400" },
  { number: "3", label: "Archive", tone: "border-emerald-500/40 bg-emerald-500/20 text-emerald-400" },
];

export default function OriginalDesignStudy() {
  const display = buildPrelaunchDisplay();

  return (
    <main className="min-h-screen bg-[#08080c] px-4 py-6 font-mono text-white selection:bg-yellow-500 selection:text-black sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-4 border-b border-cyber-border/80 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-yellow-500/40 bg-yellow-500/20 p-1.5 text-yellow-400"><Crown className="h-5 w-5" /></span>
              <h1 className="text-glow-gold text-2xl font-black tracking-tight sm:text-3xl">KING OF THE SCREEN</h1>
            </div>
            <p className="mt-1 text-xs text-gray-400 sm:text-sm">One screen. One ruler. Hold it until you get dethroned.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-400">● PRE-LAUNCH SIGNAL</span>
            <span className="flex h-12 items-center gap-1.5 rounded-xl bg-gray-700 px-4 font-black uppercase tracking-wider text-gray-300">{display.paymentStatus}</span>
          </div>
        </header>

        <section className="relative mx-auto my-4 w-full max-w-5xl overflow-hidden rounded-2xl border-2 border-yellow-500/50 bg-gradient-to-b from-[#141422] to-[#0d0d15] p-5 shadow-2xl sm:p-7">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="relative mx-auto mb-6 max-w-3xl space-y-3 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-yellow-400"><Gem className="h-4 w-4" /> PUBLIC SCREEN PREVIEW</span>
            <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl">ONE SCREEN. <span className="text-yellow-400">ONE FUTURE PUBLIC RECORD.</span></h2>
            <p className="mx-auto max-w-2xl text-xs leading-relaxed text-gray-300 sm:text-base">King of the Screen is a public art and status experiment. <strong className="text-emerald-400">The project is under pre-launch review. Payments, token activity, and NFT activity are disabled.</strong></p>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="space-y-2 rounded-xl border border-cyber-border/80 bg-black/60 p-4">
                <div className={`flex items-center gap-2 text-sm font-bold ${step.tone.split(" ").at(-1)}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-black ${step.tone}`}>{step.number}</span><Zap className="h-4 w-4" /> {step.label}</div>
                <p className="text-xs leading-relaxed text-gray-400">This feature stays unavailable during pre-launch review.</p>
              </article>
            ))}
          </div>
          <div className="relative mt-6 flex flex-col items-center justify-between gap-4 border-t border-yellow-500/20 pt-4 sm:flex-row">
            <span className="flex items-center gap-2 text-xs text-emerald-400"><ShieldCheck className="h-4 w-4" /> PAYMENTS, NFT MINTING, AND KOTS CLAIMS ARE PAUSED.</span>
            <span className="rounded-xl bg-gray-700 px-6 py-3 text-sm font-black tracking-wider text-gray-300">{display.paymentStatus}</span>
          </div>
        </section>

        <section className="relative mx-auto my-4 w-full max-w-5xl overflow-hidden rounded-2xl border-2 border-yellow-500/80 bg-cyber-card shadow-[0_0_50px_rgba(234,179,8,0.35)]">
          <div className="flex min-h-[320px] items-center justify-center bg-black p-8 text-center sm:min-h-[460px]">
            <div><Crown className="mx-auto mb-4 h-20 w-20 text-yellow-400/50" /><p className="text-xl text-gray-400">{display.screen.title}</p><p className="mt-2 text-sm text-gray-600">{display.screen.message}</p></div>
          </div>
          <div className="space-y-5 border-t-2 border-yellow-500/40 bg-[#11111c] p-5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyber-border/60 pb-3">
              <div className="flex items-center gap-3"><span className="text-glow-gold flex items-center gap-2 text-2xl font-black tracking-wide sm:text-4xl">👑 CROWN RECORD</span><span className="rounded-md bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-black">UNPUBLISHED</span></div>
              <span className="flex items-center gap-1.5 rounded-xl border border-yellow-500/60 bg-gradient-to-r from-purple-900/60 to-yellow-900/60 px-3.5 py-1.5 text-xs font-black text-yellow-300"><Gem className="h-4 w-4 text-purple-400" /> {display.nft.status}</span>
            </div>
            <p className="text-2xl font-black leading-tight tracking-tight text-emerald-300 sm:text-4xl">"No public record is available during pre-launch."</p>
            <div className="flex flex-col justify-between gap-4 rounded-2xl border-2 border-cyan-400 bg-gradient-to-r from-[#032b36] via-[#051d24] to-[#032b36] p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex items-center gap-3.5"><span className="rounded-xl bg-cyan-400 p-3 text-black"><Globe className="h-6 w-6" /></span><div><span className="block text-[11px] font-black tracking-widest text-cyan-300">PUBLIC PROJECT HOME</span><span className="block text-lg font-black text-white sm:text-2xl">kingofthescreen.fun</span></div></div>
              <span className="rounded-xl bg-cyan-400 px-6 py-3 text-center text-sm font-black tracking-wider text-black">PRE-LAUNCH</span>
            </div>
            <span className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-700 py-4 text-lg font-black tracking-wider text-gray-300 sm:py-5 sm:text-xl"><Flame className="h-7 w-7" /> {display.paymentStatus}</span>
          </div>
          <div className="flex items-center justify-between border-t border-cyber-border bg-black/95 px-4 py-2 text-[11px] text-gray-400"><span className="flex items-center gap-2 text-red-400"><i className="h-2.5 w-2.5 rounded-full bg-red-500" /> 24/7 GLOBAL LIVE FEED</span><span className="hidden text-yellow-400 sm:block">RULE: Holds screen until outbid</span></div>
        </section>

        <section className="relative mx-auto my-6 w-full max-w-5xl overflow-hidden rounded-2xl border border-cyber-border bg-cyber-card p-4 shadow-xl sm:p-6">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><span className="flex items-center gap-2 text-xs tracking-widest text-emerald-400"><Target className="h-4 w-4" /> PRE-LAUNCH STATUS</span><div className="mt-1 flex items-baseline gap-2"><span className="text-glow-green text-3xl font-black sm:text-4xl">PAUSED</span><span className="text-sm text-gray-400">NO PUBLIC TRANSACTIONS</span></div></div><span className="rounded-xl border border-cyber-border bg-black/50 px-3 py-2 text-xs text-gray-400">NO ACTIVE CROWNS</span></div>
          <div className="h-5 rounded-full border border-cyber-border bg-black/80 p-0.5"><div className="h-full w-[1%] rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-400" /></div>
          <div className="mt-2 flex justify-between gap-2 text-[10px] text-gray-500">{milestones.map((milestone) => <span key={milestone}>{milestone}</span>)}</div>
        </section>

        <section className="mx-auto my-8 w-full max-w-5xl rounded-2xl border border-cyber-border bg-cyber-card p-4 shadow-xl sm:p-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-cyber-border pb-4"><span className="flex items-center gap-2 text-base font-bold text-gold-400 sm:text-lg"><Trophy className="h-5 w-5 text-yellow-400" /> CROWN ARCHIVE</span><span className="rounded-xl border border-cyber-border bg-black/60 px-3 py-1.5 text-xs text-gray-400">TIMELINE</span></div><div className="py-10 text-center text-xs text-gray-500"><Crown className="mx-auto mb-2 h-8 w-8 opacity-50" /><p>No crown records have been published. The archive stays read-only before launch.</p></div></section>

        <footer className="border-t border-cyber-border/80 pb-12 pt-8 text-center text-xs text-gray-500"><div className="flex items-center justify-center gap-2 font-bold text-gray-300"><Crown className="h-4 w-4 text-yellow-400" /> KING OF THE SCREEN (2026)</div><p className="mt-2">Selected visual system, preserved as a non-transactional pre-launch study.</p></footer>
      </div>
    </main>
  );
}
