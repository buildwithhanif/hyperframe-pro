import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// The Get Started flow posts twice: a short signup (so a lead is never lost),
// then the creator profile. Both land in the sheet as rows joined by lead_id.

import {
  BIZ_BUDGETS,
  BIZ_PLATFORMS,
  BUDGETS,
  CATEGORIES,
  CONSENT_TEXT,
  CONSENT_TEXT_V2,
  FACES,
  FOLLOWERS,
  GOALS,
  LANGUAGES,
  OPTIN_TEXT_V2,
  PLATFORMS,
  POSTING,
  STARTS,
  WANTS,
} from "./waitlist-options.ts";

export * from "./waitlist-options.ts";

type Values<T extends readonly { value: string }[]> = T[number]["value"];
const oneOf = <T extends readonly { value: string }[]>(list: T, message: string) =>
  z.enum(list.map((o) => o.value) as [Values<T>, ...Values<T>[]], { message });

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

const EMAIL_MESSAGE = "That email doesn’t look right. Check for typos.";

// v1 (creators) needs an email and takes WhatsApp optionally. v2 (business
// owners) needs WhatsApp and takes email optionally.
export const SignupSchema = z
  .object({
    variant: z.enum(["v1", "v2"]).default("v1"),
    name: z.string().trim().min(2, "Please enter your name.").max(80, "That name is too long."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, "That email is too long.")
      .refine((v) => v === "" || z.email().safeParse(v).success, EMAIL_MESSAGE)
      .default(""),
    whatsapp: z
      .string()
      .trim()
      .max(24, "That number is too long.")
      .refine((v) => v === "" || normalizePhone(v) !== null, "Add your country code, like +62 812 3456 7890.")
      .default(""),
    consent: z.literal(true, { message: "Please tick the box so we can contact you." }),
    // v2 only, unticked by default: message me when a new group opens.
    optin: z.boolean().default(false),
    // v2 only: what the business sells, from the first tap.
    cat: z
      .string()
      .default("")
      .refine((v) => v === "" || CATEGORIES.some((c) => c.value === v), "Pick what you sell."),
    utm_source: utm,
    utm_medium: utm,
    utm_campaign: utm,
    // Honeypot: hidden from people, filled in by naive bots.
    company: z.string().max(200).default(""),
  })
  .superRefine((v, ctx) => {
    if (v.variant === "v1" && v.email === "") ctx.addIssue({ code: "custom", path: ["email"], message: EMAIL_MESSAGE });
    if (v.variant === "v2" && v.whatsapp === "")
      ctx.addIssue({ code: "custom", path: ["whatsapp"], message: "Add your WhatsApp number so we can reply." });
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
  start: oneOf(STARTS, "Pick when you’d like to start."),
  budget: oneOf(BUDGETS, "Let us know if the price works."),
  company: z.string().max(200).default(""),
});

// v2: the business profile. It reuses the profile tab, so the sheet keeps one
// row per lead: niche holds the category, goal holds what they want more of.
// Who makes the content now and when to start are asked on the setup call.
export const BusinessProfileSchema = z.object({
  variant: z.literal("v2"),
  lead_id: z.string().uuid("Your session expired. Please start again."),
  token: z.string().regex(/^[a-f0-9]{64}$/, "Your session expired. Please start again."),
  cat: oneOf(CATEGORIES, "Pick what you sell."),
  want: oneOf(WANTS, "Pick what you want more of."),
  platform: oneOf(BIZ_PLATFORMS, "Pick your main account."),
  handle: z
    .string()
    .max(120, "That handle is too long.")
    .transform(handleFromInput)
    .pipe(z.string().regex(/^(@?[A-Za-z0-9._-]{1,30})?$/, "Handles can only use letters, numbers, dots, dashes and underscores."))
    .default(""),
  face: oneOf(FACES, "Pick who would be the face."),
  budget: oneOf(BIZ_BUDGETS, "Let us know if the price works."),
  company: z.string().max(200).default(""),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type ProfileInput = z.infer<typeof ProfileSchema>;
export type BusinessProfileInput = z.infer<typeof BusinessProfileSchema>;

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
    variant: input.variant,
    name: input.name,
    email: input.email,
    whatsapp: input.whatsapp ? (normalizePhone(input.whatsapp) ?? "") : "",
    consent: input.variant === "v2" ? CONSENT_TEXT_V2 : CONSENT_TEXT,
    optin: input.variant === "v2" && input.optin ? OPTIN_TEXT_V2 : "",
    cat: input.cat,
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

// A rough first sort for v2 leads, 0 to 7.
export function businessFitScore(p: Pick<BusinessProfileInput, "budget" | "face" | "handle">): number {
  let score = 0;
  if (p.budget === "yes") score += 4;
  else if (p.budget === "test-first") score += 3;
  if (p.face === "me") score += 2;
  else if (p.face === "team") score += 1;
  // An account we can look at before replying.
  if (p.handle.replace(/^@/, "")) score += 1;
  return score;
}

const label = (list: readonly { value: string; label: string }[], value: string) => list.find((o) => o.value === value)?.label ?? value;

export function businessProfilePayload(input: BusinessProfileInput, now: Date, secret?: string) {
  const handle = input.handle.replace(/^@/, "");
  return {
    stage: "profile" as const,
    lead_id: input.lead_id,
    created_at: now.toISOString(),
    variant: "v2" as const,
    niche: label(CATEGORIES, input.cat),
    platform: input.platform,
    handle: handle ? `@${handle}` : "",
    followers: "",
    posting: "",
    goal: input.want,
    language: "",
    start: "",
    budget: input.budget,
    // Kept as empty columns so rows from the first v2 draft still line up.
    maker: "",
    face: input.face,
    poster: "",
    fit_score: businessFitScore(input),
    ...(secret ? { secret } : {}),
  };
}
