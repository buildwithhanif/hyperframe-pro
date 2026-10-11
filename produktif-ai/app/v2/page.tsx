import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { fontVars } from "@/app/fonts";
import "../tokens.css";
import "../home.css";
import "./v2.css";
import Clip, { type ClipSource } from "@/components/home/Clip";
import { Wordmark } from "@/components/site/Brand";
import CatChips from "@/components/v2/CatChips";
import Engine from "@/components/v2/Engine";
import SourceLine from "@/components/v2/SourceLine";
import StickyCta from "@/components/v2/StickyCta";
import TrackedLink from "@/components/v2/TrackedLink";

// v2: the page for owners of an existing business. v1 stays at / so the two
// can be compared; this one is kept out of search until a winner is picked.
export const metadata: Metadata = {
  title: "produktif.ai | Short videos for your business, done for you",
  description:
    "60 short videos a month for your business, starring an AI version of you. You approve them on WhatsApp. No filming. Founding rate Rp 4,000,000 a month.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "60 videos a month for your business. You never film.",
    description: "Done-for-you short videos for your business, starring an AI version of you. No filming.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "only light",
};

// Hanif's own videos, made with his AI persona (face and voice): openings of
// real posts, cut by scripts/cut-samples.sh.
const clip = (id: string, title: string): ClipSource => ({ id, title, src: `/samples/${id}.mp4`, poster: `/samples/${id}.jpg` });
const HERO = clip("qris", "QRIS");
const SAMPLES = [
  clip("qris", "QRIS"),
  clip("damai", "Kecelakaan"),
  clip("dana", "Salah transfer"),
  clip("colokan", "Colokan listrik"),
  clip("xiaomi", "Iklan HP Xiaomi"),
  clip("ahliwaris", "Ahli waris"),
  clip("bpjs", "BPJS"),
];

const WE_DO = [
  ["Plan the month.", "Topics for your business and your customers, 60 of them."],
  ["Write every script,", "using only facts and claims you give us."],
  ["Make every video", "with your AI persona, B-roll and burned-in captions, 9:16."],
  ["Write the post copy:", "a caption, hashtags and a call to action for each one."],
  ["Deliver 14 a week", "on WhatsApp, a week before they go out."],
];
const YOU_DO = [
  ["Once:", "a setup call, 3 photos and a 2-minute voice recording, plus your product photos and prices."],
  ["Every week:", "about 15 minutes on WhatsApp to approve the batch or send notes."],
  ["Every day:", "post the 2 videos, with the platform’s AI label switched on."],
];

const STEPS = [
  ["Apply", "About 2 minutes. Nothing to pay. We reply on WhatsApp within 2 working days."],
  ["Get picked", "A short setup call. Then a Rp 1,000,000 deposit and your kit."],
  ["See yourself first", "A test clip of your persona within 7 days. Not right? Ask for 1 redo, or say no and the deposit comes back."],
  ["Approve weekly", "14 videos a week land on WhatsApp. Reply OK, or send notes within 48 hours."],
  ["Post 2 a day", "You post them, with the AI label on. Nothing goes out without you."],
];

const WEEK = [
  ["Mon", "Best-seller spotlight", "“Do you deliver?”"],
  ["Tue", "Keeping iced coffee from going watery", "Why I opened this shop"],
  ["Wed", "Payday bundle", "Hot drinks for rainy season"],
  ["Thu", "New on the menu", "“Is it halal?” (with your certificate)"],
  ["Fri", "Ordering for the office", "Weekend plans"],
  ["Sat", "Non-coffee drinks", "Where our beans come from"],
  ["Sun", "Weekend offer", "Opening hours and parking"],
];

const INCLUDED = [
  "60 videos a month, 30 to 45 seconds each, 2 for every day",
  "Your AI persona on the hook and outro, labeled as AI",
  "Topics and scripts for your business. Swap any topic",
  "B-roll, product shots and captions, 9:16 for Reels, TikTok and Shorts",
  "A caption, hashtags and a call to action for every video",
  "Indonesian, English or both, your pick each month",
  "Your approval on every video before it goes out",
  "No tool subscriptions, no logins",
];

const FAQ = [
  [
    "Will it work for my kind of business?",
    "We don’t know yet, and we won’t pretend. We have no client results yet, so you’d be in the founding cohort. We pick businesses where we think it fits, and you see a test clip of yourself before any monthly payment.",
  ],
  ["Do you guarantee views, followers or sales?", "No. Nobody can, and we won’t promise what we don’t control. What you get is 60 finished videos a month, made for your business."],
  ["Will the AI label hurt my reach?", "We don’t know, and we don’t promise either way. The label goes on every post because it’s honest, and it’s in the agreement."],
  [
    "Do you post for me?",
    "Not yet. You post, so nothing goes out without you. You get 9:16 files for Reels, TikTok and Shorts, plus the caption, hashtags and call to action to paste. We may add posting later.",
  ],
  [
    "Can the videos promote my products, promos and prices? Who checks claims?",
    "Yes, using only what you send us: product photos, prices, offers, and certificates for claims like halal or BPOM. You approve every script before a video is made.",
  ],
  [
    "Can someone on my team be the face?",
    "Yes, if that person signs the agreement, records the consent line and passes the ID and selfie check. If they leave your business, we delete their persona.",
  ],
  [
    "How do paying, refunds and canceling work?",
    "By bank transfer, against a PDF invoice. The Rp 1,000,000 deposit comes off your first month, and comes back if you don’t approve your test clip. After that it’s month to month: cancel 7 days before your next bill. Once delivery starts there are no cash refunds; a missed video is made up.",
  ],
  [
    "How do I know a message is really from you?",
    "We only ask for money after you’re picked, always against a PDF invoice. If a message asks you to pay before that, or anything looks off, don’t pay. Reply to us first.",
  ],
];

export default function V2Home() {
  return (
    <div className={`pai home v2 ${fontVars}`}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="nav">
        <div className="nav-in">
          <Link href="/v2" className="brand" aria-label="produktif.ai home">
            <Wordmark title={null} className="brand-wm" />
          </Link>
          <TrackedLink href="/v2/start" pos="header" className="btn btn--sm v2-nav-btn">
            Get started
          </TrackedLink>
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-h">
          <div className="wrap v2-hero">
            <div className="v2-hero-copy">
              <SourceLine />
              <h1 id="hero-h" className="hero-h">
                60 videos a month for your business. You never film.
              </h1>
              <p className="hero-sub">
                <span className="only-wide">
                  We plan, script and make 2 short videos a day, each starring an AI version of you, with captions and post copy. You approve
                  them on WhatsApp, then post.
                </span>
                <span className="only-narrow">2 a day, starring an AI version of you. You approve them on WhatsApp.</span>
              </p>
              <CatChips id="hero-cat" pos="hero" />
              <p className="hero-price">
                <b>Rp&nbsp;4,000,000 a month for 60 videos.</b> Nothing to pay to apply.{" "}
                <TrackedLink href="/v2/start" pos="hero-link">
                  Or just get started
                </TrackedLink>
              </p>
              <div className="hero-proof">
                <ul className="proof-tiles">
                  <li>
                    <b>178.7M</b>
                    <span>views in 90 days</span>
                  </li>
                  <li>
                    <b>+288K</b>
                    <span>new followers in 90 days</span>
                  </li>
                  <li>
                    <b>88.8%</b>
                    <span>of views from non-followers</span>
                  </li>
                </ul>
                <p>
                  The founder&rsquo;s own Instagram, all post types, native dashboard, October 2026. Not a client result. Nobody can guarantee
                  views.
                </p>
              </div>
            </div>
            <Engine hero={HERO} samples={SAMPLES} />
          </div>
        </section>

        <section className="sec who" aria-labelledby="who-h">
          <div className="wrap">
            <h2 id="who-h" className="h2">
              We make the videos. You approve and post.
            </h2>
            <div className="split">
              <div>
                <h3>We do</h3>
                <ul>
                  {WE_DO.map(([b, t]) => (
                    <li key={b}>
                      <b>{b}</b> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="you">
                <h3>You do</h3>
                <ul>
                  {YOU_DO.map(([b, t]) => (
                    <li key={b}>
                      <b>{b}</b> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="post-answer">
              <b>Do you post for me?</b> Not yet. You post, so nothing goes out without you. No prompts to write, no tools to learn, no new
              logins.
            </p>
            <div className="sec-cta">
              <TrackedLink href="/v2/start" pos="who" className="btn btn--lg">
                Get started
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="sec samples" aria-labelledby="samples-h">
          <div className="wrap">
            <h2 id="samples-h" className="h2">
              What the videos look like.
            </h2>
            <p className="samples-cap">
              These are the founder&rsquo;s own posts, made with his AI persona. Personal topics, not business marketing. Yours star you and
              your products.
            </p>
            <ul className="strip" tabIndex={0} aria-label="Sample videos">
              {SAMPLES.slice(1).map((c) => (
                <li key={c.id}>
                  <Clip clip={c} />
                  <p className="strip-t" lang="id">
                    {c.title}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="sec own-sec" aria-labelledby="own-h">
          <div className="wrap own">
            <div>
              <h2 id="own-h" className="h2">
                The founder&rsquo;s own account.
              </h2>
              <p className="lead">
                Before selling this to anyone, the founder runs short videos on his own accounts every day. These are his numbers, so you know
                who is making yours.
              </p>
              <p className="own-label">
                Personal creator account, not a business account. All post types. Native dashboards, 7 to 10 October 2026. No client results
                yet. Nobody can guarantee views, followers or sales.
              </p>
            </div>
            <dl className="own-stats">
              <div>
                <dt>178.7M</dt>
                <dd>Instagram views in the last 90 days</dd>
              </div>
              <div>
                <dt>+288K</dt>
                <dd>new Instagram followers in the same 90 days</dd>
              </div>
              <div>
                <dt>88.8%</dt>
                <dd>of those views came from people who didn&rsquo;t follow him yet</dd>
              </div>
              <div>
                <dt>690K</dt>
                <dd>followers across his platforms</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="sec how" id="how" aria-labelledby="how-h">
          <div className="wrap">
            <h2 id="how-h" className="h2">
              How it works.
            </h2>
            <ol className="how-steps">
              {STEPS.map(([t, b], i) => (
                <li key={t}>
                  <span className="steps-n">{i + 1}</span>
                  <h3>{t}</h3>
                  <p>{b}</p>
                </li>
              ))}
            </ol>
            <div className="plan">
              <h3>One week of a month, for a coffee shop</h3>
              <p className="plan-note">A made-up example, not a client. In a real plan, every fact comes from you.</p>
              <ul className="plan-week">
                {WEEK.map(([d, a, b]) => (
                  <li key={d}>
                    <em>{d}</em>
                    <span>{a}</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sec-cta">
              <TrackedLink href="/v2/start" pos="how" className="btn btn--lg">
                Get started
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="sec price" id="pricing" aria-labelledby="price-h">
          <div className="wrap price-box">
            <div>
              <h2 id="price-h" className="h-big">
                <span className="nocase">Rp</span>&nbsp;4,000,000 a month.
              </h2>
              <p className="lead">60 finished videos for your business. The founding rate, for the first cohort only; later cohorts may pay more.</p>
              <p className="price-note">
                Applying is free. If you&rsquo;re picked, a Rp 1,000,000 deposit holds your slot and comes off your first invoice. You see a
                test clip of yourself first, and the deposit comes back if you don&rsquo;t approve it.
              </p>
              <div className="price-cta">
                <TrackedLink href="/v2/start" pos="price" className="btn btn--lg">
                  Get started
                </TrackedLink>
                <p>Nothing to pay until you&rsquo;re picked.</p>
              </div>
              <p className="price-fine">
                Month to month. Cancel 7 days before your next bill. Once delivery starts there are no cash refunds; a missed video is caught
                up within 7 days or credited. <Link href="/terms">Full terms</Link>.
              </p>
            </div>
            <div>
              <h3 className="h3">Every month includes</h3>
              <ul className="ticks">
                {INCLUDED.map((t) => (
                  <li key={t}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="sec trust" aria-labelledby="trust-h">
          <div className="wrap trust-grid">
            <div>
              <h2 id="trust-h" className="h2">
                Open about AI.
              </h2>
              <p className="lead">
                Some people don&rsquo;t want AI content. That&rsquo;s why every post carries the AI label, you approve every video, and you see
                your test clip before paying monthly.
              </p>
              <Link href="/consent" className="link link--inverse">
                How we use your face and voice
              </Link>
            </div>
            <ul className="rules">
              <li>The AI label goes on every post. It&rsquo;s in the agreement.</li>
              <li>Only the person who signs and records the consent line can be the face, after an ID and live selfie check.</li>
              <li>You approve every video, and you own your videos and your likeness.</li>
              <li>We only use facts and claims you give us.</li>
              <li>Cancel, and we delete your photos, voice and persona within 30 days and confirm it in writing.</li>
            </ul>
          </div>
        </section>

        <section className="sec faq" id="faq" aria-labelledby="faq-h">
          <div className="wrap faq-grid">
            <h2 id="faq-h" className="h2">
              Questions before you apply
            </h2>
            <div className="faq-list">
              {FAQ.map(([q, a], i) => (
                <details key={q} open={i === 0}>
                  <summary>
                    {q}
                    <span className="pm" aria-hidden="true" />
                  </summary>
                  <div className="faq-a">
                    <p>{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="final" id="final-cta" aria-labelledby="final-h">
          <div className="wrap">
            <h2 id="final-h" className="final-h">
              You sell. We make the videos.
            </h2>
            <CatChips pos="final" />
            <p className="final-trust">
              If you&rsquo;re picked: a Rp 1,000,000 deposit, refunded if you don&rsquo;t approve your test clip. We only ask for money against
              a PDF invoice.
            </p>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <Wordmark className="foot-wm" />
          <div className="foot-row">
            <p>Short videos for your business, done for you.</p>
            <nav aria-label="Footer">
              <a href="#how">How it works</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
              <Link href="/consent">How we use your face and voice</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
          <p className="foot-fine">produktif.ai, Yogyakarta, Indonesia.</p>
        </div>
      </footer>
      <StickyCta />
    </div>
  );
}
