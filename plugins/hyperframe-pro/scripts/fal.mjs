#!/usr/bin/env node
// fal.mjs — generated footage for beats the drawn library cannot sell (the footage rule).
//
// Why this exists: a drawn/vector library is right for CONCEPTS — a toggle, an arrow, a diagram. It is the
// wrong register for a beat whose job is fear ("this could happen to YOU"). A cartoon does not trigger a
// threat reflex no matter how well it is animated, and that beat is usually your hook. This wraps fal.ai so
// a photoreal plate is one command instead of an afternoon.
//
//   node fal.mjs image --prompt "..." --out raw/frame.png [--size 1088x1920] [--quality high] [--n 1]
//   node fal.mjs edit  --prompt "..." --image in.png --out out.png
//   node fal.mjs video --image first.png --prompt "..." --out out.mp4 [--duration 6] [--resolution 768P]
//   node fal.mjs probe                                   # auth + connectivity, costs nothing to read
//
// Models (fixed — do not swap without asking):
//   openai/gpt-image-2            text->image      stills, and first frames for the video model
//   openai/gpt-image-2/edit       image->image     fix one thing in a frame you already like
//   minimax/h3-max/image-to-video image->video     max 10 s per clip, 768P by default (half the price of 1080P)
//
// Credentials: FAL_KEY from the environment, else ~/.config/hyperframe-pro/fal.env (chmod 600).
// NEVER put the key in a skill file — skills are copied into the migration bundle.
//
// COST: every image and every video is a paid call. Generate few, review, then commit. Prompt once,
// look at it, and iterate on the PROMPT rather than re-rolling the same prompt hoping for luck.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ENV_FILE = path.join(os.homedir(), ".config/hyperframe-pro/fal.env");
function key() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY.trim();
  if (fs.existsSync(ENV_FILE)) {
    const m = fs.readFileSync(ENV_FILE, "utf8").match(/^\s*FAL_KEY\s*=\s*(.+)$/m);
    if (m) return m[1].trim();
  }
  throw new Error(`no FAL_KEY in env or ${ENV_FILE}`);
}
const H = () => ({ Authorization: `Key ${key()}`, "Content-Type": "application/json" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** queue API: submit, poll, fetch. Used for everything — image calls can exceed a sync timeout too. */
async function run(model, input, { pollMs = 3000, maxMs = 15 * 60 * 1000, label = model } = {}) {
  const sub = await fetch(`https://queue.fal.run/${model}`, { method: "POST", headers: H(), body: JSON.stringify(input) });
  const subTxt = await sub.text();
  if (!sub.ok) throw new Error(`${label}: submit ${sub.status} ${subTxt.slice(0, 600)}`);
  const { request_id, status_url, response_url } = JSON.parse(subTxt);
  const sUrl = status_url || `https://queue.fal.run/${model}/requests/${request_id}/status`;
  const rUrl = response_url || `https://queue.fal.run/${model}/requests/${request_id}`;
  process.stderr.write(`  ${label}: queued ${request_id}\n`);
  const t0 = Date.now();
  for (;;) {
    await sleep(pollMs);
    const st = await fetch(sUrl, { headers: H() });
    const j = await st.json().catch(() => ({}));
    if (j.status === "COMPLETED") break;
    if (j.status === "FAILED" || j.error) throw new Error(`${label}: FAILED ${JSON.stringify(j).slice(0, 600)}`);
    if (Date.now() - t0 > maxMs) throw new Error(`${label}: timed out after ${Math.round((Date.now() - t0) / 1000)}s`);
    process.stderr.write(`  ${label}: ${j.status || "…"} ${Math.round((Date.now() - t0) / 1000)}s\n`);
  }
  const res = await fetch(rUrl, { headers: H() });
  const txt = await res.text();
  if (!res.ok) throw new Error(`${label}: result ${res.status} ${txt.slice(0, 600)}`);
  return JSON.parse(txt);
}

async function download(url, out) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${r.status} ${url}`);
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
  return out;
}
const dataUri = (p) => {
  const ext = path.extname(p).slice(1).toLowerCase();
  const mime = ext === "jpg" ? "jpeg" : ext;
  return `data:image/${mime};base64,${fs.readFileSync(p).toString("base64")}`;
};

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) { const k = argv[i].slice(2); const v = argv[i + 1]?.startsWith("--") ? true : argv[++i]; o[k] = v ?? true; }
    else o._.push(argv[i]);
  }
  return o;
}
/** "1088x1920" -> {width,height}; a preset name passes through. gpt-image-2 wants multiples of 16. */
function sizeArg(s) {
  if (!s) return "portrait_16_9";
  const m = String(s).match(/^(\d+)x(\d+)$/);
  if (!m) return s;
  const [w, h] = [+m[1], +m[2]];
  for (const [n, v] of [["width", w], ["height", h]]) if (v % 16) throw new Error(`${n} ${v} must be a multiple of 16 (try ${Math.round(v / 16) * 16})`);
  return { width: w, height: h };
}

const cmd = process.argv[2];
const a = args(process.argv.slice(3));

if (cmd === "probe") {
  // a HEAD-ish sanity check that the key parses and the queue answers. No generation, no cost.
  const r = await fetch("https://queue.fal.run/openai/gpt-image-2/requests/00000000-0000-0000-0000-000000000000/status", { headers: H() });
  console.log(`fal reachable, auth ${r.status === 401 || r.status === 403 ? "REJECTED" : "accepted"} (status ${r.status} on a bogus request id — 404/422 is the healthy answer)`);
} else if (cmd === "image") {
  if (!a.prompt || !a.out) throw new Error("image needs --prompt and --out");
  const input = { prompt: a.prompt, image_size: sizeArg(a.size), quality: a.quality || "high", num_images: +(a.n || 1), output_format: "png" };
  const j = await run("openai/gpt-image-2", input, { pollMs: 2500, label: "gpt-image-2" });
  const imgs = j.images || [];
  if (!imgs.length) throw new Error(`no images in response: ${JSON.stringify(j).slice(0, 400)}`);
  const outs = [];
  for (let i = 0; i < imgs.length; i++) {
    const out = imgs.length === 1 ? a.out : a.out.replace(/(\.\w+)$/, `-${i + 1}$1`);
    outs.push(await download(imgs[i].url, out));
    console.log(`${out}  ${imgs[i].width}x${imgs[i].height}`);
  }
} else if (cmd === "edit") {
  if (!a.prompt || !a.image || !a.out) throw new Error("edit needs --prompt --image --out");
  const input = { prompt: a.prompt, image_urls: [dataUri(a.image)], quality: a.quality || "high", num_images: 1, output_format: "png" };
  const j = await run("openai/gpt-image-2/edit", input, { pollMs: 2500, label: "gpt-image-2/edit" });
  const im = (j.images || [])[0];
  if (!im) throw new Error(`no image: ${JSON.stringify(j).slice(0, 400)}`);
  await download(im.url, a.out); console.log(`${a.out}  ${im.width}x${im.height}`);
} else if (cmd === "video") {
  if (!a.prompt || !a.out) throw new Error("video needs --prompt and --out (and --image for image-to-video)");
  const dur = Math.min(10, +(a.duration || 6));           // hard cap: 10 s per clip
  if ((a.resolution || "").toUpperCase() === "1080P")
    process.stderr.write(`  ! 1080P costs 2x 768P ($0.04 vs $0.02 per second promo, $0.16 vs $0.08 standard).\n` +
                         `    The house default is 768P — these plates are graded dark and grainy and get\n` +
                         `    upscaled to 1080x1920 anyway. Only worth it for a bright, static, full-frame shot.\n`);
  const input = {
    prompt: a.prompt,
    prompt_expansion_mode: a.expansion || "balanced",
    duration: dur,
    resolution: a.resolution || "768P",   // DEFAULT. 1080P is 2x the price for no visible gain after the
                                          // scrim + crop + 30 fps re-encode (a mistake this cost us once). Pass --resolution
                                          // 1080P only when the plate is bright, static and fills the frame.
    enable_safety_checker: true,
  };
  if (a.image) input.image_url = dataUri(a.image);
  if (a.endimage) input.end_image_url = dataUri(a.endimage);
  if (a.seed) input.seed = +a.seed;
  const j = await run("minimax/h3-max/image-to-video", input, { pollMs: 5000, label: "h3-max/i2v" });
  const v = j.video;
  if (!v?.url) throw new Error(`no video: ${JSON.stringify(j).slice(0, 400)}`);
  await download(v.url, a.out);
  console.log(`${a.out}  ${(v.file_size / 1048576).toFixed(1)} MiB  ${dur}s`);
  if (j.expanded_prompt) console.log(`expanded prompt: ${String(j.expanded_prompt).slice(0, 300)}`);
} else {
  console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("\n").filter((l) => l.startsWith("//")).join("\n"));
  process.exit(1);
}
