import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { isBot, WaitlistSchema, webhookPayload } from "@/lib/waitlist";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8_192;

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? NaN);
  if (!(length <= MAX_BODY_BYTES)) return fail(413, "Request-nya kegedean.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Request-nya bukan JSON yang valid.");
  }

  const parsed = WaitlistSchema.safeParse(body);
  if (!parsed.success) {
    const emailIssue = parsed.error.issues.find((i) => i.path[0] === "email");
    return fail(400, emailIssue?.message ?? "Isian form-nya ada yang aneh. Coba refresh.");
  }
  const input = parsed.data;

  // Pretend success so bots learn nothing, but never forward them.
  if (isBot(input)) return NextResponse.json({ ok: true });

  if (!rateLimit(`wl:${clientKey(request.headers)}`, 5).ok) {
    return fail(429, "Kebanyakan percobaan. Coba lagi sejam lagi.");
  }

  const url = process.env.WAITLIST_WEBHOOK_URL;
  if (!url) {
    if (process.env.DEMO_MODE === "1") return NextResponse.json({ ok: true, demo: true });
    console.error("WAITLIST_WEBHOOK_URL is not set; signup dropped");
    return fail(503, "Waitlist-nya belum nyambung. Coba lagi nanti ya.");
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(webhookPayload(input, new Date(), process.env.WAITLIST_WEBHOOK_SECRET)),
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      console.error(`Waitlist webhook answered ${res.status}`);
      return fail(502, "Gagal nyimpen. Coba sekali lagi.");
    }
  } catch (error) {
    console.error("Waitlist webhook failed:", error);
    return fail(502, "Gagal nyimpen. Coba sekali lagi.");
  }
  return NextResponse.json({ ok: true });
}
