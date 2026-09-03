"use client";
import { useEffect } from "react";

export function TelemetryTracker() {
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

  return null;
}
