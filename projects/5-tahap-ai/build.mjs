// build.mjs — "5 tahap kreator nerima AI", a drawn short built on Hyperframe Pro.
//
//   node clock.mjs . && node build.mjs . && python3 audio.py .
//
// No voice-over: the on-screen text IS the narration. clock.mjs turns script.json into a word table at
// reading pace, and every cue below is chained to a word in it with TA(), exactly as it would be to a real
// take. Swap a VO in with tts.mjs later and nothing here changes.
//
// Register: every beat is a SENSATION or a CONCEPT (denial, anger, a bad feeling about the algorithm), so
// every hero is DRAWN. There is no screen the viewer owns in this story, so no screenshot and no fake UI:
// the "posts" are abstract drawn cards, deliberately not any real app. The stage cards (#st1..#st5) are
// emotional stages, not tutorial steps, so they are not named #tN and the lint's "every step shows a real
// screen" gate does not apply to them. They still carry the running count (01 / 05), per beats gate 5.
import fs from "node:fs";
import path from "node:path";
import { makeMotion } from "../../plugins/hyperframe-pro/scripts/motion.mjs";
import { kreator, MOODS } from "./kreator.mjs";

// ---------------------------------------------------------------- PLAN -------------------------------
// `from`/`to` are WORDS in the on-screen script. See hyperframe-pro-beats.
export const PLAN = [
  { beat: "H0 contract",    from: "start",      to: "Denial",     hero: "slam:5 + five faces",          frame: "absent",  zones: "type 330-1130 / faces y1200-1420 / none", sfx: "thump, pops" },
  { beat: "S1 denial",      from: "Denial",     to: "Anger",      hero: "drawn post + SLOP stamp",      frame: "medL",    zones: "post x560-1020 y470-1070 / bubble y1240+ / char x20-540 y560-1184", sfx: "whoosh, stamp" },
  { beat: "S2 anger",       from: "Anger",      to: "Bargaining", hero: "close-up face + glass draining", frame: "close", zones: "glass x760-1050 y520-1080 / bubble y1240+ / char x0-780 y390-1200", sfx: "hit, hiss, drain" },
  { beat: "S3 bargaining",  from: "Bargaining", to: "Depression", hero: "doc: squiggle fixed + two chips",  frame: "medR",    zones: "doc x60-580 y450-1110 / bubble y1240+ / char x560-1060 y540-1140", sfx: "pop, ding" },
  { beat: "S4 depression",  from: "Depression", to: "Acceptance", hero: "counter:4 two cards, then slump under rain", frame: "wide", zones: "cards y450-1050 / bubble y1240+ / char x250-810 y500-1172", sfx: "riser, ticks, wah-wah" },
  { beat: "S5 acceptance",  from: "Acceptance", to: "Ini",        hero: "laptop + system pipeline lights", frame: "full", zones: "pipe y430-590 / bubble y1250+ / char x250-810 y560-1232", sfx: "chime, blips" },
  { beat: "C1 real story",  from: "Ini",        to: "Lo",         hero: "profile = the same kreator + BLOCKED stamp", frame: "absent", zones: "card x190-890 y430-1080 / bubble y1240+ / none", sfx: "whoosh, buzz" },
  { beat: "END question",   from: "Lo",         to: "end",        hero: "question + five faces again",  frame: "faces",   zones: "type y520-820 / faces y900-1180 / none", sfx: "pops" },
];

const proj = process.argv[2] || ".";
const meta = JSON.parse(fs.readFileSync(path.join(proj, "assets/vo/audio_meta.json"), "utf8"));
const VO = meta.scenes[0];

const W = 1080, H = 1920;
const INK = "#17171C", PAPER = "#F7F1E6", MUTED = "#6E6A63", WHITE = "#FFFDF8";
const ST = [ // one colour per stage; the background tints with it
  { name: "DENIAL",     c: "#7C5CE0", bg: "#EEE8FB", mood: "smug" },
  { name: "ANGER",      c: "#E5484D", bg: "#FCE6E3", mood: "angry" },
  { name: "BARGAINING", c: "#B86E00", bg: "#FDF0D8", mood: "unsure" },
  { name: "DEPRESSION", c: "#3E63DD", bg: "#D9E0EE", mood: "sad" },
  { name: "ACCEPTANCE", c: "#1E8453", bg: "#E0F3E8", mood: "happy" },
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
const VO_END = fx(VO_START + VO.duration);
const TOTAL = fx(VO_END + 0.2);
if (TOTAL > 179) throw new Error(`total ${TOTAL}s exceeds the 2:59 ceiling`);

const tl = [], html = [], sfx = [];
const M = makeMotion({ tl, audio: [], fx, TOTAL });
const S = (name, t, vol = 0.5) => sfx.push({ name, t: fx(Math.max(0, t - 0.06)), vol }); // lands a hair before the visual

// ---------------------------------------------------------------- cue table (chained) -----------------
const tahap    = TA("tahap", -1);
const nerima   = TA("nerima", tahap);
const denial   = TA("Denial", nerima);
const jelek    = TA("jelek", denial);
const slop     = TA("slop", jelek);
const anger    = TA("Anger", slop);
const bangsat  = TA("bangsat", anger);
const ngabis   = TA("ngabis2in", bangsat);
const air      = TA("air", ngabis);
const barg     = TA("Bargaining", air);
const gapapa   = TA("gapapa", barg);
const benerin  = TA("benerin", gapapa);
const grammar  = TA("grammar", benerin);
const editing  = TA("editing", grammar);
const tapi     = TA("tapi", editing);
const ide      = TA("ide", tapi);
const nulis    = TA("nulis", ide);
const depr     = TA("Depression", nulis);
const kok      = TA("kok", depr);
const fullAI   = TA("full", kok);
const viral    = TA("viral", fullAI);
const gueB     = TA("gue", viral);
const ngedit   = TA("ngedit", gueB);
const empat    = TA("4", ngedit);
const jam      = TA("jam", empat);
const sepi     = TA("sepi", jam);
const gaFair   = TA("ga", sepi);
const fair     = TA("fair", gaFair);
const acc      = TA("Acceptance", fair);
const akhirnya = TA("akhirnya", acc);
const belajar  = TA("belajar", akhirnya);
const jalanin  = TA("jalanin", belajar);
const system   = TA("system", jalanin);
const ini      = TA("Ini", system);
const real     = TA("real", ini);
const peserta  = TA("peserta", real);
const bahkan   = TA("Bahkan", peserta);
const block    = TA("block", bahkan);
const wkwk     = TA("wkwkwk", block);
const lo       = TA("Lo", wkwk);
const mana     = TA("mana", lo);
const stageAt = [denial, anger, barg, depr, acc];
const X = (next) => fx(next - 0.42); // exits clear the frame before the next cue lands

// words of the script between two cue times — the bubble text is literally the clock
const wordsBetween = (a, b) => VO.words.filter((w) => at(w) >= a - 0.001 && at(w) < b - 0.001);

// ---------------------------------------------------------------- helpers -----------------------------
const shake = (t, amt = 18) => tl.push(`tl.fromTo("#cam",{x:${-amt},y:${amt / 3}},{x:0,y:0,duration:0.42,ease:"elastic.out(1.2,0.28)",immediateRender:false},${fx(t)});`);
const blink = (p, t) => tl.push(`tl.fromTo("#${p}-eyes",{scaleY:1},{scaleY:0.08,duration:0.07,ease:"power1.in",yoyo:true,repeat:1,transformOrigin:"50% 50%",immediateRender:false},${fx(t)});`);
const pop = (sel, t, from = 0.4, d = 0.42) => tl.push(`tl.fromTo("${sel}",{autoAlpha:0,scale:${from}},{autoAlpha:1,scale:1,duration:${d},ease:"back.out(2.2)"},${fx(t)});`);
const faceSvg = (p, mood) => kreator(p, mood, { crop: "face" });

/** A speech bubble whose words appear on their clock times. `hl` = words that land in the stage colour. */
function bubble(id, from, to, { tailX = 300, size = 58, color = INK, hl = [], script = false, top = 1240 } = {}) {
  const ws = wordsBetween(from, to);
  const spans = ws.map((w, i) => {
    const txt = w.text.replace(/^\*/, "");
    const on = hl.some((h) => norm(txt).startsWith(norm(h)));
    return `<span class="w${on ? " hl" : ""}" id="${id}w${i}"${on ? ` style="color:${color}"` : ""}>${esc(txt)}</span>`;
  }).join(" ");
  html.push(`<div id="${id}" class="bub ct${script ? " script" : ""}" style="top:${top}px;--tx:${tailX}px;font-size:${size}px">${spans}</div>`);
  const t0 = fx(at(ws[0]) - 0.04);
  tl.push(`tl.fromTo("#${id}",{autoAlpha:0,y:40,scale:0.92},{autoAlpha:1,y:0,scale:1,duration:0.3,ease:"back.out(1.6)"},${t0});`);
  ws.forEach((w, i) => {
    const on = hl.some((h) => norm(w.text).startsWith(norm(h)));
    if (on) tl.push(`tl.fromTo("#${id}w${i}",{autoAlpha:0,scale:1.7},{autoAlpha:1,scale:1,duration:0.26,ease:"back.out(2.4)"},${at(w)});`);
    else tl.push(`tl.fromTo("#${id}w${i}",{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:0.16,ease:"power2.out"},${at(w)});`);
  });
  return { t0, n: ws.length };
}

/** Stage card: running count + the stage name, whipped in from the left. */
function stageCard(i, t, until) {
  const s = ST[i];
  html.push(`<div id="st${i + 1}" class="stage ct"><span class="num">${String(i + 1).padStart(2, "0")} / 05</span><span class="name" style="color:${s.c}">${s.name}</span></div>`);
  tl.push(`tl.fromTo("#st${i + 1}",{autoAlpha:0,x:-160,skewX:-12},{autoAlpha:1,x:0,skewX:0,duration:0.36,ease:"expo.out"},${fx(t - 0.25)});`);
  tl.push(`tl.fromTo("#st${i + 1} .name",{scaleX:1.25},{scaleX:1,duration:0.5,ease:"power3.out",transformOrigin:"0% 50%"},${fx(t - 0.25)});`);
  tl.push(`tl.to("#bg",{backgroundColor:"${s.bg}",duration:0.5,ease:"power2.inOut"},${fx(t - 0.2)});`);
  M.exit(`#st${i + 1}`, X(until), { y: -40 });
  S("whoosh", t, 0.45);
}

// ---------------------------------------------------------------- H0 hook -----------------------------
// What MOVES in the first second: the giant 5 slams in on frame 1 with a thump. By 1.4 s the five faces are up,
// so the viewer knows the length of the ride and the shape of the joke before any stage starts.
html.push(`<div id="h-eyebrow" class="ct pill">5 STAGES OF GRIEF</div>`);
// the giant 5 is the Bricolage glyph as a PATH (fontTools): as text, its em box reaches ~100 px past the ink
// and every layout check reads the eyebrow and the line under it as overlapping it.
const FIVE = "M304 -14Q227 -14 168.0 8.0Q109 30 76.0 70.5Q43 111 44 169L197 198Q202 155 233.0 134.0Q264 113 304 113Q353 113 379.5 141.0Q406 169 406 224Q406 251 400.0 272.5Q394 294 382.0 309.0Q370 324 351.5 331.5Q333 339 308 339Q294 339 281.0 335.5Q268 332 256.0 325.0Q244 318 233.5 306.0Q223 294 212 277H54L80 660H544V527H213L199 354H210Q231 402 276.0 427.5Q321 453 376 453Q441 453 484.5 425.5Q528 398 550.0 347.5Q572 297 572 227Q572 144 538.5 90.5Q505 37 444.5 11.5Q384 -14 304 -14Z";
html.push(`<div id="h-5" class="ct"><svg viewBox="30 -690 580 720" width="330" height="410" overflow="visible"><g transform="scale(1,-1)"><path d="${FIVE}" fill="#FFC928" transform="translate(26,-26)"/><path d="${FIVE}" fill="${INK}"/></g></svg></div>`);
const hookWords = wordsBetween(tahap, denial);
html.push(`<div id="h-line" class="ct">${hookWords.map((w, i) => `<span class="w" id="hlw${i}">${esc(w.text.replace(/\.$/, ""))}</span>`).join(" ")}</div>`);
html.push(`<div id="h-faces" class="ct">${MOODS.map((m, i) => `<div class="mf" id="hf${i + 1}"><div class="mfh" style="border-color:${ST[i].c}">${faceSvg(`hf${i + 1}k`, m)}</div><span style="color:${ST[i].c}">${ST[i].name}</span></div>`).join("")}</div>`);
M.slam("#h-5", 0.02, { from: 2.4, d: 0.3 }); S("thump", 0.1, 0.8);
M.enter("#h-eyebrow", 0.3, { y: -24 });
M.enter("#h-line", fx(tahap - 0.12), { y: 20 });
hookWords.forEach((w, i) => tl.push(`tl.fromTo("#hlw${i}",{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:0.2,ease:"power3.out"},${at(w)});`));
tl.push(`tl.set("#h-faces",{autoAlpha:1},${fx(nerima - 0.2)});`);
MOODS.forEach((m, i) => { pop(`#hf${i + 1}`, fx(nerima - 0.2 + i * 0.1), 0.3); S("pop", nerima - 0.2 + i * 0.1, 0.32); });
tl.push(`tl.fromTo("#h-5",{rotation:0},{rotation:-4,duration:0.9,ease:"sine.inOut",yoyo:true,repeat:1,immediateRender:false},0.6);`);
M.exit("#h-eyebrow, #h-5, #h-line, #h-faces", fx(denial - 0.3));

// ---------------------------------------------------------------- S1 denial ---------------------------
stageCard(0, denial, anger);
html.push(`<div id="k1" class="ct char" style="left:20px;top:560px;width:520px;height:624px">${kreator("k1", "smug")}</div>`);
html.push(`<div id="post1" class="ct post" style="left:560px;top:470px;width:460px"><div class="tilt" style="transform:rotate(4deg)">
  <div class="ph"><i class="av"></i><b></b><b class="s"></b></div>
  <div class="pimg" style="background:linear-gradient(135deg,#C9B8F5,#F2C6E0)"><span class="spark">&#10022;</span><span class="plab">konten AI</span></div>
  <div class="pf"><i></i><i></i><i></i><b></b></div></div></div>`);
html.push(`<div id="stamp1" class="ct stamp" style="left:585px;top:690px;width:410px;color:#D7263D;border-color:#D7263D"><div class="tilt" style="transform:rotate(-14deg)">SLOP</div></div>`);
M.enter("#k1", fx(denial + 0.15), { x: -80, y: 0 });
M.enter("#post1", fx(denial + 0.3), { x: 90, y: 0, scale: 0.9 });
bubble("q1", jelek, anger, { tailX: 250, color: ST[0].c, hl: ["slop"] });
// "jelek": the eye-roll. Pupils go up, head tips back a touch.
tl.push(`tl.fromTo("#k1-pupils",{y:0,x:0},{y:-9,x:4,duration:0.3,ease:"power2.out",yoyo:true,repeat:1,repeatDelay:0.5},${jelek});`);
tl.push(`tl.fromTo("#k1-head",{rotation:0},{rotation:-5,duration:0.4,ease:"sine.inOut",yoyo:true,repeat:1,transformOrigin:"50% 90%"},${jelek});`);
S("tick", jelek, 0.3);
M.slam("#stamp1", slop, { from: 2.6, d: 0.28 }); S("stamp", slop, 0.9); shake(fx(slop + 0.18), 22);
tl.push(`tl.fromTo("#post1 .pimg",{filter:"saturate(1)"},{filter:"saturate(0.3)",duration:0.4},${fx(slop + 0.2)});`);
tl.push(`tl.to("#post1 .spark, #post1 .plab",{autoAlpha:0,duration:0.15},${slop});`);
blink("k1", denial + 1.0); blink("k1", slop + 0.7);
M.breathe("#k1", denial + 0.5, anger - denial - 1);
M.exit("#k1, #post1, #stamp1, #q1", X(anger));

// ---------------------------------------------------------------- S2 anger ----------------------------
stageCard(1, anger, barg);
html.push(`<div id="k2" class="ct char" style="left:-10px;top:380px;width:790px;height:820px;overflow:hidden"><div style="width:790px;height:948px">${kreator("k2", "angry")}</div></div>`);
html.push(`<div id="glass2" class="ct wo" style="left:770px;top:560px;width:280px;height:520px"><svg viewBox="0 0 280 520" width="280" height="520" overflow="visible">
  <defs><clipPath id="g2clip"><path d="M40,150 L240,150 L218,500 L62,500 Z"/></clipPath></defs>
  <path d="M170,300 L170,60 Q170,30 200,30 L262,30" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M170,300 L170,60 Q170,30 200,30 L262,30" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
  <g clip-path="url(#g2clip)"><rect id="g2water" x="0" y="190" width="280" height="330" fill="#6FB1F2"/><rect id="g2wave" x="0" y="184" width="280" height="14" fill="#A9D2FA"/></g>
  <path d="M40,150 L240,150 L218,500 L62,500 Z" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <g transform="translate(206,0)"><rect x="0" y="0" width="80" height="60" rx="16" fill="${INK}"/><text x="40" y="42" text-anchor="middle" font-family="Bricolage" font-size="34" font-weight="800" fill="#fff">AI</text></g>
</svg><div class="glab">air</div></div>`);
M.enter("#k2", fx(anger + 0.12), { y: 60, scale: 0.94 });
bubble("q2", bangsat, barg, { tailX: 360, color: ST[1].c, hl: ["bangsat", "air"] });
// "bangsat": the face flushes, the fist jumps, the room shakes.
tl.push(`tl.fromTo("#k2-flush",{opacity:0.1},{opacity:0.42,duration:0.25,ease:"power2.out"},${bangsat});`);
tl.push(`tl.fromTo("#k2-fist",{y:30,rotation:8},{y:0,rotation:0,duration:0.3,ease:"back.out(3)",transformOrigin:"80% 90%"},${bangsat});`);
tl.push(`tl.fromTo("#k2-fist",{y:0},{y:-18,duration:0.14,ease:"sine.inOut",yoyo:true,repeat:5,immediateRender:false},${fx(bangsat + 0.35)});`);
S("hit", bangsat, 0.95); shake(bangsat, 26);
[1, 2, 3].forEach((n) => tl.push(`tl.fromTo("#k2-steam${n}",{y:20,autoAlpha:0,scale:0.6},{y:-40,autoAlpha:1,scale:1.1,duration:0.7,ease:"power1.out",yoyo:true,repeat:${Math.max(1, Math.floor((barg - anger - 1.4) / 0.7) - 1)},transformOrigin:"50% 50%"},${fx(anger + 0.3 + n * 0.18)});`));
S("hiss", anger + 0.4, 0.12);
// "ngabis2in air": the glass enters full, then the AI drinks it down.
M.enter("#glass2", fx(ngabis - 0.2), { x: 80, y: 0 });
tl.push(`tl.fromTo("#g2water, #g2wave",{y:0},{y:270,duration:${fx(Math.max(0.8, barg - air - 0.9))},ease:"power1.in"},${fx(air)});`);
S("drain", air, 0.55);
blink("k2", anger + 1.3);
M.exit("#k2, #glass2, #q2", X(barg));

// ---------------------------------------------------------------- S3 bargaining -----------------------
stageCard(2, barg, depr);
html.push(`<div id="doc3" class="ct doc" style="left:60px;top:450px;width:520px;height:660px">
  <div class="dtab">konten.txt</div>
  <b style="width:86%"></b><b style="width:70%"></b>
  <div class="sqrow"><b style="width:78%;margin:0"></b><svg id="sq3" class="sq" viewBox="0 0 300 20" width="300" height="20"><path d="M0,10 Q7.5,0 15,10 T30,10 T45,10 T60,10 T75,10 T90,10 T105,10 T120,10 T135,10 T150,10 T165,10 T180,10 T195,10 T210,10 T225,10 T240,10 T255,10 T270,10 T285,10 T300,10" fill="none" stroke="#E5484D" stroke-width="5"/></svg><span id="ok3" class="ok">&#10003;</span></div>
  <b style="width:90%"></b><b style="width:58%"></b>
  <div class="chips"><span id="c3ai" class="chip" style="background:${ST[2].c}">AI bantu grammar + editing</span><span id="c3ide" class="chip ink">ide &amp; tulisan tetep dari gue</span></div>
</div>`);
html.push(`<div id="k3" class="ct char" style="left:560px;top:540px;width:500px;height:600px">${kreator("k3", "unsure")}</div>`);
M.enter("#doc3", fx(barg + 0.25), { x: -80, y: 0 });
M.enter("#k3", fx(barg + 0.15), { x: 80, y: 0 });
const q3a = bubble("q3a", gapapa, tapi, { tailX: 700, color: ST[2].c, hl: ["grammar", "editing"] });
const q3b = bubble("q3b", tapi, depr, { tailX: 700, color: ST[2].c, hl: ["ide", "sendiri"] });
M.exit("#q3a", fx(tapi - 0.3), { y: -20, d: 0.18 });
tl.push(`tl.fromTo("#k3-palm",{rotation:-10},{rotation:10,duration:0.3,ease:"sine.inOut",yoyo:true,repeat:5,transformOrigin:"100% 100%"},${gapapa});`);
tl.push(`tl.fromTo("#k3-sweat",{y:0,autoAlpha:1},{y:40,autoAlpha:0,duration:0.8,ease:"power1.in",repeat:1,repeatDelay:0.4},${fx(gapapa + 0.3)});`);
pop("#c3ai", grammar, 0.5); S("pop", grammar, 0.45);
tl.push(`tl.fromTo("#sq3",{autoAlpha:1,scaleX:1},{autoAlpha:0,scaleX:0,duration:0.3,ease:"power2.in",transformOrigin:"0% 50%"},${benerin});`);
pop("#ok3", fx(benerin + 0.2), 0.3); S("ding", benerin + 0.2, 0.5);
pop("#c3ide", ide, 0.5); S("pop", ide, 0.5);
tl.push(`tl.fromTo("#c3ide",{scale:1},{scale:1.08,duration:0.16,yoyo:true,repeat:1,ease:"sine.inOut"},${nulis});`);
tl.push(`tl.fromTo("#k3-pupils",{x:0},{x:14,duration:0.25,ease:"power2.out"},${tapi});`);
blink("k3", barg + 1.2); blink("k3", tapi + 0.9);
M.breathe("#k3", barg + 0.6, depr - barg - 1);
M.exit("#doc3, #k3, #q3b", X(depr));

// ---------------------------------------------------------------- S4 depression -----------------------
stageCard(3, depr, acc);
const bars = (id, hs, color) => `<div class="bars">${hs.map((h, i) => `<i id="${id}${i}" style="height:${h}px;background:${color}"></i>`).join("")}</div>`;
html.push(`<div id="pA" class="ct post" style="left:60px;top:450px;width:460px"><div class="tilt" style="transform:rotate(-2deg)">
  <div class="ptag" style="background:${INK}">full pake AI</div>
  ${bars("pAb", [110, 190, 300], "#FF7A45")}
  <div id="pAl" class="plab2" style="color:#FF5A1F">VIRAL &#8599;</div></div></div>`);
html.push(`<div id="pB" class="ct post" style="left:560px;top:450px;width:460px"><div class="tilt" style="transform:rotate(2deg)">
  <div class="ptag" style="background:${ST[3].c}">bikin sendiri</div>
  <div class="clock"><svg viewBox="0 0 60 60" width="64" height="64"><circle cx="30" cy="30" r="25" fill="#fff" stroke="${INK}" stroke-width="6"/><path id="pBhand" d="M30,30 L30,13" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M30,30 L42,30" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></svg><span><span id="c4v">0</span> jam</span></div>
  ${bars("pBb", [22, 16, 12], "#9AA5BD")}
  <div id="pBl" class="plab2" style="color:${ST[3].c}">sepi...</div></div></div>`);
M.enter("#pA", fx(kok), { x: -80, y: 0 });
M.enter("#pB", fx(gueB - 0.1), { x: 80, y: 0 });
bubble("q4a", kok, gueB, { tailX: 290, color: ST[3].c, hl: ["viral"] });
const q4b = bubble("q4b", gueB, acc, { tailX: 780, color: ST[3].c, hl: ["4", "jam", "sepi", "fair"] });
M.exit("#q4a", fx(gueB - 0.3), { y: -20, d: 0.18 });
tl.push(`tl.fromTo("#pAb0, #pAb1, #pAb2",{scaleY:0},{scaleY:1,duration:0.5,ease:"back.out(1.8)",stagger:0.22,transformOrigin:"50% 100%"},${fx(fullAI)});`);
pop("#pAl", viral, 0.4); S("riser", viral - 0.3, 0.45);
tl.push(`tl.fromTo("#pBb0, #pBb1, #pBb2",{scaleY:0},{scaleY:1,duration:0.4,ease:"power2.out",stagger:0.1,transformOrigin:"50% 100%"},${fx(gueB + 0.2)});`);
// the counter counts the hours and finishes ON "jam" — the number is one the text says, never invented.
tl.push(`tl.to(C4,{v:4,duration:${fx(jam - ngedit + 0.1)},ease:"none",onUpdate:()=>{document.getElementById("c4v").textContent=Math.floor(C4.v);}},${ngedit});`);
tl.push(`tl.fromTo("#pBhand",{rotation:0},{rotation:1440,duration:${fx(jam - ngedit + 0.1)},ease:"none",svgOrigin:"30 30"},${ngedit});`);
for (let t = ngedit; t < jam + 0.1; t += 0.16) S("tick", t, 0.22);
pop("#pBl", sepi, 0.6); S("wahwah", sepi, 0.55);
tl.push(`tl.to("#pB",{y:14,duration:0.5,ease:"power2.in"},${fx(sepi + 0.1)});`);
// "ga fair": the cards leave and the kreator is left alone under the cloud.
M.exit("#pA, #pB", fx(gaFair - 0.1), { y: 30, d: 0.25 });
html.push(`<div id="k4" class="ct char" style="left:260px;top:500px;width:560px;height:672px">${kreator("k4", "sad")}</div>`);
html.push(`<div id="cloud4" class="ct wo" style="left:300px;top:380px;width:480px;height:260px"><svg viewBox="0 0 480 260" width="480" height="260" overflow="visible">
  ${[0, 1, 2, 3, 4, 5].map((i) => `<path id="drop${i}" d="M${95 + i * 58},150 l-8,34" stroke="#5B7BE6" stroke-width="9" stroke-linecap="round"/>`).join("")}
  <path d="M90,140 Q40,140 44,100 Q50,60 100,70 Q110,20 170,24 Q210,-6 262,22 Q320,6 344,56 Q404,50 410,96 Q420,142 370,142 Z" fill="#8E98AE" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
</svg></div>`);
M.enter("#k4", fx(gaFair + 0.12), { y: 80 });
M.enter("#cloud4", fx(gaFair + 0.1), { y: -60 });
tl.push(`tl.fromTo("#drop0, #drop1, #drop2, #drop3, #drop4, #drop5",{y:0,autoAlpha:1},{y:90,autoAlpha:0,duration:0.5,ease:"none",stagger:{each:0.09,repeat:${Math.max(1, Math.floor((acc - gaFair) / 0.5))}}},${fx(gaFair + 0.3)});`);
tl.push(`tl.fromTo("#k4-tear",{y:0,autoAlpha:1},{y:70,autoAlpha:0,duration:0.9,ease:"power1.in",repeat:1,repeatDelay:0.2},${fx(fair)});`);
S("thud", gaFair, 0.6); S("rain", gaFair + 0.2, 0.2);
M.exit("#k4, #q4b", X(acc));

// ---------------------------------------------------------------- S5 acceptance -----------------------
stageCard(4, acc, ini);
// the same cloud drifts off: the weather changes, the person does not
M.exit("#cloud4", fx(akhirnya + 0.2), { y: -120, d: 0.6 });
const NODES = ["ide", "AI", "edit", "posting"];
html.push(`<div id="pipe5" class="ct pipe">${NODES.map((n, i) => `${i ? `<i class="arr" id="pa${i}"></i>` : ""}<span class="node" id="pn${i}">${n}</span>`).join("")}</div>`);
html.push(`<div id="sun5" class="ct wo" style="left:590px;top:560px;width:300px;height:300px"><svg viewBox="0 0 300 300" width="300" height="300"><g id="sunrays">${Array.from({ length: 12 }, (_, i) => `<rect x="144" y="8" width="12" height="44" rx="6" fill="#F5B400" transform="rotate(${i * 30} 150 150)"/>`).join("")}</g><circle cx="150" cy="150" r="78" fill="#FFC928" stroke="${INK}" stroke-width="7"/></svg></div>`);
html.push(`<div id="k5" class="ct char" style="left:250px;top:560px;width:560px;height:672px">${kreator("k5", "happy")}</div>`);
M.enter("#k5", fx(acc + 0.2), { y: 60 });
tl.push(`tl.fromTo("#sun5",{autoAlpha:0,y:120,scale:0.6},{autoAlpha:1,y:0,scale:1,duration:0.8,ease:"back.out(1.4)"},${fx(akhirnya + 0.3)});`);
tl.push(`tl.fromTo("#sunrays",{rotation:0},{rotation:90,duration:${fx(ini - akhirnya)},ease:"none",svgOrigin:"150 150"},${fx(akhirnya + 0.3)});`);
bubble("q5", akhirnya, ini, { tailX: 520, color: ST[4].c, hl: ["belajar", "system"], script: true, size: 76, top: 1250 });
S("chime", akhirnya, 0.5);
tl.push(`tl.fromTo("#k5-head",{rotation:-3},{rotation:3,duration:0.5,ease:"sine.inOut",yoyo:true,repeat:${Math.max(1, Math.floor((ini - acc - 1) / 0.5) - 1)},transformOrigin:"50% 90%"},${fx(acc + 0.6)});`);
// the pipeline switches on node by node from "belajar" and is fully lit on "system"
tl.push(`tl.set("#pipe5",{autoAlpha:1},${fx(belajar - 0.3)});`);
tl.push(`tl.fromTo("#pipe5 .node, #pipe5 .arr",{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:0.25,stagger:0.06,ease:"power3.out"},${fx(belajar - 0.3)});`);
const step = fx((system - belajar) / NODES.length);
NODES.forEach((_, i) => {
  const t = fx(belajar + i * step);
  tl.push(`tl.to("#pn${i}",{backgroundColor:"${ST[4].c}",color:"#fff",scale:1.12,duration:0.18,ease:"back.out(3)"},${t});`);
  tl.push(`tl.to("#pn${i}",{scale:1,duration:0.2},${fx(t + 0.2)});`);
  if (i) tl.push(`tl.to("#pa${i}",{backgroundColor:"${ST[4].c}",duration:0.15},${fx(t - 0.08)});`);
  S("blip", t, 0.35);
});
S("ding", system, 0.55);
tl.push(`tl.fromTo("#pipe5",{scale:1},{scale:1.05,duration:0.2,yoyo:true,repeat:1,ease:"sine.inOut"},${system});`);
M.exit("#pipe5, #sun5, #k5, #q5", X(ini));

// ---------------------------------------------------------------- C1 real story -----------------------
html.push(`<div id="st6" class="ct pill big">REAL STORY</div>`);
html.push(`<div id="prof6" class="ct prof" style="left:190px;top:430px;width:700px">
  <div class="pav"><div id="pav-h" class="fc">${faceSvg("pvh", "happy")}</div><div id="pav-a" class="fc">${faceSvg("pva", "angry")}</div></div>
  <b style="width:56%"></b><b class="s" style="width:34%"></b>
  <span id="chip6" class="chip" style="background:${ST[4].c}">peserta 1-on-1</span>
</div>`);
html.push(`<div id="block6" class="ct stamp blk" style="left:150px;top:760px;width:780px"><div class="tilt" style="transform:rotate(-8deg)"><svg viewBox="0 0 60 60" width="84" height="84"><circle cx="30" cy="30" r="24" fill="none" stroke="#fff" stroke-width="8"/><path d="M13,13 L47,47" stroke="#fff" stroke-width="8"/></svg>BLOCKED</div></div>`);
html.push(`<div id="wk6" class="ct">${"wkwkwk".split("").map((c, i) => `<span id="wkc${i}">${c}</span>`).join("")}</div>`);
M.enter("#st6", fx(ini - 0.05), { y: -30 }); S("whoosh", ini, 0.45);
tl.push(`tl.to("#bg",{backgroundColor:"${PAPER}",duration:0.5},${fx(ini - 0.2)});`);
M.enter("#prof6", fx(real - 0.1), { y: 60, scale: 0.94 });
tl.push(`tl.set("#pav-a",{autoAlpha:0},${fx(real - 0.1)});`);
pop("#chip6", peserta, 0.4); S("pop", peserta, 0.5);
bubble("q6a", ini, bahkan, { tailX: 540, color: ST[4].c, hl: ["real", "peserta", "1-on-1"] });
bubble("q6b", bahkan, lo, { tailX: 540, color: "#D7263D", hl: ["block", "wkwkwk"] });
M.exit("#q6a", fx(bahkan - 0.3), { y: -20, d: 0.18 });
// "block": a hard cut to the angry face (callback to ANGER) under the stamp
tl.push(`tl.set("#pav-h",{autoAlpha:0},${block});`);
tl.push(`tl.set("#pav-a",{autoAlpha:1},${block});`);
tl.push(`tl.to("#chip6",{autoAlpha:0,duration:0.12},${block});`);
M.slam("#block6", block, { from: 2.2, d: 0.26 }); S("buzz", block, 0.7); shake(fx(block + 0.15), 20);
// "wkwkwk": the letters bounce, and the face is happy again
tl.push(`tl.set("#pav-a",{autoAlpha:0},${wkwk});`);
tl.push(`tl.set("#pav-h",{autoAlpha:1},${wkwk});`);
tl.push(`tl.set("#wk6",{autoAlpha:1},${fx(wkwk - 0.05)});`);
tl.push(`tl.fromTo("#wk6 span",{autoAlpha:0,y:60,rotation:-20},{autoAlpha:1,y:0,rotation:0,duration:0.34,ease:"back.out(3)",stagger:0.06},${wkwk});`);
tl.push(`tl.fromTo("#wk6 span",{y:0},{y:-22,duration:0.16,ease:"sine.out",yoyo:true,repeat:5,stagger:0.05,immediateRender:false},${fx(wkwk + 0.5)});`);
for (let i = 0; i < 6; i++) S("boing", wkwk + i * 0.06, 0.18);
M.exit("#st6, #prof6, #block6, #wk6, #q6b", X(lo));

// ---------------------------------------------------------------- END question ------------------------
const endWords = wordsBetween(lo, TOTAL + 1);
html.push(`<div id="endq" class="ct">${endWords.map((w, i) => `<span class="w${/mana/.test(w.text) ? " hl" : ""}" id="eqw${i}">${esc(w.text)}</span>`).join(" ")}</div>`);
html.push(`<div id="endfaces" class="ct">${MOODS.map((m, i) => `<div class="mf" id="ef${i + 1}"><div class="mfh" style="border-color:${ST[i].c}">${faceSvg(`ef${i + 1}k`, m)}</div><span style="color:${ST[i].c}">${String(i + 1).padStart(2, "0")}</span></div>`).join("")}</div>`);
M.enter("#endq", fx(lo - 0.12), { y: 30 });
endWords.forEach((w, i) => tl.push(`tl.fromTo("#eqw${i}",{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:0.22,ease:"back.out(2)"},${at(w)});`));
tl.push(`tl.set("#endfaces",{autoAlpha:1},${fx(mana + 0.2)});`);
MOODS.forEach((m, i) => { pop(`#ef${i + 1}`, fx(mana + 0.2 + i * 0.1), 0.3); S("pop", mana + 0.2 + i * 0.1, 0.3); });
tl.push(`tl.fromTo("#ef1, #ef2, #ef3, #ef4, #ef5",{y:0},{y:-24,duration:0.2,ease:"sine.out",yoyo:true,repeat:1,stagger:0.12,immediateRender:false},${fx(mana + 1.2)});`);

// ---------------------------------------------------------------- audio cue sheet ---------------------
// audio.py renders the music bed (one section per stage) and mixes every SFX at these times.
const sections = [
  { name: "hook", t: 0 }, { name: "denial", t: denial }, { name: "anger", t: anger }, { name: "bargaining", t: barg },
  { name: "depression", t: depr }, { name: "acceptance", t: acc }, { name: "story", t: ini }, { name: "end", t: lo },
];
fs.writeFileSync(path.join(proj, "assets/audio/cues.json"), JSON.stringify({ total: TOTAL, sections, sfx }, null, 1));

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
#dots{position:absolute;inset:0;background-image:radial-gradient(rgba(23,23,28,0.07) 2.2px,transparent 2.6px);background-size:36px 36px}
#paper{position:absolute;inset:0;pointer-events:none;opacity:0.35;mix-blend-mode:multiply;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 0.35 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")}
#scene{position:absolute;inset:0}
#cam{position:absolute;inset:0}
#lay{position:absolute;left:0;right:0;top:80px;height:${H}px}
.ct{position:absolute;opacity:0;visibility:hidden;will-change:transform}
.w{display:inline-block;opacity:0;visibility:hidden}
.pill{left:50%;transform:translateX(-50%);top:300px;background:${INK};color:${PAPER};font-family:Jakarta;font-size:38px;letter-spacing:0.16em;padding:14px 30px;border-radius:999px;white-space:nowrap}
.pill.big{top:200px;font-size:46px;background:#D7263D}
#h-eyebrow{left:260px;width:560px;transform:none;text-align:center}
#st6{left:300px;width:480px;transform:none;text-align:center}
#h-5{left:375px;width:330px;height:410px;top:410px}
#h-line{left:70px;right:70px;top:930px;text-align:center;font-family:Bricolage;font-size:104px;line-height:1.02;letter-spacing:-0.03em}
#h-faces,#endfaces{left:40px;right:40px;display:flex;justify-content:space-between}
#h-faces{top:1230px}
#endfaces{top:980px}
.mf{width:184px;display:flex;flex-direction:column;align-items:center;gap:10px;opacity:0;visibility:hidden}
.mfh{width:176px;height:176px;border-radius:50%;border:7px solid;background:${WHITE};overflow:hidden}
.mf span{font-family:Jakarta;font-size:26px;letter-spacing:0.04em}
#endfaces .mf span{font-family:Bricolage;font-size:44px}
.stage{left:70px;right:70px;top:140px;display:flex;flex-direction:column;gap:4px}
.stage .num{font-family:Jakarta;font-size:40px;letter-spacing:0.12em;color:${MUTED}}
.stage .name{display:inline-block;align-self:flex-start;font-family:Bricolage;font-size:148px;line-height:0.95;letter-spacing:-0.02em;text-shadow:7px 7px 0 ${INK}}
.char{transform-origin:50% 100%}
.bub{left:60px;right:60px;background:${WHITE};border:7px solid ${INK};border-radius:46px;padding:36px 44px 40px;line-height:1.24;box-shadow:12px 12px 0 ${INK};letter-spacing:-0.01em}
.bub::before{content:"";position:absolute;top:-27px;left:var(--tx);width:44px;height:44px;background:${WHITE};border-left:7px solid ${INK};border-top:7px solid ${INK};transform:rotate(45deg)}
.bub.script{font-family:Caveat;font-weight:700;line-height:1.05}
.bub .hl{font-family:Bricolage}
.bub.script .hl{font-family:Caveat}
.post{background:transparent}
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
.stamp>.tilt{border:14px solid;border-radius:26px;padding:10px 0 20px;background:rgba(255,253,248,0.82);letter-spacing:0.04em}
.stamp.blk{font-size:120px;color:#fff}
.stamp.blk>.tilt{background:#D7263D;border-color:${INK};display:flex;align-items:center;justify-content:center;gap:24px;padding:26px 0;box-shadow:14px 14px 0 ${INK}}
.glab{position:absolute;left:62px;top:520px;width:156px;text-align:center;font-family:Bricolage;font-size:56px;color:#2F7FD0}
.doc{background:${WHITE};border:7px solid ${INK};border-radius:30px;padding:90px 36px 30px;box-shadow:12px 12px 0 ${INK};display:flex;flex-direction:column;gap:30px}
.doc>b{display:block;height:24px;border-radius:12px;background:#D8D2C6}
.dtab{position:absolute;left:28px;top:22px;font-family:Jakarta;font-size:32px;color:${MUTED}}
.sqrow{position:relative;display:flex;align-items:center}
.sq{position:absolute;left:0;top:26px;width:78%}
.ok{position:absolute;right:6px;top:-26px;width:72px;height:72px;border-radius:50%;background:${ST[4].c};color:#fff;font-size:48px;display:flex;align-items:center;justify-content:center;border:5px solid ${INK};opacity:0;visibility:hidden}
.chips{display:flex;flex-direction:column;align-items:flex-start;gap:16px;margin-top:10px}
.chip{font-size:38px;color:#fff;padding:12px 24px;border-radius:16px;border:5px solid ${INK};opacity:0;visibility:hidden;white-space:nowrap}
.chip.ink{background:${INK}}
.chips .chip{white-space:normal;max-width:100%;font-size:34px;line-height:1.15}
.ptag{display:inline-block;color:#fff;font-size:38px;padding:10px 22px;border-radius:14px;margin-bottom:24px}
.bars{height:320px;display:flex;align-items:flex-end;gap:26px;padding:0 20px;border-bottom:7px solid ${INK}}
.bars i{display:block;flex:1;border:6px solid ${INK};border-bottom:none;border-radius:14px 14px 0 0}
.plab2{font-family:Bricolage;font-size:72px;margin-top:16px;opacity:0;visibility:hidden}
.clock{position:absolute;right:30px;top:118px;display:flex;align-items:center;gap:12px;font-size:44px}
.pipe{left:40px;right:40px;top:430px;display:flex;align-items:center;justify-content:center}
.node{font-size:46px;padding:16px 26px;border-radius:20px;border:6px solid ${INK};background:${WHITE};box-shadow:7px 7px 0 ${INK};opacity:0;visibility:hidden}
.arr{display:block;width:48px;height:10px;background:${INK};margin:0 6px;opacity:0;visibility:hidden}
.prof{background:${WHITE};border:7px solid ${INK};border-radius:40px;padding:50px 40px 44px;box-shadow:12px 12px 0 ${INK};display:flex;flex-direction:column;align-items:center;gap:22px}
.prof>b{display:block;height:28px;border-radius:14px;background:#D8D2C6}
.prof>b.s{height:22px}
.pav{position:relative;width:300px;height:300px;border-radius:50%;border:8px solid ${INK};background:#FFE3A8;overflow:hidden}
.fc{position:absolute;inset:0}
#chip6{font-size:44px;margin-top:6px}
#wk6{left:0;right:0;top:1050px;text-align:center;font-family:Bricolage;font-size:150px;color:#D7263D;text-shadow:8px 8px 0 ${INK};transform:rotate(-4deg)}
#wk6 span{display:inline-block}
#endq{left:60px;right:60px;top:600px;text-align:center;font-family:Bricolage;font-size:132px;line-height:1.02;letter-spacing:-0.03em}
#endq .hl{color:#D7263D}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <div id="bgwrap" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="0"><div id="bg"></div><div id="dots"></div></div>
  <div id="scene" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="3">
   <div id="cam"><div id="lay">
    ${html.join("\n    ")}
   </div></div>
  </div>
  <div id="paperwrap" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="15"><div id="paper"></div></div>
  <audio id="mix" src="assets/audio/mix.wav" data-start="0" data-duration="${TOTAL}" data-track-index="30" data-volume="1"></audio>
</div>
<script>
  window.__timelines = window.__timelines || {};
  gsap.set(".ct, .w, .mf, .chip, .ok, .plab2, .node, .arr",{autoAlpha:0});
  const C4 = { v: 0 };
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  ${tl.join("\n  ")}
  window.__timelines["main"] = tl;
</script>
</body></html>
`;
fs.writeFileSync(path.join(proj, "index.html"), page);
console.log(`wrote index.html  total=${TOTAL}s  tweens=${tl.length}  sfx=${sfx.length}`);
