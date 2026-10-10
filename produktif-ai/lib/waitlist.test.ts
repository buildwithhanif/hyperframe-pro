import { test } from "node:test";
import assert from "node:assert/strict";
import { isBot, WaitlistSchema, webhookPayload } from "./waitlist.ts";

test("accepts a plain signup and fills defaults", () => {
  const v = WaitlistSchema.parse({ email: "  Hanif@Contoh.id " });
  assert.equal(v.email, "Hanif@Contoh.id");
  assert.equal(v.tool, "");
  assert.deepEqual(v.needs, []);
  assert.equal(v.source, "hero");
  assert.equal(isBot(v), false);
});

test("rejects bad emails, unknown tools and unknown needs", () => {
  assert.equal(WaitlistSchema.safeParse({ email: "bukan-email" }).success, false);
  assert.equal(WaitlistSchema.safeParse({ email: "a@b.co", tool: "gemini" }).success, false);
  assert.equal(WaitlistSchema.safeParse({ email: "a@b.co", needs: ["crypto"] }).success, false);
  assert.equal(WaitlistSchema.safeParse({ email: `${"a".repeat(250)}@b.co` }).success, false);
});

test("honeypot marks bots", () => {
  assert.equal(isBot(WaitlistSchema.parse({ email: "a@b.co", company: "PT Bot" })), true);
});

test("payload is flat, lowercased, deduped, and carries the secret only when set", () => {
  const v = WaitlistSchema.parse({ email: "A@B.co", tool: "both", needs: ["konten", "konten", "kantor"], source: "footer" });
  const now = new Date("2026-10-10T00:00:00Z");
  assert.deepEqual(webhookPayload(v, now), {
    email: "a@b.co",
    tool: "both",
    needs: ["konten", "kantor"],
    source: "footer",
    created_at: "2026-10-10T00:00:00.000Z",
  });
  assert.equal(webhookPayload(v, now, "s3cret").secret, "s3cret");
});
