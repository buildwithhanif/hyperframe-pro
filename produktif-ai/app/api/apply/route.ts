import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { formatReplyBy, replyBy } from "@/lib/dates";
import { sendConfirmation, siteUrl } from "@/lib/email";
import { forwardRow, signingSecret } from "@/lib/forward";
import { clientKey, rateLimit, unhit } from "@/lib/ratelimit";
import { isBot, leadToken, SignupSchema, signupPayload } from "@/lib/waitlist";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY_BYTES = 8_192;
const FIELDS = ["name", "email", "whatsapp", "consent", "cat"];

function fail(status: number, error: string, field?: string) {
  return NextResponse.json(field ? { error, field } : { error }, { status });
}

// Step 1 of Get Started: save the lead before asking anything else.
export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? NaN);
  if (!(length <= MAX_BODY_BYTES)) return fail(413, "That request is too large.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "That request wasn’t valid. Please refresh and try again.");
  }

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    // Report the first problem in a field the visitor can actually fix.
    const issue = parsed.error.issues.find((i) => FIELDS.includes(String(i.path[0])));
    return issue
      ? fail(400, issue.message, String(issue.path[0]))
      : fail(400, "Something in the form looks off. Please refresh and try again.");
  }
  const input = parsed.data;
  const leadId = randomUUID();
  const token = leadToken(leadId, signingSecret());

  // Pretend success so bots learn nothing, but never forward them.
  if (isBot(input)) return NextResponse.json({ ok: true, lead_id: leadId, token });

  // Generous: many Indonesian mobile users share one carrier IP (CGNAT).
  const key = `apply:${clientKey(request.headers)}`;
  if (!rateLimit(key, 30).ok) return fail(429, "Too many attempts. Please try again in an hour.");

  const result = await forwardRow(signupPayload(input, leadId, new Date(), process.env.WAITLIST_WEBHOOK_SECRET));
  if (result === "not-configured") {
    console.error("WAITLIST_WEBHOOK_URL is not set; signup dropped");
    unhit(key);
    return fail(503, "Applications aren’t open yet. Please try again later.");
  }
  if (result === "failed") {
    unhit(key);
    return fail(502, "We couldn’t save that. Please try again.");
  }

  const resumeUrl = `${siteUrl()}${input.variant === "v2" ? "/v2/start" : "/start"}?lead=${leadId}&t=${token}`;
  // The done screen only promises an email when one actually went out. v2
  // applicants may leave email out; they hear back on WhatsApp.
  const emailed =
    result === "saved" &&
    input.email !== "" &&
    (await sendConfirmation(input.email, input.name, resumeUrl, formatReplyBy(replyBy(new Date())), input.whatsapp !== ""));
  return NextResponse.json({ ok: true, lead_id: leadId, token, emailed, ...(result === "demo" ? { demo: true } : {}) });
}
