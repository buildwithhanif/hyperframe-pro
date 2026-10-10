import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import { buildUserMessage, SYSTEM_PROMPT } from "@/lib/prompt";
import { clientKey, limitFromEnv, rateLimit } from "@/lib/ratelimit";
import { SAMPLE_DECK } from "@/lib/sample";
import { DeckSchema, GenerateRequestSchema, normalizeHandle, withComputedVerdict } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 300;

const MODEL = "claude-opus-5-5";
const MAX_BODY_BYTES = 65_536;

function fail(status: number, error: string, headers?: Record<string, string>) {
  return NextResponse.json({ error }, { status, headers });
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? NaN);
  if (!(length <= MAX_BODY_BYTES)) {
    return fail(413, "Request-nya kegedean.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Request-nya bukan JSON yang valid.");
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, parsed.error.issues[0]?.message ?? "Input-nya belum lengkap.");
  }
  const req = parsed.data;
  const handle = normalizeHandle(req.handle);

  if (process.env.DEMO_MODE === "1") {
    return NextResponse.json({ deck: withComputedVerdict(SAMPLE_DECK), handle, slideCount: req.slideCount, demo: true });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(503, "Server belum siap: ANTHROPIC_API_KEY belum diisi.");
  }

  const perIp = limitFromEnv(process.env.RATE_LIMIT_PER_HOUR, 8);
  const global = limitFromEnv(process.env.GLOBAL_LIMIT_PER_HOUR, 200);
  if (perIp === 0 || global === 0) {
    return fail(503, "Generate lagi dimatiin sementara. Coba lagi nanti.");
  }
  for (const [key, limit] of [
    [`ip:${clientKey(request.headers)}`, perIp],
    ["global", global],
  ] as const) {
    const rl = rateLimit(key, limit);
    if (!rl.ok) {
      return fail(429, "Udah kebanyakan generate. Coba lagi nanti ya.", { "Retry-After": String(rl.retryAfterSec) });
    }
  }

  const client = new Anthropic();
  try {
    // create() rather than parse(): parse() throws on truncated JSON before we
    // can look at stop_reason. The structured-outputs beta is what parse() adds.
    const response = await client.beta.messages.create(
      {
        model: MODEL,
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01", "structured-outputs-2025-12-15"],
        fallbacks: "default",
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserMessage(req, handle) }],
        output_config: { effort: "medium", format: betaZodOutputFormat(DeckSchema) },
      },
      // Stay inside maxDuration so we answer with our own error, and never
      // start a second billed generation after a slow first one.
      { timeout: 270_000, maxRetries: 0 },
    );

    if (response.stop_reason === "refusal") {
      if (response.stop_details?.type === "refusal" && response.stop_details.recommended_model) {
        return fail(503, "AI-nya lagi penuh. Coba lagi sebentar lagi.");
      }
      return fail(422, "Topik ini ditolak sama AI-nya. Coba topik lain.");
    }
    if (response.stop_reason === "max_tokens") {
      return fail(502, "Jawaban AI kepotong. Coba kurangi jumlah slide.");
    }

    const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return fail(502, "AI-nya balikin format yang nggak kebaca. Coba sekali lagi.");
    }
    const deck = DeckSchema.safeParse(json);
    if (!deck.success) {
      return fail(502, "AI-nya balikin format yang nggak kebaca. Coba sekali lagi.");
    }
    return NextResponse.json({ deck: withComputedVerdict(deck.data), handle, slideCount: req.slideCount, demo: false });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return fail(429, "Server lagi rame. Coba lagi sebentar lagi.");
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic auth failed:", error.message);
      return fail(503, "Server belum siap: API key ditolak.");
    }
    if (error instanceof Anthropic.BadRequestError) {
      console.error("Anthropic bad request:", error.message);
      return fail(502, "Permintaan ke AI gagal. Coba lagi.");
    }
    if (error instanceof Anthropic.APIConnectionTimeoutError) {
      return fail(504, "AI-nya kelamaan mikir. Coba lagi, atau kurangi jumlah slide.");
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
      return fail(502, "AI-nya lagi error. Coba lagi sebentar lagi.");
    }
    console.error("Generate failed:", error);
    return fail(500, "Ada yang error di server. Coba lagi.");
  }
}
