"use client";

import { Transaction } from "@solana/web3.js";
import { Crown, ExternalLink, LockKeyhole, Wallet } from "lucide-react";
import { useState } from "react";

import { PHANTOM_DOWNLOAD_URL, buildPhantomBrowseUrl, isMobileUserAgent } from "@/lib/phantom-browser";
import { getPhantomProvider } from "@/lib/phantom-provider";

type Preview = { id: string; totalLamports: number; treasuryLamports: number; operationsVaultLamports: number; serializedTransaction: string; expiresAt: number; amountUsdCents: number };

function sol(lamports: number): string { return (lamports / 1_000_000_000).toFixed(6); }

export function PrivateCaptureClient({ currentKing, token }: { currentKing: string; token?: string }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [tagline, setTagline] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [status, setStatus] = useState(`Private production test. ${currentKing} is the current King.`);

  function openInPhantom() {
    const target = token ? new URL("/capture/access", window.location.origin) : new URL("/", window.location.origin);
    if (token) target.searchParams.set("token", token);
    window.location.assign(buildPhantomBrowseUrl(target.toString(), window.location.origin));
  }

  async function connectWallet() {
    const provider = getPhantomProvider();
    if (!provider) {
      if (isMobileUserAgent(navigator.userAgent)) { setStatus("Opening this private test inside Phantom."); openInPhantom(); return; }
      window.location.assign(PHANTOM_DOWNLOAD_URL); return;
    }
    try { const result = await provider.connect(); setWalletAddress(result.publicKey.toBase58()); setStatus("Wallet connected. Enter the King record, then prepare the fixed payment."); }
    catch { setStatus("Wallet connection was cancelled."); }
  }

  async function prepare() {
    if (!walletAddress) { setStatus("Connect Phantom first."); return; }
    setStatus("Preparing the private $0.95 capture transaction.");
    try {
      const response = await fetch("/api/private-capture/intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletAddress, nickname, tagline, linkUrl }) });
      const body = await response.json() as Preview & { code?: string };
      if (!response.ok || body.amountUsdCents !== 95 || !body.id) throw new Error(body.code ?? "CAPTURE_PREVIEW_UNAVAILABLE");
      setPreview(body); setSignature(null); setStatus("Transaction ready. Phantom will show the exact 80/20 split before you approve it.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "CAPTURE_PREVIEW_UNAVAILABLE"); }
  }

  async function capture() {
    const provider = getPhantomProvider();
    if (!provider || !preview) return;
    try {
      const result = await provider.signAndSendTransaction(Transaction.from(Buffer.from(preview.serializedTransaction, "base64")));
      setSignature(result.signature); setStatus("Phantom sent the transfer. Checking Solana finalization and updating the King record.");
      await settle(result.signature);
    } catch (error) { setStatus(error instanceof Error ? error.message : "CAPTURE_SEND_FAILED"); }
  }

  async function settle(transactionSignature = signature) {
    if (!preview || !transactionSignature) return;
    try {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 2500));
        const response = await fetch("/api/private-capture/settle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intentId: preview.id, signature: transactionSignature }) });
        const body = await response.json() as { status?: string; code?: string; king?: string };
        if (body.status === "SETTLED") { setStatus(`${body.king} is now the King. The archive and history are updated. No NFT or KOTS action was created.`); window.setTimeout(() => window.location.reload(), 1300); return; }
        if (response.status !== 202) throw new Error(body.code ?? "CAPTURE_SETTLEMENT_FAILED");
      }
      setStatus("Transfer sent. Solana finalization is still pending. Press SETTLE PAYMENT after a few seconds.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "CAPTURE_SETTLEMENT_FAILED"); }
  }

  return <section className="mt-6 rounded-2xl border border-yellow-400/50 bg-black/70 p-5 shadow-[0_0_50px_rgba(234,179,8,.16)] sm:p-7">
    <div className="flex items-center gap-2 text-xs font-black tracking-[.18em] text-yellow-300"><LockKeyhole size={15} /> PRIVATE PRODUCTION CAPTURE. STAGE 1</div>
    <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">CAPTURE THE THRONE FOR $0.95</h2>
    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">A real Solana mainnet transfer. 80% goes to Treasury. 20% goes to Operations. The successful finalized transaction changes the public King record and archive. NFT and KOTS stay off.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={48} placeholder="King name" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-yellow-400" /><input value={tagline} onChange={(event) => setTagline(event.target.value)} maxLength={280} placeholder="Message on the screen" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-yellow-400" /><input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https:// link, optional" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-yellow-400 sm:col-span-2" /></div>
    <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={connectWallet} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-black"><Wallet size={17} />{walletAddress ? "PHANTOM CONNECTED" : "CONNECT PHANTOM"}</button><button type="button" onClick={prepare} disabled={!walletAddress} className="rounded-xl border border-yellow-300/70 px-4 py-3 text-sm font-black text-yellow-100 disabled:opacity-40">PREPARE $0.95</button><button type="button" onClick={capture} disabled={!preview || Boolean(signature)} className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black disabled:opacity-40"><Crown size={17} />CONFIRM IN PHANTOM</button>{signature && <button type="button" onClick={() => settle()} className="rounded-xl border border-cyan-300/70 px-4 py-3 text-sm font-black text-cyan-100">SETTLE PAYMENT</button>}</div>
    <button type="button" onClick={openInPhantom} className="mt-4 rounded-xl border border-cyan-300/60 px-4 py-3 text-xs font-bold text-cyan-100">OPEN PRIVATE TEST IN PHANTOM</button>
    {preview && <div className="mt-5 grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 sm:grid-cols-3"><span>Total: <b>{sol(preview.totalLamports)} SOL</b></span><span>Treasury: <b>{sol(preview.treasuryLamports)} SOL</b></span><span>Operations: <b>{sol(preview.operationsVaultLamports)} SOL</b></span></div>}
    <p aria-live="polite" className="mt-5 text-sm leading-6 text-yellow-100">{status}</p>
    {signature && <a href={`https://explorer.solana.com/tx/${signature}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 underline">OPEN SOLANA EXPLORER <ExternalLink size={14} /></a>}
  </section>;
}
