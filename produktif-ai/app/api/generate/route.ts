import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import { buildUserMessage, SYSTEM_PROMPT } from "@/lib/prompt";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { SAMPLE_DECK } from "@/lib/sample";
import { checkDeck, DeckSchema, GenerateRequestSchema, normalizeHandle } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL = "claude-opus-5-5";

function fail(status: number, error: string, headers?: Record<string, string>) {
  return NextResponse.json({ error }, { status, headers });
}

export async function POST(request: Request) {
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
    return NextResponse.json({ deck: SAMPLE_DECK, handle, issues: [], demo: true });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(503, "Server belum siap: ANTHROPIC_API_KEY belum diisi.");
  }

  const limit = Number(process.env.RATE_LIMIT_PER_HOUR) || 8;
  const rl = rateLimit(clientKey(request.headers), limit);
  if (!rl.ok) {
    return fail(429, "Udah kebanyakan generate. Coba lagi nanti ya.", { "Retry-After": String(rl.retryAfterSec) });
  }

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(req, handle) }],
      output_config: { effort: "medium", format: betaZodOutputFormat(DeckSchema) },
    });

    if (response.stop_reason === "refusal") {
      return fail(422, "Topik ini ditolak sama AI-nya. Coba topik lain.");
    }
    if (response.stop_reason === "max_tokens") {
      return fail(502, "Jawaban AI kepotong. Coba kurangi jumlah slide.");
    }
    const deck = response.parsed_output;
    if (!deck) {
      return fail(502, "AI-nya balikin format yang nggak kebaca. Coba sekali lagi.");
    }
    return NextResponse.json({ deck, handle, issues: checkDeck(deck, req.slideCount), demo: false });
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
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
      return fail(502, "AI-nya lagi error. Coba lagi sebentar lagi.");
    }
    console.error("Generate failed:", error);
    return fail(500, "Ada yang error di server. Coba lagi.");
  }
}
