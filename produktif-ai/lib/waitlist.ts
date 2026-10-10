import { z } from "zod";

export const ROLES = [
  { value: "bisnis", label: "Pemilik bisnis" },
  { value: "profesional", label: "Profesional" },
  { value: "coach", label: "Coach & edukator" },
  { value: "kreator", label: "Kreator" },
  { value: "lainnya", label: "Lainnya" },
] as const;

export const STARTS = [
  { value: "bulan-ini", label: "Bulan ini" },
  { value: "1-3-bulan", label: "1–3 bulan lagi" },
  { value: "liat-liat", label: "Masih liat-liat" },
] as const;

type RoleValue = (typeof ROLES)[number]["value"];
type StartValue = (typeof STARTS)[number]["value"];

// Indonesian mobile numbers: 08…, 628… or +628…, 10 to 14 digits in total.
// Returns the number as 628… (the format wa.me links want), or null.
export function normalizeWhatsapp(raw: string): string | null {
  const digits = raw.replace(/[\s\-().]/g, "");
  const m = digits.match(/^(?:\+?62|0)(8\d{7,11})$/);
  return m ? `62${m[1]}` : null;
}

export const WaitlistSchema = z.object({
  name: z.string().trim().min(2, "Namanya diisi dulu ya.").max(80, "Namanya kepanjangan."),
  whatsapp: z
    .string()
    .trim()
    .max(24, "Nomornya kepanjangan.")
    .refine((v) => normalizeWhatsapp(v) !== null, "Nomor WhatsApp-nya kayaknya salah. Contoh: 0812 3456 7890."),
  handle: z
    .string()
    .trim()
    .max(31, "Handle-nya kepanjangan.")
    .regex(/^(@?[A-Za-z0-9._]{1,30})?$/, "Handle cuma boleh huruf, angka, titik dan underscore.")
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
