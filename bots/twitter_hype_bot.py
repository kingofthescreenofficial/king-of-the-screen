#!/usr/bin/env python3
"""
Autonomous Twitter (X) Hype Bot for King of the Screen
Monitors throne dethronements and auto-tweets viral provocation alerts.
"""

import os
import sys
import time
import json
import urllib.request

API_STATE_URL = os.getenv("APP_URL", "http://localhost:3000") + "/api/state"
CHECK_INTERVAL_SEC = 5

TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET")
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
TWITTER_ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET")

def get_current_state():
    try:
        req = urllib.request.Request(API_STATE_URL, headers={"User-Agent": "HypeBot/1.0"})
        with urllib.request.urlopen(req, timeout=5) as res:
            return json.loads(res.read().decode())
    except Exception as e:
        return None

def compose_tweet(king, next_price, reign_time_sec=0):
    nickname = king.get("nickname", "Anonymous")
    amount = king.get("paidAmountUsd", 0)
    crypto = king.get("cryptoCurrency", "SOL")
    tagline = king.get("tagline", "")
    
    templates = [
        f"🚨 THRONE DETHRONED!\n\n👑 {nickname} just captured the world's most contested screen for ${amount:.2f} ({crypto})!\n\n💬 \"{tagline}\"\n\n🔥 Who is bold enough to take it for ${next_price:.2f}?\n\n👉 {os.getenv('APP_URL', 'https://kingofthescreen.xyz')}",
        f"⚡ BREAKING: A new Monarch reigns!\n\n{nickname} paid ${amount:.2f} to control the global broadcast.\n\nMinimum to dethrone: ${next_price:.2f}\n\nReign until outbid: {os.getenv('APP_URL', 'https://kingofthescreen.xyz')}",
        f"⚔️ SCREEN HIJACKED!\n\n{nickname} just kicked the previous King off the throne with a ${amount:.2f} bid.\n\nTake the screen: {os.getenv('APP_URL', 'https://kingofthescreen.xyz')}"
    ]
    
    import random
    return random.choice(templates)

def post_tweet(text):
    print(f"\n[🐦 TWEET DRAFTED]:\n{text}\n" + "-"*40)
    
    if TWITTER_API_KEY and TWITTER_ACCESS_TOKEN:
        try:
            # If tweepy is installed, publish live
            import tweepy
            client = tweepy.Client(
                consumer_key=TWITTER_API_KEY,
                consumer_secret=TWITTER_API_SECRET,
                access_token=TWITTER_ACCESS_TOKEN,
                access_token_secret=TWITTER_ACCESS_SECRET
            )
            resp = client.create_tweet(text=text)
            print(f"✅ Published live tweet: ID {resp.data['id']}")
        except Exception as err:
            print(f"⚠️ Live tweet failed (check keys): {err}")
    else:
        print("💡 Tip: Add TWITTER_API_KEY & tokens in .env for autonomous 100% automated posting.")

def monitor():
    print(f"🤖 Autonomous Hype Bot running. Monitoring: {API_STATE_URL}")
    last_king_id = None
    
    while True:
        state = get_current_state()
        if state:
            current_king = state.get("currentKing", {})
            king_id = current_king.get("id")
            
            if last_king_id and king_id != last_king_id:
                print(f"🔥 NEW KING DETECTED: {current_king.get('nickname')}")
                tweet = compose_tweet(current_king, state.get("nextMinPriceUsd", 2))
                post_tweet(tweet)
                
            last_king_id = king_id
            
        time.sleep(CHECK_INTERVAL_SEC)

if __name__ == "__main__":
    monitor()
