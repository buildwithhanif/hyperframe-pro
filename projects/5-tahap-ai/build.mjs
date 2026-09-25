// build.mjs — "5 tahap kreator nerima AI", a drawn short on Hyperframe Pro, voiced.
//
//   python3 vo_local.py . && node build.mjs . && python3 audio.py .
//
// Every cue below is chained to a SPOKEN word with TA(), from the word table vo_local.py writes. Change
// a line in script.json, re-run the chain, and the video re-times itself; a cue whose word is gone throws.
//
// Register: every beat is a SENSATION or a CONCEPT, so every hero is DRAWN. No screen the viewer owns
// appears in this story, so there is no screenshot and no fake UI: the "posts" are abstract drawn cards.
// The stage cards (#st1..#st5) are emotional stages, not tutorial steps, so they are not #tN and the lint's
// "every step shows a real screen" gate does not apply; they still carry the running count (01 / 05).
import fs from "node:fs";
import path from "node:path";
import { makeMotion } from "../../plugins/hyperframe-pro/scripts/motion.mjs";
import { kreator, MOODS } from "./kreator.mjs";

// ---------------------------------------------------------------- PLAN -------------------------------
export const PLAN = [
  { beat: "H0 contract",   from: "start",      to: "Satu",       hero: "slam:5 + five faces",                     frame: "absent", zones: "type 330-1180 / faces y1240-1460 / none", sfx: "thump, pops" },
  { beat: "W1..W5 wipes",  from: "Satu/Dua/..", to: "stage name", hero: "full-bleed colour wipe: 0N + NAME",       frame: "absent", zones: "full frame", sfx: "whoosh" },
  { beat: "S1 denial",     from: "Denial",     to: "Dua",        hero: "drawn post + SLOP stamp",                 frame: "medL",   zones: "post x560-1020 y530-1090 / bubble y1260+ / char x20-520 y600-1200", sfx: "stamp" },
  { beat: "S2 anger",      from: "Anger",      to: "Tiga",       hero: "close-up face on flames + glass draining", frame: "close", zones: "glass x770-1050 y620-1160 / bubble y1260+ / char x0-780 y440-1240", sfx: "hit, hiss, drain" },
  { beat: "S3 bargaining", from: "Bargaining", to: "Empat",      hero: "doc: squiggle fixed + two chips",         frame: "medR",   zones: "doc x60-580 y510-1150 / bubble y1260+ / char x560-1060 y600-1200", sfx: "pop, ding" },
  { beat: "S4 depression", from: "Depression", to: "Lima",       hero: "counter:4 two cards, then push in on him under rain", frame: "wide", zones: "cards y480-880 / bubble y1260+ / char x250-830 y550-1246", sfx: "riser, ticks, wah-wah, rain" },
  { beat: "S5 acceptance", from: "Acceptance", to: "Mau",        hero: "laptop + system pipeline + confetti",     frame: "full",   zones: "pipe y480-640 / bubble y1280+ / char x250-810 y600-1272", sfx: "chime, blips" },
  { beat: "CTA offer",     from: "Mau",        to: "end",        hero: "hop 01 to 05, 1-on-1 card, link di bio, 3 seats", frame: "token", zones: "type y290-540 / track y560-760 / card y800-1200 / button y1240-1350 / seats y1380-1480", sfx: "boing, pops, ding" },
];

const proj = process.argv[2] || ".";
const meta = JSON.parse(fs.readFileSync(path.join(proj, "assets/vo/audio_meta.json"), "utf8"));
const MOUTH = JSON.parse(fs.readFileSync(path.join(proj, "assets/vo/mouth.json"), "utf8"));
const GL = JSON.parse(fs.readFileSync(path.join(proj, "assets/glyphs.json"), "utf8"));
const VO = meta.scenes[0];

const W = 1080, H = 1920;
const INK = "#17171C", PAPER = "#F7F1E6", MUTED = "#6E6A63", WHITE = "#FFFDF8", YEL = "#FFC928";
const ST = [
  { name: "DENIAL",     c: "#7C5CE0", bg: "#EEE8FB", mood: "smug",   bw: "MEH" },
  { name: "ANGER",      c: "#E5484D", bg: "#FCE3DF", mood: "angry",  bw: "ARGH" },
  { name: "BARGAINING", c: "#B86E00", bg: "#FDF0D8", mood: "unsure", bw: "YAUDAH" },
  { name: "DEPRESSION", c: "#3E63DD", bg: "#D5DCEB", mood: "sad",    bw: "SEPI" },
  { name: "ACCEPTANCE", c: "#1E8453", bg: "#DFF3E7", mood: "happy",  bw: "SYSTEM" },
];
const fx = (n) => +n.toFixed(3);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const VO_START = 0.35;

function TA(word, after) {
  for (const w of VO.words) {
    const t = fx(VO_START + w.start);
    if (t > after + 0.01 && norm(w.text).startsWith(norm(word))) return t;
  }
  throw new Error(`cue "${word}" after ${after}s not found — the script changed; re-cue this beat`);
}
const at = (w) => fx(VO_START + w.start);
const endOf = (word, after) => { const t = TA(word, after); const w = VO.words.find((x) => fx(VO_START + x.start) === t); return fx(VO_START + w.end); };
const LINE = VO.lines.map((l) => ({ ...l, start: fx(VO_START + l.start), end: fx(VO_START + l.end) }));
const lineWords = (...idx) => VO.words.filter((w) => idx.includes(w.line));
const VO_END = fx(VO_START + VO.duration);
const TOTAL = fx(VO_END + 0.3);
if (TOTAL > 179) throw new Error(`total ${TOTAL}s exceeds the 2:59 ceiling`);

const tl = [], lay = [], top = [], sfx = [];
const M = makeMotion({ tl, audio: [], fx, TOTAL });
const S = (name, t, vol = 0.5) => sfx.push({ name, t: fx(Math.max(0, t - 0.05)), vol });
const cut = (sel, t) => tl.push(`tl.set("${sel}",{autoAlpha:0},${fx(t)});`);

// ---------------------------------------------------------------- display type as paths ---------------
/** A word drawn from glyph outlines, `h` px cap height. Returns an <svg>. */
function glyphs(str, { h = 200, fill = INK, stroke = "none", sw = 0, shadow = null, track = 0 } = {}) {
  let x = 0; const ps = [];
  for (const ch of str.toUpperCase()) { const g = GL.g[ch] || GL.g[" "]; if (g.d) ps.push(`<path d="${g.d}" transform="translate(${x},0)"/>`); x += g.adv + track; }
  x -= track;
  const vb = `-20 -700 ${x + 40} 740`, wpx = Math.round(((x + 40) * h) / GL.cap), hpx = Math.round((740 * h) / GL.cap);
  const body = (f, s, dx = 0, dy = 0) => `<g transform="translate(${dx},${dy}) scale(1,-1)" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round">${ps.join("")}</g>`;
  return { svg: `<svg viewBox="${vb}" width="${wpx}" height="${hpx}" overflow="visible">${shadow ? body(shadow, shadow === "none" ? "none" : stroke, 34, 34) : ""}${body(fill, stroke)}</svg>`, w: wpx, h: hpx };
}

// ---------------------------------------------------------------- cue table (chained) -----------------
const tahap = TA("tahap", -1), nerima = TA("nerima", tahap), hookAI = TA("AI", nerima);
const satu = TA("Satu", hookAI), denial = TA("Denial", satu), denialEnd = endOf("Denial", satu);
const jelek = TA("Jelek", denial), slop = TA("Slop", jelek);
const dua = TA("Dua", slop), anger = TA("Anger", dua), angerEnd = endOf("Anger", dua);
const bangsat = TA("Bangsat", anger), ngabis = TA("ngabis2in", bangsat), air = TA("air", ngabis);
const tiga = TA("Tiga", air), barg = TA("Bargaining", tiga), bargEnd = endOf("Bargaining", tiga);
const gapapa = TA("Gapapa", barg), benerin = TA("benerin", gapapa), grammar = TA("grammar", benerin);
const tapi = TA("Tapi", grammar), ide = TA("ide", tapi), nulis = TA("nulis", ide);
const empat = TA("Empat", nulis), depr = TA("Depression", empat), deprEnd = endOf("Depression", empat);
const kok = TA("Kok", depr), fullAI = TA("full", kok), viral = TA("viral", fullAI);
const gueB = TA("Gue", viral), ngedit = TA("ngedit", gueB), empat4 = TA("4", ngedit), jam = TA("jam", empat4);
const sepi = TA("sepi", jam), gaFair = TA("Ga", sepi), fair = TA("fair", gaFair);
const lima = TA("Lima", fair), acc = TA("Acceptance", lima), accEnd = endOf("Acceptance", lima);
const akhirnya = TA("Akhirnya", acc), belajar = TA("belajar", akhirnya), system = TA("system", belajar);
const mau = TA("Mau", system), loncat = TA("loncat", mau), tahap5 = TA("5", loncat);
const bangun = TA("Bangun", tahap5), oneOn = TA("1-on-1", bangun), hanif = TA("hanifproduktif", oneOn);
const cek = TA("Cek", hanif), bio = TA("bio", cek), slot = TA("Slotnya", bio), tigaOrang = TA("3", slot);
const X = (next) => fx(next - 0.42);

// ---------------------------------------------------------------- helpers -----------------------------
const shake = (t, amt = 18) => tl.push(`tl.fromTo("#cam",{x:${-amt},y:${amt / 3}},{x:0,y:0,duration:0.42,ease:"elastic.out(1.2,0.28)",immediateRender:false},${fx(t)});`);
const punch = (t, s = 1.06) => tl.push(`tl.fromTo("#cam",{scale:${s}},{scale:1,duration:0.5,ease:"power3.out",immediateRender:false},${fx(t)});`);
const blink = (p, t) => tl.push(`tl.fromTo("#${p}-eyes",{scaleY:1},{scaleY:0.08,duration:0.07,ease:"power1.in",yoyo:true,repeat:1,transformOrigin:"50% 50%",immediateRender:false},${fx(t)});`);
const pop = (sel, t, from = 0.4, d = 0.42) => tl.push(`tl.fromTo("${sel}",{autoAlpha:0,scale:${from}},{autoAlpha:1,scale:1,duration:${d},ease:"back.out(2.2)"},${fx(t)});`);
const charIn = (sel, t) => tl.push(`tl.fromTo("${sel}",{autoAlpha:0,y:90,scaleY:0.82,scaleX:1.08},{autoAlpha:1,y:0,scaleY:1,scaleX:1,duration:0.5,ease:"back.out(2)",transformOrigin:"50% 100%"},${fx(t)});`);
const sway = (sel, t0, t1, deg = 1.6) => { const n = Math.max(1, Math.floor((t1 - t0) / 1.4) - 1); tl.push(`tl.fromTo("${sel}",{rotation:${-deg}},{rotation:${deg},duration:1.4,ease:"sine.inOut",yoyo:true,repeat:${n},transformOrigin:"50% 100%",immediateRender:false},${fx(t0)});`); };
const faceSvg = (p, mood) => kreator(p, mood, { crop: "face" });
const shadow = `<i class="gsh"></i>`;

/** A speech bubble; words appear as they are SPOKEN. `hl` words land in the stage colour. */
function bubble(id, words, { tailX = 300, size = 56, color = INK, hl = [], script = false, topPx = 1180 } = {}) {
  const isHl = (t) => hl.some((h) => norm(t).startsWith(norm(h)));
  lay.push(`<div id="${id}" class="bub ct${script ? " script" : ""}" style="top:${topPx}px;--tx:${tailX}px;font-size:${size}px">${words.map((w, i) => `<span class="w${isHl(w.text) ? " hl" : ""}" id="${id}w${i}"${isHl(w.text) ? ` style="color:${color}"` : ""}>${esc(w.text)}</span>`).join(" ")}</div>`);
  tl.push(`tl.fromTo("#${id}",{autoAlpha:0,y:40,scale:0.92},{autoAlpha:1,y:0,scale:1,duration:0.28,ease:"back.out(1.6)"},${fx(at(words[0]) - 0.06)});`);
  words.forEach((w, i) => tl.push(isHl(w.text)
    ? `tl.fromTo("#${id}w${i}",{autoAlpha:0,scale:1.7},{autoAlpha:1,scale:1,duration:0.26,ease:"back.out(2.4)"},${at(w)});`
    : `tl.fromTo("#${id}w${i}",{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:0.14,ease:"power2.out"},${at(w)});`));
}

/** Full-bleed colour wipe carrying 0N + the stage name, over the narrator saying them. */
function wipe(n, name, color, tIn, tOut, { numColor = WHITE } = {}) {
  const num = glyphs(n, { h: 360, fill: numColor, stroke: INK, sw: 26, shadow: INK });
  const nm = name ? glyphs(name, { h: name.length > 8 ? 110 : 150, fill: INK }) : null;
  top.push(`<div id="wp${n}" class="ct wipe" style="background:${color}"><div class="wpin"><div class="wn">${num.svg}</div>${nm ? `<div class="wname">${nm.svg}</div>` : ""}</div></div>`);
  tl.push(`tl.fromTo("#wp${n}",{autoAlpha:1,xPercent:-115,skewX:-9},{autoAlpha:1,xPercent:0,skewX:-9,duration:0.3,ease:"expo.out"},${fx(tIn)});`);
  tl.push(`tl.fromTo("#wp${n} .wpin",{x:110},{x:-40,duration:${fx(tOut - tIn + 0.3)},ease:"power1.out"},${fx(tIn)});`);
  tl.push(`tl.to("#wp${n}",{xPercent:115,duration:0.3,ease:"power2.in"},${fx(tOut)});`);
  cut(`#wp${n}`, tOut + 0.3);
  S("whoosh", tIn, 0.5); S("whoosh", tOut, 0.3);
}

/** Stage frame: wipe in on "Satu/Dua/...", everything of the stage lands as the wipe leaves. */
function stageFrame(i, tNum, tNameEnd, tNext) {
  const s = ST[i];
  wipe(String(i + 1).padStart(2, "0"), s.name, s.c, fx(tNum - 0.22), fx(tNameEnd + 0.08));
  const under = fx(tNum + 0.1);
  tl.push(`tl.set("#bg",{backgroundColor:"${s.bg}"},${under});`);
  tl.push(`tl.set("#glow",{backgroundColor:"${s.c}"},${under});`);
  lay.push(`<div id="st${i + 1}" class="stage ct"><span class="num">${String(i + 1).padStart(2, "0")} / 05</span><span class="name" style="color:${s.c}">${s.name}</span></div>`);
  tl.push(`tl.fromTo("#st${i + 1}",{autoAlpha:0,x:-120},{autoAlpha:1,x:0,duration:0.36,ease:"expo.out"},${fx(tNameEnd + 0.12)});`);
  // the stage's word, huge and outlined, drifting behind everything
  const bw = glyphs(s.bw, { h: 330, fill: "none", stroke: s.c, sw: 16 });
  lay.push(`<div id="bw${i + 1}" class="bw">${bw.svg}</div>`);
  tl.push(`tl.fromTo("#bw${i + 1}",{autoAlpha:0,x:120},{autoAlpha:0.22,x:-120,duration:${fx(tNext - tNameEnd - 0.4)},ease:"none"},${fx(tNameEnd + 0.1)});`);
  // slow push-in for the whole stage
  tl.push(`tl.fromTo("#lay",{scale:1},{scale:1.035,duration:${fx(tNext - tNameEnd - 0.4)},ease:"sine.inOut",immediateRender:false},${fx(tNameEnd + 0.1)});`);
  return { start: fx(tNameEnd + 0.08), clear: fx(tNext - 0.22 + 0.26) };   // clear = under the next wipe
}

// ---------------------------------------------------------------- H0 hook -----------------------------
// What MOVES in the first second: the giant 5 slams in on frame 1 with a thump; the narrator is already
// saying "Lima tahap kreator nerima AI" and the five faces are up by ~1.8 s. Length and joke, both set.
const five = glyphs("5", { h: 430, fill: INK, shadow: YEL });
lay.push(`<div id="h-eyebrow" class="ct pill">5 STAGES OF GRIEF</div>`);
lay.push(`<div id="h-5" class="ct" style="left:${Math.round((W - five.w) / 2)}px;width:${five.w}px;height:${five.h}px">${five.svg}</div>`);
const hookWords = lineWords(0).slice(1);
lay.push(`<div id="h-line" class="ct">${hookWords.map((w, i) => `<span class="w" id="hlw${i}">${esc(w.text.replace(/\.$/, ""))}</span>`).join(" ")}</div>`);
lay.push(`<div id="h-faces" class="ct">${MOODS.map((m, i) => `<div class="mf" id="hf${i + 1}"><div class="mfh" style="border-color:${ST[i].c}">${faceSvg(`hf${i + 1}k`, m)}</div><span style="color:${ST[i].c}">${ST[i].name}</span></div>`).join("")}</div>`);
M.slam("#h-5", 0.02, { from: 2.4, d: 0.3 }); S("thump", 0.1, 0.8); shake(0.2, 14);
M.enter("#h-eyebrow", 0.3, { y: -24 });
M.enter("#h-line", fx(tahap - 0.1), { y: 20 });
hookWords.forEach((w, i) => tl.push(`tl.fromTo("#hlw${i}",{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:0.2,ease:"power3.out"},${at(w)});`));
tl.push(`tl.set("#h-faces",{autoAlpha:1},${fx(nerima - 0.2)});`);
MOODS.forEach((m, i) => { pop(`#hf${i + 1}`, fx(nerima - 0.2 + i * 0.1), 0.3); S("pop", nerima - 0.2 + i * 0.1, 0.3); });
tl.push(`tl.fromTo("#hf1, #hf2, #hf3, #hf4, #hf5",{y:0},{y:-26,duration:0.18,ease:"sine.out",yoyo:true,repeat:1,stagger:0.08,immediateRender:false},${hookAI});`);
tl.push(`tl.fromTo("#h-5",{rotation:0},{rotation:-4,duration:0.9,ease:"sine.inOut",yoyo:true,repeat:1,immediateRender:false},0.6);`);

// ---------------------------------------------------------------- S1 denial ---------------------------
const f1 = stageFrame(0, satu, denialEnd, dua);
cut("#h-eyebrow, #h-5, #h-line, #h-faces", satu + 0.1);
lay.push(`<div id="k1" class="ct char" style="left:20px;top:520px;width:500px;height:600px">${shadow}${kreator("k1", "smug")}</div>`);
lay.push(`<div id="post1" class="ct post" style="left:560px;top:450px;width:460px"><div class="tilt" style="transform:rotate(4deg)">
  <div class="ph"><i class="av"></i><b></b><b class="s"></b></div>
  <div class="pimg" style="background:linear-gradient(135deg,#C9B8F5,#F2C6E0)"><span class="spark">&#10022;</span><span class="plab">konten AI</span></div>
  <div class="pf"><i></i><i></i><i></i><b></b></div></div></div>`);
lay.push(`<div id="stamp1" class="ct stamp" style="left:585px;top:650px;width:410px;color:#D7263D;border-color:#D7263D"><div class="tilt" style="transform:rotate(-14deg)">SLOP</div></div>`);
lay.push(`<div id="burst1" class="burst" style="left:590px;top:560px">${Array.from({ length: 10 }, (_, i) => `<i style="transform:rotate(${i * 36}deg)"></i>`).join("")}</div>`);
charIn("#k1", f1.start);
M.enter("#post1", fx(f1.start + 0.15), { x: 90, y: 0, scale: 0.9 });
bubble("q1", lineWords(2, 3), { tailX: 250, color: ST[0].c, hl: ["slop"] });
tl.push(`tl.fromTo("#k1-pupils",{y:0,x:0},{y:-9,x:4,duration:0.3,ease:"power2.out",yoyo:true,repeat:1,repeatDelay:0.6,immediateRender:false},${jelek});`);
tl.push(`tl.fromTo("#k1-head",{rotation:0},{rotation:-5,duration:0.4,ease:"sine.inOut",yoyo:true,repeat:1,transformOrigin:"50% 90%",immediateRender:false},${jelek});`);
S("tick", jelek, 0.3);
M.slam("#stamp1", slop, { from: 2.6, d: 0.26 }); S("stamp", slop, 0.9); shake(fx(slop + 0.16), 24); punch(slop, 1.07);
tl.push(`tl.fromTo("#burst1",{autoAlpha:1,scale:0.3},{autoAlpha:0,scale:1.5,duration:0.5,ease:"power2.out"},${fx(slop + 0.1)});`);
tl.push(`tl.to("#post1 .spark, #post1 .plab",{autoAlpha:0,duration:0.15},${slop});`);
tl.push(`tl.fromTo("#post1 .pimg",{filter:"saturate(1)"},{filter:"saturate(0.3)",duration:0.4,immediateRender:false},${fx(slop + 0.2)});`);
blink("k1", f1.start + 1.2); blink("k1", slop + 0.5);
sway("#k1", f1.start + 0.6, dua - 0.3);
cut("#k1, #post1, #stamp1, #q1, #st1, #bw1", f1.clear);

// ---------------------------------------------------------------- S2 anger ----------------------------
const f2 = stageFrame(1, dua, angerEnd, tiga);
lay.push(`<div id="flame2" class="ct wo" style="left:-40px;top:620px;width:900px;height:640px"><svg viewBox="0 0 900 640" width="900" height="640" overflow="visible">${
  [[90, 1.0, "#FF7A1A"], [250, 1.25, "#FFB21A"], [450, 1.4, "#FF7A1A"], [640, 1.2, "#FFB21A"], [800, 0.95, "#FF7A1A"]].map(([x, s, c], i) =>
    `<g transform="translate(${x},640)"><path id="fl${i}" d="M0,0 C-90,-40 -80,-170 -10,-250 C-20,-190 30,-170 30,-120 C60,-170 40,-230 70,-300 C150,-190 150,-60 60,0 Z" fill="${c}" stroke="${INK}" stroke-width="7" stroke-linejoin="round" transform="scale(${s})"/></g>`).join("")}</svg></div>`);
lay.push(`<div id="k2" class="ct char" style="left:-10px;top:360px;width:790px;height:820px;overflow:hidden"><div style="width:790px;height:948px">${kreator("k2", "angry")}</div></div>`);
lay.push(`<div id="glass2" class="ct wo" style="left:770px;top:540px;width:280px;height:520px"><svg viewBox="0 0 280 520" width="280" height="520" overflow="visible">
  <defs><clipPath id="g2clip"><path d="M40,150 L240,150 L218,500 L62,500 Z"/></clipPath></defs>
  <path d="M170,300 L170,60 Q170,30 200,30 L262,30" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M170,300 L170,60 Q170,30 200,30 L262,30" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
  <g clip-path="url(#g2clip)"><rect id="g2water" x="0" y="190" width="280" height="330" fill="#6FB1F2"/><rect id="g2wave" x="0" y="184" width="280" height="14" fill="#A9D2FA"/></g>
  <path d="M40,150 L240,150 L218,500 L62,500 Z" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <g transform="translate(206,0)"><rect x="0" y="0" width="80" height="60" rx="16" fill="${INK}"/><text x="40" y="42" text-anchor="middle" font-family="Bricolage" font-size="34" font-weight="800" fill="#fff">AI</text></g>
</svg><div class="glab">air</div></div>`);
top.push(`<div id="flash2" class="flash" style="background:#E5484D"></div>`);
M.enter("#flame2", fx(f2.start), { y: 120 });
[0, 1, 2, 3, 4].forEach((i) => tl.push(`tl.fromTo("#fl${i}",{scaleY:0.86},{scaleY:1.08,duration:${fx(0.16 + i * 0.03)},ease:"sine.inOut",yoyo:true,repeat:${Math.floor((tiga - f2.start) / (0.16 + i * 0.03)) - 1},transformOrigin:"50% 100%",immediateRender:false},${fx(f2.start)});`));
charIn("#k2", fx(f2.start + 0.05));
bubble("q2", lineWords(5), { tailX: 360, color: ST[1].c, hl: ["bangsat", "air"] });
tl.push(`tl.fromTo("#k2-flush",{opacity:0.1},{opacity:0.45,duration:0.25,ease:"power2.out",immediateRender:false},${bangsat});`);
tl.push(`tl.fromTo("#k2-fist",{y:30,rotation:8},{y:0,rotation:0,duration:0.3,ease:"back.out(3)",transformOrigin:"80% 90%",immediateRender:false},${bangsat});`);
tl.push(`tl.fromTo("#k2-fist",{y:0},{y:-18,duration:0.14,ease:"sine.inOut",yoyo:true,repeat:7,immediateRender:false},${fx(bangsat + 0.35)});`);
tl.push(`tl.fromTo("#flash2",{opacity:0.5},{opacity:0,duration:0.4,ease:"power2.out",immediateRender:false},${bangsat});`);
S("hit", bangsat, 0.95); shake(bangsat, 30); punch(bangsat, 1.09);
[1, 2, 3].forEach((n) => tl.push(`tl.fromTo("#k2-steam${n}",{y:20,autoAlpha:0,scale:0.6},{y:-40,autoAlpha:1,scale:1.1,duration:0.7,ease:"power1.out",yoyo:true,repeat:${Math.max(1, Math.floor((tiga - f2.start - 1) / 0.7) - 1)},transformOrigin:"50% 50%"},${fx(f2.start + 0.2 + n * 0.18)});`));
S("hiss", f2.start + 0.3, 0.12);
M.enter("#glass2", fx(ngabis - 0.3), { x: 80, y: 0 });
tl.push(`tl.fromTo("#g2water, #g2wave",{y:0},{y:270,duration:${fx(Math.max(0.8, tiga - air - 0.6))},ease:"power1.in",immediateRender:false},${fx(air)});`);
S("drain", air, 0.5);
blink("k2", f2.start + 1.0);
cut("#flame2, #k2, #glass2, #q2, #st2, #bw2", f2.clear);

// ---------------------------------------------------------------- S3 bargaining -----------------------
const f3 = stageFrame(2, tiga, bargEnd, empat);
lay.push(`<div id="doc3" class="ct doc" style="left:60px;top:430px;width:520px;height:640px">
  <div class="dtab">konten.txt</div>
  <b style="width:86%"></b><b style="width:70%"></b>
  <div class="sqrow"><b style="width:78%;margin:0"></b><svg id="sq3" class="sq" viewBox="0 0 300 20" width="300" height="20"><path d="M0,10 Q7.5,0 15,10 T30,10 T45,10 T60,10 T75,10 T90,10 T105,10 T120,10 T135,10 T150,10 T165,10 T180,10 T195,10 T210,10 T225,10 T240,10 T255,10 T270,10 T285,10 T300,10" fill="none" stroke="#E5484D" stroke-width="5"/></svg><span id="ok3" class="ok">&#10003;</span></div>
  <b style="width:90%"></b><b style="width:58%"></b>
  <div class="chips"><span id="c3ai" class="chip" style="background:${ST[2].c}">AI bantu grammar + editing</span><span id="c3ide" class="chip ink">ide &amp; tulisan tetep dari gue</span></div>
</div>`);
lay.push(`<div id="k3" class="ct char" style="left:560px;top:520px;width:500px;height:600px">${shadow}${kreator("k3", "unsure")}</div>`);
M.enter("#doc3", fx(f3.start + 0.12), { x: -80, y: 0 });
charIn("#k3", f3.start);
bubble("q3a", lineWords(7), { tailX: 700, color: ST[2].c, hl: ["grammar", "editing"] });
bubble("q3b", lineWords(8), { tailX: 700, color: ST[2].c, hl: ["ide", "sendiri"] });
M.exit("#q3a", fx(tapi - 0.28), { y: -20, d: 0.18 });
tl.push(`tl.fromTo("#k3-palm",{rotation:-10},{rotation:10,duration:0.3,ease:"sine.inOut",yoyo:true,repeat:5,transformOrigin:"100% 100%",immediateRender:false},${gapapa});`);
tl.push(`tl.fromTo("#k3-sweat",{y:0,autoAlpha:1},{y:40,autoAlpha:0,duration:0.8,ease:"power1.in",repeat:1,repeatDelay:0.4,immediateRender:false},${fx(gapapa + 0.3)});`);
pop("#c3ai", grammar, 0.5); S("pop", grammar, 0.45);
tl.push(`tl.fromTo("#sq3",{autoAlpha:1,scaleX:1},{autoAlpha:0,scaleX:0,duration:0.3,ease:"power2.in",transformOrigin:"0% 50%",immediateRender:false},${benerin});`);
pop("#ok3", fx(benerin + 0.2), 0.3); S("ding", benerin + 0.2, 0.45);
pop("#c3ide", ide, 0.5); S("pop", ide, 0.5);
tl.push(`tl.fromTo("#c3ide",{scale:1},{scale:1.08,duration:0.16,yoyo:true,repeat:1,ease:"sine.inOut",immediateRender:false},${nulis});`);
tl.push(`tl.fromTo("#k3-pupils",{x:0},{x:14,duration:0.25,ease:"power2.out",immediateRender:false},${tapi});`);
blink("k3", f3.start + 1.2); blink("k3", tapi + 0.9);
sway("#k3", f3.start + 0.6, empat - 0.3);
cut("#doc3, #k3, #q3b, #st3, #bw3", f3.clear);

// ---------------------------------------------------------------- S4 depression -----------------------
const f4 = stageFrame(3, empat, deprEnd, lima);
const bars = (id, hs, color) => `<div class="bars">${hs.map((h, i) => `<i id="${id}${i}" style="height:${h}px;background:${color}"></i>`).join("")}</div>`;
lay.push(`<div id="pA" class="ct post" style="left:60px;top:400px;width:450px"><div class="tilt" style="transform:rotate(-2deg)">
  <div class="ptag" style="background:${INK}">full pake AI</div>${bars("pAb", [80, 140, 220], "#FF7A45")}
  <div id="pAl" class="plab2" style="color:#FF5A1F">VIRAL &#8599;</div></div></div>`);
lay.push(`<div id="pB" class="ct post" style="left:570px;top:400px;width:450px"><div class="tilt" style="transform:rotate(2deg)">
  <div class="ptag" style="background:${ST[3].c}">bikin sendiri</div>
  <div class="clock"><svg viewBox="0 0 60 60" width="60" height="60"><circle cx="30" cy="30" r="25" fill="#fff" stroke="${INK}" stroke-width="6"/><path id="pBhand" d="M30,30 L30,13" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M30,30 L42,30" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></svg><span><span id="c4v">0</span> jam</span></div>
  ${bars("pBb", [20, 14, 10], "#9AA5BD")}<div id="pBl" class="plab2" style="color:${ST[3].c}">sepi...</div></div></div>`);
lay.push(`<div id="cloud4" class="ct wo" style="left:300px;top:330px;width:480px;height:260px"><svg viewBox="0 0 480 260" width="480" height="260" overflow="visible">
  ${[0, 1, 2, 3, 4, 5].map((i) => `<path id="drop${i}" d="M${95 + i * 58},150 l-8,34" stroke="#5B7BE6" stroke-width="9" stroke-linecap="round"/>`).join("")}
  <path d="M90,140 Q40,140 44,100 Q50,60 100,70 Q110,20 170,24 Q210,-6 262,22 Q320,6 344,56 Q404,50 410,96 Q420,142 370,142 Z" fill="#8E98AE" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/></svg></div>`);
lay.push(`<div id="k4" class="ct char" style="left:250px;top:470px;width:580px;height:696px">${shadow}${kreator("k4", "sad")}</div>`);
top.push(`<div id="rain" class="ct wo" style="left:0;top:0;width:${W}px;height:${H}px;overflow:hidden"><svg id="rainl" viewBox="0 0 ${W} ${H + 400}" width="${W}" height="${H + 400}" style="position:absolute;top:-400px">${
  (() => { let s = 7, r = () => (s = (s * 16807) % 2147483647) / 2147483647, out = ""; for (let k = 0; k < 42; k++) { const x = Math.round(r() * W), y = Math.round(r() * 400); for (let yy = y; yy < H + 400; yy += 400) out += `<path d="M${x},${yy} l-14,70" stroke="#6D86D8" stroke-width="5" stroke-linecap="round" opacity="0.55"/>`; } return out; })()
}</svg></div>`);
M.enter("#pA", fx(f4.start + 0.05), { x: -80, y: 0 });
M.enter("#pB", fx(f4.start + 0.2), { x: 80, y: 0 });
tl.push(`tl.fromTo("#k4",{autoAlpha:0,scale:0.4,y:60},{autoAlpha:1,scale:0.52,y:0,duration:0.45,ease:"back.out(2)",transformOrigin:"50% 100%"},${fx(f4.start + 0.3)});`);
bubble("q4a", lineWords(10), { tailX: 540, color: ST[3].c, hl: ["viral"] });
bubble("q4b", lineWords(11, 12), { tailX: 540, color: ST[3].c, hl: ["4", "jam", "sepi", "fair"] });
M.exit("#q4a", fx(gueB - 0.28), { y: -20, d: 0.18 });
tl.push(`tl.fromTo("#pAb0, #pAb1, #pAb2",{scaleY:0},{scaleY:1,duration:0.5,ease:"back.out(1.8)",stagger:0.22,transformOrigin:"50% 100%"},${fullAI});`);
pop("#pAl", viral, 0.4); S("riser", viral - 0.3, 0.4);
tl.push(`tl.fromTo("#pBb0, #pBb1, #pBb2",{scaleY:0},{scaleY:1,duration:0.4,ease:"power2.out",stagger:0.1,transformOrigin:"50% 100%"},${fx(gueB + 0.2)});`);
// the counter counts the hours and finishes ON "jam": the number is one the voice says, never invented
tl.push(`tl.fromTo(C4,{v:0},{v:4,duration:${fx(jam - ngedit + 0.1)},ease:"none"},${ngedit});`);
tl.push(`tl.fromTo("#pBhand",{rotation:0},{rotation:1440,duration:${fx(jam - ngedit + 0.1)},ease:"none",svgOrigin:"30 30"},${ngedit});`);
for (let t = ngedit; t < jam + 0.1; t += 0.16) S("tick", t, 0.2);
pop("#pBl", sepi, 0.6); S("wahwah", sepi, 0.5);
// "Ga fair": the cards leave, the camera pushes in on him, the cloud arrives and it rains on everything
M.exit("#pA, #pB", fx(gaFair - 0.1), { y: -40, d: 0.25 });
tl.push(`tl.to("#k4",{scale:1,duration:0.6,ease:"power3.inOut"},${fx(gaFair)});`);
M.enter("#cloud4", fx(gaFair + 0.25), { y: -80 });
tl.push(`tl.fromTo("#drop0, #drop1, #drop2, #drop3, #drop4, #drop5",{y:0,autoAlpha:1},{y:90,autoAlpha:0,duration:0.5,ease:"none",stagger:{each:0.09,repeat:${Math.max(1, Math.floor((lima - gaFair) / 0.5))}}},${fx(gaFair + 0.45)});`);
tl.push(`tl.set("#rain",{autoAlpha:1},${fx(gaFair + 0.1)});`);
tl.push(`tl.fromTo("#rainl",{y:0},{y:400,duration:0.42,ease:"none",repeat:${Math.max(1, Math.floor((lima - gaFair) / 0.42))}},${fx(gaFair + 0.1)});`);
tl.push(`tl.to("#bg",{backgroundColor:"#AEB8CE",duration:0.8},${fx(gaFair)});`);
tl.push(`tl.fromTo("#k4-tear",{y:0,autoAlpha:1},{y:70,autoAlpha:0,duration:0.9,ease:"power1.in",repeat:1,repeatDelay:0.2,immediateRender:false},${fx(fair)});`);
S("thud", gaFair, 0.55); S("rain", gaFair + 0.1, 0.18);
cut("#k4, #q4b, #st4, #bw4, #rain", f4.clear);

// ---------------------------------------------------------------- S5 acceptance -----------------------
const f5 = stageFrame(4, lima, accEnd, mau);
tl.push(`tl.set("#cloud4",{autoAlpha:1,x:0},${f5.start});`);   // the same cloud is still over him when the wipe leaves
M.exit("#cloud4", fx(akhirnya + 0.1), { y: -160, d: 0.6 });
const NODES = ["ide", "AI", "edit", "posting"];
lay.push(`<div id="pipe5" class="ct pipe">${NODES.map((n, i) => `${i ? `<i class="arr" id="pa${i}"></i>` : ""}<span class="node" id="pn${i}">${n}</span>`).join("")}</div>`);
lay.push(`<div id="sun5" class="ct wo" style="left:590px;top:520px;width:300px;height:300px"><svg viewBox="0 0 300 300" width="300" height="300"><g id="sunrays">${Array.from({ length: 12 }, (_, i) => `<rect x="144" y="8" width="12" height="44" rx="6" fill="#F5B400" transform="rotate(${i * 30} 150 150)"/>`).join("")}</g><circle cx="150" cy="150" r="78" fill="${YEL}" stroke="${INK}" stroke-width="7"/></svg></div>`);
lay.push(`<div id="k5" class="ct char" style="left:250px;top:520px;width:560px;height:672px">${shadow}${kreator("k5", "happy")}</div>`);
const CONF = ["#FF5A5F", YEL, "#3E63DD", "#1E8453", "#7C5CE0", "#FF7A1A"];
lay.push(`<div id="conf" class="conf">${Array.from({ length: 40 }, (_, i) => `<i id="cf${i}" style="background:${CONF[i % CONF.length]}"></i>`).join("")}</div>`);
charIn("#k5", fx(f5.start + 0.05));
tl.push(`tl.fromTo("#sun5",{autoAlpha:0,y:140,scale:0.6},{autoAlpha:1,y:0,scale:1,duration:0.8,ease:"back.out(1.4)"},${fx(akhirnya + 0.3)});`);
tl.push(`tl.fromTo("#sunrays",{rotation:0},{rotation:90,duration:${fx(mau - akhirnya)},ease:"none",svgOrigin:"150 150"},${fx(akhirnya + 0.3)});`);
tl.push(`tl.to("#bg",{backgroundColor:"#F0FAF3",duration:1.0},${fx(akhirnya + 0.2)});`);
bubble("q5", lineWords(14), { tailX: 520, color: ST[4].c, hl: ["belajar", "system"], script: true, size: 74, topPx: 1200 });
S("chime", akhirnya, 0.45);
tl.push(`tl.fromTo("#k5-head",{rotation:-3},{rotation:3,duration:0.5,ease:"sine.inOut",yoyo:true,repeat:${Math.max(1, Math.floor((mau - f5.start - 1) / 0.5) - 1)},transformOrigin:"50% 90%",immediateRender:false},${fx(f5.start + 0.6)});`);
tl.push(`tl.set("#pipe5",{autoAlpha:1},${fx(belajar - 0.3)});`);
tl.push(`tl.fromTo("#pipe5 .node, #pipe5 .arr",{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:0.25,stagger:0.06,ease:"power3.out"},${fx(belajar - 0.3)});`);
const step = fx((system - belajar) / NODES.length);
NODES.forEach((_, i) => {
  const t = fx(belajar + i * step);
  tl.push(`tl.to("#pn${i}",{backgroundColor:"${ST[4].c}",color:"#fff",scale:1.12,duration:0.18,ease:"back.out(3)"},${t});`);
  tl.push(`tl.to("#pn${i}",{scale:1,duration:0.2},${fx(t + 0.2)});`);
  if (i) tl.push(`tl.to("#pa${i}",{backgroundColor:"${ST[4].c}",duration:0.15},${fx(t - 0.08)});`);
  S("blip", t, 0.3);
});
// confetti on "system": every piece flies out and falls, seeded so every render is identical
{ let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  tl.push(`tl.set("#conf",{autoAlpha:1},${system});`);
  for (let i = 0; i < 40; i++) {
    const dx = Math.round((r() - 0.5) * 1100), dy = Math.round(-200 - r() * 500), fall = Math.round(700 + r() * 500), rot = Math.round((r() - 0.5) * 1080);
    tl.push(`tl.fromTo("#cf${i}",{x:0,rotation:0},{x:${dx},rotation:${rot},duration:1.6,ease:"power2.out"},${system});`);
    tl.push(`tl.fromTo("#cf${i}",{y:0},{keyframes:[{y:${dy},duration:0.45,ease:"power2.out"},{y:${dy + fall},duration:1.15,ease:"power2.in"}]},${system});`);
  } }
S("ding", system, 0.5); S("pop", system + 0.05, 0.4); punch(system, 1.05);
tl.push(`tl.fromTo("#pipe5",{scale:1},{scale:1.06,duration:0.2,yoyo:true,repeat:1,ease:"sine.inOut",immediateRender:false},${system});`);
const ctaIn = fx(mau - 0.4), ctaOut = fx(mau - 0.02);
cut("#pipe5, #sun5, #k5, #q5, #st5, #bw5, #conf", ctaIn + 0.26);

// ---------------------------------------------------------------- CTA -------------------------------
// The offer, as a callback: the kreator's face hops from stage 01 straight to 05 on "loncat".
wipe("05", null, YEL, ctaIn, ctaOut, { numColor: WHITE });
tl.push(`tl.set("#bg",{backgroundColor:"${PAPER}"},${fx(ctaIn + 0.2)});`);
tl.push(`tl.set("#glow",{backgroundColor:"${YEL}"},${fx(ctaIn + 0.2)});`);
tl.push(`tl.set("#lay",{scale:1},${fx(ctaIn + 0.2)});`);
const qWords = lineWords(15);
lay.push(`<div id="cq" class="ct">${qWords.map((w, i) => `<span class="w${/5/.test(w.text) ? " hl" : ""}" id="cqw${i}">${esc(w.text)}</span>`).join(" ")}</div>`);
lay.push(`<div id="track" class="ct"><i class="tline"></i>${MOODS.map((m, i) => `<div class="tf" id="tf${i + 1}" style="border-color:${ST[i].c}"><span style="color:${ST[i].c}">0${i + 1}</span></div>`).join("")}<div id="hop" class="hop">${faceSvg("hopk", "happy")}</div></div>`);
lay.push(`<div id="cta" class="ct ctacard">
  <div class="c1"><span id="c1on1" class="c1on1">1-on-1</span><span class="c1b">bareng <b id="chandle">@hanifproduktif</b></span></div>
  <div id="cline" class="cline">Belajar bangun system konten AI buat akun lo sendiri.</div></div>`);
lay.push(`<div id="biob" class="ct biob"><span>Cek link di bio</span><svg id="bioarr" viewBox="0 0 40 40" width="54" height="54"><path d="M20,34 L20,8 M8,19 L20,7 L32,19" fill="none" stroke="${YEL}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`);
lay.push(`<div id="seats" class="ct seats"><span class="sl">cuma <b>3 orang</b> / minggu</span>${[0, 1, 2].map((i) => `<svg id="seat${i}" class="seat" viewBox="0 0 60 60" width="64" height="64"><circle cx="30" cy="18" r="12" fill="${ST[4].c}" stroke="${INK}" stroke-width="5"/><path d="M8,56 Q8,32 30,32 Q52,32 52,56 Z" fill="${ST[4].c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></svg>`).join("")}</div>`);
M.enter("#cq", fx(ctaOut - 0.05), { y: 30 });
qWords.forEach((w, i) => tl.push(`tl.fromTo("#cqw${i}",{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:0.22,ease:"back.out(2)"},${Math.max(at(w), ctaOut)});`));
M.enter("#track", fx(ctaOut + 0.05), { y: 30 });
// the hop: 01 -> 05 in one arc, landing ON "tahap 5"
const TF = 184;                                            // distance between stage dots
tl.push(`tl.fromTo("#hop",{x:0},{x:${4 * TF},duration:${fx(tahap5 - loncat)},ease:"power1.inOut"},${loncat});`);
tl.push(`tl.fromTo("#hop",{y:0},{keyframes:[{y:-230,duration:${fx((tahap5 - loncat) / 2)},ease:"power2.out"},{y:-112,duration:${fx((tahap5 - loncat) / 2)},ease:"power2.in"}]},${loncat});`);   // perches ON TOP of 05, the label stays readable
tl.push(`tl.fromTo("#hop",{rotation:0},{rotation:360,duration:${fx(tahap5 - loncat)},ease:"power1.inOut"},${loncat});`);
S("boing", loncat, 0.45); S("thump", tahap5, 0.5);
tl.push(`tl.fromTo("#tf5",{scale:1},{scale:1.3,duration:0.3,ease:"back.out(3)",yoyo:true,repeat:1,immediateRender:false},${tahap5});`);
tl.push(`tl.to("#tf5",{backgroundColor:"${ST[4].c}",duration:0.2},${tahap5});`);
tl.push(`tl.to("#tf5 span",{color:"#fff",duration:0.2},${tahap5});`);
tl.push(`tl.to("#tf1, #tf2, #tf3, #tf4",{opacity:0.35,duration:0.3},${tahap5});`);
M.enter("#cta", fx(bangun - 0.1), { y: 60, scale: 0.94 }); S("pop", bangun, 0.4);
tl.push(`tl.fromTo("#c1on1",{scale:1},{scale:1.15,duration:0.18,yoyo:true,repeat:1,ease:"sine.inOut",immediateRender:false},${oneOn});`);
tl.push(`tl.fromTo("#chandle",{backgroundSize:"0% 100%"},{backgroundSize:"100% 100%",duration:0.5,ease:"power2.out",immediateRender:false},${hanif});`);
M.enter("#biob", fx(cek - 0.08), { y: 40, scale: 0.9 }); S("ding", cek, 0.45);
tl.push(`tl.fromTo("#bioarr",{y:0},{y:-12,duration:0.3,ease:"sine.inOut",yoyo:true,repeat:${Math.max(1, Math.floor((TOTAL - cek - 0.4) / 0.3) - 1)},immediateRender:false},${fx(cek + 0.3)});`);
M.enter("#seats", fx(slot - 0.08), { y: 30 });
[0, 1, 2].forEach((i) => { pop(`#seat${i}`, fx(tigaOrang + i * 0.12), 0.3); S("pop", tigaOrang + i * 0.12, 0.35); });
tl.push(`tl.fromTo("#biob",{scale:1},{scale:1.05,duration:0.45,ease:"sine.inOut",yoyo:true,repeat:${Math.max(1, Math.floor((TOTAL - tigaOrang - 0.8) / 0.45) - 1)},immediateRender:false},${fx(tigaOrang + 0.6)});`);

// ---------------------------------------------------------------- lip-sync ---------------------------
// The kreator's mouth opens with the voice's loudness, only on HIS lines. A pure function of time, so any
// frame the renderer seeks to is right on its own.
const LIPS = [[2, "k1", "talk"], [3, "k1", "talk"], [5, "k2", "mouth"], [7, "k3", "talk"], [8, "k3", "talk"], [10, "k4", "talk"], [11, "k4", "talk"], [12, "k4", "talk"]]
  .map(([i, id, kind]) => [fx(LINE[i].start - 0.02), fx(LINE[i].end + 0.05), id, kind]);
const LIPIDS = [...new Set(LIPS.map((l) => `${l[2]}|${l[3]}`))];

// ---------------------------------------------------------------- audio cue sheet ---------------------
const sections = [
  { name: "hook", t: 0 }, { name: "denial", t: fx(satu - 0.22) }, { name: "anger", t: fx(dua - 0.22) }, { name: "bargaining", t: fx(tiga - 0.22) },
  { name: "depression", t: fx(empat - 0.22) }, { name: "acceptance", t: fx(lima - 0.22) }, { name: "cta", t: ctaIn },
];
fs.writeFileSync(path.join(proj, "assets/audio/cues.json"), JSON.stringify({ total: TOTAL, vo: "assets/vo/vo.wav", voStart: VO_START, sections, sfx }, null, 1));

// ---------------------------------------------------------------- HTML -------------------------------
const page = `<!doctype html>
<html lang="id"><head><meta charset="UTF-8" /><meta name="viewport" content="width=${W}, height=${H}" />
<script src="assets/vendor/gsap.min.js"></script>
<style>
@font-face{font-family:Bricolage;src:url(assets/fonts/bricolage-grotesque-latin-800-normal.woff2) format("woff2");font-weight:800}
@font-face{font-family:Jakarta;src:url(assets/fonts/plus-jakarta-sans-latin-800-normal.woff2) format("woff2");font-weight:800}
@font-face{font-family:Jakarta;src:url(assets/fonts/plus-jakarta-sans-latin-600-normal.woff2) format("woff2");font-weight:600}
@font-face{font-family:Caveat;src:url(assets/fonts/caveat-latin-700-normal.woff2) format("woff2");font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${PAPER}}
body{font-family:Jakarta,system-ui,sans-serif;font-weight:800;color:${INK};-webkit-font-smoothing:antialiased}
#root{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${PAPER}}
#bg{position:absolute;inset:0;background:${PAPER}}
#glow{position:absolute;inset:0;background:${YEL};opacity:0.28;-webkit-mask-image:radial-gradient(ellipse 70% 45% at 50% 46%,#000 0%,transparent 70%);mask-image:radial-gradient(ellipse 70% 45% at 50% 46%,#000 0%,transparent 70%)}
#dots{position:absolute;inset:0;background-image:radial-gradient(rgba(23,23,28,0.08) 2.2px,transparent 2.6px);background-size:36px 36px}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,transparent 55%,rgba(23,23,28,0.16) 100%)}
#paper{position:absolute;inset:0;pointer-events:none;opacity:0.35;mix-blend-mode:multiply;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 0.35 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")}
#scene{position:absolute;inset:0}
#cam{position:absolute;inset:0;transform-origin:50% 48%}
#lay{position:absolute;left:0;right:0;top:80px;height:${H}px;transform-origin:50% 40%}
.ct{position:absolute;opacity:0;visibility:hidden;will-change:transform}
.w{display:inline-block;opacity:0;visibility:hidden}
.bw{position:absolute;left:-200px;right:-200px;top:520px;display:flex;justify-content:center;transform:rotate(-8deg);opacity:0;visibility:hidden}
.flash{position:absolute;inset:0;opacity:0;pointer-events:none;mix-blend-mode:multiply}
.wipe{left:-200px;top:-200px;width:${W + 400}px;height:${H + 400}px;display:flex;align-items:center;justify-content:center;border-left:14px solid ${INK};border-right:14px solid ${INK}}
.wpin{display:flex;flex-direction:column;align-items:center;gap:30px;transform:skewX(9deg)}
.pill{background:${INK};color:${PAPER};font-family:Jakarta;font-size:38px;letter-spacing:0.16em;padding:14px 30px;border-radius:999px;white-space:nowrap}
#h-eyebrow{left:260px;width:560px;top:250px;text-align:center}
#h-5{top:360px}
#h-line{left:70px;right:70px;top:900px;text-align:center;font-family:Bricolage;font-size:104px;line-height:1.02;letter-spacing:-0.03em}
#h-faces{left:40px;right:40px;top:1200px;display:flex;justify-content:space-between}
.mf{width:184px;display:flex;flex-direction:column;align-items:center;gap:10px;opacity:0;visibility:hidden}
.mfh{width:176px;height:176px;border-radius:50%;border:7px solid;background:${WHITE};overflow:hidden;box-shadow:6px 6px 0 ${INK}}
.mf span{font-family:Jakarta;font-size:26px;letter-spacing:0.04em}
.stage{left:70px;right:70px;top:110px;display:flex;flex-direction:column;gap:2px}
.stage .num{font-family:Jakarta;font-size:38px;letter-spacing:0.12em;color:${MUTED}}
.stage .name{font-family:Bricolage;font-size:128px;line-height:0.95;letter-spacing:-0.02em;text-shadow:6px 6px 0 ${INK}}
.char{transform-origin:50% 100%}
.gsh{position:absolute;left:12%;right:12%;bottom:-18px;height:44px;border-radius:50%;background:rgba(23,23,28,0.22);filter:blur(4px)}
.bub{left:60px;right:60px;background:${WHITE};border:7px solid ${INK};border-radius:46px;padding:34px 44px 38px;line-height:1.24;box-shadow:12px 12px 0 ${INK};letter-spacing:-0.01em}
.bub::before{content:"";position:absolute;top:-27px;left:var(--tx);width:44px;height:44px;background:${WHITE};border-left:7px solid ${INK};border-top:7px solid ${INK};transform:rotate(45deg)}
.bub.script{font-family:Caveat;font-weight:700;line-height:1.05}
.bub .hl{font-family:Bricolage}
.bub.script .hl{font-family:Caveat}
.post>.tilt{background:${WHITE};border:7px solid ${INK};border-radius:34px;padding:26px;box-shadow:12px 12px 0 ${INK}}
.ph{display:flex;align-items:center;gap:16px;margin-bottom:22px}
.ph .av{width:64px;height:64px;border-radius:50%;background:#D8D2C6;display:block;border:5px solid ${INK}}
.ph b{display:block;height:18px;width:150px;border-radius:9px;background:#D8D2C6}
.ph b.s{width:80px}
.pimg{height:300px;border-radius:20px;border:5px solid ${INK};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.spark{font-size:120px;line-height:1;color:#fff;text-shadow:5px 5px 0 ${INK}}
.plab{font-size:40px;background:${INK};color:#fff;padding:6px 18px;border-radius:12px}
.pf{display:flex;gap:18px;align-items:center;margin-top:22px}
.pf i{display:block;width:40px;height:40px;border-radius:50%;border:5px solid ${INK}}
.pf b{display:block;flex:1;height:18px;border-radius:9px;background:#D8D2C6}
.stamp{font-family:Bricolage;font-size:150px;line-height:1;text-align:center}
.stamp>.tilt{border:14px solid;border-radius:26px;padding:10px 0 20px;background:rgba(255,253,248,0.86);letter-spacing:0.04em}
.burst{position:absolute;width:400px;height:400px;opacity:0;visibility:hidden}
.burst i{position:absolute;left:196px;top:0;width:10px;height:70px;border-radius:5px;background:${INK};transform-origin:5px 200px}
.glab{position:absolute;left:62px;top:520px;width:156px;text-align:center;font-family:Bricolage;font-size:56px;color:#2F7FD0}
.doc{background:${WHITE};border:7px solid ${INK};border-radius:30px;padding:90px 36px 30px;box-shadow:12px 12px 0 ${INK};display:flex;flex-direction:column;gap:30px}
.doc>b{display:block;height:24px;border-radius:12px;background:#D8D2C6}
.dtab{position:absolute;left:28px;top:22px;font-family:Jakarta;font-size:32px;color:${MUTED}}
.sqrow{position:relative;display:flex;align-items:center}
.sq{position:absolute;left:0;top:26px;width:78%}
.ok{position:absolute;right:6px;top:-26px;width:72px;height:72px;border-radius:50%;background:${ST[4].c};color:#fff;font-size:48px;display:flex;align-items:center;justify-content:center;border:5px solid ${INK};opacity:0;visibility:hidden}
.chips{display:flex;flex-direction:column;align-items:flex-start;gap:16px;margin-top:10px}
.chip{color:#fff;padding:12px 24px;border-radius:16px;border:5px solid ${INK};opacity:0;visibility:hidden}
.chip.ink{background:${INK}}
.chips .chip{white-space:normal;max-width:100%;font-size:34px;line-height:1.15}
.ptag{display:inline-block;color:#fff;font-size:34px;padding:8px 20px;border-radius:14px;margin-bottom:20px}
.bars{height:230px;display:flex;align-items:flex-end;gap:26px;padding:0 20px;border-bottom:7px solid ${INK}}
.bars i{display:block;flex:1;border:6px solid ${INK};border-bottom:none;border-radius:14px 14px 0 0}
.plab2{font-family:Bricolage;font-size:64px;margin-top:12px;opacity:0;visibility:hidden}
.clock{position:absolute;right:28px;top:96px;display:flex;align-items:center;gap:10px;font-size:40px}
.pipe{left:40px;right:40px;top:400px;display:flex;align-items:center;justify-content:center}
.node{font-size:46px;padding:16px 26px;border-radius:20px;border:6px solid ${INK};background:${WHITE};box-shadow:7px 7px 0 ${INK};opacity:0;visibility:hidden}
.arr{display:block;width:48px;height:10px;background:${INK};margin:0 6px;opacity:0;visibility:hidden}
.conf{position:absolute;left:540px;top:520px;width:0;height:0;opacity:0;visibility:hidden}
.conf i{position:absolute;left:-9px;top:-14px;width:18px;height:28px;border-radius:4px;border:3px solid ${INK}}
#cq{left:60px;right:60px;top:210px;text-align:center;font-family:Bricolage;font-size:108px;line-height:1.02;letter-spacing:-0.03em}
#cq .hl{color:${ST[4].c}}
#track{left:90px;width:900px;top:580px;height:190px}
.tline{position:absolute;left:60px;right:60px;top:66px;height:10px;background:${INK};border-radius:5px;display:block}
.tf{position:absolute;top:10px;width:128px;height:128px;border-radius:50%;border:8px solid;background:${WHITE};display:flex;align-items:center;justify-content:center;box-shadow:6px 6px 0 ${INK}}
${[0, 1, 2, 3, 4].map((i) => `#tf${i + 1}{left:${i * 184}px}`).join("")}
.tf span{font-family:Bricolage;font-size:52px}
.hop{position:absolute;left:4px;top:-2px;width:120px;height:120px;border-radius:50%;border:7px solid ${INK};background:#FFE3A8;overflow:hidden;box-shadow:6px 6px 0 ${INK}}
.ctacard{left:70px;right:70px;top:830px;background:${WHITE};border:8px solid ${INK};border-radius:44px;padding:44px 48px 48px;box-shadow:14px 14px 0 ${INK}}
.c1{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
.c1on1{display:inline-block;background:${ST[4].c};color:#fff;font-family:Bricolage;font-size:84px;padding:4px 30px 12px;border-radius:22px;border:6px solid ${INK}}
.c1b{font-family:Jakarta;font-size:50px}
.c1b b{font-family:Bricolage;background-image:linear-gradient(${YEL},${YEL});background-repeat:no-repeat;background-position:0 85%;background-size:0% 100%;padding:0 6px}
.cline{margin-top:28px;font-family:Jakarta;font-weight:600;font-size:46px;line-height:1.25;color:#2B2B31}
.biob{left:170px;right:170px;top:1330px;height:120px;border-radius:999px;background:${INK};color:#fff;display:flex;align-items:center;justify-content:center;gap:18px;font-family:Bricolage;font-size:62px;box-shadow:10px 10px 0 ${YEL}}
.seats{left:70px;right:70px;top:1480px;display:flex;align-items:center;justify-content:center;gap:14px}
.seats .sl{font-family:Jakarta;font-size:46px;margin-right:12px}
.seats .sl b{color:#D7263D}
.seat{opacity:0;visibility:hidden}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <div id="bgwrap" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="0"><div id="bg"></div><div id="glow"></div><div id="dots"></div><div id="vig"></div></div>
  <div id="scene" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="3">
   <div id="cam"><div id="lay">
    ${lay.join("\n    ")}
   </div>
    ${top.join("\n    ")}
   </div>
  </div>
  <div id="paperwrap" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="15"><div id="paper"></div></div>
  <audio id="mix" src="assets/audio/mix.wav" data-start="0" data-duration="${TOTAL}" data-track-index="30" data-volume="1"></audio>
</div>
<script>
  window.__timelines = window.__timelines || {};
  gsap.set(".ct, .w, .mf, .chip, .ok, .plab2, .node, .arr, .seat",{autoAlpha:0});
  // seek-safe drivers: the renderer seeks with events suppressed, so onUpdate never fires on a render.
  // A property SETTER runs on every render, however the timeline got there.
  const setter = (fn) => { const o = {}; let v = 0; Object.defineProperty(o, "v", { get: () => v, set: (x) => { v = x; fn(x); } }); return o; };
  const C4 = setter((x) => { document.getElementById("c4v").textContent = Math.floor(x); });
  const MOUTH = ${JSON.stringify(MOUTH)};
  const LIPS = ${JSON.stringify(LIPS)};
  const LIPIDS = ${JSON.stringify(LIPIDS)};
  const LIPX = setter((t) => lip(t));
  function lip(t) {
    const v = MOUTH[Math.round((t - ${VO_START}) * 30)] || 0;
    for (const k of LIPIDS) {
      const [id, kind] = k.split("|");
      const on = LIPS.some((l) => l[2] === id && t >= l[0] && t <= l[1]);
      const a = on ? Math.min(1, v) : 0;
      if (kind === "mouth") gsap.set("#" + id + "-mouth", { scaleY: 0.72 + a * 0.55, transformOrigin: "50% 0%" });
      else gsap.set("#" + id + "-talk", { scale: a, svgOrigin: "0 0" });
    }
  }
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  ${tl.join("\n  ")}
  tl.fromTo(LIPX, { v: 0 }, { v: ${TOTAL}, duration: ${TOTAL}, ease: "none" }, 0);
  window.__timelines["main"] = tl;
</script>
</body></html>
`;
fs.writeFileSync(path.join(proj, "index.html"), page);
console.log(`wrote index.html  total=${TOTAL}s  tweens=${tl.length}  sfx=${sfx.length}`);
