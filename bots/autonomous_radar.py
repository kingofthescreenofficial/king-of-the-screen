#!/usr/bin/env python3
"""
Autonomous Viral Radar & Live Platform Sentinel
Monitors king-of-the-screen.vercel.app, tracks incoming on-chain takeovers,
generates viral social broadcasts, and maintains platform uptime.
"""

import time
import requests
import json
import os
from datetime import datetime

API_URL = "https://king-of-the-screen.vercel.app/api/state"
LOG_DIR = os.path.join(os.path.dirname(__file__), "..", "analytics")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "radar_events.jsonl")

last_king_id = None

def log_event(event_type, details):
    timestamp = datetime.utcnow().isoformat()
    record = {"timestamp": timestamp, "event_type": event_type, "details": details}
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(record) + "\n")
    print(f"[{timestamp}] 📡 RADAR: {event_type} -> {json.dumps(details, ensure_ascii=False)}")

def check_platform():
    global last_king_id
    try:
        res = requests.get(API_URL, timeout=10)
        if res.status_code == 200:
            state = res.json()
            current_king = state.get("currentKing", {})
            current_id = current_king.get("id")
            stats = state.get("stats", {})

            if last_king_id is None:
                last_king_id = current_id
                log_event("SENTINEL_START", {
                    "currentKing": current_king.get("nickname"),
                    "price": current_king.get("paidAmountUsd"),
                    "totalRaised": stats.get("totalRaisedUsd"),
                    "nextMin": state.get("nextMinPriceUsd")
                })
            elif current_id != last_king_id:
                # NEW KING DETECTED!
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

if __name__ == "__main__":
    print("🛰️ Autonomous Viral Sentinel is ONLINE. Monitoring 24/7...")
    while True:
        check_platform()
        time.sleep(15)
