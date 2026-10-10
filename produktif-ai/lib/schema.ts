import { z } from "zod";

// What the model must return. Kept to plain strings, booleans, enums and arrays
// so it stays inside what structured outputs accept; counts and lengths are
// checked in code afterwards (see checkDeck).

const TopicTest = z.object({
  pass: z.boolean(),
  why: z.string(),
});

export const SlideSchema = z.object({
  kind: z.enum(["hook", "insight", "step", "warning", "closer"]),
  kicker: z.string(),
  title: z.string(),
  body: z.string(),
  anchor: z.string(),
});

export const DeckSchema = z.object({
  topic_check: z.object({
    wallet: TopicTest,
    villain: TopicTest,
    tomorrow: TopicTest,
    tag: TopicTest,
    verdict: z.enum(["gas", "perlu diasah", "ganti topik"]),
    suggestion: z.string(),
  }),
  slides: z.array(SlideSchema),
  caption: z.string(),
  fact_check: z.array(z.string()),
});

export type Slide = z.infer<typeof SlideSchema>;
export type Deck = z.infer<typeof DeckSchema>;
export type TopicCheck = Deck["topic_check"];

// What the browser sends.
export const GenerateRequestSchema = z.object({
  mode: z.enum(["topic", "thread"]),
  input: z.string().trim().min(3, "Topiknya kependekan.").max(6000, "Kepanjangan, maksimal 6.000 karakter."),
  receipts: z.string().trim().max(1000, "Bagian pengalaman maksimal 1.000 karakter.").default(""),
  slideCount: z.number().int().min(5).max(12).default(8),
  handle: z
    .string()
    .trim()
    .regex(/^@?[A-Za-z0-9._]{1,30}$/, "Handle cuma boleh huruf, angka, titik dan underscore.")
    .or(z.literal(""))
    .default(""),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export function normalizeHandle(handle: string): string {
  const h = handle.trim().replace(/^@/, "");
  return h ? `@${h}` : "";
}

// Problems worth showing the user, without throwing the deck away.
export function checkDeck(deck: Deck, wantedSlides: number): string[] {
  const issues: string[] = [];
  if (deck.slides.length === 0) issues.push("Model tidak mengembalikan slide.");
  if (deck.slides.length !== wantedSlides) {
    issues.push(`Diminta ${wantedSlides} slide, keluar ${deck.slides.length}.`);
  }
  if (deck.slides[0] && deck.slides[0].kind !== "hook") issues.push("Slide pertama bukan hook.");
  deck.slides.forEach((s, i) => {
    if (s.anchor && !s.title.toLowerCase().includes(s.anchor.toLowerCase())) {
      issues.push(`Slide ${i + 1}: kata emas "${s.anchor}" tidak ada di judul.`);
    }
  });
  return issues;
}

// Split a title around the first case-insensitive match of the anchor so the
// renderer can paint that part gold. Returns [before, match, after].
export function splitAnchor(title: string, anchor: string): [string, string, string] {
  const a = anchor.trim();
  if (!a) return [title, "", ""];
  const i = title.toLowerCase().indexOf(a.toLowerCase());
  if (i < 0) return [title, "", ""];
  return [title.slice(0, i), title.slice(i, i + a.length), title.slice(i + a.length)];
}
