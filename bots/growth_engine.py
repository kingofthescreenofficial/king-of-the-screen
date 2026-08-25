#!/usr/bin/env python3
"""
Autonomous Multi-Channel Growth Engine for King of the Screen
Generates live data-driven marketing assets for Hacker News, Twitter/X, Telegram,
TikTok/Shorts, Streamer Raids, and Product Hunt.
"""

import urllib.parse
import requests
import json
import os

API_URL = "https://king-of-the-screen.vercel.app/api/state"
WEB_URL = "https://king-of-the-screen.vercel.app"

def get_live_metrics():
    try:
        res = requests.get(API_URL, timeout=5)
        if res.status_code == 200:
            return res.json()
    except Exception:
        pass
    return {
        "currentKing": {"nickname": "👑 Sovereign Origin", "paidAmountUsd": 1},
        "nextMinPriceUsd": 2,
        "stats": {"totalRaisedUsd": 1, "targetGoalUsd": 1000000}
    }

def generate_campaign():
    data = get_live_metrics()
    king = data["currentKing"]["nickname"]
    min_price = data["nextMinPriceUsd"]
    raised = data["stats"]["totalRaisedUsd"]

    print("=" * 75)
    print("🔥 AUTONOMOUS MULTI-CHANNEL GROWTH & HYPE CAMPAIGN")
    print(f"📊 LIVE STATS: Current King: {king} | Min Bid: ${min_price} | Raised: ${raised:,}")
    print("=" * 75)

    # 1. HACKER NEWS (Show HN)
    hn_title = f"Show HN: King of the Screen – A real-time, on-chain digital billboard experiment"
    hn_text = f"""I built a modernized, real-time take on the 2005 Million Dollar Homepage called King of the Screen.

Instead of buying static pixels, there is exactly one global screen. Anyone can claim the throne with micro-transactions (Base / Solana), broadcasting their image, message, and link to everyone.

You hold the screen 24/7 until someone outbids you. All bids go towards a $1,000,000 public progress goal.

Tech stack: Next.js 15, Tailwind, Web Audio API synth sirens, client-side canvas image optimization, on-chain RPC verification.

Live link: {WEB_URL}

Feedback and thoughts on the game theory mechanics are welcome!"""

    hn_url = f"https://news.ycombinator.com/submitlink?u={urllib.parse.quote(WEB_URL)}&t={urllib.parse.quote(hn_title)}"

    print("\n🚀 [1] HACKER NEWS (SHOW HN):")
    print(f"👉 1-Click Submit Link: {hn_url}")
    print(f"Title: {hn_title}")

    # 2. TWITTER / X VIRAL THREAD
    tweet_text = f"""The Million Dollar Homepage modernized for 2026 is LIVE 👑

One global screen. You rule 24/7 until someone outbids you on-chain.

Sirens, live audio & the Graveyard of Kings.

Minimum bid to conquer the screen is currently ${min_price}:
👉 {WEB_URL}

@base @solana #Base #Solana #Crypto #MillionDollarHomepage"""

    tweet_url = f"https://twitter.com/intent/tweet?text={urllib.parse.quote(tweet_text)}"

    print("\n🐦 [2] TWITTER / X 1-CLICK TWEET:")
    print(f"👉 1-Click Post to X: {tweet_url}")

    # 3. TELEGRAM & DISCORD ALPHA RAID TEMPLATES
    print("\n💬 [3] TELEGRAM & DISCORD MEME ALPHA TEMPLATES:")
    print("Template A (Meme Wars):")
    print(f"🚨 On-chain battleground for the world's screen just launched! You can put our token on the global billboard for ${min_price} right now before other whales find it: {WEB_URL}")
    print("\nTemplate B (Challenge):")
    print(f"👑 Who owns the screen right now? {king} is reigning. Let's dethrone them: {WEB_URL}")

    # 4. TIKTOK / YOUTUBE SHORTS VIRAL SCRIPT
    print("\n🎬 [4] VIRAL TIKTOK / REELS / SHORTS SCRIPT (30 SECONDS):")
    print("Hook (0-3s): 'This website is the ultimate battle of internet egos...'")
    print("Visual: Screen recording of https://king-of-the-screen.vercel.app with sirens blaring")
    print(f"Voiceover: 'Basically, there is ONE screen on the entire internet. You pay to put your face on it, and you rule until someone outbids you. It started at $1, and now people are battling for the $1,000,000 throne. The link is in the bio to see who is winning right now.'")

    # 5. STREAMER DONATION TROLL BAIT ($2 - $5)
    print("\n💰 [5] STREAMER DONATION BAIT:")
    print(f"Message: 'Hey! Someone just put your face on the global billboard at {WEB_URL} - you gotta check this out live!'")

    print("\n" + "=" * 75)

if __name__ == "__main__":
    generate_campaign()
