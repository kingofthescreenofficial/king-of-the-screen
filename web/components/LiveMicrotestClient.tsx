"use client";

import { Transaction } from "@solana/web3.js";
import { ExternalLink, ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";

import { PHANTOM_DOWNLOAD_URL, buildPhantomBrowseUrl, isMobileUserAgent } from "@/lib/phantom-browser";
import { getPhantomProvider } from "@/lib/phantom-provider";

type Preview = {
  totalLamports: number;
  treasuryLamports: number;
  operationsVaultLamports: number;
  serializedTransaction: string;
};

function sol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(6);
}

export function LiveMicrotestClient({ phantomBrowseUrl }: { phantomBrowseUrl: string }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [status, setStatus] = useState("This is a one-time mainnet payment test. No NFT, KOTS, claim, or auction entry is created.");

  function openPhantomOnMobile() {
    const token = new URLSearchParams(window.location.search).get("live_test_token");
    if (!token) {
      window.location.assign(PHANTOM_DOWNLOAD_URL);
      return;
    }
    const accessUrl = new URL("/live-test/access", window.location.origin);
    accessUrl.searchParams.set("token", token);
    window.location.assign(buildPhantomBrowseUrl(accessUrl.toString(), window.location.origin));
  }

  async function connectWallet() {
    const currentProvider = getPhantomProvider();
    if (!currentProvider) {
      if (isMobileUserAgent(navigator.userAgent)) {
        setStatus("Opening this payment test in Phantom.");
        openPhantomOnMobile();
        return;
      }
      window.location.assign(PHANTOM_DOWNLOAD_URL);
      return;
    }
    try {
      const result = await currentProvider.connect();
      setWalletAddress(result.publicKey.toBase58());
      setStatus("Mainnet wallet connected. Prepare the fixed $0.95 payment before Phantom shows any transfer.");
    } catch {
      setStatus("Wallet connection was cancelled.");
    }
  }

  async function preparePayment() {
    if (!walletAddress) {
      setStatus("Connect the wallet first.");
      return;
    }
    setStatus("Preparing a fixed $0.95 mainnet payment.");
    try {
      const response = await fetch("/api/live-test/payment", {
        body: JSON.stringify({ walletAddress }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = await response.json() as { amountUsdCents?: number; preview?: Preview; error?: string };
      if (!response.ok || body.amountUsdCents !== 95 || !body.preview) throw new Error(body.error ?? "Payment preview unavailable.");
      setPreview(body.preview);
      setSignature(null);
      setStatus("Preview ready. Check the 80/20 split. Phantom will show the final transaction before it sends it.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Payment preview unavailable.");
    }
  }

  async function sendPayment() {
    const currentProvider = getPhantomProvider();
    if (!currentProvider || !preview) return;
    try {
      const transaction = Transaction.from(Buffer.from(preview.serializedTransaction, "base64"));
      const result = await currentProvider.signAndSendTransaction(transaction);
      setSignature(result.signature);
      setStatus("Phantom submitted the payment. Wait for its confirmation, then open the transaction record.");
    } catch {
      setStatus("Payment was cancelled or rejected. No completed transfer was recorded by this page.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-amber-300/35 bg-[#0c1220] p-6 shadow-[0_20px_80px_rgba(0,0,0,.4)] sm:p-9">
      <p className="text-xs font-black tracking-[.2em] text-amber-300">PRIVATE MAINNET MICROTEST</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-white">$0.95 PAYMENT CHECK</h1>
      <p className="mt-4 leading-7 text-slate-300">This page sends at most $0.95 in SOL, split 80% to Treasury and 20% to Operations. Network fee is paid separately by the wallet. This does not take the throne and does not create an NFT or KOTS balance.</p>
      <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-slate-200 sm:grid-cols-2">
        <span>Treasury: 80%</span><span>Operations: 20%</span>
        <span>Transaction cap: $0.95</span><span>Cluster: Solana mainnet</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={connectWallet} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-100"><Wallet size={18} />{walletAddress ? "WALLET CONNECTED" : "CONNECT PHANTOM"}</button>
        <button type="button" onClick={preparePayment} disabled={!walletAddress} className="rounded-xl border border-amber-300/60 px-4 py-3 font-bold text-amber-100 disabled:cursor-not-allowed disabled:opacity-40">PREPARE $0.95</button>
        <button type="button" onClick={sendPayment} disabled={!preview || Boolean(signature)} className="rounded-xl bg-amber-300 px-4 py-3 font-black text-black disabled:cursor-not-allowed disabled:opacity-40">SEND IN PHANTOM</button>
      </div>
      <a href={phantomBrowseUrl} className="mt-4 inline-flex rounded-xl border border-cyan-300/60 px-4 py-3 text-sm font-bold text-cyan-100">OPEN THIS PAGE IN PHANTOM</a>
      {preview && <div className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200"><div className="flex justify-between gap-5"><span>Total</span><strong>{sol(preview.totalLamports)} SOL</strong></div><div className="flex justify-between gap-5"><span>Treasury</span><strong>{sol(preview.treasuryLamports)} SOL</strong></div><div className="flex justify-between gap-5"><span>Operations</span><strong>{sol(preview.operationsVaultLamports)} SOL</strong></div></div>}
      <p aria-live="polite" className="mt-6 text-sm leading-6 text-amber-100">{status}</p>
      {signature && <a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 underline" href={`https://explorer.solana.com/tx/${signature}`} rel="noreferrer" target="_blank">OPEN SOLANA EXPLORER <ExternalLink size={15} /></a>}
      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" size={16} />The page never holds a wallet key. Phantom shows and asks for approval of the actual transfer.</p>
    </div>
  );
}
