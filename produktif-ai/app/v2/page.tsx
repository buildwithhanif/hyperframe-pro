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
import WeekTabs from "@/components/v2/WeekTabs";

// v2: the page for owners of an existing business. v1 stays at / so the two
// can be compared; this one is kept out of search until a winner is picked.
export const metadata: Metadata = {
  title: "produktif.ai | Short videos for your business, made for you",
  description:
    "60 short videos a month for your business, each opening and closing with an AI version of you. You approve them on WhatsApp and never film. Rp 4,000,000 a month.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "60 videos a month for your business. You never film.",
    description: "Short videos for your business, made for you with an AI version of you. No filming.",
  },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", colorScheme: "only light" };

const IG = "https://www.instagram.com/hanifmuh_/";
const WA = process.env.NEXT_PUBLIC_WA_NUMBER || "";
const WA_DIGITS = WA.replace(/\D/g, "");

// Hanif's own videos, made with his AI version (face and voice): openings of
// real posts, cut by scripts/cut-samples.sh. Two were left out: one names a
// phone brand, and one shows a debt-collection message.
const clip = (id: string, title: string): ClipSource => ({ id, title, src: `/samples/${id}.mp4`, poster: `/samples/${id}.jpg` });
const HERO = clip("qris", "QR payments");
const SAMPLES = [
  HERO,
  clip("damai", "Road accident"),
  clip("colokan", "Power sockets"),
  clip("ahliwaris", "Inheritance"),
  clip("bpjs", "Public health insurance"),
];

const STEPS = [
  ["Today", "Apply", "About 2 minutes on your phone. We ask what you sell and where to reach you."],
  [
    "Within 2 working days",
    "We reply on WhatsApp",
    "If we pick you: a short setup call. Then you sign the agreement and pay a Rp 1,000,000 refundable deposit. We send a photo guide and the script for your voice recording.",
  ],
  [
    "About 7 days later",
    "See yourself first",
    "A short clip of your AI version talking, so you can judge how you look and sound. Not right? We redo it once. Still not right, and we refund the deposit in full and delete your files.",
  ],
  [
    "Every week",
    "Approve on WhatsApp",
    "14 scripts to read (24 hours to reply), then 14 videos to watch (48 hours). No reply counts as approved. Each video gets 1 full redo, and text fixes are free.",
  ],
  ["Every day", "You post", "Switch on the platform’s AI label and post. The caption comes with each video. We never post for you."],
];

const INCLUDED = [
  "60 videos a month (about 2 a day), 30 to 45 seconds each",
  "Your AI version at the start and end of each video, labeled as AI",
  "Topics and scripts planned around what you sell. Swap any topic",
  "Shots of your shop and products, subtitles on the video, vertical for Reels and TikTok",
  "A caption, hashtags and a line telling viewers what to do next, for every video",
  "Indonesian, English or both, your pick each month",
  "Your OK on every video, or 48 hours without notes",
  "No tool subscriptions, no logins",
];

const YOUR_PART = [
  [
    "Once:",
    "a setup call, 3 photos, a 2-minute voice recording, and your product photos and prices. Add a line to your bio saying your videos use an AI version of you.",
  ],
  ["Every week:", "read 14 scripts and watch 14 videos on WhatsApp, and reply OK or send notes."],
  ["Posting:", "post as they come, or schedule the week in one sitting with Instagram’s and TikTok’s own scheduling."],
];

const ALTERNATIVES = [
  ["AI video apps", "You write, prompt and fix every video yourself, and it’s one more subscription."],
  ["Editors and creator agencies", "Someone still has to film, and that someone is usually you."],
  ["produktif.ai", "We make all 60, captions included. You send 3 photos and a voice recording, once."],
];

const FAQ: [string, string][] = [
  [
    "Will it bring me sales or followers?",
    "Nobody can promise that, and we have no client results yet. That’s why we only pick businesses where we think it fits, and why your test clip comes before your first bill. We don’t take on gambling, trading, lending, MLM or get-rich schemes.",
  ],
  [
    "Do I ever have to film?",
    "No. You send 3 photos and a 2-minute voice recording once, plus photos of your products and prices. Short clips of your shop help if you have them, but you never stand in front of a camera.",
  ],
  [
    "Do you post for me?",
    "No. You post them yourself, so nothing goes out without your OK. Each video comes with its caption, and you can schedule a whole week in one sitting.",
  ],
  [
    "What counts as a video?",
    "A finished vertical video, 30 to 45 seconds, with subtitles and its caption, ready to post. It counts toward your 60 once you approve it, or once 48 hours pass without notes.",
  ],
  ["Why about 2 a day?", "More posts give more chances to reach people who don’t follow you yet. You can post fewer."],
  [
    "Will the AI label hurt my reach?",
    "We don’t know, and we won’t promise either way. The label goes on every post because it’s honest, and it’s in the agreement.",
  ],
  [
    "Can the videos promote my products, offers and prices? Who checks claims?",
    "Yes, using only what you send us: product photos, prices, offers and certificates. A person on our side checks the facts before we make each video. If a claim needs a document, like a halal certificate, we leave it out until you send it. You approve the scripts, and you’re responsible for the claims in videos you approve.",
  ],
  [
    "Can someone on my team be the face?",
    "Yes, if that person signs the agreement, records the consent line and passes the ID and selfie check. If they leave your business, we delete their AI version within 30 days.",
  ],
  [
    "How do paying, refunds and canceling work?",
    "By bank transfer, against a PDF invoice. The Rp 1,000,000 deposit comes off your first month, or comes back to you if the test clip isn’t right. After that it’s month to month: cancel at least 7 days before your next bill. Once delivery starts there are no cash refunds. A missed video is made up within 7 days, or credited on your next invoice.",
  ],
  [
    "How do I know a message is really from you?",
    `${WA ? `We only message from ${WA}. ` : ""}We only ask for money after we pick you, always against a PDF invoice. If a message asks you to pay before that, or anything looks off, don’t pay. Write to hello@produktif.ai first.`,
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
                <span className="hl">60</span> videos a month for your business. You never film.
              </h1>
              <p className="hero-sub">
                <span className="only-wide">
                  We write and make 2 short videos a day for you. Each one opens and closes with an AI version of you, with subtitles and a
                  caption ready to paste. You approve them on WhatsApp, then post.
                </span>
                <span className="only-narrow">
                  We write and make them for you: about 2 a day, each opening and closing with an AI version of you. You approve on
                  WhatsApp, then post.
                </span>
              </p>
              <p className="hero-price">
                <b>Rp&nbsp;4,000,000 a month</b> for 60 videos. Month to month.
              </p>
              <CatChips id="hero-cat" pos="hero" />
              <p className="cat-note">
                Applying is free and takes about 2 minutes, with no payment details. You see a test clip of yourself before any monthly
                bill.
              </p>
              <p className="hero-proof">
                <b>Made by Hanif.</b> His own Instagram,{" "}
                <a href={IG} target="_blank" rel="noopener">
                  @hanifmuh_
                </a>
                , got <b>178.7M views and 288K new followers in 90 days</b>. Those numbers come from his personal creator account, across
                all post types. We have no client results yet, and nobody can promise you views.
              </p>
            </div>
            <Engine hero={HERO} samples={SAMPLES} label="Made with AI · Hanif" />
          </div>
        </section>

        <section className="sec samples" aria-labelledby="samples-h">
          <div className="wrap">
            <h2 id="samples-h" className="h2">
              What your AI version will look like.
            </h2>
            <p className="samples-cap">
              Real posts from Hanif&rsquo;s own account, made with AI. They cover personal topics, so you won&rsquo;t see a product in them,
              and the captions are in the original language. Yours open and close with your AI version, with your shop and products in
              between.
            </p>
            <ul className="strip" tabIndex={0} aria-label="Sample videos">
              {SAMPLES.slice(1).map((c) => (
                <li key={c.id}>
                  <Clip clip={c} label="Made with AI" />
                  <p className="strip-t">{c.title}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="sec week-sec" aria-labelledby="week-h">
          <div className="wrap week-grid">
            <div>
              <h2 id="week-h" className="h2">
                Here&rsquo;s what 2 a day could look like.
              </h2>
              <p className="lead">
                60 topics a month like these, planned from what you sell, your prices and your photos. Swap any of them.
              </p>
            </div>
            <WeekTabs />
          </div>
        </section>

        <section className="sec maker" aria-labelledby="maker-h">
          <div className="wrap maker-grid">
            <div className="maker-who">
              <figure className="maker-fig">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HERO.poster}
                  alt="A frame of Hanif’s AI version from one of his posts"
                  width={540}
                  height={960}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Made with AI: Hanif&rsquo;s AI version</figcaption>
              </figure>
              <p className="maker-name">
                Hanif ·{" "}
                <a href={IG} target="_blank" rel="noopener">
                  @hanifmuh_
                </a>
              </p>
            </div>
            <div>
              <h2 id="maker-h" className="h2">
                Who&rsquo;s making your videos.
              </h2>
              <p className="lead">
                Hanif makes short videos for his own account every day with an AI version of himself. These numbers show people watch what
                he makes. Your business account starts from its own audience, so expect different numbers.
              </p>
              <dl className="maker-stats">
                <div className="maker-big">
                  <dt>178.7M</dt>
                  <dd>views in 90 days</dd>
                </div>
                <div>
                  <dt>+288K</dt>
                  <dd>followers in the same 90 days</dd>
                </div>
                <div>
                  <dt>88.8%</dt>
                  <dd>of views from people who didn&rsquo;t follow him yet</dd>
                </div>
              </dl>
              <p className="stamp stamp--dark">
                His personal creator account. Counts every post type, including posts made without his AI version. Instagram&rsquo;s own
                dashboard, checked 7 to 10 October 2026. No client results yet.
              </p>
            </div>
          </div>
        </section>

        <section className="sec how" id="how" aria-labelledby="how-h">
          <div className="wrap">
            <h2 id="how-h" className="h2">
              How it works.
            </h2>
            <ol className="how-steps">
              {STEPS.map(([when, t, b]) => (
                <li key={t}>
                  <span className="how-when">{when}</span>
                  <h3>{t}</h3>
                  <p>{b}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="sec alt" aria-labelledby="alt-h">
          <div className="wrap alt-grid">
            <h2 id="alt-h" className="h2">
              Tried AI apps or an editor already?
            </h2>
            <dl className="alt-list">
              {ALTERNATIVES.map(([k, v]) => (
                <div key={k} className={k === "produktif.ai" ? "is-us" : undefined}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="sec trust" aria-labelledby="trust-h">
          <div className="wrap trust-grid">
            <div>
              <h2 id="trust-h" className="h2">
                Open about AI.
              </h2>
              <p className="lead">
                Will customers know it&rsquo;s AI? Yes, and that&rsquo;s on purpose. Will it look like you? Judge your test clip before any
                monthly payment.
              </p>
              <Link href="/consent" className="link link--inverse">
                How we use your face and voice
              </Link>
            </div>
            <ul className="rules">
              <li>
                Every post carries the platform&rsquo;s AI label, and your bio says your videos use an AI version of you. Both are in the
                agreement.
              </li>
              <li>Only the person who signs and records the consent line can be the face, after an ID and live selfie check.</li>
              <li>
                Facts about your business come only from you. We never invent customers, reviews, before-and-after results or cure claims.
              </li>
              <li>Cancel, and we delete your photos, voice and AI version within 30 days and confirm it in writing.</li>
              <li>You own your videos, and the person in them owns their likeness.</li>
            </ul>
          </div>
        </section>

        <section className="sec price" id="pricing" aria-labelledby="price-h">
          <div className="wrap price-box">
            <div>
              <h2 id="price-h" className="h-big">
                <span className="nocase">Rp</span>&nbsp;4,000,000 a month.
              </h2>
              <p className="lead">
                60 finished videos a month. This is the founding rate for the first group of businesses; later groups may pay more.
              </p>
              <p className="price-note">
                If we pick you, a Rp 1,000,000 deposit holds your slot and comes off your first invoice. Turn down your test clip and the
                deposit comes back.
              </p>
              <div className="part">
                <h3>Your part</h3>
                <ul>
                  {YOUR_PART.map(([b, t]) => (
                    <li key={b}>
                      <b>{b}</b> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="price-cta">
                <TrackedLink href="/v2/start" pos="price" className="btn btn--lg">
                  Get started
                </TrackedLink>
                <p>Nothing to pay until we pick you.</p>
              </div>
            </div>
            <div>
              <h3 className="h3">Every month includes</h3>
              <ul className="ticks">
                {INCLUDED.map((t) => (
                  <li key={t}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
              <p className="not-incl">
                <b>Not included:</b> posting, replying to comments or DMs, paid ads, and any promise of results.
              </p>
              <p className="price-fine">
                Month to month. Cancel at least 7 days before your next bill. Once delivery starts there are no cash refunds; a missed video
                is made up within 7 days, or credited on your next invoice. Price changes come with 30 days&rsquo; notice.{" "}
                <Link href="/terms">Full terms</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className="sec faq" id="faq" aria-labelledby="faq-h">
          <div className="wrap faq-grid">
            <h2 id="faq-h" className="h2">
              Questions before you apply
            </h2>
            <div className="faq-list">
              {FAQ.map(([q, a]) => (
                <details key={q}>
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
              The only payment before your first month is a Rp 1,000,000 deposit, and you get it back if you turn down your test clip. We
              only ask for money against a PDF invoice.
              {WA_DIGITS && (
                <>
                  {" "}
                  Rather ask first?{" "}
                  <a href={`https://wa.me/${WA_DIGITS}`} target="_blank" rel="noopener">
                    Message us on WhatsApp
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <Wordmark className="foot-wm" />
          <div className="foot-row">
            <p>Short videos for your business, made for you.</p>
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
