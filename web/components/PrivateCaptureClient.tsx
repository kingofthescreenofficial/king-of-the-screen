"use client";

import { Transaction } from "@solana/web3.js";
import { Crown, ImagePlus, Wallet, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PHANTOM_DOWNLOAD_URL, buildPhantomBrowseUrl, isMobileUserAgent } from "@/lib/phantom-browser";
import { getPhantomProvider } from "@/lib/phantom-provider";

type Preview = { id: string; totalLamports: number; treasuryLamports: number; operationsVaultLamports: number; serializedTransaction: string; amountUsdCents: number };

function sol(lamports: number): string { return (lamports / 1_000_000_000).toFixed(6); }

export function PrivateCaptureClient({ currentKing, token }: { currentKing: string; token?: string }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [tagline, setTagline] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [status, setStatus] = useState(`${currentKing} holds the throne.`);

  useEffect(() => () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); }, []);

  function openInPhantom() {
    const target = token ? new URL("/capture/access", window.location.origin) : new URL("/", window.location.origin);
    if (token) target.searchParams.set("token", token);
    window.location.assign(buildPhantomBrowseUrl(target.toString(), window.location.origin));
  }

  async function connectWallet() {
    const provider = getPhantomProvider();
    if (!provider) {
      if (isMobileUserAgent(navigator.userAgent)) { setStatus("Opening King of the Screen inside Phantom."); openInPhantom(); return; }
      window.location.assign(PHANTOM_DOWNLOAD_URL); return;
    }
    try { const result = await provider.connect(); setWalletAddress(result.publicKey.toBase58()); setStatus("Wallet connected. You can capture the throne."); }
    catch { setStatus("Wallet connection was cancelled."); }
  }

  function selectImage(nextImage: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const nextPreview = nextImage ? URL.createObjectURL(nextImage) : null;
    previewRef.current = nextPreview;
    setImage(nextImage); setImagePreview(nextPreview); setPreview(null); setSignature(null);
  }

  async function reviewAndPrepare(): Promise<Preview | null> {
    if (!walletAddress || !image || !nickname.trim() || !tagline.trim()) { setStatus("Add an image, name, and message first."); return null; }
    setStatus("Checking your image and message.");
    const form = new FormData();
    form.set("file", image); form.set("nickname", nickname); form.set("tagline", tagline); form.set("linkUrl", linkUrl);
    const review = await fetch("/api/private-capture/content", { method: "POST", body: form });
    const reviewed = await review.json() as { id?: string; code?: string };
    if (!review.ok || !reviewed.id) throw new Error(reviewed.code ?? "CONTENT_REVIEW_FAILED");
    setStatus("Content approved. Preparing the exact 80/20 transaction.");
    const response = await fetch("/api/private-capture/intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletAddress, contentSubmissionId: reviewed.id }) });
    const body = await response.json() as Preview & { code?: string };
    if (!response.ok || body.amountUsdCents !== 95 || !body.id) throw new Error(body.code ?? "CAPTURE_PREVIEW_UNAVAILABLE");
    setPreview(body); return body;
  }

  async function capture() {
    const provider = getPhantomProvider();
    if (!provider) return;
    try {
      const activePreview = preview ?? await reviewAndPrepare();
      if (!activePreview) return;
      setStatus("Phantom will now show the real $0.95 transaction.");
      const result = await provider.signAndSendTransaction(Transaction.from(Buffer.from(activePreview.serializedTransaction, "base64")));
      setSignature(result.signature); setStatus("Payment sent. Waiting for Solana finalization.");
      await settle(result.signature, activePreview);
    } catch (error) { setStatus(error instanceof Error ? error.message : "CAPTURE_SEND_FAILED"); }
  }

  async function settle(transactionSignature = signature, activePreview = preview) {
    if (!activePreview || !transactionSignature) return;
    try {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 2500));
        const response = await fetch("/api/private-capture/settle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intentId: activePreview.id, signature: transactionSignature }) });
        const body = await response.json() as { status?: string; code?: string; king?: string };
        if (body.status === "SETTLED") { setStatus(`${body.king} is now King. The screen and archive are updated.`); setOpen(false); window.setTimeout(() => window.location.reload(), 1300); return; }
        if (response.status !== 202) throw new Error(body.code ?? "CAPTURE_SETTLEMENT_FAILED");
      }
      setStatus("Transfer sent. Press CHECK PAYMENT after a few seconds.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "CAPTURE_SETTLEMENT_FAILED"); }
  }

  return <>
    <div className="mt-6 flex flex-col items-center gap-3"><button type="button" onClick={connectWallet} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-black tracking-wide text-black transition hover:bg-yellow-100"><Wallet size={18} />{walletAddress ? "WALLET CONNECTED" : "CONNECT WALLET"}</button>{walletAddress && <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-7 py-4 text-base font-black tracking-wide text-black"><Crown size={20} />CAPTURE THE THRONE</button>}<p aria-live="polite" className="text-center text-xs leading-5 text-yellow-100">{status}</p></div>
    {open && <div role="dialog" aria-modal="true" aria-labelledby="capture-title" className="fixed inset-0 z-50 flex items-end bg-black/80 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6"><section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-yellow-400/70 bg-[#11111c] p-5 shadow-[0_0_70px_rgba(234,179,8,.3)] sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black tracking-[.18em] text-yellow-300">THRONE SUBMISSION</p><h2 id="capture-title" className="mt-2 text-3xl font-black text-white">CAPTURE THE THRONE</h2><p className="mt-2 text-sm text-slate-300">$0.95 in SOL. 80% Treasury. 20% Operations.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close capture form" className="rounded-lg p-2 text-slate-300 hover:bg-white/10"><X size={22} /></button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-200">King name<input value={nickname} onChange={(event) => { setNickname(event.target.value); setPreview(null); }} maxLength={48} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-yellow-400" placeholder="Your name" /></label><label className="text-sm text-slate-200">Message<input value={tagline} onChange={(event) => { setTagline(event.target.value); setPreview(null); }} maxLength={280} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-yellow-400" placeholder="Your message on the screen" /></label><label className="text-sm text-slate-200 sm:col-span-2">Link, optional<input value={linkUrl} onChange={(event) => { setLinkUrl(event.target.value); setPreview(null); }} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-yellow-400" placeholder="https://example.com" /></label><label className="text-sm text-slate-200 sm:col-span-2">Screen image<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={(event) => selectImage(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-yellow-200 file:px-3 file:py-2 file:font-bold file:text-black" /></label></div>
      {imagePreview && <img src={imagePreview} alt="Your screen image preview" className="mt-4 h-40 w-full rounded-xl border border-white/10 object-cover" />}
      {preview && <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200 sm:grid-cols-3"><span>Total: <b>{sol(preview.totalLamports)} SOL</b></span><span>Treasury: <b>{sol(preview.treasuryLamports)} SOL</b></span><span>Operations: <b>{sol(preview.operationsVaultLamports)} SOL</b></span></div>}
      <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={capture} disabled={!walletAddress || Boolean(signature)} className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-black text-black disabled:opacity-40"><ImagePlus size={18} />CAPTURE THE THRONE</button>{signature && <button type="button" onClick={() => settle()} className="rounded-xl border border-cyan-300/70 px-5 py-3 font-black text-cyan-100">CHECK PAYMENT</button>}</div><p className="mt-4 text-xs leading-5 text-slate-400">Your image and text are checked before Phantom receives the transaction. No NFT or KOTS action occurs in this test.</p></section></div>}
  </>;
}
