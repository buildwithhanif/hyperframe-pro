// build.mjs — the shape every Hyperframe Pro generator follows.
//
//   node build.mjs .
//
// Read it top to bottom: PLAN (what each beat does) -> cue table (chained to voice-over WORDS) ->
// beats (place + tween against those cues) -> one HTML template with a paused GSAP timeline.
//
// The thing to notice: not one timing in here is a stopwatch number. Every cue is "the next occurrence
// of this word after the previous cue", so if the script changes, the video re-times itself.
import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------- PLAN -------------------------------
// Fill this BEFORE writing beats. `from`/`to` are WORDS in the narration. See hyperframe-pro-beats.
export const PLAN = [
  { beat: "H1 situation", from: "start",   to: "problem", hero: "slam",       zones: "type full 520-980" },
  { beat: "H2 reversal",  from: "problem", to: "cache",   hero: "slam",       zones: "type full 560-1000" },
  { beat: "B3 reveal",    from: "cache",   to: "Here",    hero: "counter:23", zones: "counter 70-1010 y620-1100 | chips y1180" },
  { beat: "END cta",      from: "Here",    to: "end",     hero: "line",       zones: "type full 700-1050" },
];

const proj = process.argv[2] || ".";
const meta = JSON.parse(fs.readFileSync(path.join(proj, "assets/vo/audio_meta.json"), "utf8"));
const VO = meta.scenes[0];

const W = 1080, H = 1920;
const BG = "#0B0D12", INK = "#F4F5F7", MUTED = "#8A8F99", ACCENT = "#F5C242", DIM = "#151923";
const fx = (n) => +n.toFixed(3);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const VO_START = 0.35;                       // a beat of air before the first word

/** TA = Time After. The next occurrence of `word` AFTER `after`. Chain these; never count occurrences. */
function TA(word, after) {
  for (const w of VO.words) {
    const t = fx(VO_START + w.start);
    if (t > after + 0.01 && norm(w.text).startsWith(norm(word))) return t;
  }
  throw new Error(`cue "${word}" after ${after}s not found — the script changed; re-cue this beat`);
}
const VO_END = fx(VO_START + VO.duration);
const TOTAL = fx(VO_END + 1.2);
if (TOTAL > 179) throw new Error(`total ${TOTAL}s exceeds the 2:59 ceiling — see hyperframe-pro-voice`);

const tl = [], html = [];

// ---------------------------------------------------------------- cue table (chained) -----------------
const storage  = TA("storage", -1);
const full     = TA("full", storage);
const deleted  = TA("deleted", full);
const week     = TA("week", deleted);
const problem  = TA("problem", week);
const notYours = TA("not", problem);
const cache    = TA("cache", notYours);
const three    = TA("three", cache);
const twenty   = TA("twenty", three);
const gigabytes= TA("gigabytes", twenty);
const here     = TA("Here", gigabytes);
const look     = TA("look", here);

// ---------------------------------------------------------------- tiny motion helpers -----------------
const enter = (sel, at, { d = 0.3, y = 28, scale = null } = {}) =>
  tl.push(`tl.fromTo("${sel}",{autoAlpha:0,y:${y}${scale ? `,scale:${scale}` : ""}},{autoAlpha:1,y:0${scale ? ",scale:1" : ""},duration:${d},ease:"power3.out"},${fx(at)});`);
const exit = (sel, at, { d = 0.22, y = -30 } = {}) => {
  tl.push(`tl.to("${sel}",{autoAlpha:0,y:${y},duration:${d},ease:"power2.in"},${fx(at)});`);
  tl.push(`tl.set("${sel}",{autoAlpha:0},${fx(at + d)});`);   // hard kill: survives non-linear seeking
};
const slam = (sel, at, { d = 0.3, from = 1.3 } = {}) =>
  tl.push(`tl.fromTo("${sel}",{autoAlpha:0,scale:${from}},{autoAlpha:1,scale:1,duration:${d},ease:"power4.out"},${fx(at)});`);

// ---------------------------------------------------------------- beats ------------------------------
// H1 — the situation, named. Something moves in the first second; a fade-in is not motion.
slam("#h1a", 0.12);   // something MOVES in the first second — the lint enforces this
enter("#h1b", full, { y: 24 });
enter("#h1c", deleted, { y: 24 });
exit("#h1a, #h1b, #h1c", fx(problem - 0.42));

// H2 — the reversal. Hands over BEFORE H1 is gone, so there is never an empty frame.
slam("#h2a", fx(problem - 0.12));
slam("#h2b", notYours, { from: 1.25 });
exit("#h2a, #h2b", fx(cache - 0.42));

// B3 — the reveal. The counter counts; it finishes ON the spoken number.
enter("#n23", cache, { y: 30, scale: 0.6 });
tl.push(`tl.to(N23,{v:23,duration:${fx(gigabytes - twenty + 0.3)},ease:"power3.out",snap:{v:1},` +
        `onUpdate:()=>{document.getElementById("n23v").textContent=Math.round(N23.v);}},${fx(twenty)});`);
enter("#n23sub", three, { y: 20 });
exit("#n23, #n23sub", fx(here - 0.42));

// END — one action.
enter("#end", fx(here - 0.05), { y: 34 });
tl.push(`tl.fromTo("#end .rule",{scaleX:0},{scaleX:1,duration:0.4,ease:"power3.out"},${fx(here + 0.25)});`);

// ---------------------------------------------------------------- captions ---------------------------
const caps = [];
{
  const lines = []; let line = [];
  for (const w of VO.words) { line.push(w); if (line.length === 4 || /[.?!]$/.test(w.text)) { lines.push(line); line = []; } }
  if (line.length) lines.push(line);
  lines.forEach((ln, i) => {
    const st = fx(VO_START + ln[0].start - 0.06), nx = lines[i + 1];
    const en = fx(nx ? VO_START + nx[0].start - 0.06 : VO_START + ln.at(-1).end + 0.3);
    caps.push(`<div class="cap clip" id="cap-${i}" data-start="${st}" data-duration="${fx(en - st)}" data-track-index="7">${ln.map((w) => esc(w.text)).join(" ")}</div>`);
    tl.push(`tl.fromTo("#cap-${i}",{y:16,opacity:0},{y:0,opacity:1,duration:0.18,ease:"power2.out"},${st});`);
  });
}

// ---------------------------------------------------------------- HTML -------------------------------
const page = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=${W}, height=${H}" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${BG}}
body{font-family:Inter,system-ui,sans-serif;color:${INK};-webkit-font-smoothing:antialiased}
#root{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${BG}}
#scene{position:absolute;inset:0}
.ct{position:absolute;opacity:0;visibility:hidden;will-change:transform;z-index:4}
.slam{left:70px;right:70px;text-align:center;font-weight:800;letter-spacing:-0.045em;line-height:0.98}
.note{font-size:44px;font-weight:700;line-height:1.2;color:${MUTED}}
#h1a{top:520px;font-size:120px}
#h1b{top:760px;left:70px;right:70px;text-align:center}
#h1c{top:860px;left:70px;right:70px;text-align:center}
#h2a{top:560px;font-size:96px;color:${MUTED}}
#h2b{top:720px;font-size:130px;color:${ACCENT}}
#n23{left:70px;right:70px;top:620px;text-align:center;font-weight:800;letter-spacing:-0.05em;line-height:1;font-variant-numeric:tabular-nums}
#n23 .v{font-size:280px;color:${ACCENT}} #n23 .u{font-size:90px;color:${MUTED};margin-left:14px}
#n23sub{left:70px;right:70px;top:1000px;text-align:center}
#end{position:absolute;left:70px;right:70px;top:700px;opacity:0;visibility:hidden}
#end h1{font-size:84px;font-weight:800;letter-spacing:-0.04em;line-height:1.1}
#end h1 b{color:${ACCENT}}
#end .rule{width:180px;height:9px;background:${ACCENT};border-radius:5px;margin-top:30px;transform-origin:0 50%}
.cap{position:absolute;left:60px;right:60px;top:1620px;text-align:center;font-size:52px;font-weight:700;line-height:1.2;color:rgba(244,245,247,0.82);opacity:0}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <div id="scene" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="3">
    <div id="h1a" class="slam ct">STORAGE<br>PENUH.</div>
    <div id="h1b" class="note ct">You deleted photos.</div>
    <div id="h1c" class="note ct">It came back in a week.</div>
    <div id="h2a" class="slam ct">It is not your photos.</div>
    <div id="h2b" class="slam ct">IT IS CACHE.</div>
    <div id="n23" class="ct"><span class="v" id="n23v">0</span><span class="u">GB</span></div>
    <div id="n23sub" class="note ct">hidden by three apps, right now.</div>
    <div id="end"><h1>Here is <b>where to look</b>.</h1><div class="rule"></div></div>
  </div>
  ${caps.join("\n  ")}
  <audio id="vo" src="assets/vo/${VO.wav}" data-start="${VO_START}" data-duration="${fx(VO.duration)}" data-track-index="30" data-volume="1"></audio>
</div>
<script>
  window.__timelines = window.__timelines || {};
  gsap.set(".ct, #end",{autoAlpha:0});
  gsap.set("#end .rule",{scaleX:0});
  const N23 = { v: 0 };
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  ${tl.join("\n  ")}
  window.__timelines["main"] = tl;
</script>
</body></html>
`;
fs.writeFileSync(path.join(proj, "index.html"), page);
console.log(`wrote index.html  total=${TOTAL}s  tweens=${tl.length}  captions=${caps.length}`);
