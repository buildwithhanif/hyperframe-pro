---
name: hyperframe-pro-voice
description: >
  Voice-over for a HyperFrames video, and every revision that touches it. Generate ONE continuous take with
  word-level timestamps, anchor every animation cue to a spoken word, cap pauses to hit a duration ceiling,
  and swap a single line inside a finished take without re-recording. Use for TTS, for "it's too long", for
  "change this line / the CTA", and for any edit to a video that already rendered.
---

# Voice, timing, and revisions

The voice-over is not a soundtrack laid under the animation — it is the **clock the animation runs on**.
Get one take with word-level timestamps and every cue in the video anchors to a word, so the number lands
on the number and the title card lands on "three".

## One take. Always.

One TTS call for the entire script. Not one per scene, not one per step.

Per-scene narration produces an audible seam at every join, a flat list-like delivery, and a timing model
that drifts the moment any scene changes length. One take also gives you one continuous word table, which
is what makes cue-chaining possible.

Request **word-level timestamps** (`/with-timestamps` on ElevenLabs). Without them you are placing cues by
stopwatch, and every script edit re-times the whole video by hand.

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/tts.mjs script.json <projectDir>/assets/vo
```

Writes `vo.wav` (44.1k mono, normalised) plus `audio_meta.json` carrying every word with `start`/`end`.

## Anchor cues to words, never to nth-occurrence

Resolve each cue by "the next occurrence of this word AFTER the previous cue", chained:

```js
const VO_START = 0.35;                       // a beat of air before the first word
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function TA(word, after) {                   // Time After
  for (const w of VO.words) {
    const t = +(VO_START + w.start).toFixed(3);
    if (t > after + 0.01 && norm(w.text).startsWith(norm(word))) return t;
  }
  throw new Error(`cue "${word}" after ${after}s not found`);   // this throw is the check working
}

const satu   = TA("Satu", -1);
const settings = TA("Settings", satu);       // each cue starts searching where the last one ended
const dua    = TA("Dua", settings);
```

**Never count occurrences** ("the 3rd time they say Empat"). A common word appears everywhere, and
`startsWith` on a normalised token will match a word 50 seconds earlier — firing step four's title card in
the middle of step one. Chaining makes that impossible.

When a cue throws, the script changed. That is information, not an obstacle.

## The 2:59 ceiling

179 seconds. Longer videos get deprioritised for non-followers, so this is a distribution constraint.
Fix a long cut **in this order**:

### 1. Cap the pauses in the existing take (no re-record)

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/trim-vo.py <projectDir> 0.24 0.42
```

TTS leaves 0.5–0.8 s between sentences. Capping at ~0.24 s (and ~0.42 s before a numbered step, so title
cards keep their beat) typically reclaims **10–14 s from a 3-minute take and reads better**. It splices the
existing wav sample-exactly and re-times every word from the frames actually removed.

Below ~0.18 s it starts to sound clipped. Back up `assets/vo/` first; the script does it for you.

**Verify no cut landed on speech** before rendering: peak amplitude in the 30 ms either side of each cut
should be under ~10 % of the take's peak.

### 2. Tighten holds and title-card minimums.
### 3. Only then rewrite the script and re-record.

**Never** speed the audio up with `atempo` to hit a number — it makes the voice sound wrong, and everyone
can hear it. **Never** drop a step to fit.

## Swap ONE line without re-recording

A CTA, a price or a claim changes after the voice is rendered. Do not re-record the script.

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/swap-line.py <projectDir> \
  --find "<exact phrase in the take>" --replace "<new text>" --dry-run
```

Dry-run first, always — it prints the span it matched and the surrounding context, and spends nothing.
Then run it for real. It handles the four things that are easy to get wrong:

1. generates **only** the new sentence, with the same voice/model/seed/settings **and the surrounding
   sentences passed as `previous_text` / `next_text`** so the prosody matches the take it lands in;
2. splices it in sample-exactly;
3. **level-matches** it to the speech either side — a separately normalised clip sits at a different level
   and the seam is audible;
4. re-times every downstream word by the **actual** inserted length.

Then do the parts a tool cannot:

- **Re-cue the beat.** The old words are gone, so `TA("Hubungi", …)` will throw. The tool prints the new
  cue words. Wire them in.
- **Re-do the beat's visuals.** A new line usually makes the old on-screen text wrong — or a lie. If the
  old line said "free" and the new one doesn't, the "FREE" chip has to go.
- **Update the caption** if it quoted the old line.
- **Log it** in `publish/sources.txt`: what was replaced, with what, and where the original take is backed up.

**Use the requester's wording verbatim.** If they wrote the line, ship their words — do not improve a CTA.

## Arithmetic discipline

Whenever you edit audio, **derive new timings from what was actually removed or inserted, not from what you
asked for**. Frame rounding and crossfades make those differ, and a 5 ms error per splice across 60 splices
is half a second of caption drift by the end of a three-minute video.

Corollary: apply amplitude ramps *in place* at a splice rather than consuming samples across the join, so
the arithmetic stays exact.

## Revisions: the intake table

| The ask | What to do | Re-record? | Re-render? |
|---|---|---|---|
| "too long" | cap pauses → tighten holds → rewrite | no | yes |
| "change this line" / new CTA | `swap-line.py` | one line | yes |
| "this visual is wrong" | `hyperframe-pro-beats`; check the REGISTER first | no | yes |
| "the hook doesn't grab" | usually a register problem, not polish | no | yes |
| new caption / hashtags | edit the caption file | no | **no** |
| "add a step" / "cut a step" | new script → full build | yes | yes |

Two standing rules for any revision:

- **Edit the generator, never `index.html`** — it is a build artifact the compiler rewrites.
- **Reproduce the complaint first.** Pull the frames at the timestamps in question and look. A surprising
  amount of "this is broken" turns out to be a misread contact sheet, and "fixing" it breaks something real.

After any revision, audit **the beats either side of the one you changed**. A timing shift propagates.
