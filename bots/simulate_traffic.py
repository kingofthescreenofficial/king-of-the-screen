#!/usr/bin/env python3
"""
Simulate Viral Bidding Wars for King of the Screen
Usage: python3 simulate_traffic.py [number_of_battles]
"""

import sys
import time
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:3000"

WARRIORS = [
    {
        "nickname": "🐸 $PEPE General",
        "tagline": "The frog army owns the internet! $PEPE TO THE MOON! 🚀",
        "link": "https://twitter.com/pepecoineth",
        "mediaUrl": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
        "cryptoCurrency": "SOL",
    },
    {
        "nickname": "🐕 Doge Supreme",
        "tagline": "Much wow, very screen! Dethroning frogs all day long! 🐕",
        "link": "https://dogecoin.com",
        "mediaUrl": "https://images.unsplash.com/photo-1517976487502-d17e997f8c0d?w=1200&auto=format&fit=crop&q=80",
        "cryptoCurrency": "SOL",
    },
    {
        "nickname": "🧢 WIF with Hat",
        "tagline": "The hat stays ON. $WIF takes the global throne! 🧢",
        "link": "https://twitter.com",
        "mediaUrl": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=1200&auto=format&fit=crop&q=80",
        "cryptoCurrency": "SOL",
    },
    {
        "nickname": "💎 Anonymous Whale",
        "tagline": "I just spent $500 on this screen because I can. Try me.",
        "link": "https://etherscan.io",
        "mediaUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
        "cryptoCurrency": "USDT",
    },
    {
        "nickname": "👾 Cyber Ronin",
        "tagline": "Glitch in the matrix. Rule forever, die never.",
        "link": "https://github.com",
        "mediaUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
        "cryptoCurrency": "SOL",
    }
]

def get_state():
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/state", headers={"User-Agent": "TrafficBot"})
        with urllib.request.urlopen(req, timeout=5) as res:
            return json.loads(res.read().decode())
    except Exception as e:
        print(f"❌ Error connecting to server ({BASE_URL}): {e}")
        return None

def send_takeover(warrior, bid_amount):
    payload = {
        **warrior,
        "paidAmountUsd": bid_amount,
        "paidCryptoAmount": round(bid_amount / 150, 4),
        "mediaType": "image",
        "txHash": f"tx_sim_{int(time.time() * 1000)}"
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/api/takeover",
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "TrafficBot"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            resp = json.loads(res.read().decode())
            return resp
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"❌ Takeover rejected: {err}")
        return None

def run_simulation(battles=5):
    print(f"\n🚀 STARTING VIRAL SIMULATION: {battles} BATTLES FOR THE THRONE\n" + "="*50)
    
    for i in range(battles):
        state = get_state()
        if not state:
            print("Make sure Next.js dev server is running on http://localhost:3000")
            sys.exit(1)
            
        min_price = state.get("nextMinPriceUsd", 2)
        warrior = WARRIORS[i % len(WARRIORS)]
        
        # Calculate random bid above minimum
        bonus = (i + 1) * 2
        bid_amount = min_price + bonus
        
        print(f"⚔️ Battle #{i+1}: {warrior['nickname']} is claiming throne with ${bid_amount:.2f}...")
        
        resp = send_takeover(warrior, bid_amount)
        if resp and resp.get("success"):
            print(f"👑 SUCCESS! {warrior['nickname']} is now the King! Next min price: ${resp['state']['nextMinPriceUsd']:.2f}")
        else:
            print("❌ Failed to claim.")
            
        time.sleep(3)
        
    print("\n🏁 Simulation complete! Check your browser window to see the Graveyard and Reign counters.")

if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    run_simulation(count)
