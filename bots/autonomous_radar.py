#!/usr/bin/env python3
"""
Autonomous Viral Radar & 24/7 Payment Health Watchdog
Continuously analyzes king-of-the-screen.vercel.app, verifies RPC node availability,
tracks incoming payments, and logs health metrics.
"""

import time
import requests
import json
import os
from datetime import datetime, timezone

API_URL = "https://king-of-the-screen.vercel.app/api/state"
LOG_DIR = os.path.join(os.path.dirname(__file__), "..", "analytics")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "radar_events.jsonl")

RPCS_TO_CHECK = [
    {"name": "Base RPC Primary", "url": "https://mainnet.base.org", "body": {"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}},
    {"name": "Base RPC PublicNode", "url": "https://base.publicnode.com", "body": {"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}},
    {"name": "Solana RPC Primary", "url": "https://api.mainnet-beta.solana.com", "body": {"jsonrpc":"2.0","method":"getHealth","params":[],"id":1}},
    {"name": "Ethereum PublicNode", "url": "https://ethereum.publicnode.com", "body": {"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}},
]

last_king_id = None
check_count = 0

def log_event(event_type, details):
    timestamp = datetime.now(timezone.utc).isoformat()
    record = {"timestamp": timestamp, "event_type": event_type, "details": details}
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(record) + "\n")
    print(f"[{timestamp}] 📡 RADAR: {event_type} -> {json.dumps(details, ensure_ascii=False)}")

def check_rpc_health():
    for rpc in RPCS_TO_CHECK:
        try:
            start = time.time()
            res = requests.post(rpc["url"], json=rpc["body"], timeout=4)
            latency_ms = int((time.time() - start) * 1000)
            if res.status_code == 200:
                pass
            else:
                log_event("RPC_DEGRADED", {"rpc": rpc["name"], "status": res.status_code})
        except Exception as e:
            log_event("RPC_TIMEOUT", {"rpc": rpc["name"], "error": str(e)})

def check_platform():
    global last_king_id, check_count
    check_count += 1

    try:
        start = time.time()
        res = requests.get(API_URL, timeout=10)
        api_latency_ms = int((time.time() - start) * 1000)

        if res.status_code == 200:
            state = res.json()
            current_king = state.get("currentKing", {})
            current_id = current_king.get("id")
            stats = state.get("stats", {})

            if last_king_id is None:
                last_king_id = current_id
                log_event("SENTINEL_ONLINE", {
                    "currentKing": current_king.get("nickname"),
                    "price": current_king.get("paidAmountUsd"),
                    "totalRaised": stats.get("totalRaisedUsd"),
                    "nextMin": state.get("nextMinPriceUsd"),
                    "apiLatencyMs": api_latency_ms
                })
            elif current_id != last_king_id:
                # NEW CROWN DETECTED!
                last_king_id = current_id
                log_event("NEW_KING_CROWNED", {
                    "nickname": current_king.get("nickname"),
                    "tagline": current_king.get("tagline"),
                    "paidAmountUsd": current_king.get("paidAmountUsd"),
                    "currency": current_king.get("cryptoCurrency"),
                    "link": current_king.get("link"),
                    "totalRaised": stats.get("totalRaisedUsd")
                })
        else:
            log_event("API_WARNING", {"status_code": res.status_code})
    except Exception as e:
        log_event("CONNECTION_ERROR", {"error": str(e)})

    # Periodically check RPC health every 10 cycles (approx every 2.5 min)
    if check_count % 10 == 0:
        check_rpc_health()

if __name__ == "__main__":
    print("🛰️ Autonomous 24/7 Payment Health Watchdog is ONLINE...")
    while True:
        check_platform()
        time.sleep(15)
