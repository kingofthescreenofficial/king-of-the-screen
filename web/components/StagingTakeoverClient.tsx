"use client";

import { Transaction } from "@solana/web3.js";
import { CheckCircle2, Crown, LockKeyhole, Wallet } from "lucide-react";
import { useState } from "react";

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: { toBase58(): string };
  connect(): Promise<{ publicKey: { toBase58(): string } }>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
};

declare global {
  interface Window { solana?: PhantomProvider; }
}

type Preview = { totalLamports: number; treasuryLamports: number; operationsVaultLamports: number; serializedTransaction: string };

function sol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(4);
}

export function StagingTakeoverClient() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [status, setStatus] = useState("Devnet only. No money moves from this screen.");
  const [signed, setSigned] = useState(false);
  const [nftPreview, setNftPreview] = useState(false);

  async function connectWallet() {
    const provider = window.solana;
    if (!provider?.isPhantom) {
      setStatus("Phantom was not found. Open this staging page in a browser with Phantom installed.");
      return;
    }
    try {
      const result = await provider.connect();
      setWalletAddress(result.publicKey.toBase58());
      setStatus("Devnet wallet connected. No transaction has been prepared yet.");
    } catch {
      setStatus("Wallet connection was cancelled.");
    }
  }

  async function preparePreview() {
    if (!walletAddress || !displayName.trim() || !message.trim()) {
      setStatus("Connect a devnet wallet and complete the screen details first.");
      return;
    }
    setStatus("Preparing the unsigned devnet transaction.");
    try {
      const response = await fetch("/api/staging/payment-preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletAddress, displayName, message, link }) });
      const body = await response.json() as { preview?: Preview; error?: string };
      if (!response.ok || !body.preview) throw new Error(body.error ?? "Preview unavailable.");
      setPreview(body.preview);
      setSigned(false);
      setStatus("Preview ready. It contains two devnet transfers. It has not been signed or broadcast.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Preview unavailable.");
    }
  }

  async function signPreview() {
    const provider = window.solana;
    if (!provider?.isPhantom || !preview) return;
    try {
      const transaction = Transaction.from(Buffer.from(preview.serializedTransaction, "base64"));
      await provider.signTransaction(transaction);
      setSigned(true);
      setStatus("Phantom signed the devnet preview. The app does not broadcast it and no funds moved.");
    } catch {
      setStatus("Signature was cancelled. No funds moved.");
    }
  }

  async function queueNftPreview() {
    if (!walletAddress || !signed) return;
    const response = await fetch("/api/staging/nft-queue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletAddress, displayName, message }) });
    if (response.ok) {
      setNftPreview(true);
      setStatus("NFT job preview recorded. No NFT was minted or sent.");
    } else {
      setStatus("NFT job preview could not be recorded.");
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
      <div className="rounded-3xl border border-cyan-300/25 bg-[#0c1220] p-5 shadow-[0_20px_80px_rgba(0,0,0,.35)] sm:p-7">
        <p className="text-xs font-bold tracking-[.2em] text-cyan-300">STAGING TAKEOVER CONSOLE</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">PUT YOUR MESSAGE ON THE SCREEN.</h1>
        <p className="mt-4 max-w-xl leading-7 text-slate-300">Build the exact screen card that a future participant will review. The staging flow prepares a devnet-only 80/20 transaction and never broadcasts it.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-slate-300 sm:col-span-1">Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={48} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-cyan-300" placeholder="Your name" /></label>
          <label className="text-sm text-slate-300 sm:col-span-2">Message<input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={280} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-cyan-300" placeholder="What stays on the screen?" /></label>
          <label className="text-sm text-slate-300 sm:col-span-3">Link, optional<input value={link} onChange={(event) => setLink(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-cyan-300" placeholder="https://example.com" /></label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={connectWallet} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-100"><Wallet size={18} />{walletAddress ? "DEVNET WALLET CONNECTED" : "CONNECT PHANTOM"}</button>
          <button type="button" onClick={preparePreview} className="rounded-xl border border-cyan-300/50 px-4 py-3 font-bold text-cyan-200 transition hover:bg-cyan-300/10">PREPARE 80/20 PREVIEW</button>
        </div>
        <p aria-live="polite" className="mt-5 text-sm leading-6 text-cyan-100">{status}</p>
      </div>

      <aside className="rounded-3xl border border-amber-300/25 bg-[#15110b] p-5 sm:p-7">
        <div className="flex items-center gap-3"><Crown className="text-amber-300" /><p className="font-bold tracking-[.16em] text-amber-200">TRANSACTION PREVIEW</p></div>
        {preview ? <div className="mt-6 space-y-4 text-sm text-slate-200"><div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-slate-400">Total devnet amount</p><strong className="mt-1 block text-2xl text-white">{sol(preview.totalLamports)} SOL</strong></div><div className="flex justify-between"><span>Treasury, 80%</span><strong>{sol(preview.treasuryLamports)} SOL</strong></div><div className="flex justify-between"><span>Operations wallet, 20%</span><strong>{sol(preview.operationsVaultLamports)} SOL</strong></div><button type="button" onClick={signPreview} className="w-full rounded-xl bg-amber-300 px-4 py-3 font-black text-black">SIGN DEVNET PREVIEW</button><button type="button" disabled={!signed} onClick={queueNftPreview} className="w-full rounded-xl border border-amber-300/50 px-4 py-3 font-black text-amber-100 disabled:cursor-not-allowed disabled:opacity-40">QUEUE NFT PREVIEW</button>{nftPreview && <p className="flex items-center gap-2 text-emerald-300"><CheckCircle2 size={16} />NFT preview queued. No mint and no delivery.</p>}</div> : <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-5 text-sm leading-6 text-slate-400"><LockKeyhole className="mb-3 text-amber-300" />Connect a devnet wallet and prepare the preview. The final production flow remains disabled.</div>}
      </aside>
    </section>
  );
}
