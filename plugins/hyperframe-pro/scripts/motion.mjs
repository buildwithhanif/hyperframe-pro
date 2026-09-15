// motion.mjs — the production-grade motion helpers for hyperframe-pro generators.
// Implements references/motion-vocabulary.md so a build gets the rules by default.
//
//   import { makeMotion } from "${CLAUDE_PLUGIN_ROOT}/scripts/motion.mjs";
//   const M = makeMotion({ tl, audio, fx, YEL, TOTAL, sfxDur: SFX_D });
//
// Everything emitted is seek-safe: fromTo with explicit from-states, finite repeats, absolute
// values, and a hard-kill `tl.set` after every exit (lint: gsap_exit_missing_hard_kill).

export const ease = {
  out: "power3.out",     // house settle — smooth beats bouncy
  punch: "power4.out",   // slams, hero snaps
  snap: "expo.out",      // hardest front — side snaps, whip-ins
  move: "power2.inOut",  // on-screen repositioning, camera
  drift: "sine.inOut",   // breathing, mesh, Ken Burns, anything that yoyos
  in: "power2.in",       // exits only
  none: "none",
};

// by element mass; exits multiply by EXIT_RATIO
export const dur = { micro: 0.12, ui: 0.18, card: 0.3, hero: 0.45, reveal: 0.6 };
export const EXIT_RATIO = 0.7;
export const SFX_LEAD = 0.08; // seconds the sound lands BEFORE the visual (≈2.4 frames @30fps)

/**
 * Closed-form damped spring as a GSAP ease — pure function of progress, seek-safe.
 * Ported verbatim from hyperframes-animation/adapters/gsap-easing-and-stagger.md.
 * Use BOTH the returned ease and duration; tune speed via `response`, not by overriding duration.
 */
export function springEase({ response = 0.5, dampingFraction = 1 } = {}) {
  const w = (2 * Math.PI) / response, z = dampingFraction;
  let pos;
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    pos = (t) => 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  } else if (z > 1) {
    const wo = w * Math.sqrt(z * z - 1);
    pos = (t) => 1 - Math.exp(-z * w * t) * (Math.cosh(wo * t) + ((z * w) / wo) * Math.sinh(wo * t));
  } else pos = (t) => 1 - Math.exp(-w * t) * (1 + w * t);
  const EPS = 0.001, rate = z <= 1 ? z * w : (z - Math.sqrt(z * z - 1)) * w, SCAN = 12 / rate, N = 4800;
  let T = SCAN;
  for (let i = N; i >= 0; i--) { const t = (i / N) * SCAN; if (Math.abs(1 - pos(t)) > EPS) { T = ((i + 1) / N) * SCAN; break; } }
  const xT = pos(T);
  return { duration: T, ease: (p) => pos(p * T) + p * (1 - xT) };
}

export function makeMotion({ tl, audio, fx = (n) => +n.toFixed(3), YEL = "#F5C242", TOTAL, sfxDur = {}, trackBase = 40 }) {
  let sfxN = 0;
  const M = { ease, dur, springEase };

  /** Entrance: ALWAYS ≥2 properties (opacity + y and/or scale). A lone fade is refused. */
  M.enter = (sel, at, { d = dur.card, y = 28, scale = null, e = ease.out, x = 0 } = {}) => {
    const from = { autoAlpha: 0 }, to = { autoAlpha: 1, duration: d, ease: e };
    if (y) { from.y = y; to.y = 0; }
    if (x) { from.x = x; to.x = 0; }
    if (scale != null) { from.scale = scale; to.scale = 1; }
    if (!y && !x && scale == null) { from.y = 24; to.y = 0; } // enforce rule 3
    tl.push(`tl.fromTo("${sel}",${JSON.stringify(from)},${JSON.stringify(to)},${fx(at)});`);
  };

  /** Exit: 70% of the matching entrance, ease.in, then a hard kill so seeks past it stay hidden. */
  M.exit = (sel, at, { d = dur.card * EXIT_RATIO, y = -36, e = ease.in } = {}) => {
    tl.push(`tl.to("${sel}",{y:${y},autoAlpha:0,duration:${fx(d)},ease:"${e}"},${fx(at)});`);
    tl.push(`tl.set("${sel}",{autoAlpha:0},${fx(at + d)});`);
  };

  /** Staggered group arrival — native GSAP stagger, capped so the group lands inside ~0.5 s. */
  M.stagger = (sel, at, { count = 3, d = dur.card, y = 24, scale = 0.96, e = ease.out } = {}) => {
    const each = Math.min(0.08, 0.5 / Math.max(1, count));
    tl.push(`tl.fromTo("${sel}",{autoAlpha:0,y:${y},scale:${scale}},{autoAlpha:1,y:0,scale:1,duration:${fx(d)},ease:"${e}",stagger:${fx(each)}},${fx(at)});`);
  };

  /** Slam: scale-down + blur-resolve on a punch ease. For the ONE hero word of a beat. */
  M.slam = (sel, at, { d = 0.34, from = 1.3 } = {}) => {
    tl.push(`tl.fromTo("${sel}",{autoAlpha:0,scale:${from},filter:"blur(14px)"},{autoAlpha:1,scale:1,filter:"blur(0px)",duration:${fx(d)},ease:"${ease.punch}"},${fx(at)});`);
  };

  /** Ken Burns on a held still (cards, objects — never the puppet). Alternate dir per shot. */
  M.kenBurns = (sel, at, hold, { to = 1.05, dir = 1, x = 0 } = {}) => {
    const a = dir > 0 ? 1 : to, b = dir > 0 ? to : 1;
    tl.push(`tl.fromTo("${sel}",{scale:${a},x:0},{scale:${b},x:${x},duration:${fx(hold)},ease:"${ease.drift}"},${fx(at)});`);
  };

  /** Bounded idle breath for anything held >2 s. Never on a Ken-Burnsing or scaleY-breathing element. */
  M.breathe = (sel, at, hold, { amp = 1.01, cycle = 3.2 } = {}) => {
    const reps = Math.max(0, Math.floor(hold / cycle) * 2 - 1);
    if (reps < 1) return;
    tl.push(`tl.fromTo("${sel}",{scale:1},{scale:${amp},duration:${fx(cycle / 2)},ease:"${ease.drift}",yoyo:true,repeat:${reps}},${fx(at)});`);
  };

  /** Designed stillness after a hit. Emits a label only — visible to the animation-map audit. */
  M.hold = (at, d = 0.5, label = "hold") => { tl.push(`tl.addLabel("${label}-${fx(at)}",${fx(at)}); /* hold ${fx(d)}s: nothing moves but breathing */`); };

  /** SFX that lands SFX_LEAD before the visual. Rotates tracks so no two share one. */
  M.sfxAt = (name, visualAt, vol = 0.4, { src = `assets/sfx/${name}.mp3`, lead = SFX_LEAD, track = null } = {}) => {
    const at = Math.max(0, visualAt - lead);
    const d = sfxDur[name] ?? 0.6;
    const tr = track ?? trackBase + (++sfxN % 16); // 16 lanes: a dense tutorial fires 150+ cues
    audio.push(`<audio id="sfx-${++sfxN}" src="${src}" data-start="${fx(at)}" data-duration="${d}" data-track-index="${tr}" data-volume="${vol}"></audio>`);
  };

  /** Tick loop under a counter — one short tick per step, capped at 14 so it reads as texture. */
  M.tickWhile = (from, to, { every = 0.09, vol = 0.14, name = "tick", src = "assets/sfx/tick.wav" } = {}) => {
    const n = Math.min(14, Math.floor((to - from) / every));
    for (let i = 0; i < n; i++) M.sfxAt(name, from + i * every, vol, { src, lead: 0, track: trackBase - 1 }); // on the step, own track (never collides with hits), no anticipation lead — texture, not a hit
  };

  /** The five-layer stack: CSS + HTML + tweens for mesh, grade, grain, vignette. Call once. */
  M.stack = ({ BG = "#0B0D12", accent = YEL, gradeOpacity = 0.14, grainOpacity = 0.06, W = 1080, H = 1920 } = {}) => {
    const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' seed='7'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/></filter><rect width='220' height='220' filter='url(%23n)' opacity='0.5'/></svg>")`;
    const css = `
#mesh{position:absolute;inset:0;overflow:hidden;background:${BG}}
#mesh i{position:absolute;border-radius:50%;display:block;will-change:transform}
#mesh1{width:${Math.round(W * 1.3)}px;height:${Math.round(W * 1.3)}px;left:${Math.round(-W * 0.3)}px;top:${Math.round(-W * 0.45)}px;filter:blur(60px);background:radial-gradient(circle,${accent}2E 0%,transparent 62%)}
#mesh2{width:${Math.round(W * 1.0)}px;height:${Math.round(W * 1.0)}px;right:${Math.round(-W * 0.28)}px;bottom:${Math.round(-W * 0.4)}px;filter:blur(80px);background:radial-gradient(circle,${accent}1A 0%,transparent 65%)}
#grade{position:absolute;inset:0;pointer-events:none;background:${accent};mix-blend-mode:soft-light;opacity:${gradeOpacity}}
#gradeV{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,0.10),transparent 28%,transparent 72%,rgba(0,0,0,0.20))}
#grain{position:absolute;inset:-260px;pointer-events:none;background-image:${NOISE};background-size:220px 220px;opacity:${grainOpacity};mix-blend-mode:overlay}
#vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 56%,rgba(0,0,0,0.22) 100%)}`;
    const under = `<div id="mesh" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="0"><i id="mesh1" data-layout-allow-overflow></i><i id="mesh2" data-layout-allow-overflow></i></div>`; // blobs bleed off-frame on purpose
    const over = [
      `<div id="grade" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="15"></div>`,
      `<div id="gradeV" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="15"></div>`,
      `<div id="grain" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="16"></div>`,
      `<div id="vignette" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="17"></div>`,
    ].join("\n  ");
    tl.push(`tl.fromTo("#mesh1",{x:-50,y:0},{x:50,y:-30,duration:9,ease:"${ease.drift}",yoyo:true,repeat:${Math.max(0, Math.floor(TOTAL / 9) - 1)}},0);`); // floor(dur/cycle)-1: never past data-duration (lint gsap_repeat_ceil_overshoot)
    tl.push(`tl.fromTo("#mesh2",{x:40,y:20},{x:-40,y:-20,duration:11,ease:"${ease.drift}",yoyo:true,repeat:${Math.max(0, Math.floor(TOTAL / 11) - 1)}},0);`);
    tl.push(`tl.fromTo("#grain",{backgroundPosition:"0px 0px"},{backgroundPosition:"1540px 2860px",duration:${fx(TOTAL)},ease:"none"},0);`);
    return { css, under, over };
  };

  return M;
}
