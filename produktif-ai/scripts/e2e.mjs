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

function startNext(port, env) {
  const proc = spawn("npx", ["next", "start", "-p", String(port)], {
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  proc.stdout.on("data", (d) => (log += d));
  proc.stderr.on("data", (d) => (log += d));
  return { proc, log: () => log };
}

async function waitFor(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server at ${url} never came up`);
}

function pngSize(buf) {
  assert.equal(buf.subarray(1, 4).toString(), "PNG");
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const results = [];
const check = (name, fn) =>
  fn().then(
    () => results.push(["PASS", name]),
    (e) => {
      results.push(["FAIL", name, e.message]);
    },
  );

const servers = [];
try {
  // ---------- 1. UI in demo mode ----------
  const demo = startNext(3101, { DEMO_MODE: "1", ANTHROPIC_API_KEY: "" });
  servers.push(demo);
  await waitFor("http://localhost:3101/");
  const browser = await chromium.launch({ executablePath: CHROME });

  for (const vp of [
    { name: "mobile", width: 375, height: 812 },
    { name: "desktop", width: 1280, height: 900 },
  ]) {
    await check(`[${vp.name}] page loads with no horizontal scroll`, async () => {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto("http://localhost:3101/");
      await page.screenshot({ path: `${OUT}/landing-${vp.name}.png`, fullPage: true });
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(over <= 0, `page is ${over}px wider than the viewport`);
      await page.close();
    });
  }

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  await page.goto("http://localhost:3101/");

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
    assert.equal(await page.locator(".slide").first().locator(".slide__gold").innerText(), "Jangan transfer balik");
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
  const fake = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      captured = { url: req.url, headers: req.headers, body: JSON.parse(body) };
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          id: "msg_fake",
          type: "message",
          role: "assistant",
          model: "claude-opus-5-5",
          content: [{ type: "text", text: JSON.stringify(sample) }],
          stop_reason: "end_turn",
          stop_sequence: null,
          usage: { input_tokens: 10, output_tokens: 10 },
        }),
      );
    });
  });
  await new Promise((r) => fake.listen(3199, r));
  const api = startNext(3102, { ANTHROPIC_API_KEY: "test-key", ANTHROPIC_BASE_URL: "http://localhost:3199", DEMO_MODE: "" });
  servers.push(api);
  await waitFor("http://localhost:3102/");

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
    assert.equal(captured.body.model, "claude-opus-5-5");
    assert.equal(captured.body.fallbacks, "default");
    assert.equal(captured.body.output_config.effort, "medium");
    assert.equal(captured.body.output_config.format.type, "json_schema");
    assert.match(captured.body.messages[0].content, /<thread>/);
  });

  await check("bad input gets a 400 with an Indonesian message", async () => {
    const r = await fetch("http://localhost:3102/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "topic", input: "a" }),
    });
    assert.equal(r.status, 400);
    assert.match((await r.json()).error, /kependekan/);
  });

  await check("rate limit returns 429 after the hourly quota", async () => {
    let last = 0;
    for (let i = 0; i < 9; i++) {
      const r = await fetch("http://localhost:3102/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" },
        body: JSON.stringify({ mode: "topic", input: "topik tes" }),
      });
      last = r.status;
    }
    assert.equal(last, 429);
  });
  fake.close();

  // ---------- 3. no key configured ----------
  const nokey = startNext(3103, { ANTHROPIC_API_KEY: "", DEMO_MODE: "" });
  servers.push(nokey);
  await waitFor("http://localhost:3103/");
  await check("missing API key answers 503 instead of crashing", async () => {
    const r = await fetch("http://localhost:3103/api/generate", {
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
