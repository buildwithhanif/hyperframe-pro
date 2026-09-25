// kreator.mjs — the one drawn character in this video, in five moods.
//
//   kreator(prefix, mood, { crop })  -> an <svg> string
//
// One identity (hair, hoodie, face shape) across every stage so the viewer reads it as the SAME person
// going through the stages. Only the face and the pose change. Every animatable part gets an id prefixed
// with `prefix`, so two instances never collide:  <prefix>-eyes, -steam1..3, -tear, -fist, -palm, -head,
// and for the lip-sync: -mouth (open-mouth moods, scaled in Y) or -talk (closed-mouth moods, an oval scaled from 0).
//
// mood: smug (denial) | angry (anger) | unsure (bargaining) | sad (depression) | happy (acceptance)
// crop: "full" (head + torso, 600x720) | "face" (head only, for the mini row)

const SKIN = "#F4C8A2", SKIN_D = "#E3AE85", HAIR = "#2A201B", HOOD = "#2E3A59", HOOD_D = "#232C45", INK = "#17171C";
const RED = "#E5484D", BLUE = "#3E63DD";

const eyeWhite = (cx, cy, rx = 21, ry = 17) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${INK}" stroke-width="5"/>`;
const pupil = (cx, cy, r = 9) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${INK}"/><circle cx="${cx + 3}" cy="${cy - 3}" r="3" fill="#fff"/>`;
const line = (d, w = 8, c = INK) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

function face(p, mood) {
  switch (mood) {
    case "smug": return `
      <g id="${p}-eyes">${eyeWhite(245, 268)}${eyeWhite(355, 268)}
        <g id="${p}-pupils">${pupil(245, 272)}${pupil(355, 272)}</g>
        <path d="M222,266 A23,19 0 0 1 268,266 Z" fill="${SKIN}" stroke="${INK}" stroke-width="5"/>
        <path d="M332,266 A23,19 0 0 1 378,266 Z" fill="${SKIN}" stroke="${INK}" stroke-width="5"/></g>
      ${line("M218,232 L272,236", 10)}${line("M328,214 Q356,196 386,212", 10)}
      ${line("M262,344 Q306,356 342,326", 8)}`;
    case "angry": return `
      <g id="${p}-eyes">${eyeWhite(245, 272, 19, 15)}${eyeWhite(355, 272, 19, 15)}${pupil(247, 274, 8)}${pupil(353, 274, 8)}</g>
      ${line("M212,222 L276,248", 13)}${line("M324,248 L388,222", 13)}
      <g id="${p}-mouth"><path d="M246,318 Q300,300 354,318 Q350,390 300,392 Q250,390 246,318 Z" fill="#7A1F22" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M254,320 Q300,306 346,320 L344,334 Q300,322 256,334 Z" fill="#fff"/>
      <ellipse cx="300" cy="372" rx="26" ry="10" fill="#E0736F"/></g>
      <g stroke="${RED}" stroke-width="8" stroke-linecap="round">${line("M372,186 L384,204", 8, RED)}${line("M400,180 L388,198", 8, RED)}${line("M372,216 L384,204", 8, RED)}${line("M400,222 L388,210", 8, RED)}</g>`;
    case "unsure": return `
      <g id="${p}-eyes">${eyeWhite(245, 268)}${eyeWhite(355, 268)}<g id="${p}-pupils">${pupil(236, 270)}${pupil(346, 270)}</g></g>
      ${line("M218,220 Q244,204 272,214", 9)}${line("M328,214 Q356,204 382,220", 9)}
      ${line("M264,340 Q280,330 296,340 Q312,350 336,336", 8)}
      <path id="${p}-sweat" d="M432,178 Q448,204 440,218 Q428,230 418,216 Q412,202 432,178 Z" fill="#7FB2F0" stroke="${INK}" stroke-width="4"/>`;
    case "sad": return `
      <g id="${p}-eyes">${line("M224,272 Q245,286 266,272", 8)}${line("M334,272 Q355,286 376,272", 8)}</g>
      ${line("M220,232 L270,212", 9)}${line("M330,212 L380,232", 9)}
      ${line("M266,356 Q300,330 334,356", 8)}
      <path id="${p}-tear" d="M366,292 Q378,312 372,322 Q364,332 356,322 Q352,310 366,292 Z" fill="#7FB2F0" stroke="${INK}" stroke-width="4"/>`;
    case "happy": return `
      <g id="${p}-eyes">${line("M224,272 Q245,248 266,272", 9)}${line("M334,272 Q355,248 376,272", 9)}</g>
      ${line("M220,222 Q245,208 270,218", 9)}${line("M330,218 Q355,208 380,222", 9)}
      <g id="${p}-mouth"><path d="M250,318 Q300,386 350,318 Z" fill="#7A1F22" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M276,352 Q300,340 324,352 Q312,366 300,366 Q288,366 276,352 Z" fill="#E0736F"/></g>`;
  }
  return "";
}

function arms(p, mood) {
  const sleeve = (d) => `<path d="${d}" fill="${HOOD}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  const hand = (cx, cy, r = 30) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>`;
  switch (mood) {
    case "smug": return `
      ${sleeve("M150,600 Q300,640 452,560 L462,612 Q300,700 150,652 Z")}${hand(462, 584, 28)}
      ${sleeve("M450,600 Q300,640 148,560 L138,612 Q300,700 450,652 Z")}${hand(138, 584, 28)}`;
    case "angry": return `
      <g id="${p}-fist">${sleeve("M450,520 Q520,470 536,380 L590,396 Q580,500 480,580 Z")}
        <rect x="524" y="318" width="76" height="72" rx="24" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>
        ${line("M540,340 L584,340", 5)}${line("M540,360 L584,360", 5)}</g>`;
    case "unsure": return `
      <g id="${p}-palm">${sleeve("M150,540 Q100,480 96,400 L150,394 Q156,460 200,510 Z")}
        <ellipse cx="118" cy="372" rx="42" ry="48" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>
        ${line("M92,346 L92,318", 14, INK)}${line("M92,346 L92,318", 6, SKIN)}
        ${line("M112,336 L112,300", 14, INK)}${line("M112,336 L112,300", 6, SKIN)}
        ${line("M132,338 L134,304", 14, INK)}${line("M132,338 L134,304", 6, SKIN)}</g>`;
    case "sad": return `
      ${sleeve("M140,600 Q180,690 260,700 L262,640 Q210,630 190,570 Z")}${sleeve("M460,600 Q420,690 340,700 L338,640 Q390,630 410,570 Z")}
      <rect x="250" y="612" width="100" height="70" rx="12" fill="${INK}"/><rect x="258" y="620" width="84" height="54" rx="7" fill="#3A4468"/>
      ${hand(262, 668, 22)}${hand(338, 668, 22)}`;
    case "happy": return `
      <path d="M150,600 L450,600 L478,700 L122,700 Z" fill="#AEB6C4" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <rect x="168" y="492" width="264" height="150" rx="14" fill="#C9CFDA" stroke="${INK}" stroke-width="6"/>
      <circle cx="300" cy="566" r="16" fill="#fff" opacity="0.8"/>
      <rect x="100" y="690" width="400" height="22" rx="10" fill="#8C95A6" stroke="${INK}" stroke-width="6"/>
      ${hand(150, 668, 26)}${hand(450, 668, 26)}`;
  }
  return "";
}

export function kreator(p, mood, { crop = "full" } = {}) {
  const tilt = mood === "sad" ? `transform="translate(0,26) rotate(7 300 300)"` : mood === "angry" ? `transform="translate(0,-6)"` : "";
  const steam = mood === "angry" ? [0, 1, 2].map((i) => {
    const x = [190, 300, 410][i], y = [96, 70, 96][i];
    return `<g id="${p}-steam${i + 1}"><circle cx="${x}" cy="${y}" r="30" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="${x + 26}" cy="${y - 16}" r="22" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="${x - 20}" cy="${y - 20}" r="18" fill="#fff" stroke="${INK}" stroke-width="5"/></g>`;
  }).join("") : "";
  const head = `
    <g id="${p}-head" ${tilt}>
      <circle cx="156" cy="272" r="28" fill="${SKIN}" stroke="${INK}" stroke-width="6"/><circle cx="444" cy="272" r="28" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>
      <ellipse cx="300" cy="262" rx="146" ry="156" fill="${SKIN}" stroke="${INK}" stroke-width="7"/>
      ${mood === "angry" ? `<ellipse id="${p}-flush" cx="300" cy="262" rx="146" ry="156" fill="${RED}" opacity="0.26"/>` : mood === "sad" ? `<ellipse cx="300" cy="262" rx="146" ry="156" fill="${BLUE}" opacity="0.13"/>` : ""}
      <ellipse cx="214" cy="318" rx="24" ry="14" fill="#F28B82" opacity="${mood === "happy" ? 0.7 : 0.4}"/>
      <ellipse cx="386" cy="318" rx="24" ry="14" fill="#F28B82" opacity="${mood === "happy" ? 0.7 : 0.4}"/>
      <path d="M152,262 Q134,96 300,92 Q470,96 450,262 Q440,176 384,156 Q342,196 262,166 Q200,176 152,262 Z" fill="${HAIR}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      ${face(p, mood)}
      ${["smug", "unsure", "sad"].includes(mood) ? `<g transform="translate(${mood === "smug" ? 302 : 300},${mood === "sad" ? 346 : 340})"><g id="${p}-talk" transform="scale(0)"><ellipse cx="0" cy="0" rx="24" ry="19" fill="#7A1F22" stroke="${INK}" stroke-width="5"/><ellipse cx="0" cy="9" rx="12" ry="6" fill="#E0736F"/></g></g>` : ""}
    </g>`;
  if (crop === "face") return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="120 70 360 360" width="100%" height="100%">${head}</svg>`;
  const body = `
    <rect x="262" y="380" width="76" height="80" fill="${SKIN_D}" stroke="${INK}" stroke-width="6"/>
    <path d="M96,720 L104,572 Q112,466 232,444 L368,444 Q488,466 496,572 L504,720 Z" fill="${HOOD}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M232,444 Q300,500 368,444" fill="${HOOD_D}" stroke="${INK}" stroke-width="6"/>
    ${line("M276,486 L272,560", 5, "#E9E4DA")}${line("M324,486 L328,560", 5, "#E9E4DA")}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 720" width="100%" height="100%" overflow="visible">${steam}${body}${arms(p, mood)}${head}</svg>`;
}

export const MOODS = ["smug", "angry", "unsure", "sad", "happy"];
