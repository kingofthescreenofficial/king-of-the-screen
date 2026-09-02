"use client";
import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function TelemetryTracker() {
  const { publicKey } = useWallet();
  const trackedConnection = useRef(false);

  useEffect(() => {
    // 1. Page View
    fetch('/api/telemetry', {
      method: 'POST',
      body: JSON.stringify({ type: 'USER', event: 'PAGE_VIEW', details: { path: window.location.pathname } })
    }).catch(() => {});

    // 2. Ping loop
    const sessionId = Math.random().toString(36).substring(2, 15);
    const ping = () => {
      fetch('/api/ping', { method: 'POST', body: JSON.stringify({ sessionId }) }).catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (publicKey && !trackedConnection.current) {
      trackedConnection.current = true;
      fetch('/api/telemetry', {
        method: 'POST',
        body: JSON.stringify({ type: 'USER', event: 'WALLET_CONNECTED', details: { pubkey: publicKey.toBase58() } })
      }).catch(() => {});
    }
  }, [publicKey]);

  return null;
}
