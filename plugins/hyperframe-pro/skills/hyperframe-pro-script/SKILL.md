---
name: hyperframe-pro-script
description: >
  Turn a topic, prompt or research brief into ONE continuous narration script for a short-form explainer
  video — written for the ear, hook complete in the first two seconds, sized to fit under the 2:59 ceiling.
  Use when starting a video from a subject rather than from existing copy, or when a script reads flat,
  rushed, or like someone reading a document out loud.
---

# Script: topic → one narration take

The script is the spine. Every animation cue in the finished video is anchored to a word in this take, so a
weak script cannot be rescued by motion later.

## Rule 1 — write for the EAR, not the page

The reader cannot scroll back. Anything that needs re-reading is lost.

| Don't | Do |
|---|---|
| "Navigate to Settings › General › Storage" | "Buka Settings, General, Storage" — the way a person says it |
| subordinate clauses stacked three deep | one idea per sentence |
| "approximately 23 gigabytes" | "23 giga" |
| reading out a file path or a URL | show it on screen, say the shape of it |
| a paragraph of caveats | one caveat, in the place it matters |

Read it aloud. If you run out of breath, the sentence is too long. If you can't tell where the emphasis
goes, neither can the voice model.

## Rule 2 — the hook is complete in the first two seconds

Not "starts in" — **complete**. The viewer must know, inside two seconds, what problem this is about and
that it applies to them. Three shapes that work:

- **The situation, named precisely.** "Storage HP lo penuh padahal udah dihapus semua?"
- **The event, in progress.** "Your phone just got stolen." — present tense, happening now.
- **The cancelled purchase.** Name the thing they were about to buy, then remove the need for it.

What fails: throat-clearing ("In this video we'll look at…"), a promise with no stake ("5 tips for…"), and
anything that needs a sentence of setup before the point lands.

Then pay it off. If the hook promises N things, the body delivers N things. **"Feels rushed" almost never
means the pace is too fast — it means the hook promised more than the body showed.** Count them.

## Rule 3 — length follows content, under 2:59

179 seconds is a hard ceiling, because longer videos get deprioritised for people who don't follow you yet.

Budget at roughly **3 words per second** of finished narration:

| Shape | Target | Words |
|---|---|---|
| single-concept explainer | 30–45 s | 90–135 |
| step-by-step / listicle | 90–150 s | 270–450 |
| **absolute ceiling** | **179 s** | **~500** |

Over budget? Cut *words*, never steps. A tutorial that drops step 4 to fit is a tutorial that fails the
viewer at step 4. If the content genuinely needs more than 2:59, it is two videos.

## Rule 4 — structure a step-by-step so it can be followed

Each numbered step needs, in this order:
1. **the number and a two-word name** — becomes a title card
2. **one line of "why"** — why this step exists, not just what it does
3. **the exact path**, said the way a person says it
4. **the payoff** — what changes, with a number if you have one

Never invent a number to make arithmetic work. If the steps don't add up to a total, don't state a total —
restate the promise instead. A viewer who checks and finds the sum wrong stops believing the rest.

## Rule 5 — one take, one voice, no per-scene stitching

Write it as one continuous block of prose. Not a list of scenes, not one line per shot. Per-scene narration
recorded separately produces audible seams at every join and a flat, list-like delivery — and it is the
single most common reason a finished video sounds like a robot reading a document.

Sentence-level variety is what makes a take sound human: mix a 3-word sentence against a 15-word one, and
let punctuation do the work. A question mark and a full stop produce different prosody in every decent
voice model; a comma splice produces none.

## Rule 6 — end on ONE action

One instruction, one destination. "Save this and do it tonight" beats "follow, share, comment and check the
link". If there is a link, say where it is, once.

## Output shape

```json
{
  "slug": "kebab-case-name",
  "mode": "tutorial",
  "scenes": [{ "id": "vo", "text": "the ENTIRE narration as one continuous string." }]
}
```

One scene. One string. The voice step turns it into a take plus word-level timestamps, and those timestamps
become every cue in the video — which is why the script is finished *before* anything is animated.

## Before you hand it on

- Read it aloud, timed. Does it fit the budget?
- Does the hook land inside two seconds, and does the body pay off everything it promised?
- Is every number one you can defend?
- Is there exactly one call to action?
- Does any sentence require the viewer to have caught the previous one perfectly? Rewrite it.
