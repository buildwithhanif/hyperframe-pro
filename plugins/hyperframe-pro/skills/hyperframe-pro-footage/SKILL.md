---
name: hyperframe-pro-footage
description: >
  Generate photoreal video plates for beats a drawing cannot sell — a theft, a loss, an accident — using
  fal.ai (gpt-image-2 for the first frame, minimax h3-max for the motion). Includes the prompt recipe that
  makes a plate read as real, the wiring rules for putting video into a HyperFrames composition, how to cut
  a multi-shot opening, and the safety rules that keep this from producing convincing fake evidence.
---

# Generated footage

A vector/drawn library is right for **concepts** — a toggle, an arrow, a diagram, money leaving a wallet.
It is the wrong register for a beat whose job is **fear**. A cartoon does not trigger a threat reflex no
matter how well it is animated, and that beat is usually your hook.

## Read this before generating anything

Generated footage of people and events is genuinely useful for illustrating a scenario, and genuinely
dangerous if it leaves the context that makes it obviously a dramatisation. The rules are not optional:

- **Never depict a real, identifiable person.** Keep faces indistinct — hoods, low light, high angles, backs
  of heads. This also makes the shot more universal, so it costs nothing.
- **Never generate something that could pass as a record of a real, specific event** — no real place names,
  no real dates presented as fact, no framing that implies "this footage is from an actual incident".
  Camera chrome (a timestamp, a REC dot) is a stylistic convention; it must stay decorative and must never
  be used to assert that a real thing happened at a real time.
- **Never generate a user interface.** Ever. See below — this is also a quality rule.
- **Never generate a person meant to be a real creator, brand or public figure.**
- **Log every plate** in `publish/sources.txt`: that it is generated, what it depicts, and that it is not a
  real incident. If you cannot write that line honestly, do not use the shot.

Keep the plate inside a clearly branded explainer. That context is what makes it a dramatisation rather
than a claim.

## When to use it

| The beat's job | Use |
|---|---|
| "this could happen to YOU" — theft, loss, an accident | **generated plate** |
| "here is the screen you'll see" | a **real screenshot** — never generate a UI |
| a mechanism, a path, a count, a comparison | the **drawn** library |

## The three calls

Credentials in `~/.config/hyperframe-pro/fal.env` (`chmod 600`), never in the repo.

```bash
F=${CLAUDE_PLUGIN_ROOT}/scripts/fal.mjs
node $F probe                                                    # auth check, free

# 1. the first frame (sizes must be multiples of 16; 1088x1920 for vertical)
node $F image --size 1088x1920 --out raw/fal/plate.png --prompt "…"

# 2. fix ONE thing in a frame you otherwise like, instead of re-rolling
node $F edit --image raw/fal/plate.png --out raw/fal/plate2.png --prompt "…"

# 3. animate it — max 10 s per clip, 768P by default
node $F video --image raw/fal/plate.png --duration 6 --out raw/fal/clip.mp4 --prompt "…"

# 4. make it composition-ready (trim + 1080x1920 + 30 fps + silent + upscale sharpen)
bash ${CLAUDE_PLUGIN_ROOT}/scripts/prep-footage.sh raw/fal/clip.mp4 assets/footage/name.mp4 <trimStart> <dur>
```

**Every call costs money.** Generate one, *look at it*, and iterate on the PROMPT — do not re-roll the same
prompt hoping for a better dice throw. Re-rolls are the single biggest source of waste.

**768P, not 1080P.** 1080P is exactly twice the price per second and the detail does not survive the
pipeline — the plate gets graded, sits under a scrim, is cropped to 9:16 and re-encoded at 30 fps. Compared
at 100 % crop, the two were indistinguishable.

## Prompting a plate that reads as real

The failure mode is "AI stock photo": clean, centred, well-lit, cinematic. Name the **camera**, not the
scene's beauty:

- **the rig** — "still frame from a fixed outdoor security camera, high mounted angle looking down"
- **the optics** — "wide-angle lens with barrel distortion, slightly soft focus"
- **the sensor** — "heavy low-light sensor noise and grain, crushed shadows, blown-out streetlight
  highlights, muted desaturated colour, mild motion blur on movement"
- **the register** — "documentary surveillance realism, not cinematic"
- **the safety** — "faces indistinct and not identifiable", "no text or watermarks"
- **the frame** — "vertical 9:16 composition"

### If a screen is anywhere in the shot, say it is OFF — every time

The video model *will* invent an interface. Asked for a phone with a dark screen, it produced a lock screen
with a clock and garbled pseudo-text and held it for half the clip. A fake UI in a video about software is
the one thing that destroys credibility, and viewers own the real interface. Use, verbatim:

> "The phone screen is completely black, dead and switched off for the entire shot — it never lights up, and
> no clock, icons, text, lock screen or interface of any kind ever appears on it."

Either the screen is off, or its glow is blown out and unreadable. If the beat genuinely needs screen
*content*, that is a real screenshot composited on top — never generated.

### For the motion call, lock the camera

> "Fixed security camera, completely locked off — the camera never moves, pans or zooms."

Without it the model adds a dolly-in and the surveillance illusion dies instantly.

## Wiring a clip into the composition

1. **Normalise first** with `prep-footage.sh` — models return odd sizes (768x1356, 1080x1906) at 24 fps with
   an audio track; the composition wants exactly 1080x1920 @ 30 fps, silent. The script also refuses a trim
   that would run past the end of the source, which is how a plate ends up black mid-beat.
2. **Trim so the ACTION lands on its cue word.** Find the frame where the action completes, subtract the cue
   time. This alignment is the whole point of the beat.
3. ```html
   <video class="clip footage" muted playsinline preload="auto"
          src="assets/footage/name.mp4" data-start="0" data-duration="2.54"></video>
   ```
   **`data-start`/`data-duration` own a clip element's visibility.** Never GSAP `autoAlpha` it, and never
   put `opacity:0` / `visibility:hidden` in its CSS — that renders a black frame under perfect overlays and
   the composition checker will still pass. Put the beat's tweens on the HTML overlay instead.
4. **Camera chrome is HTML, never baked into the plate** — timestamp, REC dot, brackets, scanlines,
   vignette. Baked text renders badly, cannot be corrected, and locks the plate to one video.
5. **Overlaid type needs a scrim** (an HTML gradient) or it will fail the contrast check over moving footage.

## Cutting a multi-shot opening

A single locked plate carries ~2–3 s. Past that it needs to cut. A three-shot opening, each cut landing on a
narration beat, reads as a sequence instead of a held frame:

| narration | shot | register |
|---|---|---|
| "your phone just got stolen" | the snatch, wide | security camera, locked, with chrome |
| "they switch it off" | hands, dead black screen | close, handheld |
| "everything is in their hands" | going through it, alley | medium, locked |

Two things make it hold together: **cut on the words, not on a clock**; and **keep the world consistent** —
same night, same wardrobe, same grain — so separate generations read as one incident. Chrome belongs only on
the shot that is supposed to be a camera; carrying it across every shot makes the conceit silly.

## The plate is a source of stills too

Before generating anything new, check whether the clip you already have contains the frame you need. Two
later beats were fixed with a single crop out of an existing plate — free, photoreal, and it reads as the
same incident because it is.

```bash
ffmpeg -ss <t> -i raw/fal/clip.mp4 -frames:v 1 raw/fal/still.png
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/shots.py grid raw/fal/still.png raw/fal/grid.png   # labels are SOURCE pixels
```

Measure the crop off the grid. Eyeballing a downscaled preview put one crop 300 px off and produced an
empty pavement.
