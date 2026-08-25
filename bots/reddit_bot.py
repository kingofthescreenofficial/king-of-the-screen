#!/usr/bin/env python3
"""
Autonomous Reddit Hype & Campaign Bot for King of the Screen
Automates viral submissions across r/SideProject, r/InternetIsBeautiful, r/CryptoCurrency, and r/memecoins.
"""

import sys
import os
import urllib.parse
import json

LIVE_URL = "https://king-of-the-screen.vercel.app/"

CAMPAIGNS = [
    {
        "subreddit": "SideProject",
        "title": "I modernized the 2005 Million Dollar Homepage: One global screen where you rule until someone outbids you",
        "body": """Hey Reddit,

Remember Alex Tew's Million Dollar Homepage from 2005 where people bought pixels? I decided to build a modernized, real-time social experiment for 2026 called **King of the Screen**.

### The Premise:
* There is **only ONE screen** in the world.
* Anyone can claim the throne by uploading an image, a message, and their project link.
* **There is NO 60-second timer**: you own the global live canvas 24/7 until another challenger outbids you.
* Every dethronement plays live sound effects, text-to-speech sirens, and permanently archives your reign time in the **Graveyard of Kings**.
* The goal is to see how long it takes to reach a $1,000,000 monument.

Built with Next.js 15, Tailwind, Web Audio synth, and non-custodial crypto payments (Base & Solana).

Check out the live broadcast: https://king-of-the-screen.vercel.app/

Curious to hear your thoughts — how long do you think the current King will survive?"""
    },
    {
        "subreddit": "InternetIsBeautiful",
        "title": "King of the Screen: A real-time website where you hold the entire screen until someone outbids you",
        "body": """King of the Screen is a live global digital billboard and social experiment. 

You pay to broadcast your image, message, and link to the world, and you hold the screen 24/7 until another challenger outbids you.

Live link: https://king-of-the-screen.vercel.app/"""
    },
    {
        "subreddit": "CryptoCurrency",
        "title": "A $1,000,000 on-chain live billboard: Meme communities are fighting for a single global screen",
        "body": """A live on-chain social experiment just went live: **King of the Screen**.

Instead of buying static banner ads, there is **one unified screen** on the planet. You broadcast your image, message, and link to everyone until someone pays higher.

* Payments supported via **Base / USDT** and **Solana (SOL)** directly on-chain.
* Rule until dethroned (could be 5 minutes, could be 3 days).
* Graveyard of Kings tracks longest reigns and top spenders.
* Live progression towards a $1M on-chain benchmark.

Live URL: https://king-of-the-screen.vercel.app/

Which community holds the throne first?"""
    },
    {
        "subreddit": "memecoins",
        "title": "Live on-chain billboard where meme coins can conquer the screen until outbid",
        "body": """Found this wild on-chain experiment: https://king-of-the-screen.vercel.app/

Basically one global screen that everyone sees. Minimum bid is super low right now. You upload your meme and hold the broadcast until someone pays more.

Let's see if $PEPE, $DOGE or $WIF claims it first!"""
    }
]

def generate_direct_links():
    print("=" * 70)
    print("🚀 1-CLICK REDDIT LAUNCH LINKS (PRE-FILLED & READY TO POST)")
    print("=" * 70)
    
    for idx, camp in enumerate(CAMPAIGNS, 1):
        sub = camp["subreddit"]
        title = camp["title"]
        body = camp["body"]
        
        # URL encode params for Reddit submit web interface
        params = {
            "title": title,
            "text": body,
            "url": LIVE_URL if sub == "InternetIsBeautiful" else None
        }
        
        # Clean None values
        params = {k: v for k, v in params.items() if v is not None}
        query_string = urllib.parse.urlencode(params)
        submit_url = f"https://www.reddit.com/r/{sub}/submit?{query_string}"
        
        print(f"\n[{idx}] 📌 r/{sub.upper()}:")
        print(f"👉 1-Click Post Link: {submit_url}")
        print(f"Title: {title}")
    
    print("\n" + "=" * 70)

if __name__ == "__main__":
    generate_direct_links()
