import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BusinessProfileSchema,
  businessFitScore,
  businessProfilePayload,
  CONSENT_TEXT,
  fitScore,
  handleFromInput,
  isBot,
  leadToken,
  normalizePhone,
  ProfileSchema,
  profilePayload,
  SignupSchema,
  signupPayload,
  tokenValid,
  webhookSaved,
} from "./waitlist.ts";
import { confirmationEmail } from "./email.ts";
import { CONSENT_TEXT_V2 } from "./waitlist-options.ts";

const LEAD = "6f1c2a7e-3b4d-4e5f-8a9b-0c1d2e3f4a5b";

test("Indonesian numbers normalise to 628…, others need a country code", () => {
  assert.equal(normalizePhone("0812 3456 7890"), "6281234567890");
  assert.equal(normalizePhone("+62 812-3456-7890"), "6281234567890");
  assert.equal(normalizePhone("6281234567890"), "6281234567890");
  assert.equal(normalizePhone("+62 0812 3456 7890"), "6281234567890");
  assert.equal(normalizePhone("812 3456 7890"), "6281234567890");
  assert.equal(normalizePhone("‪+62 812‑3456‑7890‬"), "6281234567890", "copied from WhatsApp contacts");
  assert.equal(normalizePhone("+1 415 555 0100"), "14155550100");
  assert.equal(normalizePhone("0060 12 345 6789"), "60123456789");
  assert.equal(normalizePhone("+44 7700 900123"), "447700900123");
  assert.equal(normalizePhone("021 555 1234"), null, "landlines without a country code are rejected");
  assert.equal(normalizePhone("12345"), null);
  assert.equal(normalizePhone("+0 123 456 789"), null);
});

test("pasted profile links become handles", () => {
  assert.equal(handleFromInput("https://www.instagram.com/ani.coach/?hl=id"), "@ani.coach");
  assert.equal(handleFromInput("tiktok.com/@ani_wijaya"), "@ani_wijaya");
  assert.equal(handleFromInput("https://www.youtube.com/@ani-wijaya"), "@ani-wijaya");
  assert.equal(handleFromInput("https://x.com/ani"), "@ani");
  assert.equal(handleFromInput(" @ani "), "@ani");
});

test("signup needs a name, a real email and consent; WhatsApp is optional", () => {
  const v = SignupSchema.parse({ name: " Ani ", email: " Ani@Example.COM ", consent: true });
  assert.equal(v.name, "Ani");
  assert.equal(v.email, "ani@example.com");
  assert.equal(v.whatsapp, "");
  assert.equal(isBot(v), false);
  assert.equal(SignupSchema.safeParse({ name: "Ani", email: "ani@example", consent: true }).success, false);
  assert.equal(SignupSchema.safeParse({ name: "Ani", email: "ani@example.com" }).success, false, "consent is required");
  assert.equal(SignupSchema.safeParse({ name: "Ani", email: "ani@example.com", consent: false }).success, false);
  assert.equal(SignupSchema.safeParse({ name: "A", email: "ani@example.com", consent: true }).success, false);
  assert.equal(SignupSchema.safeParse({ name: "Ani", email: "ani@example.com", whatsapp: "12345", consent: true }).success, false);
  assert.equal(SignupSchema.safeParse({ name: "Ani", email: "ani@example.com", whatsapp: "+1 415 555 0100", consent: true }).success, true);
});

test("honeypot marks bots", () => {
  assert.equal(isBot(SignupSchema.parse({ name: "Bot", email: "b@b.co", consent: true, company: "PT Bot" })), true);
});

test("lead tokens verify only for the right lead and secret", () => {
  const t = leadToken(LEAD, "s3cret");
  assert.match(t, /^[a-f0-9]{64}$/);
  assert.equal(tokenValid(LEAD, t, "s3cret"), true);
  assert.equal(tokenValid(LEAD, t, "other"), false);
  assert.equal(tokenValid("00000000-0000-4000-8000-000000000000", t, "s3cret"), false);
  assert.equal(tokenValid(LEAD, "ab", "s3cret"), false);
});

const PROFILE = {
  lead_id: LEAD,
  token: leadToken(LEAD, "s3cret"),
  niche: "Personal finance for first jobbers",
  platform: "tiktok",
  handle: "https://www.tiktok.com/@ani_wijaya",
  followers: "50k-250k",
  posting: "weekly",
  goal: "time",
  language: "both",
  start: "this-month",
  budget: "yes",
};

test("profile validates every choice and cleans the handle", () => {
  const p = ProfileSchema.parse(PROFILE);
  assert.equal(p.handle, "@ani_wijaya");
  assert.equal(ProfileSchema.safeParse({ ...PROFILE, platform: "myspace" }).success, false);
  assert.equal(ProfileSchema.safeParse({ ...PROFILE, niche: "x" }).success, false);
  assert.equal(ProfileSchema.safeParse({ ...PROFILE, budget: "" }).success, false);
  assert.equal(ProfileSchema.safeParse({ ...PROFILE, lead_id: "nope" }).success, false);
  assert.equal(ProfileSchema.safeParse({ ...PROFILE, handle: "bad handle!" }).success, false);
});

test("fit score favours budget and timing", () => {
  assert.equal(fitScore({ budget: "yes", start: "this-month", followers: "50k-250k", posting: "weekly" }), 9);
  assert.equal(fitScore({ budget: "not-yet", start: "looking", followers: "under-10k", posting: "rarely" }), 0);
});

test("payloads are flat rows joined by lead_id, secret only when set", () => {
  const now = new Date("2026-10-10T00:00:00Z");
  const s = SignupSchema.parse({ name: "Ani", email: "ani@example.com", whatsapp: "0812 3456 7890", consent: true, utm_source: "x" });
  assert.deepEqual(signupPayload(s, LEAD, now), {
    stage: "signup",
    lead_id: LEAD,
    created_at: "2026-10-10T00:00:00.000Z",
    variant: "v1",
    name: "Ani",
    email: "ani@example.com",
    whatsapp: "6281234567890",
    consent: CONSENT_TEXT,
    cat: "",
    utm_source: "x",
    utm_medium: "",
    utm_campaign: "",
  });
  assert.equal(signupPayload(s, LEAD, now, "s3cret").secret, "s3cret");
  const p = profilePayload(ProfileSchema.parse(PROFILE), now);
  assert.equal(p.stage, "profile");
  assert.equal(p.lead_id, LEAD);
  assert.equal(p.handle, "@ani_wijaya");
  assert.equal(p.fit_score, 9);
  assert.equal("token" in p, false, "the token never reaches the sheet");
});

test("webhookSaved only trusts a real confirmation", () => {
  assert.equal(webhookSaved(200, "application/json", '{"ok":true}'), true);
  assert.equal(webhookSaved(200, "text/plain", "Accepted"), true);
  assert.equal(webhookSaved(200, "application/json", '{"ok":false,"error":"forbidden"}'), false);
  assert.equal(webhookSaved(200, "text/plain", "forbidden"), false);
  assert.equal(webhookSaved(200, "text/html; charset=utf-8", "<html>Error</html>"), false);
  assert.equal(webhookSaved(500, "application/json", '{"ok":true}'), false);
});

test("confirmation email greets by first name, escapes HTML and links to the profile", () => {
  assert.match(confirmationEmail("Ani Wijaya", "https://produktif.ai/start").text, /^Hi Ani,/);
  const m = confirmationEmail("<b>Ani</b> Wijaya", "https://produktif.ai/start?lead=x&t=y");
  assert.match(m.text, /within 2 working days/);
  assert.match(confirmationEmail("Ani", "x", "Tuesday, 13 October").text, /by Tuesday, 13 October/);
  assert.doesNotMatch(m.html, /<b>Ani/);
  assert.match(m.html, /&lt;b&gt;Ani/);
  assert.match(m.html, /lead=x&amp;t=y/);
});

test("v2 signup needs WhatsApp, takes email optionally, and keeps the category", () => {
  const v = SignupSchema.parse({ variant: "v2", name: "Budi", whatsapp: "0812 3456 7890", consent: true, cat: "food-drink" });
  assert.equal(v.email, "");
  assert.equal(v.cat, "food-drink");
  const noWa = SignupSchema.safeParse({ variant: "v2", name: "Budi", email: "budi@example.com", consent: true });
  assert.equal(noWa.success, false);
  assert.equal(noWa.error?.issues[0].path[0], "whatsapp");
  assert.equal(SignupSchema.safeParse({ variant: "v2", name: "Budi", whatsapp: "0812 3456 7890", email: "budi@", consent: true }).success, false);
  assert.equal(SignupSchema.safeParse({ variant: "v2", name: "Budi", whatsapp: "0812 3456 7890", consent: true, cat: "casino" }).success, false);
  // v1 still needs an email.
  const v1 = SignupSchema.safeParse({ name: "Ani", whatsapp: "0812 3456 7890", consent: true });
  assert.equal(v1.success, false);
  assert.equal(v1.error?.issues[0].path[0], "email");
  const row = signupPayload(v, LEAD, new Date("2026-10-11T00:00:00Z"));
  assert.equal(row.variant, "v2");
  assert.equal(row.consent, CONSENT_TEXT_V2);
  assert.equal(row.whatsapp, "6281234567890");
  assert.equal(row.cat, "food-drink");
});

test("v2 business profile lands in the profile tab with readable columns", () => {
  const token = leadToken(LEAD, "s");
  const p = BusinessProfileSchema.parse({
    variant: "v2",
    lead_id: LEAD,
    token,
    cat: "beauty-fashion",
    want: "sales",
    platform: "both",
    handle: "https://www.instagram.com/kopi.ani/",
    maker: "me",
    face: "me",
    poster: "you",
    start: "this-month",
    budget: "yes",
  });
  assert.equal(p.handle, "@kopi.ani");
  const row = businessProfilePayload(p, new Date("2026-10-11T00:00:00Z"), "sec");
  assert.equal(row.stage, "profile");
  assert.equal(row.niche, "Beauty, skincare or fashion");
  assert.equal(row.goal, "sales");
  assert.equal(row.handle, "@kopi.ani");
  assert.equal(row.poster, "you");
  assert.equal(row.fit_score, 10);
  assert.equal(row.secret, "sec");
  assert.equal(businessFitScore({ budget: "not-yet", start: "looking", maker: "agency", face: "unsure" }), 0);
  assert.equal(BusinessProfileSchema.safeParse({ ...p, maker: "robot" }).success, false);
});
