# produktif.ai

The site for produktif.ai, a done-for-you short video service: 60 videos a month (two a day) made with the client's AI persona, for Rp 4,000,000 a month at the founding rate.

| Route | What it is |
|---|---|
| `/` | The homepage, in English. It leads with Hanif's own videos, made with his AI persona and labeled on every frame. |
| `/start` | Get started: a one-question-per-screen application that ends on the waitlist. |
| `/privacy`, `/terms`, `/consent` | Legal pages. Drafts: have a lawyer read them before you take money. |
| `/carousel` | Hanif's carousel tool, in Indonesian. Hidden from search. Off unless `ANTHROPIC_API_KEY` is set. |

The site uses one font, Archivo (OFL), subset and self-hosted from `app/fonts`, so pages make no third-party requests. The design rules are in [DESIGN.md](DESIGN.md).

## Deploy to produktif.ai (about 15 minutes)

You need a Vercel account, a Google account and access to the produktif.ai DNS.

1. **Make the sheet.** Create a Google Sheet called "produktif.ai applications". Open Extensions → Apps Script, paste the script from [The sheet](#the-sheet) below, and set `SECRET` to a long random string (run `openssl rand -hex 32`). Click Deploy → New deployment → Web app. Set "Execute as" to **Me** and "Who has access" to **Anyone**, then copy the web app URL.
2. **Import the repo in Vercel.** Add New → Project → pick this repo, and set **Root Directory** to `produktif-ai`. The framework is detected as Next.js; leave the build settings alone.
3. **Set the environment variables** (Settings → Environment Variables, Production):
   - `WAITLIST_WEBHOOK_URL`: the web app URL from step 1.
   - `WAITLIST_WEBHOOK_SECRET`: the same string you put in `SECRET`.
   - `APPLY_SECRET`: a second random string. It signs the "finish my profile" links.
   - `NEXT_PUBLIC_WA_NUMBER`: the WhatsApp Business number you'll message from, written the way people should save it (`+62 812 0000 0000`). Leave it empty until that number exists; the site then just says "WhatsApp".
4. **Deploy**, then open the `.vercel.app` URL and apply once with your own email. A row should show up on the Signups tab, then one on Profiles when you finish.
5. **Connect the domain.** Settings → Domains → add `produktif.ai` and `www.produktif.ai`. Copy the DNS records Vercel shows into your registrar (usually an `A` record for the apex and a `CNAME` for `www`). Vercel issues the certificate on its own once DNS resolves.
6. **Turn on the confirmation email** (optional, but applicants expect it). Create a Resend account, add and verify `produktif.ai` as a sending domain (it gives you DNS records to add), create an API key, then set:
   - `RESEND_API_KEY`
   - `EMAIL_FROM`, for example `Hanif at produktif.ai <hello@produktif.ai>` (must use the verified domain)
   - `EMAIL_REPLY_TO`: the inbox where you want replies.

   Redeploy after changing variables. Without the key, signups still save; the done screen then stops promising an email.

Before you share the link, apply once on your phone, then delete your own test rows from the sheet.

### Environment variables

| Variable | Needed | What it does |
|---|---|---|
| `WAITLIST_WEBHOOK_URL` | yes | Where each signup and profile row is POSTed as JSON. Without it, `/api/apply` answers 503 and applicants see "Applications aren't open yet". |
| `WAITLIST_WEBHOOK_SECRET` | strongly recommended | Sent as `secret` in every row so the script can reject forged posts. Must match `SECRET` in the script exactly. |
| `APPLY_SECRET` | recommended | Signs the lead token that links a profile to its signup. Falls back to `WAITLIST_WEBHOOK_SECRET`, then to a value derived from the webhook URL. Changing it breaks "finish my profile" links already sent. |
| `NEXT_PUBLIC_WA_NUMBER` | no | Business WhatsApp number shown on the done screen and in the email. Use a business number, never a personal one. |
| `RESEND_API_KEY` | no | Sends the confirmation email. A failed email never fails a signup. |
| `EMAIL_FROM` | with Resend | Sender. Defaults to `Hanif at produktif.ai <hello@produktif.ai>`. |
| `EMAIL_REPLY_TO` | no | Reply-to address on the confirmation email. |
| `SITE_URL` | no | Base URL for links in the email. Defaults to `https://produktif.ai`. |
| `ANTHROPIC_API_KEY` | only for `/carousel` | Turns the carousel tool on. Set a monthly spend limit in the Anthropic Console first. |
| `RATE_LIMIT_PER_HOUR`, `GLOBAL_LIMIT_PER_HOUR` | no | Carousel limits per IP and per server instance (defaults 8 and 200). |
| `DEMO_MODE` | never in production | `1` accepts applications without a webhook and serves a sample carousel. For local work and tests. |

## How an application flows

`/start` asks one question per screen, in two parts:

1. **About you:** name, email, WhatsApp (optional) and consent. The "Join the waitlist" button posts to `/api/apply`. The lead is saved here, so someone who leaves halfway is still on the list.
2. **Your channel:** niche, platform and handle, audience size, posting rhythm, goal, language, start date, and whether Rp 4,000,000 a month works. The last answer posts to `/api/apply/profile`.

Answers are kept in `localStorage` (`pai-apply-v1`), so a reload or a closed tab resumes where the person stopped. The confirmation email links to `/start?lead=…&t=…`, which reopens part two on any device. UTM tags from the first page view ride along with the signup.

Both routes validate with zod, cap the body at 8 KB, drop honeypot bots with a fake success, and rate-limit 30 requests per IP per hour (generous, because many Indonesian mobile users share a carrier IP). The profile route checks an HMAC token, so nobody can attach a profile to someone else's lead.

The rows the sheet receives:

```json
{ "stage": "signup", "lead_id": "uuid", "created_at": "2026-10-11T02:14:00.000Z", "name": "Ani", "email": "ani@example.com", "whatsapp": "6281234567890", "consent": "I agree to the privacy policy, and to …", "utm_source": "instagram", "utm_medium": "bio", "utm_campaign": "", "secret": "…" }
```

```json
{ "stage": "profile", "lead_id": "uuid", "created_at": "…", "niche": "Personal finance", "platform": "instagram", "handle": "@ani.coach", "followers": "50k-250k", "posting": "most-days", "goal": "sales", "language": "both", "start": "this-month", "budget": "yes", "fit_score": 10, "secret": "…" }
```

`fit_score` is a rough first sort, 0 to 10: budget yes +4, starting this month +3 (1 to 3 months +1), audience size up to +2, posting most days +1. Sort the Profiles tab by it, then read each one yourself.

## The sheet

Paste this into the sheet's Apps Script editor. It writes signups and profiles to two tabs, creates them with headers on first use, and stops a value that starts with `=`, `+`, `-` or `@` from running as a formula.

```js
const SECRET = ""; // exactly the value of WAITLIST_WEBHOOK_SECRET

const TABS = {
  signup: ["created_at", "lead_id", "name", "email", "whatsapp", "consent", "utm_source", "utm_medium", "utm_campaign"],
  profile: ["created_at", "lead_id", "fit_score", "niche", "platform", "handle", "followers", "posting", "goal", "language", "start", "budget"],
};
const NAMES = { signup: "Signups", profile: "Profiles" };

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function cell(v) {
  if (v === undefined || v === null) return "";
  return typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const d = JSON.parse(e.postData.contents);
    if (SECRET && d.secret !== SECRET) return reply({ ok: false, error: "forbidden" });
    const cols = TABS[d.stage];
    if (!cols) return reply({ ok: false, error: "unknown stage" });
    lock.waitLock(10000);
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(NAMES[d.stage]) || book.insertSheet(NAMES[d.stage]);
    if (sheet.getLastRow() === 0) sheet.appendRow(cols);
    const row = cols.map((c) => cell(d[c]));
    if (d.stage === "signup" && d.whatsapp) row[cols.indexOf("whatsapp")] = "https://wa.me/" + d.whatsapp;
    sheet.appendRow(row);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
```

After you edit the script, deploy a **new version** (Deploy → Manage deployments → edit → Version: New). Saving alone doesn't change the live web app.

Apps Script can't send error status codes, so the app treats `{"ok": false}`, a bare `forbidden` or an HTML error page as a failed save, and the applicant sees "We couldn't save that" instead of a false confirmation. To see a whole lead on one line, add a third tab and use `=FILTER(Profiles!A:L, Profiles!B:B = B2)` next to each signup, or join on `lead_id` however you like. Make, Zapier or n8n webhooks work too, as long as they answer with a 2xx and no `"ok": false`.

## Run it locally

```bash
npm install
DEMO_MODE=1 npm run dev     # http://localhost:3000, applications accepted without a sheet
```

Copy `.env.example` to `.env.local` to test against a real sheet or a real email.

## Tests

```bash
npm test          # unit tests: schemas, phone and handle parsing, fit score, tokens, reply-by dates, rate limiter
npm run build
npm run e2e       # needs a build; drives Chromium through the site and the APIs
```

`npm run e2e` starts several production servers. It checks the homepage at phone and desktop widths (no sideways scroll, the first headline line holds, the persona clip shows on a phone before any scroll, every video carries its "AI persona" label), walks the whole application on a 390×844 phone including a reload halfway through, and calls the APIs directly: the exact rows sent to the sheet, a forged profile token, the honeypot, a sheet that fails or answers `forbidden`, and a missing webhook. The carousel checks run against demo mode and a fake model server. Screenshots land in `e2e-output/`. Set `CHROME_PATH` if Chromium isn't at `/opt/pw-browsers/chromium`.

## Layout

```
app/page.tsx                 homepage (styles in app/home.css, tokens in app/tokens.css, all under .pai)
app/start/                   Get started page and its styles
app/privacy, terms, consent  legal pages (shared styles in app/legal.css)
app/api/apply/route.ts       part one: validate, rate-limit, save the lead, send the email
app/api/apply/profile/       part two: check the token, save the profile with its fit score
app/carousel/, app/api/generate/   the carousel tool
components/home/             Nav, Clip (a labeled persona video), MonthWall (the month of stills)
public/samples/              the sample clips, their stills and 60 frames for the month wall
components/onboarding/       the application flow
components/site/             legal page frame, UTM keeper
lib/waitlist.ts              schemas, option lists, phone and handle parsing, fit score, webhook rows
lib/forward.ts               posts a row to the sheet and checks it was saved
lib/email.ts                 confirmation email
lib/dates.ts                 reply-by date in Jakarta time, skipping weekends
lib/ratelimit.ts             in-memory per-IP limiter
```

## Sample videos

Every video on the homepage is one of Hanif's own posts, made with his AI persona (face and voice). `scripts/cut-samples.sh` cuts the 10 to 12 second loops, the stills and the month-wall frames from the source MP4s:

```bash
./scripts/cut-samples.sh /path/to/source-mp4s   # writes public/samples/
```

To pull fresh sources, list the post video URLs in `samples/sources.txt` and push. The `fetch-samples` workflow downloads them and commits the files to the `samples-raw` branch. Any new clip must keep the "AI persona" label (the `Clip` component adds it, and the e2e run checks it).

## Before you promote it widely

- **Shared rate limiting.** The limiter lives in each server instance's memory. Move it to Upstash or Vercel KV if the form gets abused.
- **Legal review.** The privacy, terms and consent pages are careful drafts, not legal advice. Have an Indonesian lawyer check the refund clause, the liability cap, the UU PDP wording and the language requirement for consumer agreements.
- **Hiring comparison.** The pricing section compares against job-board salary ranges (Loker.id, Glints). Re-check the numbers before a big push.
