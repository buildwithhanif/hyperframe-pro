import { createHash } from "node:crypto";
import { webhookSaved } from "./waitlist.ts";

export type ForwardResult = "saved" | "demo" | "not-configured" | "failed";

// Sends one flat row to the Google Apps Script webhook behind the sheet.
export async function forwardRow(row: Record<string, unknown>): Promise<ForwardResult> {
  const url = process.env.WAITLIST_WEBHOOK_URL;
  if (!url) return process.env.DEMO_MODE === "1" ? "demo" : "not-configured";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(row),
      redirect: "follow",
      // Apps Script cold starts can take a while; aborting early would report a
      // failure for a row that still gets written.
      signal: AbortSignal.timeout(20_000),
    });
    const text = await res.text();
    if (webhookSaved(res.status, res.headers.get("content-type") ?? "", text)) return "saved";
    console.error(`Waitlist webhook did not confirm the save (status ${res.status})`);
    return "failed";
  } catch (error) {
    console.error("Waitlist webhook failed:", error instanceof Error ? error.name : "unknown");
    return "failed";
  }
}

// Signs lead tokens. Must be the same on every server instance, so it never
// falls back to a random value: an explicit secret first, then one derived from
// the (private) webhook URL, then a fixed value that only demo mode uses.
export function signingSecret(): string {
  const explicit = process.env.APPLY_SECRET || process.env.WAITLIST_WEBHOOK_SECRET;
  if (explicit) return explicit;
  const url = process.env.WAITLIST_WEBHOOK_URL;
  if (url) return createHash("sha256").update(`produktif-apply:${url}`).digest("hex");
  return "demo-only-secret";
}
