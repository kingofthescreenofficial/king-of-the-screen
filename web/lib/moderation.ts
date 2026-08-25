export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Comprehensive Multi-Language Banned Terms & Regex Dictionary ($0, Instant)
 * Blocks hate speech, racial slurs, CSAM, terrorism, extreme violence, and harassment.
 */
const BANNED_PATTERNS = [
  // CSAM & Severe illegal content
  /\b(child\s*p[o0]rn|cp|pedo|pedophile|csam|underage\s*sex)\b/i,

  // Hate Speech, Racism, White Supremacy, Slurs (English & Multilingual)
  /\b(nigg[ae]r?|n[i1]gg[e3]r|n[i1]gg[a4]|kike|spic|chink|gook|fagg?ot|f[a4]g|tranny)\b/i,
  /\b(heil\s*hitler|nazi|swastika|white\s*power|kkk|holocaust\s*fake|gas\s*the\s*jews)\b/i,

  // Terrorism & Violent Extremism
  /\b(isis|al\s*qaeda|jihad\s*kill|bomb\s*threat|mass\s*shooting|kill\s*all\s*(jews|muslims|blacks|whites|gays))\b/i,

  // Self-harm & Direct Incitement to Violence
  /\b(kill\s*yourself|kys|commit\s*suicide|hang\s*yourself|go\s*die)\b/i,

  // Pornography / Explicit Sexual acts
  /\b(porn|porno|hardcore\s*sex|blowjob|cunt|pussy\s*pic|dick\s*pic|hentai\s*xxx|gangbang)\b/i,

  // Phishing / Malicious Draining links
  /\b(wallet\s*drainer|claim-airdrop-now|metamask-security-update|seed\s*phrase)\b/i,
];

export async function moderateContent(text: string, imageUrl?: string): Promise<ModerationResult> {
  const cleanText = text.toLowerCase();

  // 1. Strict Local Heuristic & Regex Filter ($0 cost, 0ms latency)
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(cleanText)) {
      return {
        allowed: false,
        reason: "Content violates safety policy (Prohibited language, hate speech, or explicit terms detected).",
      };
    }
  }

  // 2. OpenAI Free Moderation Endpoint (If key is available)
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ input: text }),
      });

      if (res.ok) {
        const data = await res.json();
        const result = data.results?.[0];
        if (result?.flagged) {
          const violatedCategories = Object.entries(result.categories || {})
            .filter(([_, value]) => value === true)
            .map(([cat]) => cat)
            .join(", ");

          return {
            allowed: false,
            reason: `AI Moderation flagged this content (${violatedCategories || "Policy violation"}).`,
          };
        }
      }
    } catch (err) {
      console.warn("AI moderation check fallback to local heuristic:", err);
    }
  }

  return { allowed: true };
}
