import { NextResponse } from "next/server";
import { clientKey, rateLimit, unhit } from "@/lib/ratelimit";
import { isBot, WaitlistSchema, webhookPayload, webhookSaved } from "@/lib/waitlist";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY_BYTES = 8_192;

function fail(status: number, error: string, field?: string) {
  return NextResponse.json(field ? { error, field } : { error }, { status });
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
    // Report the first problem in a field the visitor can actually fix.
    const issue = parsed.error.issues.find((i) => ["name", "whatsapp", "handle"].includes(String(i.path[0])));
    return issue
      ? fail(400, issue.message, String(issue.path[0]))
      : fail(400, "Isian form-nya ada yang aneh. Coba refresh.");
  }
  const input = parsed.data;

  // Pretend success so bots learn nothing, but never forward them.
  if (isBot(input)) return NextResponse.json({ ok: true });

  // Generous: many Indonesian mobile users share one carrier IP (CGNAT).
  const key = `wl:${clientKey(request.headers)}`;
  if (!rateLimit(key, 30).ok) {
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
      // Apps Script cold starts can take a while; aborting early would report a
      // failure for a row that still gets written.
      signal: AbortSignal.timeout(20_000),
    });
    const text = await res.text();
    if (!webhookSaved(res.status, res.headers.get("content-type") ?? "", text)) {
      console.error(`Waitlist webhook did not confirm the save (status ${res.status})`);
      unhit(key);
      return fail(502, "Gagal nyimpen. Coba sekali lagi.");
    }
  } catch (error) {
    console.error("Waitlist webhook failed:", error instanceof Error ? error.name : "unknown");
    unhit(key);
    return fail(502, "Gagal nyimpen. Coba sekali lagi.");
  }
  return NextResponse.json({ ok: true });
}
