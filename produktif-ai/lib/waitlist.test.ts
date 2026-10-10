import { test } from "node:test";
import assert from "node:assert/strict";
import { handleFromInput, isBot, normalizeWhatsapp, WaitlistSchema, webhookPayload, webhookSaved } from "./waitlist.ts";

test("WhatsApp numbers normalise to 628…", () => {
  assert.equal(normalizeWhatsapp("0812 3456 7890"), "6281234567890");
  assert.equal(normalizeWhatsapp("+62 812-3456-7890"), "6281234567890");
  assert.equal(normalizeWhatsapp("6281234567890"), "6281234567890");
  assert.equal(normalizeWhatsapp("(0812) 345.678"), "62812345678");
  assert.equal(normalizeWhatsapp("021 555 1234"), null, "landlines are not WhatsApp numbers");
  assert.equal(normalizeWhatsapp("0812"), null);
  assert.equal(normalizeWhatsapp("08123456789012345"), null);
  assert.equal(normalizeWhatsapp("+1 415 555 0100"), null);
  assert.equal(normalizeWhatsapp("+62 0812 3456 7890"), "6281234567890");
  assert.equal(normalizeWhatsapp("812 3456 7890"), "6281234567890");
  assert.equal(normalizeWhatsapp("\u202a+62 812\u20113456\u20117890\u202c"), "6281234567890", "copied from WhatsApp contacts");
  assert.equal(normalizeWhatsapp("0811 234 567"), "62811234567");
});

test("pasted profile links become handles", () => {
  assert.equal(handleFromInput("https://www.instagram.com/ani.coach/?hl=id"), "@ani.coach");
  assert.equal(handleFromInput("tiktok.com/@ani_wijaya"), "@ani_wijaya");
  assert.equal(handleFromInput(" @ani "), "@ani");
  const v = WaitlistSchema.parse({ name: "Ani", whatsapp: "081234567890", handle: "https://instagram.com/ani.coach" });
  assert.equal(v.handle, "@ani.coach");
});

test("accepts a plain signup and fills defaults", () => {
  const v = WaitlistSchema.parse({ name: " Hanif ", whatsapp: "0812 3456 7890" });
  assert.equal(v.name, "Hanif");
  assert.equal(v.handle, "");
  assert.equal(v.role, "");
  assert.equal(v.start, "");
  assert.equal(v.source, "hero");
  assert.equal(isBot(v), false);
});

test("rejects bad names, numbers, handles and unknown choices", () => {
  assert.equal(WaitlistSchema.safeParse({ name: "A", whatsapp: "081234567890" }).success, false);
  assert.equal(WaitlistSchema.safeParse({ name: "Ani", whatsapp: "12345" }).success, false);
  assert.equal(WaitlistSchema.safeParse({ name: "Ani", whatsapp: "081234567890", handle: "bad handle!" }).success, false);
  assert.equal(WaitlistSchema.safeParse({ name: "Ani", whatsapp: "081234567890", role: "artis" }).success, false);
  assert.equal(WaitlistSchema.safeParse({ name: "Ani", whatsapp: "081234567890", start: "besok" }).success, false);
});

test("honeypot marks bots", () => {
  assert.equal(isBot(WaitlistSchema.parse({ name: "Bot", whatsapp: "081234567890", company: "PT Bot" })), true);
});

test("payload is flat, normalised, and carries the secret only when set", () => {
  const v = WaitlistSchema.parse({ name: "Ani", whatsapp: "+62 812-3456-7890", handle: "ani.coach", role: "coach", start: "bulan-ini", source: "footer" });
  const now = new Date("2026-10-10T00:00:00Z");
  assert.deepEqual(webhookPayload(v, now), {
    name: "Ani",
    whatsapp: "6281234567890",
    handle: "@ani.coach",
    role: "coach",
    start: "bulan-ini",
    source: "footer",
    created_at: "2026-10-10T00:00:00.000Z",
  });
  assert.equal(webhookPayload(v, now, "s3cret").secret, "s3cret");
  assert.equal(webhookPayload(WaitlistSchema.parse({ name: "Ani", whatsapp: "081234567890" }), now).handle, "");
});

test("webhookSaved only trusts a real confirmation", () => {
  assert.equal(webhookSaved(200, "application/json", '{"ok":true}'), true);
  assert.equal(webhookSaved(200, "text/plain", "Accepted"), true);
  assert.equal(webhookSaved(200, "application/json", '{"ok":false,"error":"forbidden"}'), false);
  assert.equal(webhookSaved(200, "text/plain", "forbidden"), false);
  assert.equal(webhookSaved(200, "text/html; charset=utf-8", "<html>Error</html>"), false);
  assert.equal(webhookSaved(500, "application/json", '{"ok":true}'), false);
});
