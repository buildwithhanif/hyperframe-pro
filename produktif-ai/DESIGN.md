# produktif.ai design (v2, October 2026)

Replaces the v1 brand look (cream paper, Newsreader serif, one red word). Hanif turned it down because it read as generic AI-made design. It matched the most common AI-generated look almost point for point: warm cream background, serif display, warm accent, a small label over every heading, middle-dot meta strings, mono labels, arrows on buttons and outlined cards.

## Subject

A done-for-you service that makes 60 short videos a month with a creator's AI persona. The proof is the videos themselves: Hanif's own Reels, made with his AI persona (face and voice), talking head with B-roll and captions. The page shows real video first and explains second.

## Tokens

| Name | Hex | Job |
|---|---|---|
| Paper | `#FFFFFF` | Page |
| Ink | `#000000` | Type, the primary surface for video |
| Graphite | `#55585E` | Secondary text (7.0:1 on white) |
| Rule | `#E4E5E7` | The few lines that carry structure |
| Caption yellow | `#FFD60A` | The one accent: primary button fill, the playing indicator, today's slot. Always with black text on it, never as text on white |
| Wash | `#F3F4F5` | The rare sunk panel |

Type is one family, Archivo (variable, OFL), self-hosted and subset:
- Loud display (`.hero-h`, `.h-big`, `.final-h`): weight 900, width 62 (condensed), uppercase, leading 0.84 to 0.9. It borrows from thumbnail and caption lettering, where the subject lives. Kept for the moments that carry the page: the hero, the samples, the month, the price and the close.
- Section heads (`.h2`): weight 800, width 74, sentence case. Normal volume, so the loud moments stay loud.
- Text: weight 400 to 650, width 100.
- No serif, no mono, no all-caps small labels.

## Layout and principles

- Real video leads. Every frame on the page is a real Hanif AI persona clip or a still from one, labeled "AI persona" on the frame. No mocked text-only "videos".
- One bold thing per screen: the condensed headline with the video. Everything else is quiet text on white.
- No label above headings. Headings say the thing.
- No outlined cards in rows. Structure comes from space, the grid and a few rules.
- One orchestrated moment on load (headline and hero clip). Sections don't fade in one by one.
- Buttons: yellow fill, black text, no arrow, no dot. Secondary actions are text links.
- Motion that answers a person: tap for sound, play a sample, open a question. Only one clip plays with sound at a time.
- Vary the sections. Two of them never share a layout in a row: the samples are a filmstrip, the proof is a ledger, the trust section sits on black and the close on yellow.
- On a phone, the hero clip comes straight after the headline, cropped to 4:5 like a Reel in the feed. The nav keeps the Get started button in reach.
- Clip stills are real images under the video: high priority for the hero, lazy for the rest. Video waits for the page's load event.
