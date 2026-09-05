import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export const metadata: Metadata = {
  title: "KOTS Mechanics Status",
  description: "The King of the Screen mechanics are under pre-launch review.",
  robots: { index: false, follow: false },
};

export default function MechanicsV11Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08080c] px-5 py-10 font-sans text-zinc-200">
      <section className="w-full max-w-xl rounded-2xl border border-yellow-400/30 bg-yellow-400/5 p-7 text-center">
        <LockKeyhole className="mx-auto text-yellow-300" size={28} />
        <p className="mt-5 text-xs font-bold tracking-[0.18em] text-yellow-300">PRE-LAUNCH REVIEW</p>
        <h1 className="mt-3 text-3xl font-black text-white">MECHANICS ARE NOT PUBLIC TERMS</h1>
        <p className="mt-4 leading-7 text-zinc-300">Оплаты, NFT, KOTS и иные финансовые механики выключены. Эта страница не предлагает участие, актив, инвестицию или будущую выгоду.</p>
        <Link href="/legal" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-yellow-300 hover:text-yellow-200"><ArrowLeft size={15} />READ PRE-LAUNCH NOTICE</Link>
      </section>
    </main>
  );
}
