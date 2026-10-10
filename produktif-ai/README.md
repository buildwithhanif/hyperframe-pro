# produktif.ai

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
| `RATE_LIMIT_PER_HOUR` | no | Generations per IP per hour, default 8. |

## Deploy to produktif.ai

1. Push this folder to its own GitHub repo, or point Vercel at this one with **Root Directory** set to `produktif-ai`.
2. Import it in Vercel. Add `ANTHROPIC_API_KEY` under Settings → Environment Variables.
3. Under Settings → Domains, add `produktif.ai` and `www.produktif.ai`, then copy the DNS records Vercel shows into your registrar.

The generate route allows up to 120 seconds (`maxDuration`), because Opus can take a while on a 12-slide deck.

## Tests

```bash
npm test          # unit tests for the schema, prompt builder and rate limiter
npm run build
npm run e2e       # needs a build; drives Chromium through the whole flow
```

`npm run e2e` starts three servers. The first runs in demo mode: it checks layout at 375px and 1280px, slide text overflow, editing, and the ZIP export (8 PNGs at 1080×1350 plus `caption.txt`). The second points the real API route at a fake Anthropic server and asserts the exact request: model, fallbacks beta, JSON schema output, and how a pasted thread is wrapped. The third has no key configured and must return 503. Screenshots and sample PNGs land in `e2e-output/`. Set `CHROME_PATH` if Chromium isn't at `/opt/pw-browsers/chromium`.

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
- **Accounts, payments and saved decks.** Anyone can generate; nothing is stored.
- **Reels.** The next step in the method is turning a winning carousel into a Reel.
