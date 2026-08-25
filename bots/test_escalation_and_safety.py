import requests
import json
import time

BASE_URL = "http://localhost:3000"

print("=" * 60)
print("👑 RUNNING COMPREHENSIVE AUTOMATED PLATFORM TEST")
print("=" * 60)

# 1. Test Content Moderation (Negative Tests - Must Be Blocked)
print("\n--- TEST SUITE 1: CONTENT MODERATION SECURITY CHECKS ---")
unsafe_payloads = [
    {
        "name": "Test: Hate speech / Slur block",
        "data": {
            "nickname": "BadActor",
            "tagline": "kill all jews now white power",
            "paidAmountUsd": 500,
            "cryptoCurrency": "DEMO",
        }
    },
    {
        "name": "Test: CSAM & Severe terms block",
        "data": {
            "nickname": "IllegalUser",
            "tagline": "visit my child porn site",
            "paidAmountUsd": 500,
            "cryptoCurrency": "DEMO",
        }
    },
    {
        "name": "Test: Self-harm incitement block",
        "data": {
            "nickname": "Troll",
            "tagline": "go kill yourself kys",
            "paidAmountUsd": 500,
            "cryptoCurrency": "DEMO",
        }
    },
    {
        "name": "Test: Crypto Drainer / Phishing block",
        "data": {
            "nickname": "Scammer",
            "tagline": "instant seed phrase wallet drainer claim-airdrop-now",
            "paidAmountUsd": 500,
            "cryptoCurrency": "DEMO",
        }
    }
]

for test in unsafe_payloads:
    res = requests.post(f"{BASE_URL}/api/takeover", json=test["data"])
    if res.status_code == 400 and "Moderation rejected" in res.text:
        print(f"✅ BLOCKED [HTTP 400]: {test['name']} -> Server correctly rejected unsafe content!")
    else:
        print(f"❌ FAILED: {test['name']} was NOT properly blocked! Status: {res.status_code}, Res: {res.text}")


# 2. Test Bidding Escalation Towards $1,000,000 (Positive Tests - DEMO Mode)
print("\n--- TEST SUITE 2: BIDDING ESCALATION TO $1,000,000 GOAL ---")
battle_monarchs = [
    {
        "nickname": "🐸 PEPE Hegemony",
        "tagline": "The frog army owns this global billboard! All hail green candles.",
        "link": "https://pepe.vip",
        "mediaUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
        "paidAmountUsd": 2500,
    },
    {
        "nickname": "🐕 Doge Syndicate",
        "tagline": "Much wow! To the moon and beyond. Dethroning the frog!",
        "link": "https://dogecoin.com",
        "mediaUrl": "https://images.unsplash.com/photo-1517976487502-d17e997f8c0d?w=1200&auto=format&fit=crop&q=80",
        "paidAmountUsd": 25000,
    },
    {
        "nickname": "⚡ Base God",
        "tagline": "Onchain summer never ends. $100K takeover on Base!",
        "link": "https://base.org",
        "mediaUrl": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
        "paidAmountUsd": 125000,
    },
    {
        "nickname": "💎 Satoshi Nakamoto",
        "tagline": "Chancellor on brink of second bailout for banks. $500K reign.",
        "link": "https://bitcoin.org",
        "mediaUrl": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=1200&auto=format&fit=crop&q=80",
        "paidAmountUsd": 500000,
    },
    {
        "nickname": "👑 The $1,000,000 Emperor",
        "tagline": "GOAL REACHED! The world's first $1,000,000 living digital monument is conquered!",
        "link": "https://king-of-the-screen.vercel.app",
        "mediaUrl": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80",
        "paidAmountUsd": 1000000,
    }
]

for king in battle_monarchs:
    king["cryptoCurrency"] = "DEMO"
    king["mediaType"] = "image"
    res = requests.post(f"{BASE_URL}/api/takeover", json=king)
    if res.status_code == 200:
        data = res.json()
        stats = data["state"]["stats"]
        print(f"👑 CROWNED: {king['nickname']} | Paid: ${king['paidAmountUsd']:,} | Total Raised: ${stats['totalRaisedUsd']:,} / ${stats['targetGoalUsd']:,} | Next Min: ${data['state']['nextMinPriceUsd']:,}")
    else:
        print(f"❌ Error crowning {king['nickname']}: {res.text}")
    time.sleep(0.5)

# 3. Verify Final State
print("\n--- TEST SUITE 3: FINAL STATE VERIFICATION ---")
res = requests.get(f"{BASE_URL}/api/state")
state = res.json()

print(f"🏆 Current Sovereign: {state['currentKing']['nickname']}")
print(f"💰 Crown Value: ${state['currentKing']['paidAmountUsd']:,}")
print(f"📊 Total Monument Raised: ${state['stats']['totalRaisedUsd']:,} ({state['stats']['totalRaisedUsd'] / state['stats']['targetGoalUsd'] * 100:.1f}% of $1M Goal)")
print(f"⚔️ Total Battles in Hall of Fame: {len(state['hallOfFame'])}")
print(f"📈 Next Challenger Minimum: ${state['nextMinPriceUsd']:,}")
print("=" * 60)
