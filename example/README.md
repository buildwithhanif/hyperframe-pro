# Worked example

A tiny, complete build so the system is not vapourware. It renders with **no API keys** — the voice-over is
a synthetic tone track with a hand-written word table, so the cue-chaining and the lint are real even though
the audio is not.

```bash
cd example
node build.mjs .                                            # generator -> index.html
node ../plugins/hyperframe-pro/scripts/lint.mjs . build.mjs # the retention checks
npx hyperframes check                                       # the composition checks
npx hyperframes render                                      # MP4
```

## What to look at

**`build.mjs`** — the shape every generator in this system follows:

- a `PLAN` array at the top: one row per beat, `from`/`to` are **words**, not timestamps
- a cue table built with chained `TA(word, after)` calls
- beats that place elements and tween them against those cues
- one HTML template at the bottom with a paused GSAP timeline on `window.__timelines`

**Then break it on purpose** — the fastest way to understand what the lint buys you:

| Break this | What the lint says |
|---|---|
| delete `<div id="n23">` but keep its tween | `#n23 is animated but no element with that id exists` |
| move a beat's exit 3 s earlier | `dead air … that is where viewers skip` |
| extend a card past the next title card | `stays on frame across N later title card(s)` |
| pad the fake VO table past 179 s | `exceeds the 2:59 hard ceiling` |

Each of those is a real bug that shipped once.

## Using it for real

Replace the fake voice table with a real take:

```bash
node ../plugins/hyperframe-pro/scripts/tts.mjs script.json assets/vo
```

`audio_meta.json` has the same shape, so `build.mjs` works unchanged — that is the point of anchoring cues
to words. Then read `hyperframe-pro-beats` and plan your own beats before writing more code.
