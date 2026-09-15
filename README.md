# Hyperframe Pro

**A production layer for [HyperFrames](https://hyperframes.heygen.com). Give it a topic; get a vertical
explainer video people actually watch.**

HyperFrames turns HTML into MP4 and its own skills are the technical contract — `data-start`, GSAP
timelines, the renderer. Keep using them. This sits on top and answers the questions they don't:

> What should the first two seconds do? Is this beat in the right register? Where will people skip?
> How do I change one line without re-recording the whole voice-over?

MIT licensed. Bring your own assets, brand and topic judgement.

---

## Why this exists

Ask any capable model to "make a video about X" and you get decorated text: a stock layout reused every
beat, narration recorded per scene with audible seams, cues placed by stopwatch that drift the moment the
script changes, and no way to tell whether it's any good short of watching all three minutes.

Hyperframe Pro is the opposite discipline, and four things make it different:

**1. Beats are planned before code.** A filled table of job → hero → framing. Decide what a beat *shows*
and why, then write the generator. Designing while coding is what produces "it looks like slides".

**2. A lint that fails your build.** Not style warnings — retention failures:

```
✗ dead air 24.68–25.98 s (1.3 s with nothing hero-sized on screen) — that is where viewers skip
✗ #c1c stays on frame 41.9–118.4 s, across 6 later title cards — one visual spanning several steps
✗ #price1 is animated but no element with that id exists — the beat silently never renders
✗ #esim: the card draws this image at ratio 2.068 but esim.png is 540x660 — the card is stretched
✗ total 3:13.5 exceeds the 2:59 ceiling — platforms will not push it to a new audience
```

Every one of those is a bug that shipped once and cost a re-render to find.

**3. Every cue is locked to a voice-over word**, never a stopwatch. One continuous take with word-level
timestamps; cues resolve as "the next occurrence of this word after the previous cue". The number lands on
the number, the title card lands on "three", and the video re-times itself when the script changes.

**4. Revision surgery.** Swap one spoken line inside a finished take — same voice, prosody matched to the
sentences either side, level-matched to its neighbours, everything downstream re-timed. Or cap the pauses
in an approved take to bring a 3:10 cut under 2:59 without re-recording a word.

---

## Install

```bash
claude plugin marketplace add buildwithhanif/hyperframe-pro
claude plugin install hyperframe-pro@hyperframe-pro
```

Or point any coding agent at this repo and tell it to follow
`plugins/hyperframe-pro/skills/hyperframe-pro/SKILL.md`.

**Requirements:** `npx hyperframes`, `ffmpeg`/`ffprobe`, node 20+, python 3.9+.
Optional: an ElevenLabs key (voice-over with timestamps) and a fal.ai key (photoreal plates), in
`~/.config/hyperframe-pro/.env` and `fal.env`, `chmod 600`.

---

## The loop

```
topic ──▶ script ──▶ voice-over ──▶ beat plan ──▶ generator ──▶ lint ──▶ probe ──▶ check ──▶ render
```

Verify cheapest-first. A render is ~3 minutes; almost every mistake is visible before it.

| Cost | Check | Catches |
|---|---|---|
| instant | run the generator | cue words that don't exist |
| seconds | `lint.mjs` | dead air, dangling tweens, stale dims, the duration ceiling |
| ~30 s | browser probe | what is *actually* on screen at time t |
| ~1 min | `hyperframes check` | contrast, overlap, clip misuse |
| ~3 min | render + contact sheet | the truth |

---

## Skills

| Skill | Use it for |
|---|---|
| `hyperframe-pro` | entry point — the loop, the ladder, the hard rules |
| `hyperframe-pro-script` | topic → a script written for the ear, inside the ceiling |
| `hyperframe-pro-beats` | script → beat plan; what each beat SHOWS and why |
| `hyperframe-pro-voice` | voice-over, word-locked cues, and all revision surgery |
| `hyperframe-pro-footage` | photoreal plates for beats a drawing cannot sell |

## Tools

| Script | Does |
|---|---|
| `lint.mjs` | the retention checks above |
| `trim-vo.py` | cap pauses in a finished take, sample-exact, re-timed |
| `swap-line.py` | replace one spoken line without re-recording |
| `shots.py` | find / fetch / measure / crop real screenshots |
| `fal.mjs` | photoreal stills and plates |
| `prep-footage.sh` | normalise a clip to the composition's format |
| `motion.mjs` | the motion vocabulary (enter/exit/slam/kenBurns/hold/sfx) |

---

## Three opinions this repo will not compromise on

**2:59 is a ceiling, not a target.** Longer videos get deprioritised for people who don't follow you yet, so
length is a distribution decision. The lint errors above it. Fix a long cut by capping pauses, then
tightening holds, then rewriting — never by speeding up the audio, never by dropping a step.

**Register beats polish.** A beat can be executed perfectly and still fail because it's in the wrong
register. A threat needs photoreal; a screen needs a real screenshot; a concept stays drawn. Ask which one
you're in before asking how to make it look good.

**Never fake a user interface.** Not with a generated image, not with a drawn approximation. Your viewer
owns the real one and will notice. Use a real screenshot, or don't show the screen.

---

## What this is not

Not a template pack, and it will not invent a house style for you. It is a production discipline plus the
tools to enforce it. Your asset library, brand, voice and topic judgement stay yours — the beats skill
documents the interface your own assets plug into.

Built while shipping short-form video in production. Every rule in here exists because something failed
first. MIT — do what you like with it.
