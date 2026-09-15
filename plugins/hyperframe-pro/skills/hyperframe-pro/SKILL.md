---
name: hyperframe-pro
description: >
  Turn a TOPIC or PROMPT into a finished vertical explainer video — script, voice-over, animation,
  captions, render. Use on "make me a video about X", "turn this topic into a reel", "prompt to video",
  "short-form explainer", "faceless video", or when someone hands over a subject and wants an MP4.
  Also handles REVISIONS to a video built this way: "edit the video", "change this line", "it's too long",
  "the hook is weak". Built on HyperFrames (HTML → MP4). This is the PRODUCTION layer: it decides what the
  video should do before any code is written, then enforces it mechanically.
---

# Hyperframe Pro

**HyperFrames tells you how to author a composition. Hyperframe Pro tells you how to ship a video people
actually watch.**

The official HyperFrames skills are the technical contract — `data-start`, GSAP timelines, the renderer.
Keep using them; this sits on top and answers different questions. What should the first two seconds do?
Is this beat in the right register? Where will people skip? How do I change one line without re-recording
the whole voice-over?

Four things here that a generic "make a video" prompt will not give you:

1. **Beats are planned before code.** A filled table of job → hero → framing, or you are decorating.
2. **A lint that fails your build** on retention problems — dead air, a screen that outstays its step, a
   hook with no hero, a stale asset dimension, a dangling animation target.
3. **Every cue is locked to a voice-over word**, never to a stopwatch. The number lands on the number.
4. **Revision surgery.** Swap one spoken line inside a finished take; cap pauses to hit a duration. No
   re-record, no re-timing by hand.

## Requirements

| Need | For |
|---|---|
| `npx hyperframes` | the renderer (compositions → MP4) |
| `ffmpeg` / `ffprobe` | audio + footage normalisation |
| node 20+, python 3.9+ | the tools in `${CLAUDE_PLUGIN_ROOT}/scripts` |
| ElevenLabs API key *(optional)* | voice-over with word timestamps → `~/.config/hyperframe-pro/.env` |
| fal.ai API key *(optional)* | photoreal plates → `~/.config/hyperframe-pro/fal.env` |

Keys live in those files, `chmod 600`, never in the repo or a skill file.

## FIRST QUESTION: new video, or a revision?

If the video already exists — "edit this", "change the CTA", "too long", a screenshot of a bad frame —
**go to `hyperframe-pro-voice` (§ Revisions) and read it before touching anything.** Two things it saves
you from immediately:

- **Edit the GENERATOR, never `index.html`.** That file is a build artifact and the HyperFrames compiler
  rewrites it in place during `check`/`render`. Hand edits are lost on the next build.
- **Most revisions need no re-record.** One line can be swapped inside an approved take; length is fixed by
  capping pauses, not by re-recording and never by speeding the audio up.

A caption change needs no render at all.

## The loop

```
topic ──▶ script ──▶ voice-over ──▶ beat plan ──▶ generator ──▶ lint ──▶ probe ──▶ check ──▶ render ──▶ QA
          (script)    (voice)        (beats)                    ▲                                    │
                                                                └──────────── fix, never re-render blind
```

1. **Topic → script** — `hyperframe-pro-script`. One continuous narration take, written for the ear.
2. **Script → voice** — `hyperframe-pro-voice`. One TTS call, word-level timestamps. Those timestamps
   become every cue in the video.
3. **Script → beats** — `hyperframe-pro-beats`. Fill the table. Decide the register of each beat.
4. **Beats → generator** — a `.mjs` that emits `index.html` with a paused GSAP timeline. The generator is
   the source of truth for the whole video.
5. **Verify cheapest-first** (below), then render.

## The verification ladder — cheapest first

A render is ~3 minutes. Most mistakes are visible long before that. Never jump straight to the render.

| Cost | Check | Catches |
|---|---|---|
| instant | `node <generator>.mjs <projectDir>` | cue words that don't exist, JS errors |
| seconds | `node ${CLAUDE_PLUGIN_ROOT}/scripts/lint.mjs <projectDir> <generator>.mjs` | dead air, dangling tweens, stale asset dims, footage wiring, the duration ceiling |
| ~30 s | the browser probe (below) | what is *actually* on screen at time t |
| ~1 min | `npx hyperframes check` | contrast, overlap, clip-element misuse, motion |
| ~3 min | render + a frame contact sheet | the truth |

**Read a contact sheet before you call anything done.** A render exiting 0 proves nothing.

```bash
ffmpeg -i renders/out.mp4 -vf "fps=1/2,scale=200:-2,tile=6x6" -frames:v 1 sheet.jpg
```

### The browser probe — verify without rendering

A stuck or missing element costs a full render cycle to discover otherwise.

```bash
cd <projectDir>
python3 - <<'PY'
s = open('index.html').read()
s = s.replace('<script src="https://cdn', '<script>window.__timelines={};</script>\n<script src="https://cdn', 1)
open('_probe.html','w').write(s)
PY
(python3 -m http.server 8777 &)     # file:// gets snapshotted by some browser tools; http:// does not
```

Open `http://127.0.0.1:8777/_probe.html` and run:

```js
const tl = window.__timelines["main"];
const els = [...document.querySelectorAll('#scene [id]')].filter(e => !/^cap-/.test(e.id));
const visible = e => { const c = getComputedStyle(e); return !(c.visibility === 'hidden' || +c.opacity < 0.02); };
[0.1,2,5,9,14,20,30,45,60].map(t => { tl.seek(t); return t + ': ' + els.filter(visible).map(e=>e.id).join(' '); }).join('\n');
```

Read it as a beat sheet: **each line should contain only the elements that beat owns.** An id on lines it
has no business on is a stuck element; an empty line is dead air.

> **Measure boxes, don't read CSS.** GSAP writes the whole `transform` property, so a CSS `rotate()` on an
> element GSAP also animates is silently discarded. `getBoundingClientRect()` tells you the truth.

## Hard rules

1. **2:59 is a ceiling (179 s).** Platforms deprioritise longer videos for non-followers, so length is a
   distribution decision, not a taste one. The lint errors above it. Fix order: cap the pauses in the
   existing take → tighten holds → rewrite and re-record. Never `atempo` to hit a number. Never cut a step
   to fit — content that genuinely needs more is two videos.
2. **The first two seconds decide the rest.** Before writing generator code, answer out loud: *what MOVES
   in the first second?* A screenshot fading in is not an answer.
3. **One continuous voice take**, never per-scene narration stitched together. See `hyperframe-pro-voice`.
4. **Every animated id must exist in the HTML.** GSAP silently no-ops on a missing target, so a beat can be
   fully written and never render. The lint checks this; it is the single most common way to lose an hour.
5. **Exits are tied to the next cue**, not to a fixed duration — start the exit ~0.42 s before the next cue
   so the frame is clear before it lands, and make sure something else is already arriving.

## Skills in this plugin

| Skill | Use it for |
|---|---|
| `hyperframe-pro-script` | topic → a script written for the ear, within the duration ceiling |
| `hyperframe-pro-beats` | script → beat plan; what each beat SHOWS and why |
| `hyperframe-pro-voice` | voice-over, word-locked cues, and all revision surgery |
| `hyperframe-pro-footage` | photoreal plates for beats a drawing cannot sell |

## What this is not

It is not a template pack and it will not invent a house style for you. It is a production discipline plus
the tools to enforce it. Your asset library, your brand, your voice and your topic judgement stay yours —
`hyperframe-pro-beats` documents the interface your own assets plug into.
