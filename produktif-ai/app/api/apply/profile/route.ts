import { NextResponse } from "next/server";
import { forwardRow, signingSecret } from "@/lib/forward";
import { clientKey, rateLimit, unhit } from "@/lib/ratelimit";
import { isBot, ProfileSchema, profilePayload, tokenValid } from "@/lib/waitlist";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY_BYTES = 8_192;
const FIELDS = ["niche", "platform", "handle", "followers", "posting", "goal", "language", "start", "budget"];

function fail(status: number, error: string, field?: string) {
  return NextResponse.json(field ? { error, field } : { error }, { status });
}

// Step 2 of Get Started: the creator profile, attached to the signup row.
export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? NaN);
  if (!(length <= MAX_BODY_BYTES)) return fail(413, "That request is too large.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "That request wasn't valid. Please refresh and try again.");
  }

  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues.find((i) => FIELDS.includes(String(i.path[0])));
    if (issue) return fail(400, issue.message, String(issue.path[0]));
    const session = parsed.error.issues.some((i) => ["lead_id", "token"].includes(String(i.path[0])));
    return fail(400, session ? "Your session expired. Please start again." : "Something in the form looks off. Please refresh and try again.");
  }
  const input = parsed.data;
  if (!tokenValid(input.lead_id, input.token, signingSecret())) {
    return fail(403, "Your session expired. Please start again.");
  }
  if (isBot(input)) return NextResponse.json({ ok: true });

  const key = `profile:${clientKey(request.headers)}`;
  if (!rateLimit(key, 30).ok) return fail(429, "Too many attempts. Please try again in an hour.");

  const result = await forwardRow(profilePayload(input, new Date(), process.env.WAITLIST_WEBHOOK_SECRET));
  if (result === "not-configured") {
    console.error("WAITLIST_WEBHOOK_URL is not set; profile dropped");
    unhit(key);
    return fail(503, "Applications aren't open yet. Please try again later.");
  }
  if (result === "failed") {
    unhit(key);
    return fail(502, "We couldn't save that. Please try again.");
  }
  return NextResponse.json({ ok: true, ...(result === "demo" ? { demo: true } : {}) });
}
