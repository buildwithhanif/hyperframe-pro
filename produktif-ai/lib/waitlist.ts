import { z } from "zod";

// Values stay stable (they land in the waitlist sheet); labels are what people see.
export const ROLES = [
  { value: "bisnis", label: "Business owner" },
  { value: "profesional", label: "Professional" },
  { value: "coach", label: "Coach or educator" },
  { value: "kreator", label: "Creator" },
  { value: "lainnya", label: "Other" },
] as const;

export const STARTS = [
  { value: "bulan-ini", label: "This month" },
  { value: "1-3-bulan", label: "In 1–3 months" },
  { value: "liat-liat", label: "Just looking" },
] as const;

type RoleValue = (typeof ROLES)[number]["value"];
type StartValue = (typeof STARTS)[number]["value"];

// Indonesian mobile numbers as people actually type or paste them: 08…, 8…,
// 628…, +62 8…, even "+62 0812…", with spaces, dashes, dots or the invisible
// direction marks WhatsApp adds when copying a contact.
// Returns the number as 628… (the format wa.me links want), or null.
export function normalizeWhatsapp(raw: string): string | null {
  const digits = raw.normalize("NFKC").replace(/[\s\p{Pd}\p{Cf}().\/]/gu, "");
  const m = digits.match(/^(?:\+?620?|0)?(8\d{7,11})$/);
  return m ? `62${m[1]}` : null;
}

// Accept a pasted profile link and keep just the handle.
export function handleFromInput(raw: string): string {
  return raw
    .trim()
    .replace(/^(?:https?:\/\/)?(?:www\.|m\.)?(?:instagram|tiktok)\.com\/@?/i, "@")
    .replace(/[/?#].*$/, "");
}

export const WaitlistSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "That name is too long."),
  whatsapp: z
    .string()
    .trim()
    .max(24, "That number is too long.")
    .refine((v) => normalizeWhatsapp(v) !== null, "That doesn't look like an Indonesian WhatsApp number. Try 0812 3456 7890."),
  handle: z
    .string()
    .max(120, "That handle is too long.")
    .transform(handleFromInput)
    .pipe(z.string().regex(/^(@?[A-Za-z0-9._]{1,30})?$/, "Handles can only use letters, numbers, dots and underscores."))
    .default(""),
  role: z.enum(["", ...ROLES.map((r) => r.value)] as ["", ...RoleValue[]]).default(""),
  start: z.enum(["", ...STARTS.map((s) => s.value)] as ["", ...StartValue[]]).default(""),
  source: z.enum(["hero", "footer"]).default("hero"),
  // Honeypot: hidden from people, filled in by naive bots.
  company: z.string().max(200).default(""),
});

export type WaitlistInput = z.infer<typeof WaitlistSchema>;

export function isBot(input: WaitlistInput): boolean {
  return input.company.trim() !== "";
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
export function webhookPayload(input: WaitlistInput, now: Date, secret?: string) {
  const handle = input.handle.replace(/^@/, "");
  return {
    name: input.name,
    whatsapp: normalizeWhatsapp(input.whatsapp) ?? input.whatsapp,
    handle: handle ? `@${handle}` : "",
    role: input.role,
    start: input.start,
    source: input.source,
    created_at: now.toISOString(),
    ...(secret ? { secret } : {}),
  };
}
