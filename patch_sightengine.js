const fs = require('fs');
let code = fs.readFileSync('web/lib/moderation.ts', 'utf8');

const newCode = `export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Comprehensive Multi-Language Banned Terms & Regex Dictionary ($0, Instant)
 */
const BANNED_PATTERNS = [
  /\\b(child\\s*p[o0]rn|cp|pedo|pedophile|csam|underage\\s*sex)\\b/i,
  /\\b(nigg[ae]r?|n[i1]gg[e3]r|n[i1]gg[a4]|kike|spic|chink|gook|fagg?ot|f[a4]g|tranny)\\b/i,
  /\\b(heil\\s*hitler|nazi|swastika|white\\s*power|kkk|holocaust\\s*fake|gas\\s*the\\s*jews)\\b/i,
  /\\b(isis|al\\s*qaeda|jihad\\s*kill|bomb\\s*threat|mass\\s*shooting|kill\\s*all\\s*(jews|muslims|blacks|whites|gays))\\b/i,
  /\\b(kill\\s*yourself|kys|commit\\s*suicide|hang\\s*yourself|go\\s*die)\\b/i,
  /\\b(porn|porno|hardcore\\s*sex|blowjob|cunt|pussy\\s*pic|dick\\s*pic|hentai\\s*xxx|gangbang)\\b/i,
  /\\b(wallet\\s*drainer|claim-airdrop-now|metamask-security-update|seed\\s*phrase)\\b/i,
];

export async function moderateContent(text: string, imageUrl?: string): Promise<ModerationResult> {
  const cleanText = text.toLowerCase();

  // 1. Strict Local Text Heuristic ($0 cost, 0ms latency)
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(cleanText)) {
      return {
        allowed: false,
        reason: "Content violates safety policy (Prohibited language detected).",
      };
    }
  }

  // 2. Sightengine Image Moderation (Porn, Gore, Weapons, Hate Symbols)
  if (imageUrl && process.env.SIGHTENGINE_USER && process.env.SIGHTENGINE_SECRET) {
    try {
      // Models: nudity-2.0 (porn), wad (weapons/alcohol/drugs), offensive (hate symbols like swastika), gore
      const url = \`https://api.sightengine.com/1.0/check.json?models=nudity-2.0,wad,offensive,gore&api_user=\${process.env.SIGHTENGINE_USER}&api_secret=\${process.env.SIGHTENGINE_SECRET}&url=\${encodeURIComponent(imageUrl)}\`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        if (data.status === "success") {
          // Check Nudity/Porn
          if (data.nudity && (data.nudity.sexual_activity > 0.5 || data.nudity.sexual_display > 0.5 || data.nudity.erotica > 0.5)) {
             return { allowed: false, reason: "Image flagged for explicit content (Nudity/Porn)." };
          }
          // Check Weapons
          if (data.weapon > 0.5) {
             return { allowed: false, reason: "Image flagged for weapons." };
          }
          // Check Hate/Offensive (Nazism, Confederate flags, etc)
          if (data.offensive && data.offensive.prob > 0.5) {
             return { allowed: false, reason: "Image flagged for hate symbols or offensive material." };
          }
          // Check Gore/Violence
          if (data.gore && data.gore.prob > 0.5) {
             return { allowed: false, reason: "Image flagged for graphic violence/gore." };
          }
        }
      }
    } catch (err) {
      console.warn("Sightengine image moderation failed, falling back:", err);
    }
  }

  // 3. Fallback AI Text Moderation (If OpenAI key exists)
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
        },
        body: JSON.stringify({ input: text }),
      });

      if (res.ok) {
        const data = await res.json();
        const result = data.results?.[0];
        if (result?.flagged) {
          return {
            allowed: false,
            reason: "AI Moderation flagged this text.",
          };
        }
      }
    } catch (err) {}
  }

  return { allowed: true };
}
`;

fs.writeFileSync('web/lib/moderation.ts', newCode);
console.log("Patched moderation.ts with Sightengine!");
