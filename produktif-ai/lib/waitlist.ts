import { z } from "zod";

export const TOOLS = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "both", label: "Dua-duanya" },
] as const;

export const NEEDS = [
  { value: "konten", label: "Konten sosmed" },
  { value: "brand-deal", label: "Brand deal & jualan" },
  { value: "kantor", label: "Kerjaan kantor" },
  { value: "produk-digital", label: "Produk digital" },
] as const;

type ToolValue = (typeof TOOLS)[number]["value"];
type NeedValue = (typeof NEEDS)[number]["value"];

export const WaitlistSchema = z.object({
  email: z.string().trim().max(254, "Email-nya kepanjangan.").pipe(z.email("Email-nya kayaknya salah ketik.")),
  tool: z.enum(["", ...TOOLS.map((t) => t.value)] as ["", ...ToolValue[]]).default(""),
  needs: z.array(z.enum(NEEDS.map((n) => n.value) as [NeedValue, ...NeedValue[]])).max(NEEDS.length).default([]),
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
  return {
    email: input.email.toLowerCase(),
    tool: input.tool,
    needs: [...new Set(input.needs)],
    source: input.source,
    created_at: now.toISOString(),
    ...(secret ? { secret } : {}),
  };
}
