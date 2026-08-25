#!/usr/bin/env python3
"""
Viral Content & Distribution Pack Generator for King of the Screen
Generates high-converting marketing hooks for Reddit, TikTok/Reels, Telegram, and Streamer Raids.
"""

VIRAL_PACKS = {
    "reddit": [
        {
            "subreddit": "r/InternetIsBeautiful",
            "title": "I built a website where anyone can hijack the world's screen, and people are currently spending hundreds to stay King",
            "body": "Remember the Million Dollar Homepage from 2005? I decided to modernize the concept for 2026.\n\nThere is only ONE screen in the world. Anyone can claim it with crypto, but every time someone outbids you, the price goes up and they become the new King. You hold the broadcast 24/7 until someone dethrones you.\n\nLive audio sirens, real-time WebSockets, and a Graveyard of Kings.\n\nCheck out the live broadcast: https://kingofthescreen.xyz"
        },
        {
            "subreddit": "r/CryptoCurrency",
            "title": "A $1M on-chain battleground: Meme communities are fighting for a single global screen",
            "body": "Someone created a live decentralized auction site where anyone can broadcast their message or meme coin to the world.\n\nRule: You rule until outbid.\n\nRight now $PEPE and $DOGE armies are fighting for dominance in real-time. All funds go toward a public $1,000,000 progress goal.\n\nLive URL: https://kingofthescreen.xyz"
        }
    ],
    "tiktok_scripts": [
        {
            "concept": "The $1M Social Experiment",
            "hook": "This is the most chaotic website on the internet right now...",
            "visual": "Screen recording of the site while sirens are blaring and kings are getting dethroned",
            "script": "Basically, there is ONE giant screen that everyone on the planet sees. The first person bought it for $1. But then someone paid $5 to put a picture of a dog. Then a crypto whale paid $100. Right now two communities are spending thousands of dollars just to see who can hold the throne the longest. The rule is simple: you rule until someone outbids you. Link in bio to see who is currently winning."
        },
        {
            "concept": "War of Egos",
            "hook": "POV: Two billionaires fighting over a $1M website in real time",
            "visual": "Rapid cuts between bids on the screen, showing the reign timer ticking up",
            "script": "This guy held the screen for 4 hours before getting kicked off by a meme. Look at this Graveyard of Kings. You can literally dethrone anyone right now."
        }
    ],
    "streamer_donations": [
        "Hey! Check out https://kingofthescreen.xyz - someone just bought the global screen and put your face on it!",
        "Someone is challenging you on https://kingofthescreen.xyz, you can dethrone them for $5 right now!"
    ]
}

def print_pack():
    print("🔥 =================================================")
    print("🚀 KING OF THE SCREEN: VIRAL DISTRIBUTION PACK")
    print("🔥 =================================================\n")
    
    print("📱 [1] TIKTOK / YOUTUBE SHORTS HOOKS:")
    for idx, item in enumerate(VIRAL_PACKS["tiktok_scripts"], 1):
        print(f"\n--- Script #{idx}: {item['concept']} ---")
        print(f"🎬 Hook (First 2 sec): \"{item['hook']}\"")
        print(f"👀 Visual: {item['visual']}")
        print(f"🗣️ Voiceover: {item['script']}\n")
        
    print("\n👾 [2] REDDIT LAUNCH POSTS:")
    for idx, item in enumerate(VIRAL_PACKS["reddit"], 1):
        print(f"\n--- Subreddit: {item['subreddit']} ---")
        print(f"📌 Title: {item['title']}")
        print(f"📝 Text:\n{item['body']}\n")
        
    print("\n🎯 [3] STREAMER DONATION BAIT TEMPLATES:")
    for idx, bait in enumerate(VIRAL_PACKS["streamer_donations"], 1):
        print(f"💰 #{idx}: {bait}")

if __name__ == "__main__":
    print_pack()
