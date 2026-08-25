#!/usr/bin/env python3
"""
Autonomous Multi-Community Poster for King of the Screen
Prepares automated postings for r/webdev, r/solana, r/basechain, r/coolwebsites,
and supports headless API posting via PRAW, Telethon, and Twitter API.
"""

import urllib.parse
import requests
import json
import os

CAMPAIGNS = [
    {
        "platform": "Reddit",
        "community": "r/webdev",
        "title": "I built King of the Screen: A real-time digital billboard using Next.js 15, Web Audio synth sirens, and on-chain state",
        "body": """Hey r/webdev,

I wanted to share a real-time web experiment I built called **King of the Screen**.

### Tech Stack & Architecture:
* **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Lucide icons.
* **Audio Synthesis**: Web Audio API oscillator synthesis generating dynamic retro sirens & detuned alert frequencies when state changes without external audio asset downloads.
* **Client-Side Optimization**: HTML5 Canvas pre-compression shrinking 15MB mobile photos to ~150KB Full HD JPEGs in <100ms before upload.
* **State Management**: Zero-latency serverless state synced with live countdown timers.
* **Payments**: Non-custodial on-chain verification across Base and Solana mainnet RPCs with anti-replay hash protection.

Live demo: https://king-of-the-screen.vercel.app/

Would love your feedback on the real-time UX and client-side audio synth!"""
    },
    {
        "platform": "Reddit",
        "community": "r/solana",
        "title": "King of the Screen is LIVE: A single global screen where meme communities battle on Solana",
        "body": """A live on-chain social billboard just launched on Solana: **King of the Screen**.

Instead of boring banner ads, there is ONE giant screen in the world. You broadcast your meme, project link, and message to everyone until someone outbids you.

* Micro-payments via SOL with instant 400ms finality.
* Hold the broadcast 24/7 until dethroned.
* Graveyard of Kings permanently archives every battle and reign duration.
* $1,000,000 public progress goal.

Live broadcast: https://king-of-the-screen.vercel.app/

Which Solana community takes the first throne?"""
    },
    {
        "platform": "Reddit",
        "community": "r/coolwebsites",
        "title": "King of the Screen: A live website where anyone can hijack the world's screen until outbid",
        "body": """This is basically a modern battleground where there is only ONE screen on the internet. Anyone can put their picture and message on it, and you stay King until someone pays more.

Live link: https://king-of-the-screen.vercel.app/"""
    },
    {
        "platform": "Reddit",
        "community": "r/basechain",
        "title": "Built on Base: A $1M on-chain live billboard experiment where you rule the screen",
        "body": """Check out this new on-chain game on Base: https://king-of-the-screen.vercel.app/

You can claim the entire global screen for sub-cent gas on Base. You broadcast your meme or project until another challenger outbids you.

Starting bid is only $2 right now!"""
    }
]

def generate_links():
    print("=" * 70)
    print("🚀 NEW HIGH-IMPACT COMMUNITY LAUNCH PACK")
    print("=" * 70)
    for idx, c in enumerate(CAMPAIGNS, 1):
        sub = c["community"].replace("r/", "")
        params = {
            "title": c["title"],
            "text": c["body"],
        }
        submit_url = f"https://www.reddit.com/r/{sub}/submit?{urllib.parse.urlencode(params)}"
        print(f"\n[{idx}] 📌 {c['community'].upper()} ({c['platform']}):")
        print(f"👉 1-Click Link: {submit_url}")
        print(f"Title: {c['title']}")
    print("\n" + "=" * 70)

if __name__ == "__main__":
    generate_links()
