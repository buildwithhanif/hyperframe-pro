// clock.mjs — a READING clock for a video with no voice-over.
//
//   node clock.mjs .
//
// Writes assets/vo/audio_meta.json in the same shape tts.mjs writes, so build.mjs chains its cues to
// words exactly as it would against a real take. Pace: a word stays up long enough to be read at a
// comfortable ~3 words/s, sentences get a breath, and every "|" in script.json adds 0.3 s of hold.
import fs from "node:fs";
import path from "node:path";

const proj = process.argv[2] || ".";
const cfg = JSON.parse(fs.readFileSync(path.join(proj, "script.json"), "utf8"));
const text = cfg.scenes[0].text;

const WORD = (w) => Math.min(0.5, 0.2 + 0.024 * w.replace(/[^\p{L}\p{N}]/gu, "").length);
const SENTENCE = 0.34;   // breath after . ? !
const BAR = 0.3;         // each | in the script

const words = []; let t = 0;
for (const tok of text.split(/\s+/).filter(Boolean)) {
  if (tok === "|" || /^\|+$/.test(tok)) { t += BAR * tok.length; continue; }
  const d = WORD(tok);
  words.push({ id: `w${words.length}`, text: tok, start: +t.toFixed(3), end: +(t + d).toFixed(3) });
  t += d + 0.04;
  if (/[.?!]$/.test(tok)) t += SENTENCE;
}
const duration = +t.toFixed(3);
const meta = {
  voiceId: "reading-clock", modelId: "clock.mjs",
  scenes: [{ id: "vo", text: text.replace(/\s*\|+/g, ""), wav: null, duration, speechStart: 0, speechEnd: words.at(-1).end, words }],
};
fs.mkdirSync(path.join(proj, "assets/vo"), { recursive: true });
fs.writeFileSync(path.join(proj, "assets/vo/audio_meta.json"), JSON.stringify(meta, null, 1));
console.log(`clock: ${words.length} words, ${duration}s`);
