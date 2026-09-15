// hyperframe-pro: ElevenLabs TTS with WORD-LEVEL TIMESTAMPS — one continuous take, loudnorm to -16 LUFS.
// The timestamps are the point: every animation cue in the finished video anchors to a word in this table.
// Usage: node ${CLAUDE_PLUGIN_ROOT}/scripts/tts.mjs <script.json> <outDir> [voiceId]
// Key: ELEVENLABS_API_KEY from the environment or ~/.config/hyperframe-pro/.env
// Writes <outDir>/<id>.mp3, <id>.wav (44.1k mono, -16 LUFS), <id>.words.json and audio_meta.json
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
const _args = process.argv.slice(2).filter((a) => a !== "--force"); // flags can appear anywhere
const FORCE = process.argv.includes("--force") || process.env.TTS_FORCE === "1"; // cache lives in <id>.words.json

const [scriptPath, outDir, voiceArg] = _args;
if (!scriptPath || !outDir) { console.error("usage: tts.mjs <script.json> <outDir> [voiceId]"); process.exit(1); }
let key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  const envf = path.join(os.homedir(), ".config/hyperframe-pro/.env");
  if (fs.existsSync(envf)) { const m = fs.readFileSync(envf, "utf8").match(/^ELEVENLABS_API_KEY=(\S+)/m); if (m) key = m[1]; }
}
if (!key) throw new Error("ELEVENLABS_API_KEY missing (env or ~/.config/hyperframe-pro/.env)");
const cfg = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
const voiceId = voiceArg || cfg.voiceId || (() => { throw new Error("no voiceId: set `voiceId` in your script.json or pass one as the 3rd arg"); })();
fs.mkdirSync(outDir, { recursive: true });

function wordsFromAlignment(al) {
  const chars = al.characters, st = al.character_start_times_seconds, en = al.character_end_times_seconds;
  const words = []; let cur = null;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (/\s/.test(c)) { if (cur) { words.push(cur); cur = null; } continue; }
    if (!cur) cur = { text: c, start: st[i], end: en[i] }; else { cur.text += c; cur.end = en[i]; }
  }
  if (cur) words.push(cur);
  return words.map((w, i) => ({ id: `w${i}`, text: w.text, start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));
}

const meta = { voiceId, modelId: cfg.modelId || "eleven_multilingual_v2", scenes: [] };
for (let i = 0; i < cfg.scenes.length; i++) {
  const sc = cfg.scenes[i];
  const mp3 = path.join(outDir, `${sc.id}.mp3`), wav = path.join(outDir, `${sc.id}.wav`), wordsPath = path.join(outDir, `${sc.id}.words.json`);
  if (!FORCE && fs.existsSync(wordsPath)) console.warn(`tts: REUSING cached take ${wordsPath} — if the script changed, re-run with --force (a mistake this cost us once)`);
  if (FORCE || !fs.existsSync(wordsPath)) {
    const body = {
      text: sc.text, model_id: meta.modelId, language_code: cfg.language || "id", seed: cfg.seed ?? 42,
      voice_settings: cfg.voiceSettings || { stability: 0.45, similarity_boost: 0.8, style: 0.25, speed: 1.08, use_speaker_boost: true },
      previous_text: cfg.scenes[i - 1]?.text, next_text: cfg.scenes[i + 1]?.text, apply_text_normalization: "auto",
    };
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST", headers: { "xi-api-key": key, "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`${sc.id}: HTTP ${r.status} ${await r.text()}`);
    const j = await r.json();
    fs.writeFileSync(mp3, Buffer.from(j.audio_base64, "base64"));
    fs.writeFileSync(wordsPath, JSON.stringify(wordsFromAlignment(j.normalized_alignment || j.alignment), null, 1));
    console.log(`tts ok ${sc.id}`);
  }
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", mp3, "-af", "loudnorm=I=-16:TP=-1.5:LRA=9:linear=true", "-ar", "44100", "-ac", "1", wav]);
  const dur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).toString());
  const words = JSON.parse(fs.readFileSync(wordsPath, "utf8"));
  meta.scenes.push({ id: sc.id, text: sc.text, wav: path.basename(wav), duration: +dur.toFixed(3), speechStart: words[0]?.start ?? 0, speechEnd: words.at(-1)?.end ?? dur, words });
}
fs.writeFileSync(path.join(outDir, "audio_meta.json"), JSON.stringify(meta, null, 1));
const total = meta.scenes.reduce((a, s) => a + s.duration, 0);
console.log(meta.scenes.map(s => `${s.id}: ${s.duration}s (${s.words.length} words)`).join("\n"));
const mode = cfg.mode || (total > 60 ? "tutorial" : "explainer"); // rule 2: length follows the content
const lim = mode === "tutorial" ? [80, 220] : [28, 40]; // 9-step builds have run 191-193s clean; the ceiling is a sanity check, not a target
const verdict = total < lim[0] ? `— SHORT for ${mode} (target ${lim[0]}–${lim[1]} s)` : total > lim[1] ? `— TOO LONG even for ${mode} (target ${lim[0]}–${lim[1]} s); cut words, never a step` : "— ok";
console.log(`total VO ${total.toFixed(2)}s [${mode}] ${verdict}`);
