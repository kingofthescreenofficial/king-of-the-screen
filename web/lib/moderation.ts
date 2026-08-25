export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

const BANNED_PATTERNS = [
  /\b(child\s*porn|cp|nsfw\s*extreme|terror|hitler\s*did\s*nothing\s*wrong|kill\s*yourself|suicide)\b/i,
];

export async function moderateContent(text: string, imageUrl?: string): Promise<ModerationResult> {
  // 1. Local heuristic check for severe keywords
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        allowed: false,
        reason: "Content violates safety policy (Hate speech / Prohibited terms)",
      };
    }
  }

  // 2. OpenAI Moderation API if configured in .env
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
        const flagged = data.results?.[0]?.flagged;
        if (flagged) {
          return {
            allowed: false,
            reason: "AI Moderation flagged this message as unsafe.",
          };
        }
      }
    } catch (err) {
      console.warn("OpenAI moderation check failed, falling back to local filter:", err);
    }
  }

  return { allowed: true };
}
