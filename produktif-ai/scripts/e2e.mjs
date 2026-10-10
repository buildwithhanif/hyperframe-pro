// End-to-end check: builds must already exist (npm run build).
// 1. Demo server: drives the UI in Chromium, checks layout, editing and the ZIP export.
// 2. API server pointed at a fake Anthropic endpoint: exercises the real SDK call path.
// 3. Server with no key: must answer 503, not crash.
import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import JSZip from "jszip";
import { SAMPLE_DECK } from "../lib/sample.ts";

const OUT = path.resolve("e2e-output");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const CHROME = process.env.CHROME_PATH || "/opt/pw-browsers/chromium";

async function portInUse(port) {
  try {
    await fetch(`http://localhost:${port}/`);
    return true;
  } catch {
    return false;
  }
}

// Spawn the Next binary directly (not through npx) so the child pid is the
// server itself and kill() really stops it.
async function startNext(port, env) {
  if (await portInUse(port)) throw new Error(`port ${port} is already in use; stop the old server first`);
  const proc = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  let exited = false;
  proc.stdout.on("data", (d) => (log += d));
  proc.stderr.on("data", (d) => (log += d));
  proc.on("exit", () => (exited = true));
  const server = { proc, log: () => log };
  servers.push(server);
  for (let i = 0; i < 60; i++) {
    if (exited) throw new Error(`next start on ${port} exited:\n${log}`);
    try {
      const r = await fetch(`http://localhost:${port}/`);
      if (r.status < 500) return server;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server on ${port} never came up:\n${log}`);
}

function pngSize(buf) {
  assert.equal(buf.subarray(1, 4).toString(), "PNG");
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const results = [];
const servers = [];
const check = (name, fn) =>
  fn().then(
    () => results.push(["PASS", name]),
    (e) => {
      results.push(["FAIL", name, e.message]);
    },
  );

try {
  // ---------- 1. UI in demo mode ----------
  await startNext(3101, { DEMO_MODE: "1", ANTHROPIC_API_KEY: "" });
  const browser = await chromium.launch({ executablePath: CHROME });

  for (const route of ["/", "/carousel"]) {
    for (const vp of [
      { name: "small", width: 320, height: 640 },
      { name: "mobile", width: 375, height: 812 },
      { name: "desktop", width: 1280, height: 900 },
    ]) {
      await check(`[${route} ${vp.name}] page loads with no horizontal scroll`, async () => {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`http://localhost:3101${route}`);
        const slug = route === "/" ? "home" : "carousel";
        await page.screenshot({ path: `${OUT}/${slug}-${vp.name}.png`, fullPage: true });
        const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        assert.ok(over <= 0, `page is ${over}px wider than the viewport`);
        if (route === "/") {
          // "Go live your life." must never break into a stray "life." line.
          const lines = await page.evaluate(() =>
            [...document.querySelectorAll("h1 span")].map((el) => {
              const r = document.createRange();
              r.selectNodeContents(el);
              return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size;
            }),
          );
          assert.deepEqual(lines, [1, 1], `headline lines: ${lines}`);
        }
        await page.close();
      });
    }
  }

  await check("onboarding: the full Get Started flow ends on the confirmation", async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("http://localhost:3101/start");
    await page.getByLabel("First, what should we call you?").fill("Ani Wijaya");
    await page.keyboard.press("Enter");
    await page.getByLabel("Where should we send your spot?").fill("ani@example.com");
    await page.keyboard.press("Enter");
    await page.getByLabel("Your WhatsApp number?").fill("0812 3456 7890");
    await page.getByRole("button", { name: "Join the list" }).click();
    await page.getByText("Please tick the box").waitFor();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Join the list" }).click();
    await page.getByLabel("What do your videos teach or talk about?").fill("Money tips for first jobbers");
    await page.keyboard.press("Enter");
    await page.getByRole("radio", { name: "TikTok" }).check();
    await page.getByLabel(/Your handle/).fill("tiktok.com/@ani_w");
    await page.getByRole("button", { name: "Continue" }).click();
    for (const answer of ["50K to 250K", "1 to 2 a week", "Get my time back", "Both", "This month", "Yes, that works"]) {
      // Choice screens move on as soon as an answer is picked.
      await page.getByRole("radio", { name: answer }).click();
    }
    await page.getByRole("heading", { name: "You're on the list, Ani." }).waitFor({ timeout: 10000 });
    await page.screenshot({ path: `${OUT}/onboarding-done-mobile.png` });
    const stored = await page.evaluate(() => localStorage.getItem("pai-apply-v1"));
    assert.equal(stored, null, "finished applications clear saved progress");
    assert.deepEqual(errors, []);
    await page.close();
  });

  await check("onboarding: progress survives a reload and bad emails are caught", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3101/start");
    await page.getByLabel("First, what should we call you?").fill("Budi");
    await page.keyboard.press("Enter");
    await page.getByLabel("Where should we send your spot?").fill("budi@example");
    await page.keyboard.press("Enter");
    await page.getByText("That email doesn't look right").waitFor();
    assert.equal(await page.getByLabel("Where should we send your spot?").getAttribute("aria-invalid"), "true");
    await page.reload();
    assert.equal(await page.getByLabel("First, what should we call you?").inputValue(), "Budi");
    await page.close();
  });

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  await page.goto("http://localhost:3101/carousel");

  await check("generate shows topic score, fact check and 8 slides", async () => {
    await page.fill('textarea[name="input"]', "modus transfer nyasar");
    await page.fill('input[name="handle"]', "akuntes");
    await page.click('button[type="submit"]');
    await page.waitForSelector(".slide", { timeout: 15000 });
    assert.equal(await page.locator(".slide").count(), 8);
    assert.match(await page.locator(".check__score").innerText(), /4\/4/);
    assert.ok((await page.locator(".warn li").count()) >= 1);
    assert.equal(await page.locator(".slide__handle").first().innerText(), "@akuntes");
    await page.screenshot({ path: `${OUT}/result-desktop.png`, fullPage: true });
  });

  await check("no slide text overflows its 1080x1350 frame", async () => {
    const overflow = await page.$$eval(".slide", (els) =>
      els.map((el, i) => {
        const main = el.querySelector(".slide__main");
        return { i: i + 1, main: main.scrollHeight - main.clientHeight, slide: el.scrollHeight - el.clientHeight };
      }).filter((o) => o.main > 0 || o.slide > 0),
    );
    assert.deepEqual(overflow, []);
  });

  await check("each slide has its anchor painted gold", async () => {
    const golds = await page.locator(".slide .slide__gold").count();
    assert.equal(golds, 8);
  });

  await check("editing a slide updates the preview", async () => {
    await page.locator(".slide-card").first().getByRole("button", { name: "Edit" }).click();
    const title = page.locator(".slide-card").first().locator("textarea").first();
    await title.fill("Ada Rp 2 juta nyasar? Jangan transfer balik.");
    await page.waitForFunction(() => document.querySelector(".slide__title")?.textContent?.includes("Rp 2 juta"));
    assert.equal(await page.locator(".slide").first().locator(".slide__gold").innerText(), "nyasar");
  });

  await check("breaking an anchor in the editor shows a live warning", async () => {
    const card = page.locator(".slide-card").first();
    await card.locator("input").nth(1).fill("kata hilang");
    await page.waitForSelector(".warn li:has-text('kata hilang')");
    await card.locator("input").nth(1).fill("nyasar");
    await page.waitForFunction(() => ![...document.querySelectorAll(".warn li")].some((li) => li.textContent.includes("kata hilang")));
  });

  await check("over-long input is shown and blocks submit instead of being cut silently", async () => {
    const p2 = await ctx.newPage();
    await p2.goto("http://localhost:3101/carousel");
    await p2.getByRole("button", { name: "Dari thread viral" }).click();
    await p2.fill('textarea[name="input"]', "x".repeat(6100));
    assert.equal((await p2.inputValue('textarea[name="input"]')).length, 6100);
    assert.match(await p2.locator("#input-count").innerText(), /Kepanjangan/);
    assert.equal(await p2.locator('button[type="submit"]').isDisabled(), true);
    await p2.close();
  });

  await check("ZIP export has 8 PNGs at 1080x1350 plus caption.txt", async () => {
    const [download] = await Promise.all([page.waitForEvent("download", { timeout: 60000 }), page.getByRole("button", { name: /Download 8 slide/ }).click()]);
    const file = `${OUT}/${download.suggestedFilename()}`;
    await download.saveAs(file);
    const zip = await JSZip.loadAsync(fs.readFileSync(file));
    const names = Object.keys(zip.files).sort();
    const pngs = names.filter((n) => n.endsWith(".png"));
    assert.equal(pngs.length, 8, names.join(", "));
    assert.ok(names.includes("caption.txt"));
    for (const n of pngs) {
      const buf = await zip.file(n).async("nodebuffer");
      assert.deepEqual(pngSize(buf), { w: 1080, h: 1350 }, n);
      if (n.endsWith("-01.png") || n.endsWith("-05.png") || n.endsWith("-08.png")) fs.writeFileSync(`${OUT}/${n}`, buf);
    }
  });

  await check("no console errors during the flow", async () => {
    assert.deepEqual(consoleErrors, []);
  });
  await browser.close();

  // ---------- 2. real SDK path against a fake Anthropic API ----------
  const sample = SAMPLE_DECK;
  let captured = null;
  let reply = "ok"; // ok | truncated | refusal | busy-refusal | mismatch
  const fake = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      captured = { url: req.url, headers: req.headers, body: JSON.parse(body) };
      const deck = structuredClone(sample);
      if (reply === "mismatch") {
        deck.topic_check.villain.pass = false;
        deck.topic_check.tag.pass = false;
        deck.topic_check.verdict = "gas";
      }
      const text = reply === "truncated" ? JSON.stringify(deck).slice(0, 300) : reply.includes("refusal") ? "Maaf" : JSON.stringify(deck);
      const stop_reason = reply === "truncated" ? "max_tokens" : reply.includes("refusal") ? "refusal" : "end_turn";
      const stop_details = reply.includes("refusal")
        ? { type: "refusal", category: "cyber", explanation: "x", recommended_model: reply === "busy-refusal" ? "claude-opus-4-8" : null }
        : null;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          id: "msg_fake",
          type: "message",
          role: "assistant",
          model: "claude-opus-5-5",
          content: [{ type: "text", text }],
          stop_reason,
          stop_details,
          stop_sequence: null,
          usage: { input_tokens: 10, output_tokens: 10 },
        }),
      );
    });
  });
  await new Promise((r) => fake.listen(3199, r));
  // Fake waitlist webhook: records what it gets, can be told to fail.
  const hooks = [];
  let hookStatus = 200;
  let hookBody = '{"ok":true}';
  const hook = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      hooks.push(JSON.parse(body));
      res.statusCode = hookStatus;
      res.end(hookBody);
    });
  });
  await new Promise((r) => hook.listen(3198, r));
  await startNext(3102, {
    ANTHROPIC_API_KEY: "test-key",
    ANTHROPIC_BASE_URL: "http://localhost:3199",
    DEMO_MODE: "",
    WAITLIST_WEBHOOK_URL: "http://localhost:3198/hook",
    WAITLIST_WEBHOOK_SECRET: "s3cret",
  });
  const apply = (path, body, headers = {}) =>
    fetch(`http://localhost:3102/api/apply${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  const PROFILE = {
    niche: "Money tips",
    platform: "tiktok",
    handle: "@ani_w",
    followers: "10k-50k",
    posting: "weekly",
    goal: "time",
    language: "id",
    start: "this-month",
    budget: "yes",
  };

  await check("apply API: signup row, then a profile row joined by lead_id", async () => {
    const r = await apply("", { name: " Ani ", email: "Ani@Example.com", whatsapp: "+62 812-3456-7890", consent: true, utm_source: "x" });
    assert.equal(r.status, 200);
    const { lead_id, token } = await r.json();
    const row = hooks.at(-1);
    assert.equal(row.stage, "signup");
    assert.equal(row.lead_id, lead_id);
    assert.equal(row.name, "Ani");
    assert.equal(row.email, "ani@example.com");
    assert.equal(row.whatsapp, "6281234567890");
    assert.equal(row.utm_source, "x");
    assert.equal(row.secret, "s3cret");
    assert.match(row.consent, /privacy policy/);
    const p = await apply("/profile", { lead_id, token, ...PROFILE });
    assert.equal(p.status, 200);
    const prow = hooks.at(-1);
    assert.equal(prow.stage, "profile");
    assert.equal(prow.lead_id, lead_id);
    assert.equal(prow.fit_score, 8);
    assert.equal("token" in prow, false);
  });

  await check("apply API: bad email 400 with field, missing consent, forged token 403, honeypot swallowed, webhook failure 502", async () => {
    const r1 = await apply("", { name: "Ani", email: "ani@", consent: true });
    assert.equal(r1.status, 400);
    assert.equal((await r1.json()).field, "email");
    const r2 = await apply("", { name: "Ani", email: "ani@example.com" });
    assert.equal(r2.status, 400);
    assert.equal((await r2.json()).field, "consent");
    const forged = await apply("/profile", { lead_id: "6f1c2a7e-3b4d-4e5f-8a9b-0c1d2e3f4a5b", token: "a".repeat(64), ...PROFILE });
    assert.equal(forged.status, 403);
    const before = hooks.length;
    const r3 = await apply("", { name: "Bot", email: "bot@example.com", consent: true, company: "PT Bot" });
    assert.equal(r3.status, 200);
    assert.equal(hooks.length, before, "honeypot signup must not reach the webhook");
    hookStatus = 500;
    const r4 = await apply("", { name: "Ani", email: "ani@example.com", consent: true }, { "x-real-ip": "7.7.7.7" });
    assert.equal(r4.status, 502);
    hookStatus = 200;
  });

  await check("apply API: a 200 that says 'forbidden' is a failed save, not a signup", async () => {
    hookBody = '{"ok":false,"error":"forbidden"}';
    const r = await apply("", { name: "Ani", email: "ani@example.com", consent: true }, { "x-real-ip": "8.8.8.8" });
    assert.equal(r.status, 502);
    hookBody = '{"ok":true}';
  });

  const post = (body, headers = {}) =>
    fetch("http://localhost:3102/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

  await check("API route calls Claude with the intended request and returns the parsed deck", async () => {
    const r = await fetch("http://localhost:3102/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "thread", input: "contoh thread", receipts: "", slideCount: 8, handle: "x" }),
    });
    const data = await r.json();
    assert.equal(r.status, 200, JSON.stringify(data));
    assert.equal(data.deck.slides.length, 8);
    assert.equal(data.handle, "@x");
    assert.ok(captured, "fake API was never called");
    assert.equal(captured.url, "/v1/messages?beta=true");
    assert.match(captured.headers["anthropic-beta"], /server-side-fallback-2026-07-01/);
    assert.match(captured.headers["anthropic-beta"], /structured-outputs-2025-12-15/);
    assert.equal(captured.body.model, "claude-opus-5-5");
    assert.equal(captured.body.fallbacks, "default");
    assert.equal(captured.body.output_config.effort, "medium");
    assert.equal(captured.body.output_config.format.type, "json_schema");
    assert.match(captured.body.messages[0].content, /<thread>/);
  });

  await check("bad input gets a 400 with an Indonesian message", async () => {
    const r = await post({ mode: "topic", input: "a" });
    assert.equal(r.status, 400);
    assert.match((await r.json()).error, /kependekan/);
  });

  await check("oversized body is refused before parsing", async () => {
    const r = await post(JSON.stringify({ mode: "topic", input: "y".repeat(70_000) }));
    assert.equal(r.status, 413);
  });

  await check("verdict is recomputed from the four pass flags", async () => {
    reply = "mismatch";
    const r = await post({ mode: "topic", input: "topik tes" });
    const data = await r.json();
    assert.equal(r.status, 200, JSON.stringify(data));
    assert.equal(data.deck.topic_check.verdict, "perlu diasah");
  });

  await check("cut-off output returns the 'kepotong' 502, not a 500", async () => {
    reply = "truncated";
    const r = await post({ mode: "topic", input: "topik tes" });
    assert.equal(r.status, 502);
    assert.match((await r.json()).error, /kepotong/);
  });

  await check("refusal returns 422; refusal with a busy fallback returns 503", async () => {
    reply = "refusal";
    assert.equal((await post({ mode: "topic", input: "topik tes" })).status, 422);
    reply = "busy-refusal";
    assert.equal((await post({ mode: "topic", input: "topik tes" })).status, 503);
    reply = "ok";
  });

  await check("rate limit returns 429 after the hourly quota", async () => {
    let last = 0;
    for (let i = 0; i < 9; i++) {
      last = (await post({ mode: "topic", input: "topik tes" }, { "x-real-ip": "2001:db8:1:2::" + (i + 1) })).status;
    }
    assert.equal(last, 429, "addresses inside one IPv6 /64 must share a bucket");
  });
  fake.close();
  hook.close();

  // ---------- 3. no key configured ----------
  await startNext(3103, { ANTHROPIC_API_KEY: "", DEMO_MODE: "" });
  await check("missing API key answers 503 instead of crashing", async () => {
    const r = await fetch("http://localhost:3103/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "topic", input: "topik tes" }),
    });
    assert.equal(r.status, 503);
  });
  await check("apply without a webhook answers 503 instead of dropping signups", async () => {
    const r = await fetch("http://localhost:3103/api/apply", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Ani", email: "ani@example.com", consent: true }),
    });
    assert.equal(r.status, 503);
  });

  // ---------- 4. kill switch ----------
  await startNext(3104, { ANTHROPIC_API_KEY: "test-key", RATE_LIMIT_PER_HOUR: "0", DEMO_MODE: "" });
  await check("RATE_LIMIT_PER_HOUR=0 stops generation with a 503", async () => {
    const r = await fetch("http://localhost:3104/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "topic", input: "topik tes" }),
    });
    assert.equal(r.status, 503);
  });
} finally {
  for (const s of servers) s.proc.kill();
}

for (const [status, name, msg] of results) console.log(`${status}  ${name}${msg ? `\n      ${msg}` : ""}`);
const failed = results.filter((r) => r[0] === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed. Screenshots and PNGs in ${OUT}`);
process.exit(failed ? 1 : 0);
