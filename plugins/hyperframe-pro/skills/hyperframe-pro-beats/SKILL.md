---
name: hyperframe-pro-beats
description: >
  Decide what each beat of a video SHOWS before writing any generator code — the job, the hero visual, the
  framing, the zones. Includes the retention rules the lint enforces: no dead air, hero-sized heroes, a
  visual may not outstay its step, and the three registers a hook can be in. Use after the script exists
  and before the generator, or when a finished video "looks like slides" / "feels like decoration".
---

# Beats: decide before you code

The step that separates an edited video from decorated text. Fill the table first. A model that designs
while coding produces one layout reused for every beat, which is exactly what "it looks like slides" means.

## 1. The beat's JOB decides its HERO — never the other way round

| The narration in this window is… | job | hero |
|---|---|---|
| an **event happening to the viewer** (stolen, lost, hacked, a bill arriving) | the event | a **photoreal plate** — see `hyperframe-pro-footage`. Trim so the action lands ON its cue word |
| the viewer's **situation** ("your storage is full") | recognition | a **real screenshot**, in this priority: (1) the screen the OS shows them *unprompted* — an alert, a banner; (2) the status screen they open to check; (3) the settings page they must navigate to |
| a **sensation**, not a screen (hot, slow, laggy, battery drain) | recognition | drawn/vector object + a counter or slam. Do NOT hunt for a warning dialog that "might exist" |
| things they're told **not to buy** | cancelled purchase | sibling chips with the label and — only if the narration says a price — the price, struck through together on the dismissal word. One gesture, not two |
| "N steps / N ways" | contract | the giant N. Sets the length before step one so nobody wonders how long this is |
| "but actually… / padahal…" | reversal | a two-word slam, hero colour on the second word |
| a result number | reveal | a counter that counts, in its own column |
| a tip that names a screen | tip · recognition | a **real screenshot**, cropped to the rows the beat is about |
| the total | sum | a recap of the minis you actually showed. **If the parts don't add up, don't show a total** |
| the closing line | close | the line plus one object that IS the thing mentioned |

### The three registers — get this wrong and nothing else saves the beat

| The beat is… | Hero | Why |
|---|---|---|
| a **threat** — something taken, lost, broken into | **photoreal** | it has to reach the danger reflex; a drawing cannot |
| a **screen** — "you've seen this screen" | **real screenshot** | the viewer owns the real one; a drawn or generated UI is subtly wrong and reads as a lie |
| a **sensation** or a **concept** | **drawn** | nothing to photograph, no screen to show |

A beat can be executed perfectly in the wrong register and still fail. Ask which register the beat is in
before asking how to make it look good.

**Recognition test:** would the viewer say *"that's my phone's screen"*? Then it is a screenshot, never an
icon. And a screenshot is only for a screen the viewer has actually opened.

## 2. The table — fill it, then paste it as `PLAN` in your generator

| beat | from cue | to cue | hero | framing | zones: media / type / character | one annotation | SFX |
|---|---|---|---|---|---|---|---|
| B1 hook | start | word 1 of sentence 2 | shot:alert | absent | media 70-1010 × 400-1425 / none / none | ring on the value | whoosh, thump |
| B2 reversal | … | … | slam | bustR | none / full width 300-620 / x334-1130 y700-1600 | speedlines on the accusation | bass-hit |

`from`/`to` are **words in the narration**, never timestamps. The generator resolves them against the
voice-over's word table, so the video re-times itself if the take changes.

**Declare three zones per beat — media, type, character — and let nothing cross.** Text sitting on a
character's head is a zone collision, not a font problem.

## 3. Gates the lint enforces

1. **No dead air, anywhere.** Any stretch > 1.2 s with nothing hero-sized on screen is an error. That is
   where people skip. It applies to the whole video, not just the hook.
2. **A hero gets the frame.** ≥ 800 px wide on a 1080-wide canvas, or a crop tight enough that the beat's
   key line clears ~46 px on screen. If a card and a type column will not both fit, crop the screenshot
   down to the rows that matter and put the type in a **bottom strip that changes while the screen holds** —
   do not shrink the screen to make room for words.
3. **Nothing outstays its step.** A visible window crossing a later title card is the "stuck on one
   screenshot" bug — the step changed and the screen did not.
4. **Every numbered step shows a real screen.** A breadcrumb-only step is allowed only when no clean
   screenshot exists, and the PLAN row must say so: `hero: "crumbs", fallback: "<why>"`.
5. **Title cards carry a running count** (`03 / 09`). Three minutes in, the viewer must know where they are.
6. **Every counter is a number the narration speaks.**
7. **No third-party identity on screen** — no name, handle, phone number, email or personal album title in
   a screenshot, and no vendor's sample account from a marketing mockup. Crop above contact lists, or pick
   another source. This is the fastest way to look careless.
8. **Measure callouts, never eyeball them.** `scripts/shots.py rows <img>` prints copyable bands. A position
   read off a scaled preview silently applies the preview's scale factor.
9. **Callout geometry:** an ellipse encloses a POINT, a rectangle encloses a ROW. An ellipse is widest at
   mid-height — exactly where a list row's text sits — so its stroke cuts through the words.
10. **Exits start ~0.42 s before the next cue**, and the next thing is already arriving. Clearing the frame
    early and leaving it empty is how gate 1 gets violated.

## 4. Sourcing real screenshots

Official support pages, the vendor's own help docs, and reputable how-to sites with clean step images.
Never a watermarked press shot, never the wrong OS chrome for the platform you're describing.

**If it is an OS screen and you have a simulator or emulator, use it.** A clean simulator has no account
signed in and no personal data, so captures are free of the third-party-identity problem *by construction*,
and come out sharper than anything on the web. Try that before declaring a step has no screenshot.

```bash
S=${CLAUDE_PLUGIN_ROOT}/scripts/shots.py
python3 $S find  "<article-url>"            # list candidate image URLs
python3 $S fetch "<img-url>" raw/a.jpg      # full-res download
python3 $S sheet raw/sheet.jpg raw/*.jpg    # LOOK at them before choosing
python3 $S rows  raw/a.jpg                  # copyable y-bands for callouts
python3 $S crop  raw/a.jpg out.png 0 270 1080 1290 --paint 625,335,875,395
python3 $S check out.png 800 60             # is the key line ≥ 46 px on frame?
```

Paint out any number in the source that contradicts the narration, and log every image's provenance in
`publish/sources.txt`. If you cannot say where an image came from, do not ship it.
