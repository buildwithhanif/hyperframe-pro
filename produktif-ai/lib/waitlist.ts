import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// The Get Started flow posts twice: a short signup (so a lead is never lost),
// then the creator profile. Both land in the sheet as rows joined by lead_id.

// Values stay stable (they land in the sheet); labels are what people see.
export const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
  { value: "threads", label: "Threads" },
  { value: "other", label: "Somewhere else" },
] as const;

export const FOLLOWERS = [
  { value: "under-10k", label: "Under 10K" },
  { value: "10k-50k", label: "10K to 50K" },
  { value: "50k-250k", label: "50K to 250K" },
  { value: "250k-1m", label: "250K to 1M" },
  { value: "1m-plus", label: "1M or more" },
] as const;

export const POSTING = [
  { value: "rarely", label: "Rarely" },
  { value: "weekly", label: "1 to 2 a week" },
  { value: "most-days", label: "3 to 6 a week" },
  { value: "daily", label: "Every day" },
] as const;

export const GOALS = [
  { value: "time", label: "Get my time back" },
  { value: "reach", label: "Grow my reach" },
  { value: "sales", label: "Turn views into sales" },
  { value: "consistency", label: "Never miss a day" },
] as const;

export const LANGUAGES = [
  { value: "id", label: "Bahasa Indonesia" },
  { value: "en", label: "English" },
  { value: "both", label: "Both" },
] as const;

export const STARTS = [
  { value: "this-month", label: "This month" },
  { value: "1-3-months", label: "In 1 to 3 months" },
  { value: "looking", label: "Just looking" },
] as const;

export const BUDGETS = [
  { value: "yes", label: "Yes, that works" },
  { value: "not-yet", label: "Not right now" },
] as const;

type Values<T extends readonly { value: string }[]> = T[number]["value"];
const oneOf = <T extends readonly { value: string }[]>(list: T, message: string) =>
  z.enum(list.map((o) => o.value) as [Values<T>, ...Values<T>[]], { message });

// The consent sentence shown next to the checkbox. Stored with each signup so
// the sheet records exactly what the person agreed to.
export const CONSENT_TEXT =
  "I agree to the privacy policy and to be contacted about produktif.ai by email or WhatsApp.";

// WhatsApp numbers as people actually type or paste them. Indonesian numbers
// (08…, 8…, 628…, +62 8…, even "+62 0812…") become 628…; other countries need
// the + country code. Returns digits only (what wa.me links want), or null.
export function normalizePhone(raw: string): string | null {
  const s = raw.normalize("NFKC").replace(/[\s\p{Pd}\p{Cf}().\/]/gu, "");
  const id = s.match(/^(?:\+?620?|0)?(8\d{7,11})$/);
  if (id) return `62${id[1]}`;
  const intl = s.match(/^(?:\+|00)([1-9]\d{7,14})$/);
  return intl ? intl[1] : null;
}

// Accept a pasted profile link and keep just the handle.
export function handleFromInput(raw: string): string {
  return raw
    .trim()
    .replace(/^(?:https?:\/\/)?(?:www\.|m\.)?(?:instagram|tiktok|youtube|x|twitter|threads)\.(?:com|net)\/@?/i, "@")
    .replace(/[/?#].*$/, "");
}

const utm = z.string().trim().max(100).default("");

export const SignupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "That name is too long."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "That email is too long.")
    .pipe(z.email("That email doesn't look right. Check for typos.")),
  whatsapp: z
    .string()
    .trim()
    .max(24, "That number is too long.")
    .refine((v) => v === "" || normalizePhone(v) !== null, "Add your country code, like +62 812 3456 7890.")
    .default(""),
  consent: z.literal(true, { message: "Please tick the box so we can contact you." }),
  utm_source: utm,
  utm_medium: utm,
  utm_campaign: utm,
  // Honeypot: hidden from people, filled in by naive bots.
  company: z.string().max(200).default(""),
});

export const ProfileSchema = z.object({
  lead_id: z.string().uuid("Your session expired. Please start again."),
  token: z.string().regex(/^[a-f0-9]{64}$/, "Your session expired. Please start again."),
  niche: z.string().trim().min(2, "Tell us what you make videos about.").max(80, "Keep it under 80 characters."),
  platform: oneOf(PLATFORMS, "Pick where you post most."),
  handle: z
    .string()
    .max(120, "That handle is too long.")
    .transform(handleFromInput)
    .pipe(z.string().regex(/^(@?[A-Za-z0-9._-]{1,30})?$/, "Handles can only use letters, numbers, dots, dashes and underscores."))
    .default(""),
  followers: oneOf(FOLLOWERS, "Pick your audience size."),
  posting: oneOf(POSTING, "Pick how often you post."),
  goal: oneOf(GOALS, "Pick what you want most."),
  language: oneOf(LANGUAGES, "Pick a language."),
  start: oneOf(STARTS, "Pick when you'd like to start."),
  budget: oneOf(BUDGETS, "Let us know if the price works."),
  company: z.string().max(200).default(""),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type ProfileInput = z.infer<typeof ProfileSchema>;

export function isBot(input: { company: string }): boolean {
  return input.company.trim() !== "";
}

// The profile step proves it belongs to the signup with an HMAC of the lead id,
// so nobody can attach a profile to someone else's row.
export function leadToken(leadId: string, secret: string): string {
  return createHmac("sha256", secret).update(`lead:${leadId}`).digest("hex");
}

export function tokenValid(leadId: string, token: string, secret: string): boolean {
  const expected = Buffer.from(leadToken(leadId, secret), "hex");
  const given = Buffer.from(token, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// A rough first sort for Hanif. He still picks by hand.
export function fitScore(p: Pick<ProfileInput, "budget" | "start" | "followers" | "posting">): number {
  let score = 0;
  if (p.budget === "yes") score += 4;
  if (p.start === "this-month") score += 3;
  else if (p.start === "1-3-months") score += 1;
  score += { "under-10k": 0, "10k-50k": 1, "50k-250k": 2, "250k-1m": 2, "1m-plus": 1 }[p.followers];
  if (p.posting === "most-days" || p.posting === "daily") score += 1;
  return score;
}

// Apps Script web apps answer 200 even when nothing was written (a script
// error page, or our own "forbidden" reply), so a 2xx alone is not proof.
export function webhookSaved(status: number, contentType: string, body: string): boolean {
  if (status < 200 || status >= 300) return false;
  if (contentType.includes("text/html")) return false;
  const text = body.trim();
  if (text.toLowerCase() === "forbidden") return false;
  try {
    const json = JSON.parse(text);
    if (json && typeof json === "object" && json.ok === false) return false;
  } catch {
    // Plain-text acknowledgements ("Accepted", "OK") are fine.
  }
  return true;
}

// What the webhook receives. Kept flat so a spreadsheet can append it as a row.
export function signupPayload(input: SignupInput, leadId: string, now: Date, secret?: string) {
  return {
    stage: "signup" as const,
    lead_id: leadId,
    created_at: now.toISOString(),
    name: input.name,
    email: input.email,
    whatsapp: input.whatsapp ? (normalizePhone(input.whatsapp) ?? "") : "",
    consent: CONSENT_TEXT,
    utm_source: input.utm_source,
    utm_medium: input.utm_medium,
    utm_campaign: input.utm_campaign,
    ...(secret ? { secret } : {}),
  };
}

export function profilePayload(input: ProfileInput, now: Date, secret?: string) {
  const handle = input.handle.replace(/^@/, "");
  return {
    stage: "profile" as const,
    lead_id: input.lead_id,
    created_at: now.toISOString(),
    niche: input.niche,
    platform: input.platform,
    handle: handle ? `@${handle}` : "",
    followers: input.followers,
    posting: input.posting,
    goal: input.goal,
    language: input.language,
    start: input.start,
    budget: input.budget,
    fit_score: fitScore(input),
    ...(secret ? { secret } : {}),
  };
}
