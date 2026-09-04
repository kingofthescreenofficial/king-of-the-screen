export type ModerationProvider = "local" | "sightengine" | "openai" | "unavailable";

export interface ModerationResult {
  allowed: boolean;
  provider: ModerationProvider;
  reason?: string;
  reviewUnavailable: boolean;
}

const BANNED_PATTERNS = [
  /\b(child\s*p[o0]rn|cp|pedo|pedophile|csam|underage\s*sex)\b/i,
  /\b(nigg[ae]r?|n[i1]gg[e3]r|n[i1]gg[a4]|kike|spic|chink|gook|fagg?ot|f[a4]g|tranny)\b/i,
  /\b(heil\s*hitler|nazi|swastika|white\s*power|kkk|holocaust\s*fake|gas\s*the\s*jews)\b/i,
  /\b(isis|al\s*qaeda|jihad\s*kill|bomb\s*threat|mass\s*shooting|kill\s*all\s*(jews|muslims|blacks|whites|gays))\b/i,
  /\b(kill\s*yourself|kys|commit\s*suicide|hang\s*yourself|go\s*die)\b/i,
  /\b(porn|porno|hardcore\s*sex|blowjob|cunt|pussy\s*pic|dick\s*pic|hentai\s*xxx|gangbang)\b/i,
  /\b(wallet\s*drainer|claim-airdrop-now|metamask-security-update|seed\s*phrase)\b/i,
];

const SIGHTENGINE_IMAGE_MODELS = "nudity-2.1,wad,offensive,gore-2.0";
const SIGHTENGINE_TEXT_CATEGORIES = "profanity,personal,link,drug,weapon,spam,content-trade,money-transaction,extremism,violence,self-harm,medical";

function unavailable(): ModerationResult {
  return { allowed: false, provider: "unavailable", reason: "Automated content review is unavailable.", reviewUnavailable: true };
}

function rejected(provider: ModerationProvider, reason: string): ModerationResult {
  return { allowed: false, provider, reason, reviewUnavailable: false };
}

function approved(provider: ModerationProvider): ModerationResult {
  return { allowed: true, provider, reviewUnavailable: false };
}

function hasSightengineCredentials(): boolean {
  return Boolean(process.env.SIGHTENGINE_USER?.trim() && process.env.SIGHTENGINE_SECRET?.trim());
}

function hasRuleMatches(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).some((entry) => hasRuleMatches(entry));
}

async function sightengineTextModeration(text: string): Promise<ModerationResult> {
  const form = new FormData();
  form.set("text", text);
  form.set("lang", "en,ru");
  form.set("categories", SIGHTENGINE_TEXT_CATEGORIES);
  form.set("mode", "rules");
  form.set("api_user", process.env.SIGHTENGINE_USER!);
  form.set("api_secret", process.env.SIGHTENGINE_SECRET!);
  try {
    const response = await fetch("https://api.sightengine.com/1.0/text/check.json", { method: "POST", body: form });
    if (!response.ok) return unavailable();
    const body = await response.json() as { status?: unknown; [key: string]: unknown };
    if (body.status !== "success") return unavailable();
    const categories = ["profanity", "personal", "link", "drug", "weapon", "spam", "content_trade", "money_transaction", "extremism", "violence", "self_harm", "medical"];
    return categories.some((category) => hasRuleMatches(body[category])) ? rejected("sightengine", "Text violates content rules.") : approved("sightengine");
  } catch {
    return unavailable();
  }
}

async function openAiTextModeration(text: string): Promise<ModerationResult> {
  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY!}` },
      body: JSON.stringify({ input: text }),
    });
    if (!response.ok) return unavailable();
    const body = await response.json() as { results?: Array<{ flagged?: unknown }> };
    if (typeof body.results?.[0]?.flagged !== "boolean") return unavailable();
    return body.results[0].flagged ? rejected("openai", "Text violates content rules.") : approved("openai");
  } catch {
    return unavailable();
  }
}

export async function moderateText(text: string): Promise<ModerationResult> {
  if (BANNED_PATTERNS.some((pattern) => pattern.test(text))) return rejected("local", "Text violates content rules.");
  if (hasSightengineCredentials()) return sightengineTextModeration(text);
  if (process.env.OPENAI_API_KEY?.trim()) return openAiTextModeration(text);
  return unavailable();
}

export async function moderateImage(image: Blob, filename: string): Promise<ModerationResult> {
  if (!hasSightengineCredentials()) return unavailable();
  const form = new FormData();
  form.set("media", image, filename);
  form.set("models", SIGHTENGINE_IMAGE_MODELS);
  form.set("api_user", process.env.SIGHTENGINE_USER!);
  form.set("api_secret", process.env.SIGHTENGINE_SECRET!);
  try {
    const response = await fetch("https://api.sightengine.com/1.0/check.json", { method: "POST", body: form });
    if (!response.ok) return unavailable();
    const body = await response.json() as { status?: unknown; nudity?: { sexual_activity?: number; sexual_display?: number; erotica?: number }; weapon?: number; offensive?: { prob?: number }; gore?: { prob?: number } };
    if (body.status !== "success") return unavailable();
    if ((body.nudity?.sexual_activity ?? 0) > 0.5 || (body.nudity?.sexual_display ?? 0) > 0.5 || (body.nudity?.erotica ?? 0) > 0.5) return rejected("sightengine", "Image violates content rules.");
    if ((body.weapon ?? 0) > 0.5 || (body.offensive?.prob ?? 0) > 0.5 || (body.gore?.prob ?? 0) > 0.5) return rejected("sightengine", "Image violates content rules.");
    return approved("sightengine");
  } catch {
    return unavailable();
  }
}
