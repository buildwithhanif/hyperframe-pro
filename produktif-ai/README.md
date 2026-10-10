# produktif.ai

The home page (`/`) is the waitlist for the done-for-you service: an AI persona built from the client's own face and voice, 60 talking-head Reels a month (two a day), Rp 4 juta per month. The carousel tool described below lives at `/carousel`.

## Waitlist

The form asks for a name, a WhatsApp number, an optional IG/TikTok handle, who they are and when they want to start. It posts to `/api/waitlist`, which validates the input, normalises the number to `628…` (ready for a `wa.me/` link), drops honeypot bots, rate-limits per IP, and forwards each signup as one flat JSON row to `WAITLIST_WEBHOOK_URL`:

```json
{ "name": "Ani", "whatsapp": "6281234567890", "handle": "@ani.coach", "role": "bisnis|profesional|coach|kreator|lainnya|", "start": "bulan-ini|1-3-bulan|liat-liat|", "source": "hero|footer", "created_at": "...", "secret": "..." }
```

If the webhook isn't set, the API answers 503, so signups never vanish silently. Set `DEMO_MODE=1` to accept signups locally without a webhook.

The simplest destination is a Google Sheet. In the sheet, open Extensions → Apps Script, paste this, then Deploy → New deployment → Web app, with access set to **Anyone**:

```js
const SECRET = ""; // or exactly the value of WAITLIST_WEBHOOK_SECRET

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (SECRET && d.secret !== SECRET) return reply({ ok: false, error: "forbidden" });
    SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
      .appendRow([d.created_at, d.name, "https://wa.me/" + d.whatsapp, d.handle, d.role, d.start, d.source]);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}
```

Apps Script can't send error status codes, so the app treats `{"ok": false}`, a bare `forbidden`, or an HTML error page as a failed save. The visitor sees "Gagal nyimpen" instead of a false confirmation. The two secrets must match exactly, or both be empty.

Put the web app URL in `WAITLIST_WEBHOOK_URL` and the same secret in `WAITLIST_WEBHOOK_SECRET`. Make, Zapier or n8n webhooks work the same way.

## Carousel tool (`/carousel`)

Type a topic, or paste a thread that's going viral, and get an Instagram carousel ready to post: 1080×1350 PNGs in the dark template from @hanifmuh_ (one gold anchor word, GESER pill, progress bar) plus a caption.

Before writing, the model scores the topic on four tests: wallet, villain, tomorrow, tag. A topic likely to flop gets flagged up front. Every claim the creator should verify before posting is listed separately, and the model may only use personal numbers and stories that the user typed in.

The writing rules live in `lib/prompt.ts`. They come from the 220 carousels (106.7M views in 63 days) and the viral-thread analysis behind @hanifmuh_. That file is the product, so change it carefully.

## Run it

```bash
npm install
cp .env.example .env.local   # then put your key in ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

To work on the UI without a key, set `DEMO_MODE=1` and the API returns a built-in sample deck.

| Variable | Needed | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes, in production | Calls `claude-opus-5-5` with structured output and server-side refusal fallbacks (`fallbacks: "default"`). |
| `DEMO_MODE` | no | `1` serves the sample deck and never calls the API. Never set it in production. |
| `RATE_LIMIT_PER_HOUR` | no | Generations per IP (IPv6: per /64) per hour, default 8. `0` turns generation off. |
| `GLOBAL_LIMIT_PER_HOUR` | no | Generations per server instance per hour, default 200. |
| `WAITLIST_WEBHOOK_URL` | yes, for the waitlist | Where each signup is POSTed as JSON. |
| `WAITLIST_WEBHOOK_SECRET` | no | Sent as `secret` in each row so the receiver can reject forged posts. |

**Set a monthly spend limit in the Anthropic Console before launch.** The in-app limits live in each server instance's memory, so they slow abuse but can't cap your bill.

## Deploy to produktif.ai

1. Push this folder to its own GitHub repo, or point Vercel at this one with **Root Directory** set to `produktif-ai`.
2. Import it in Vercel. Add `ANTHROPIC_API_KEY` under Settings → Environment Variables.
3. Under Settings → Domains, add `produktif.ai` and `www.produktif.ai`, then copy the DNS records Vercel shows into your registrar.

The generate route allows up to 300 seconds (`maxDuration`). The Claude call times out at 270 seconds with no automatic retry, so a slow request ends in a clear error and never starts a second paid generation.

If you self-host instead of using Vercel, put the app behind a proxy that overwrites `X-Real-IP` (nginx: `proxy_set_header X-Real-IP $remote_addr;`). The rate limiter trusts that header, so a bare `next start` exposed to the internet lets anyone get around it.

## Tests

```bash
npm test          # unit tests for the schema, prompt builder and rate limiter
npm run build
npm run e2e       # needs a build; drives Chromium through the whole flow
```

`npm run e2e` runs 28 checks across four servers. Both pages are checked for horizontal scroll at 320, 375 and 1280px. The waitlist is checked in the browser (signup and receipt, a malformed email blocked) and through the API (the exact webhook row, a bad email, the honeypot, the webhook failing or missing). The carousel checks are:

- **Demo mode:** layout at 375px and 1280px, slide text overflow, editing and live anchor warnings, the over-length input counter, and the ZIP export (8 PNGs at 1080×1350 plus `caption.txt`).
- **Real API route, fake Anthropic server:** the exact request (model, betas, `fallbacks: "default"`, JSON schema output, how a pasted thread is wrapped) and every error path: cut-off output, refusal, refusal with a busy fallback, oversized body, IPv6 /64 rate limiting, and a verdict that disagrees with its pass flags.
- **No key configured:** must return 503.
- **`RATE_LIMIT_PER_HOUR=0`:** must stop generation.

Screenshots and sample PNGs land in `e2e-output/`. Set `CHROME_PATH` if Chromium isn't at `/opt/pw-browsers/chromium`.

## Layout

```
app/page.tsx              landing page
app/api/generate/route.ts the only API route: validate, rate-limit, call Claude
components/Generator.tsx  form, topic score, previews, editing, PNG/ZIP export
components/Slide.tsx      the 1080×1350 slide template
lib/prompt.ts             system prompt (the method)
lib/schema.ts             request and deck schemas, helpers
lib/sample.ts             demo deck
lib/ratelimit.ts          in-memory per-IP limiter
```

## Not built yet

- **Shared rate limiting.** The limiter lives in each server instance's memory. Move it to Upstash or Vercel KV before promoting the site widely.
- **A real-API test run.** Every test so far used demo mode or a fake API. Generate a few decks with a real key before launch, to check output quality and how long a 12-slide deck takes.
- **Accounts, payments and saved decks.** Anyone can generate; nothing is stored.
- **Reels.** The next step in the method is turning a winning carousel into a Reel.
