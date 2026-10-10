// Confirmation email after signup, sent through Resend's HTTP API when
// RESEND_API_KEY is set. A failed email never fails the signup.

export function siteUrl(): string {
  return (process.env.SITE_URL || "https://produktif.ai").replace(/\/+$/, "");
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function confirmationEmail(name: string, resumeUrl: string) {
  const first = name.split(/\s+/)[0] || name;
  const subject = "You're on the produktif.ai list";
  const text = [
    `Hi ${first},`,
    "",
    "You're on the list for the first produktif.ai cohort.",
    "",
    "What happens next:",
    "1. We read every creator profile. If you skipped yours, it takes about a minute: " + resumeUrl,
    "2. We reply within 2 working days, by email or WhatsApp.",
    "3. If it's a fit, we'll show you how your AI persona gets made and when you'd start.",
    "",
    "Nothing to pay to join the list.",
    "",
    "Hanif",
    "Founder, produktif.ai",
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#f5f2eb;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#15140f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" style="max-width:520px;background:#fbfaf6;border:1px solid #ddd7ca;border-radius:16px" cellpadding="0" cellspacing="0"><tr><td style="padding:32px">
<p style="margin:0 0 24px;font-weight:600;font-size:18px;letter-spacing:-0.02em">produktif<span style="color:#c8102e">.</span>ai</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.55">Hi ${escape(first)},</p>
<p style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:600;letter-spacing:-0.02em">You're on the list for the first cohort.</p>
<p style="margin:0 0 8px;font-size:15px;line-height:1.55;color:#3a372f"><b>1.</b> We read every creator profile. Skipped yours? It takes about a minute.</p>
<p style="margin:0 0 20px"><a href="${escape(resumeUrl)}" style="display:inline-block;background:#15140f;color:#f5f2eb;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:15px">Finish my profile</a></p>
<p style="margin:0 0 8px;font-size:15px;line-height:1.55;color:#3a372f"><b>2.</b> We reply within 2 working days, by email or WhatsApp.</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#3a372f"><b>3.</b> If it's a fit, we'll show you how your AI persona gets made and when you'd start.</p>
<p style="margin:0;font-size:14px;line-height:1.55;color:#6a665c">Nothing to pay to join the list.<br>Hanif, founder of produktif.ai</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}

export async function sendConfirmation(to: string, name: string, resumeUrl: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const { subject, text, html } = confirmationEmail(name, resumeUrl);
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
