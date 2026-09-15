// lint.mjs — mechanical retention checks for a Hyperframe Pro composition.
//
//   node ${CLAUDE_PLUGIN_ROOT}/scripts/lint.mjs "<project dir>" [<generator>.mjs]
//
// These are not style warnings. Every error here is a bug that shipped once and cost a re-render:
// dead air where viewers skip, a visual that outstays its step, an animated id that does not exist,
// a stale asset dimension, footage wired so it renders black, a cut over the duration ceiling.
//
// Run it on the GENERATOR'S OUTPUT, immediately after running the generator — not after `check` or
// `render`, which rewrite index.html in place.
// Reads the BUILT index.html (what ships), plus the generator's PLAN when given. Exit 1 on any error.
// Each check maps to a render that was thrown away.
import fs from "node:fs";
import path from "node:path";

const proj = process.argv[2];
const gen = process.argv[3];
if (!proj) { console.error("usage: lint.mjs <project dir> [generator.mjs]"); process.exit(2); }
const html = fs.readFileSync(path.join(proj, "index.html"), "utf8");
const errors = [], warns = [], notes = [];
const err = (m) => errors.push(m), warn = (m) => warns.push(m), note = (m) => notes.push(m);

// ---- composition duration
const total = +(html.match(/data-composition-id="main"[^>]*data-duration="([\d.]+)"/)?.[1] ?? 0);
if (!total) err("no root data-duration found");

// ---- 1. character instances (OPTIONAL — only if your build uses a character/presenter library)
// The HyperFrames compiler rewrites index.html in place during `check`/`render`, injecting data-hf-id on every
// element and reordering attributes. This lint reads the GENERATOR's output shape, so a compiled file gives
// false results. Detect it and stop rather than report nonsense (15 Sep 2026).
if (/data-hf-id="/.test(html)) {
  console.log(`  ! ${path.join(proj, "index.html")} is COMPILED output (has data-hf-id), not generator output.`);
  console.log(`    Re-run:  node pipeline/<slug>.build.mjs "${proj}"   then lint again.`);
  process.exit(2);
}

const pups = [...html.matchAll(/<div class="pup[^"]*" id="([^"]+)" data-frame="([^"]+)" data-pose="([^"]+)" data-from="([\d.]+)" data-to="([\d.]+)"/g)]
  .map((m) => ({ id: m[1], frame: m[2], pose: m[3], from: +m[4], to: +m[5] })).sort((a, b) => a.from - b.from);
if (!pups.length) note("no character instances — fine unless your build uses a character library");
else {
  const hookPup = pups.find((p) => p.from < 2.5);
  if (hookPup) err(`character present in the hook (#${hookPup.id} from ${hookPup.from}s) — the hook is the viewer's situation; a presenter arriving in it competes with it`);
  let present = 0;
  for (const p of pups) present += Math.max(0, Math.min(p.to, total) - p.from);
  const ratio = total ? present / total : 0;
  (ratio > 0.6 ? err : note)(`character on screen ${(ratio * 100).toFixed(0)}% of ${total}s ${ratio > 0.6 ? "— over 60 % is wallpaper, not a presenter" : ""}`);
  for (let i = 1; i < pups.length; i++) {
    const a = pups[i - 1], b = pups[i];
    const adjacent = Math.abs(b.from - a.to) < 0.05;
    if (adjacent && a.frame === b.frame && a.pose === b.pose) err(`#${a.id} → #${b.id}: same framing "${a.frame}" and pose across a hard cut — a cut to the identical picture (a mistake this cost us once); change framing or keep one instance`);
    if (adjacent && !(a.frame === "bustR" && b.frame === "bustClose") && a.pose === b.pose && a.frame !== b.frame) note(`#${a.id} → #${b.id}: framing ${a.frame} → ${b.frame} on the same pose (jump cut) — fine only on a reveal word`);
    if (!adjacent && b.from < a.to) err(`#${a.id} and #${b.id} overlap in time (${b.from} < ${a.to}) — two characters at once`);
  }
  const frames = new Set(pups.map((p) => p.frame));
  if (frames.size < 2) err(`only one framing used (${[...frames]}) — framing should change with the beat's job, or the character is wallpaper`);
  if (pups.filter((p) => p.frame === "present").length > 1) note("full-body framing used more than once — it lands hardest when saved for the close");
}

// ---- 2. real-screen cards: exist, sourced, sized
const cards = [...html.matchAll(/<div class="card ct[^"]*" id="([^"]+)" data-shot="([^"]+)" style="[^"]*width:(\d+)px/g)].map((m) => ({ id: m[1], shot: m[2], w: +m[3] }));
if (!cards.length) note("no real-screen .card found — fine unless a beat says \"you have seen this screen\"");
const srcTxt = fs.existsSync(path.join(proj, "publish/sources.txt")) ? fs.readFileSync(path.join(proj, "publish/sources.txt"), "utf8") : "";
for (const c of cards) {
  const f = path.join(proj, "assets/shots", `${c.shot}.png`);
  if (!fs.existsSync(f)) err(`#${c.id}: assets/shots/${c.shot}.png missing`);
  if (!srcTxt.includes(`${c.shot}.png`)) err(`#${c.id}: ${c.shot}.png has no line in publish/sources.txt — every real screen is logged`);
  if (c.w < 600) warn(`#${c.id}: card only ${c.w}px wide — key line will be under 46 px unless the crop is very tight (run shots.py check)`);
  const kb = new RegExp(`tl\\.fromTo\\("#${c.id}-img"`).test(html);
  if (!kb) warn(`#${c.id}: no Ken Burns on its img — a held still must drift (rule 22/23)`);
}

// ---- 3. hidden-parent bug (a mistake this cost us once): children animated while the .ct parent is never shown
const ctIds = [...html.matchAll(/id="([^"]+)" class="ct[ "]/g)].map((m) => m[1]).concat([...html.matchAll(/class="ct[^"]*" id="([^"]+)"/g)].map((m) => m[1]));
for (const id of new Set(ctIds)) {
  const childTween = new RegExp(`tl\\.(?:fromTo|to|set)\\("#${id} [.#>]`).test(html);
  const parentShown = new RegExp(`tl\\.(?:fromTo|set|to)\\("#${id}"[^;]*autoAlpha:1`).test(html) || new RegExp(`tl\\.fromTo\\("#${id}",\\{autoAlpha:0`).test(html);
  if (childTween && !parentShown) err(`#${id}: children are animated but the .ct parent is never set visible — the whole block stays hidden (a mistake this cost us once)`);
}

// ---- 4. same-position state swaps must be hard cuts (a mistake this cost us once/#50): a soft exit right before a popIn on an occluding element
for (const m of html.matchAll(/tl\.to\("#([\w-]+)",\{y:-?\d+,autoAlpha:0,duration:([\d.]+),ease:"power2\.in"\},([\d.]+)\);/g)) {
  const [, id, d, at] = m; const end = +at + +d;
  for (const n of html.matchAll(/tl\.fromTo\("#([\w-]+)",\{autoAlpha:0,scale:[\d.]+,rotation:-?\d+\},\{[^}]*\},([\d.]+)\);/g)) {
    const [, id2, at2] = n;
    if (id2 !== id && +at2 > +at && +at2 < end - 0.02) note(`#${id} soft-exits while #${id2} pops in (${at}→${end} vs ${at2}) — fine unless they share a position; if they do, use tl.set(autoAlpha:0) (rule 24)`);
  }
}

// ---- 5. forbidden patterns the framework lint does not catch
if (/repeat:-1/.test(html)) err("repeat:-1 found — infinite repeats break seeks; use finite repeats");
if (/\.src\s*=/.test(html)) err("src swap found — swap stacked elements with autoAlpha instead (a mistake this cost us once)");
if (/font-family:"JetBrains Mono"[^}]*\}[\s\S]*class="ct[^"]*tipTag/.test(html)) warn("mono tag inside a scene — rule 6");

// ---- 5b. dangling animation target: a tween whose id-only selector matches NOTHING in the DOM.
// This is silent everywhere else — GSAP no-ops on an empty selector, hyperframes check has no
// opinion on it, and the render finishes clean with the element simply never appearing (found on
// never emitted in the HTML body — two beats of the hook silently didn't render, a mistake this cost us once).
{
  const knownIds = new Set([...html.matchAll(/\sid="([\w-]+)"/g)].map((m) => m[1]));
  const targeted = new Set();
  for (const m of html.matchAll(/tl\.(?:fromTo|to|set)\("#([\w-]+)"/g)) targeted.add(m[1]);
  for (const id of targeted) if (!knownIds.has(id)) err(`#${id} is animated but no element with that id exists in the HTML — the beat silently never renders (a mistake this cost us once)`);
}

// ---- 5c. TIMELINE COVERAGE — the Fable-parity checks (a mistake this cost us once). Parsed from the built timeline, so they hold
// for any generator that uses the motion helpers.
//   (a) no dark gap in the hook: from 0.04 s to 6 s something hero-sized (card / character / title / type block)
//       must be on screen at all times; a gap > 0.25 s is an error. The Sonnet/Fable A/B showed the hook card
//       leaving before the next one arrived — empty frames in the only seconds that decide the video.
//   (b) every numbered step shows a REAL screen: between consecutive title cards at least one .card must
//       enter, unless a PLAN row declares hero "crumbs" WITH a `fallback:` reason. The Fable cut put a real
//       screenshot on 8 of 9 steps; the Sonnet cut on 5 of 9 — that was most of the visible difference.
{
  const cls = (id) => { const m = html.match(new RegExp(`<[^>]*\\sid="${id}"[^>]*\\bclass="([^"]*)"`)) || html.match(new RegExp(`<[^>]*\\bclass="([^"]*)"[^>]*\\sid="${id}"`)); return m ? m[1] : ""; };
  // a world part counts as a hero only when it is actually big on frame (a drawn phone/hand filling the hook is a
  // hero; a 60 px sparkle is not). A hook can legitimately be drawn rather than a card, and the coverage
  // check reported four "dark gaps" over a full-frame hand — the rule exists to catch BLACK, not to mandate cards.
  const widthOf = (id) => { const m = html.match(new RegExp(`<[^>]*\\sid="${id}"[^>]*style="[^"]*\\bwidth:([\\d.]+)px`)); return m ? +m[1] : 0; };
  const isHero = (id) => { const c = cls(id); if (/\bfootage\b/.test(c)) return true;   // generated/stock plate — always full-bleed hero (a mistake this cost us once)
    if (/\bwo\b/.test(c)) return widthOf(id) >= 260; return /\b(card|pup|tcard|crumbs|offer)\b/.test(c) || (/\bct\b/.test(c) && !/\bcbox\b/.test(c)); };
  // a selector may be a LIST ("#hv, #ph1") — expand it, keep only bare #id selectors (not "#x .child", not ".cls")
  const idsOf = (sel) => sel.split(",").map((x) => x.trim()).filter((x) => /^#[\w-]+$/.test(x)).map((x) => x.slice(1));
  const ev = []; // {t, id, on}
  for (const m of html.matchAll(/tl\.fromTo\("([^"]+)",\{[^}]*\},\{([^}]*)\},([\d.]+)\);/g)) {
    const [, sel, to, at] = m;
    const d = +(to.match(/duration"?:([\d.]+)/)?.[1] ?? 0.3);
    if (!/autoAlpha"?:1\b/.test(to)) continue;
    for (const id of idsOf(sel)) if (isHero(id)) ev.push({ t: +at + d * 0.5, id, on: true });
  }
  for (const m of html.matchAll(/tl\.to\("([^"]+)",\{([^}]*)\},([\d.]+)\);/g)) {
    const [, sel, props, at] = m;
    const d = +(props.match(/duration"?:([\d.]+)/)?.[1] ?? 0.2);
    const off = /autoAlpha"?:0\b/.test(props), on = /autoAlpha"?:1\b/.test(props);
    if (!off && !on) continue;
    for (const id of idsOf(sel)) if (isHero(id)) ev.push({ t: +at + d * (off ? 0.6 : 0.5), id, on });
  }
  for (const m of html.matchAll(/tl\.set\("([^"]+)",\{([^}]*)\},([\d.]+)\);/g)) {
    const [, sel, props, at] = m;
    const on = /autoAlpha"?:1\b/.test(props), off = /autoAlpha"?:0\b/.test(props);
    if (!on && !off) continue;
    for (const id of idsOf(sel)) if (isHero(id)) ev.push({ t: +at, id, on });
  }
  ev.sort((a, b) => a.t - b.t);
  // a <video class="clip"> is driven by the framework, not GSAP, so it never shows up in the tween scan.
  // Read its window straight off data-start/data-duration or it reads as a hole (added 15 Sep 2026).
  for (const m of html.matchAll(/<video\b[^>]*>/g)) {
    const tag = m[0];
    const id = (tag.match(/\sid="([\w-]+)"/) || [])[1];
    const st = +(tag.match(/\bdata-start="([\d.]+)"/) || [])[1];
    const du = +(tag.match(/\bdata-duration="([\d.]+)"/) || [])[1];
    if (id && !Number.isNaN(st) && !Number.isNaN(du)) { ev.push({ t: st, id, on: true }); ev.push({ t: st + du, id, on: false }); }
  }
  ev.sort((a, b) => a.t - b.t);

  const live = new Set(); let lastEmptyFrom = 0.04; let covered = false; const gaps = [];
  for (const e of ev) {
    if (e.t > 8) break;
    const was = live.size > 0;
    if (e.on) live.add(e.id); else live.delete(e.id);
    const now = live.size > 0;
    if (!was && now) { if (e.t - lastEmptyFrom > 0.25 && lastEmptyFrom < 6) gaps.push([lastEmptyFrom, e.t]); covered = true; }
    if (was && !now) lastEmptyFrom = e.t;
  }
  if (!covered) warn("hook coverage: could not find any hero element entering before 8 s — check the hook block");

  //      nothing hero-sized longer than 1.2 s anywhere before the last beat is an error.
  {
    const live2 = new Set(); let emptyFrom = null; const holes = [];
    for (const e of ev) {
      const was = live2.size > 0;
      if (e.on) live2.add(e.id); else live2.delete(e.id);
      const now = live2.size > 0;
      if (was && !now) emptyFrom = e.t;
      if (!was && now && emptyFrom != null) { if (e.t - emptyFrom > 1.2) holes.push([emptyFrom, e.t]); emptyFrom = null; }
    }
    for (const [a, b] of holes) err(`dead air ${a.toFixed(2)}–${b.toFixed(2)} s (${(b - a).toFixed(1)} s with nothing hero-sized on screen) — that is where viewers skip (a mistake this cost us once)`);
  }

  // (a3) NO CARD OUTSTAYS ITS STEP. In v1 one screenshot stayed on frame across three numbered steps because its
  //      exit never landed — the video read as "stuck di 1 screenshot" (a mistake this cost us once). A card whose live window
  //      crosses a later title card's entrance is always a bug: the step changed, the screen did not.
  {
    const titleAt = [...html.matchAll(/tl\.set\("#(t\d+)",\{autoAlpha:1\},([\d.]+)\);/g)].map((m) => +m[2]).sort((a, b) => a - b);
    const cardIds = [...html.matchAll(/\sid="([\w-]+)"[^>]*\bclass="card\b/g)].map((m) => m[1])
      .concat([...html.matchAll(/\bclass="card\b[^>]*\sid="([\w-]+)"/g)].map((m) => m[1]));
    for (const id of new Set(cardIds)) {
      const on = ev.filter((e) => e.id === id && e.on).map((e) => e.t).sort((a, b) => a - b);
      const off = ev.filter((e) => e.id === id && !e.on).map((e) => e.t).sort((a, b) => a - b);
      if (!on.length) { err(`#${id} is a card but never becomes visible — the beat silently never renders`); continue; }
      const start = on[0], end = off.filter((t) => t > start)[0];
      if (end == null) { err(`#${id} enters at ${start.toFixed(2)} s and is never hidden — it will sit on frame for the rest of the video (a mistake this cost us once)`); continue; }
      const crossed = titleAt.filter((t) => t > start + 0.05 && t < end - 0.05);
      if (crossed.length) err(`#${id} stays on frame ${start.toFixed(2)}–${end.toFixed(2)} s, across ${crossed.length} later title card(s) — one screenshot spanning several steps is the "stuck di 1 screenshot" bug (a mistake this cost us once)`);
    }
  }
  for (const [a, b] of gaps) err(`dark gap in the hook: nothing hero-sized on screen ${a.toFixed(2)}–${b.toFixed(2)} s (${(b - a).toFixed(2)} s) — the next visual must already be arriving as the last one leaves`);

  // (b) steps need a real screen
  const titles = [...html.matchAll(/tl\.set\("#(t\d+)",\{autoAlpha:1\},([\d.]+)\);/g)].map((m) => ({ id: m[1], t: +m[2] })).sort((x, y) => x.t - y.t);
  if (titles.length >= 3) {
    const cardOn = [...html.matchAll(/tl\.fromTo\("#([\w-]+)",\{[^}]*\},\{[^}]*autoAlpha"?:1[^}]*\},([\d.]+)\);/g)].filter((m) => /\bcard\b/.test(cls(m[1]))).map((m) => +m[2]);
    const noScreen = [];
    titles.forEach((tt, i) => { const end = titles[i + 1]?.t ?? total; if (!cardOn.some((t) => t >= tt.t && t < end)) noScreen.push(tt.id); });
    let allowed = 0;
    if (gen && fs.existsSync(gen)) { const g = fs.readFileSync(gen, "utf8"); const plan = g.match(/export const PLAN = \[([\s\S]*?)\];/); if (plan) allowed = (plan[1].match(/hero:\s*"crumbs[^"]*"[^}]*fallback:\s*"[^"]+"/g) || []).length; }
    if (noScreen.length > allowed) err(`${noScreen.length} step(s) show no real screen (${noScreen.join(", ")}) but PLAN declares only ${allowed} crumbs-only row(s) with a fallback reason — find the screenshot or state why none exists (a mistake this cost us once)`);
    else if (noScreen.length) note(`${noScreen.length} step(s) run on breadcrumbs only, as declared in PLAN: ${noScreen.join(", ")}`);
  }
}

// ---- 5d. THE SHOT TABLE MUST MATCH THE FILES ON DISK (a mistake this cost us once). The generator hard-codes each screenshot's
// source dimensions; re-cropping a PNG without updating that table silently stretches the card and makes it the
// wrong size on frame — every callout measured against it then lands in the wrong place.
{
  const pngSize = (fp) => { // IHDR is always the first chunk: width/height are bytes 16..23
    const b = fs.readFileSync(fp); if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(24 - 4) };
  };
  for (const m of html.matchAll(/data-shot="([\w-]+)"[^>]*style="[^"]*\bwidth:([\d.]+)px[\s\S]{0,400}?<img[^>]*style="width:([\d.]+)px;height:([\d.]+)px/g)) {
    const [, shot, , iw, ih] = m;
    const fp = path.join(proj, "assets/shots", `${shot}.png`);
    if (!fs.existsSync(fp)) { err(`card uses shot "${shot}" but assets/shots/${shot}.png does not exist`); continue; }
    const real = pngSize(fp); if (!real) continue;
    const drawn = +ih / +iw, actual = real.h / real.w;
    if (Math.abs(drawn - actual) / actual > 0.02)
      err(`#${shot}: the card draws this image at ratio ${drawn.toFixed(3)} but ${shot}.png is ${real.w}x${real.h} (ratio ${actual.toFixed(3)}) — the SHOT table is stale, so the card is stretched and every callout on it is mis-placed (a mistake this cost us once). Update SHOT to [${real.w}, ${real.h}].`);
  }
}

// ---- 5e. THE 2:59 CEILING (SKILL rule 2, 15 Sep 2026). Instagram will not push a 3-minute-plus video to a
// new audience, so a cut over 179 s is throttled before anyone judges the content. Fix order: cap the pauses in
// the existing take (scripts/trim-vo.py), then tighten holds, then rewrite the script. Never atempo, never drop a step.
{
  const m = html.match(/data-composition-id="main"[^>]*data-duration="([\d.]+)"/);
  const total = m ? +m[1] : null;
  if (total != null) {
    const mmss = (t) => `${Math.floor(t / 60)}:${String((t % 60).toFixed(1)).padStart(4, "0")}`;
    if (total > 179) err(`total ${mmss(total)} (${total.toFixed(1)}s) exceeds the 2:59 hard ceiling — IG will not push it to a new audience. Run scripts/trim-vo.py to cap the pauses in the EXISTING take (no new TTS), then tighten holds.`);
    else if (total > 174) note(`total ${mmss(total)} — under the 2:59 ceiling with ${(179 - total).toFixed(1)}s to spare`);
  }
}

// ---- 5f. GENERATED-FOOTAGE WIRING (a mistake this cost us once). A <video class="clip"> is framework-managed. Two ways to
// get a black frame under perfect chrome, one of which `hyperframes check` does NOT catch:
//   (a) GSAP autoAlpha on the clip element  -> check catches it (gsap_animates_clip_element)
//   (b) opacity:0 / visibility:hidden in ITS OWN CSS -> nothing catches it; the render is silently black.
{
  const vids = [...html.matchAll(/<video\b[^>]*>/g)].map((m) => m[0]);
  for (const tag of vids) {
    const id = (tag.match(/\sid="([\w-]+)"/) || [])[1];
    if (!id) { warn("a <video> has no id — cannot verify its wiring"); continue; }
    if (!/\bclass="[^"]*\bclip\b/.test(tag)) err(`#${id}: a <video> needs class="clip" so the framework mounts and plays it`);
    if (!/\bdata-start=/.test(tag)) err(`#${id}: a <video> needs data-start (+ data-duration) — that is what makes it play`);
    if (!/\bmuted\b/.test(tag)) warn(`#${id}: <video> without muted — give it a separate <audio> if it really has sound`);
    const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
    if (src && !/^https?:/.test(src) && !fs.existsSync(path.join(proj, src))) err(`#${id}: video src ${src} does not exist`);
    else if (src) {
      const base = path.basename(src);
      const sp = path.join(proj, "publish/sources.txt");
      if (!fs.existsSync(sp) || !fs.readFileSync(sp, "utf8").includes(base))
        err(`#${id}: ${base} has no line in publish/sources.txt — generated footage must be logged as generated (not a real incident)`);
    }
    for (const m of html.matchAll(/tl\.(?:set|to|fromTo)\("([^"]+)"[\s\S]{0,200}?autoAlpha/g))
      if (m[1].split(",").some((x) => x.trim() === `#${id}`))
        err(`#${id} is a clip element but GSAP animates autoAlpha on it — data-start/data-duration own its visibility; move the tweens to the overlay (a mistake this cost us once)`);
    const css = (html.match(new RegExp(`#${id}\\{([^}]*)\\}`)) || [])[1] || "";
    if (/opacity\s*:\s*0\b/.test(css) || /visibility\s*:\s*hidden/.test(css))
      err(`#${id} is a clip element pre-hidden in CSS (opacity:0 / visibility:hidden) — it will render BLACK under the overlay and \`hyperframes check\` will still pass. Remove it; the framework reveals it (a mistake this cost us once)`);
  }
  // a PLAN row promising footage must actually ship it
  if (gen && fs.existsSync(gen)) {
    const g = fs.readFileSync(gen, "utf8");
    for (const m of g.matchAll(/hero:\s*"footage:([\w-]+)"/g))
      if (!vids.some((t) => t.includes(`${m[1]}.mp4`))) err(`PLAN declares hero "footage:${m[1]}" but no <video> using ${m[1]}.mp4 is in the HTML`);
  }
}

// ---- 6. PLAN sanity when the generator is given
if (gen && fs.existsSync(gen)) {
  const g = fs.readFileSync(gen, "utf8");
  const plan = g.match(/export const PLAN = \[([\s\S]*?)\];/);
  if (!plan) err("generator has no `export const PLAN` — fill the beats skill first, then paste it as PLAN");
  else {
    const rows = [...plan[1].matchAll(/frame:\s*"(\w+)"/g)].map((m) => m[1]);
    if (rows[0] && rows[0] !== "absent" && rows[0] !== "undefined") note(`PLAN row 1 framing is "${rows[0]}" — a presenter in the hook competes with the hook`);
    for (let i = 1; i < rows.length; i++) if (rows[i] === rows[i - 1] && rows[i] !== "absent" && rows[i] !== "corner") err(`PLAN rows ${i}→${i + 1} repeat framing "${rows[i]}"`);
    const heroes = [...plan[1].matchAll(/hero:\s*"([^"]+)"/g)].map((m) => m[1]);
    if (!heroes.some((h) => h.startsWith("shot:"))) note("PLAN declares no shot:<name> hero — confirm no beat is a recognition beat (\"you have seen this screen\")");
    const spoken = (fs.existsSync(path.join(proj, "assets/vo/vo.words.json")) ? JSON.parse(fs.readFileSync(path.join(proj, "assets/vo/vo.words.json"), "utf8")) : []).map((w) => w.text.toLowerCase());
    const U = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
    const firstWord = (n) => { n = Math.round(n); if (n === 10) return "sepuluh"; if (n === 11) return "sebelas"; if (n >= 100 && n < 200) return "seratus"; if (n >= 1000 && n < 2000) return "seribu"; const lead = +String(n)[0]; return U[lead] || null; }; // the first spoken word of the number (dua puluh tiga → "dua")
    for (const h of heroes.filter((h) => h.startsWith("counter:"))) {
      const n = h.split(":")[1].replace(",", ".");
      const w = firstWord(+n);
      if (w && spoken.length && !spoken.some((s) => s.startsWith(w))) err(`PLAN counter ${n} — its number ("${w}…") is never spoken in the VO (a mistake this cost us once: no invented numbers)`);
    }
    const rowsTxt = plan[1].split(/\},\s*\{/);
    for (const r of rowsTxt) if (/hero:\s*"crumbs/.test(r) && !/fallback:\s*"[^"]+"/.test(r)) err(`PLAN row without a real screen has no \`fallback:\` reason — ${r.match(/beat:\s*"([^"]+)"/)?.[1] ?? "?"} (a breadcrumb-only step is allowed only when no clean screenshot exists, and it must say so)`);
    const wmPath = path.join(proj, "assets/world/manifest.json");
    if (fs.existsSync(wmPath)) {
      const parts = new Set(Object.keys(JSON.parse(fs.readFileSync(wmPath, "utf8")).parts || {}));
      for (const h of heroes.filter((h) => h.startsWith("world:"))) { const k = h.slice(6); if (!parts.has(k)) err(`PLAN hero "${h}" — no part named "${k}" in assets/world/manifest.json (read the manifest before writing PLAN; do not invent part names)`); }
    }
    const recap = heroes.includes("recap");
    if (recap) note("PLAN has a recap row — only valid when the total IS the sum of the spoken tip numbers; otherwise use minis without per-card numbers (beat-plan § 1)");
  }
}

for (const n of notes) console.log("  ·", n);
for (const w of warns) console.log("  ⚠", w);
for (const e of errors) console.log("  ✗", e);
console.log(`hyperframe-pro lint: ${errors.length} error(s), ${warns.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
