// Confirmation email after signup, sent through Resend's HTTP API when
// RESEND_API_KEY is set. A failed email never fails the signup.

export function siteUrl(): string {
  return (process.env.SITE_URL || "https://produktif.ai").replace(/\/+$/, "");
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function confirmationEmail(name: string, resumeUrl: string, replyBy = "within 2 working days", waNumber = "") {
  const first = name.split(/\s+/)[0] || name;
  const when = /^within/.test(replyBy) ? replyBy : `by ${replyBy}`;
  const wa = waNumber ? `on WhatsApp from ${waNumber}, or by replying to this email` : "by email or WhatsApp";
  const subject = "You're on the produktif.ai waitlist";
  const preheader = "What happens next, and when you'll hear from us.";
  const steps = [
    `I read every profile myself. You'll hear back ${when}.`,
    `If it's a fit, we'll message you ${wa}.${waNumber ? " Save the number so we don't land in spam." : ""}`,
    "Then an optional 15-minute call. A refundable Rp 1,000,000 deposit holds your slot and comes off your first month.",
    "Within 7 days of the deposit you get your first video: a test clip of your AI persona. If it still isn't right after one redo, the deposit comes back.",
  ];
  const text = [
    `Hi ${first},`,
    "",
    "You're on the waitlist for the first produktif.ai cohort. Nothing to pay today.",
    "",
    "What happens next:",
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    `If you didn't finish your creator profile, it's about a minute, and it's how we pick the first cohort: ${resumeUrl}`,
    "",
    "One favor: reply with a link to the video you're proudest of. It shows me your style, and I read every reply.",
    "",
    "Hanif",
    "Founder, produktif.ai",
    "",
    "You're getting this because you applied at produktif.ai. Didn't apply, or want your details deleted? Reply and we'll remove them.",
  ].join("\n");
  const li = (s: string, i: number) =>
    `<tr><td valign="top" style="padding:0 12px 14px 0;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#6a665c">0${i + 1}</td><td style="padding:0 0 14px;font-size:15px;line-height:1.55;color:#3a372f">${escape(s)}</td></tr>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f5f2eb;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#15140f">
<span style="display:none;max-height:0;overflow:hidden">${escape(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" style="max-width:540px;background:#fbfaf6;border:1px solid #ddd7ca;border-radius:16px" cellpadding="0" cellspacing="0"><tr><td style="padding:32px">
<p style="margin:0 0 28px;font-weight:600;font-size:18px;letter-spacing:-0.02em">produktif<span style="color:#c8102e">.</span>ai</p>
<p style="margin:0 0 10px;font-size:16px;line-height:1.55">Hi ${escape(first)},</p>
<p style="margin:0 0 24px;font-size:22px;line-height:1.3;font-weight:600;letter-spacing:-0.02em">You're on the waitlist for the first cohort. Nothing to pay today.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px">${steps.map(li).join("")}</table>
<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#3a372f">Didn't finish your creator profile? It's about a minute, and it's how we pick the first cohort.</p>
<p style="margin:0 0 24px"><a href="${escape(resumeUrl)}" style="display:inline-block;background:#15140f;color:#f5f2eb;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:15px">Finish my profile</a></p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#3a372f">One favor: reply with a link to the video you're proudest of. It shows me your style, and I read every reply.</p>
<p style="margin:0;font-size:15px;line-height:1.55">Hanif<br><span style="color:#6a665c">Founder, produktif.ai</span></p>
</td></tr></table>
<p style="max-width:540px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#6a665c">You're getting this because you applied at produktif.ai. Didn't apply, or want your details deleted? Reply and we'll remove them.</p>
</td></tr></table></body></html>`;
  return { subject, text, html };
}

export async function sendConfirmation(to: string, name: string, resumeUrl: string, replyBy?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const { subject, text, html } = confirmationEmail(name, resumeUrl, replyBy, process.env.NEXT_PUBLIC_WA_NUMBER || "");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Hanif at produktif.ai <hello@produktif.ai>",
        to: [to],
        reply_to: process.env.EMAIL_REPLY_TO || undefined,
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) console.error(`Confirmation email failed (status ${res.status})`);
    return res.ok;
  } catch (error) {
    console.error("Confirmation email failed:", error instanceof Error ? error.name : "unknown");
    return false;
  }
}
