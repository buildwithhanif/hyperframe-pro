import type { Viewport } from "next";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./tokens.css";
import "./home.css";
import ChaosToCalm from "@/components/home/ChaosToCalm";
import MonthGrid from "@/components/home/MonthGrid";
import Nav, { Brand, MobileCta } from "@/components/home/Nav";
import PhoneReel from "@/components/home/PhoneReel";
import Steps, { type Step } from "@/components/home/Steps";
import { Kinetic, Reveal, Stagger } from "@/components/home/motion";

export const viewport: Viewport = {
  themeColor: "#F5F2EB",
  colorScheme: "light",
};

// ---------- copy ----------

const NOS = ["No prompts.", "No credits.", "No tool subscriptions.", "Nothing new to learn."];

const STEPS: Step[] = [
  {
    n: "01",
    title: "Send your kit",
    body: "Three photos and a 2-minute voice read that ends with your spoken consent. A short brief and a 30-minute call tell us your niche and your best posts.",
    you: "Your part: around an hour, once.",
  },
  {
    n: "02",
    title: "Approve your test clip",
    body: "We build your AI persona and make one video in the real format. If it still isn't right after one redo, your Rp 1,000,000 deposit comes back.",
  },
  {
    n: "03",
    title: "Get 14 videos a week",
    body: "Each batch lands on WhatsApp a week before it goes out, captions and post copy included. Reply OK, or send notes within 48 hours.",
    you: "Your part: roughly 15 minutes a week.",
  },
  {
    n: "04",
    title: "Post two a day",
    body: "Switch on the platform's AI label when you upload. That's the whole routine.",
  },
];

const INCLUDED = [
  "60 videos a month (30 to 45 s), ready to post two a day",
  "Your AI persona on the hook and outro, labeled as AI",
  "Topics and scripts in your niche. Swap any topic",
  "Motion graphics and screen demos, with captions burned in, 9:16",
  "A post caption with hashtags and a CTA for every video",
  "Indonesian, English or both, your pick each month",
  "Your approval on every video before it goes out",
  "No tool subscriptions",
];

const COMPARE = [
  ["Monthly cost", "Rp 6.5 to 18 million, before tools", "Rp 4,000,000"],
  ["Tool subscriptions", "You pay for them", "None for you"],
  ["You still film", "Yes", "No"],
  ["Who you manage", "Two people", "One WhatsApp chat"],
  ["Videos a month", "Whatever the team can make", "60"],
];

const STATS = [
  { value: "690K", label: "followers across Hanif's platforms", tag: "Founder's accounts" },
  { value: "297K", label: "median views on his last 30 Reels (@hanifmuh_)", tag: "Founder's account" },
  { value: "17.6M", label: "Instagram views on one Reel", tag: "Founder's account" },
  { value: "106.7M", label: "views from 220 carousels in 63 days", tag: "Founder's account" },
];

const TRUST = [
  "Only the creator who signs. Never anyone else's face.",
  "An ID and live selfie check. 18 and over.",
  "Your persona opens and closes each video. The rest is graphics.",
  "Real stories only: the ones you told us.",
  "Every post carries the platform's AI label.",
  "You own your videos and your likeness.",
  "Cancel, and we delete everything within 30 days and confirm it in writing.",
];

const FAQ = [
  [
    "Is it really me in the videos?",
    "It's your AI persona, made from your recording: three photos and a 2-minute voice read. It opens and closes each video, and every video is labeled as AI. You approve each one before you post it.",
  ],
  ["Do I ever have to film?", "No. You send the photos and the voice read once, at the start. You can still post your own filmed videos whenever you like."],
  [
    "How much of my time does it take?",
    "Around an hour to set up, most of it a 30-minute call. Then roughly 15 minutes a week to watch the batch and reply on WhatsApp.",
  ],
  [
    "What if I don't like a video?",
    "Text fixes are free anytime, and every video gets one full redo. Nothing goes out unless you approve it, because you post it yourself.",
  ],
  [
    "Do you guarantee views?",
    "No. Nobody can, and we won't promise what we don't control. What you get is 60 finished videos a month, written with the playbook behind the founder's accounts.",
  ],
  [
    "Will the videos be labeled as AI?",
    "Yes. It's in the agreement: you switch on the platform's AI label for every post and keep a line in your bio. We show you how.",
  ],
  [
    "What happens to my face and voice data?",
    "It's kept in restricted storage with two-factor login, and working copies are wiped after each video is made. If you cancel, we delete everything within 30 days and confirm it in writing.",
  ],
  [
    "Who owns the videos?",
    "You own the videos and your likeness. We get a license to make videos for you while you're a client. Your videos only appear as our samples if you opt in separately.",
  ],
  ["Can I make a persona of someone else?", "No. We only build a persona of the creator who signs the agreement and records the consent line."],
  ["How does cancelling work?", "It's month to month. Message us at least 7 days before your next bill, and charges stop after the month you've paid for."],
  [
    "Why apply instead of just paying?",
    "Every persona takes real setup, so we start small: 2 to 3 creators in the first cohort, picked by fit. Applying is free, and Hanif reads every application.",
  ],
];

// ---------- page ----------

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Eyebrow({ n, children }: { n?: string; children: React.ReactNode }) {
  return (
    <p className="eyebrow">
      {n && <span className="eyebrow-n">{n}</span>}
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <div className={`pai home ${GeistSans.variable} ${GeistMono.variable}`}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />

      <main id="main">
        {/* ---------- hero ---------- */}
        <section className="hero" aria-labelledby="hero-h">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="hero-eyebrow fade-in">
                <span>Done-for-you short videos for creators</span>
              </p>
              <Kinetic id="hero-h" className="hero-h" lines={["Post every day.", "We make the videos."]} />
              <p className="hero-sub fade-in d2">
                <span className="only-wide">
                  Send three photos and a 2-minute voice read, once. We turn them into your AI persona and make <b>60 short videos a month</b>,
                  enough to post two a day. You approve them on WhatsApp and post.
                </span>
                <span className="only-narrow">
                  Three photos and a 2-minute voice read, once. Then <b>60 finished videos a month</b> with your AI persona, ready to post.
                </span>
              </p>
              <div className="hero-ctas fade-in d3" id="hero-cta">
                <Link href="/start" className="btn btn--lg">
                  Get started <Arrow />
                </Link>
                <a href="#how" className="link">
                  See how it works
                </a>
              </div>
              <p className="hero-micro fade-in d4">
                <b>Founding rate: Rp 4,000,000 a month for 60 videos.</b>
                <br />
                About 2 minutes to apply. Nothing to pay now.
              </p>
            </div>
            <div className="hero-stage fade-in d2">
              <div className="hero-stack" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="hero-phone">
                <PhoneReel />
              </div>
              <Link href="/consent" className="chip chip-label">
                <i className="chip-dot" /> AI persona · labeled as AI
              </Link>
              <span className="chip chip-1" aria-hidden="true">
                <Check /> Script approved
              </span>
              <span className="chip chip-2" aria-hidden="true">
                <b>14</b> videos ready · Monday
              </span>
            </div>
          </div>
        </section>

        {/* ---------- the tool grind ---------- */}
        <ChaosToCalm />
        <section className="nos-band" aria-label="What you won't need">
          <div className="wrap nos-in">
            <ul className="nos">
              {NOS.map((n) => (
                <li key={n}>
                  <span className="x" aria-hidden="true" />
                  {n}
                </li>
              ))}
            </ul>
            <Link href="/start" className="btn">
              Get started <Arrow />
            </Link>
          </div>
        </section>

        {/* ---------- how it works ---------- */}
        <section className="sec how" id="how" aria-labelledby="how-h">
          <div className="wrap">
            <Steps steps={STEPS}>
              <Eyebrow n="01">How it works</Eyebrow>
              <Reveal>
                <h2 id="how-h" className="h2">
                  Set up once.
                  <br />
                  Approve once a week.
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="lead">Around an hour at the start. After that, roughly 15 minutes a week on WhatsApp.</p>
              </Reveal>
            </Steps>
          </div>
        </section>

        {/* ---------- inside one video ---------- */}
        <section className="sec anatomy" aria-labelledby="anatomy-h">
          <div className="wrap anatomy-grid">
            <div>
              <Eyebrow n="02">Inside one video</Eyebrow>
              <Reveal>
                <h2 id="anatomy-h" className="h2">
                  What&rsquo;s inside every video
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="lead">30 to 45 seconds. Your persona opens and closes it. The middle does the explaining.</p>
              </Reveal>
              <Stagger className="anatomy-tl" as="ol">
                <div className="tl-seg tl-hook">
                  <em>0:00</em>
                  <b>Hook</b>
                  <span>Your AI persona</span>
                </div>
                <div className="tl-seg tl-body">
                  <em>0:05</em>
                  <b>Middle</b>
                  <span>Motion graphics and screen demos</span>
                </div>
                <div className="tl-seg tl-outro">
                  <em>0:35</em>
                  <b>Outro</b>
                  <span>Your persona and your call to action</span>
                </div>
              </Stagger>
              <Reveal delay={0.1}>
                <ul className="anatomy-notes">
                  <li>
                    <Check /> Every video: captions burned in, plus the post caption with hashtags and a CTA
                  </li>
                  <li>
                    <Check /> Indonesian, English or both. You pick each month.
                  </li>
                </ul>
                <p className="anatomy-why">Your audience follows a person. Your persona greets them and signs off, and the middle stays on the useful part.</p>
              </Reveal>
            </div>
            <Reveal className="anatomy-phone" delay={0.15}>
              <PhoneReel />
            </Reveal>
          </div>
        </section>

        {/* ---------- the month ---------- */}
        <section className="sec get" id="get" aria-labelledby="get-h">
          <div className="wrap get-grid">
            <div>
              <Eyebrow n="03">The month</Eyebrow>
              <Reveal>
                <h2 id="get-h" className="h2">
                  Two a day, for the whole month.
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="lead">
                  60 videos per 30-day cycle. They come in weekly batches of 14, a week before they go out, so you&rsquo;re never rushing a post.
                </p>
              </Reveal>
              <Stagger className="get-stats" as="dl">
                {[
                  ["60", "a month"],
                  ["14", "a week"],
                  ["2", "a day"],
                  ["9:16", "for Reels, TikTok and Shorts"],
                ].map(([n, l]) => (
                  <div key={l} className="get-stat">
                    <dt>{n}</dt>
                    <dd>{l}</dd>
                  </div>
                ))}
              </Stagger>
            </div>
            <Reveal className="get-month" delay={0.1}>
              <div className="get-month-h">
                <b>Your month</b>
                <span>2 a day</span>
              </div>
              <MonthGrid />
            </Reveal>
          </div>
        </section>

        {/* ---------- pricing ---------- */}
        <section className="sec price" id="pricing" aria-labelledby="price-h">
          <div className="wrap">
            <Eyebrow n="04">Pricing</Eyebrow>
            <Reveal>
              <h2 id="price-h" className="h2">
                Rp 4,000,000 a month.
                <br />
                That&rsquo;s the whole bill.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="lead">60 finished videos, about Rp 66,700 each. No tool subscriptions on top.</p>
            </Reveal>
            <Reveal className="plan" delay={0.12}>
              <div className="plan-l">
                <p className="plan-k">Founding rate · first cohort</p>
                <p className="plan-amt">
                  <span className="plan-cur">Rp</span>
                  <b>4,000,000</b>
                  <span className="plan-per">/ month</span>
                </p>
                <p className="plan-note">Applying is free. If you&rsquo;re picked, a refundable Rp 1,000,000 deposit holds your slot and comes off your first month.</p>
                <Link href="/start" className="btn btn--lg">
                  Get started <Arrow />
                </Link>
                <p className="plan-terms">
                  Month to month. Cancel 7 days before your next bill. No cash refunds once delivery starts: we make up any missed videos.{" "}
                  <Link href="/terms">Full terms</Link>
                </p>
                <p className="plan-cohort">The first cohort is 2 to 3 creators. Later cohorts may pay more.</p>
              </div>
              <ul className="plan-r">
                {INCLUDED.map((t) => (
                  <li key={t}>
                    <Check />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="compare">
              <Reveal>
                <h3 className="compare-h">Or hire a team.</h3>
                <p className="compare-sub">
                  Jakarta job postings list Rp 3.5 to 8 million a month for a video editor and Rp 3 to 10 million for a scriptwriter. The tools
                  are extra, and so is managing two people.
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="compare-table" role="table" aria-label="Hiring a team compared with produktif.ai">
                  <div className="compare-row compare-head" role="row">
                    <span role="columnheader" />
                    <span role="columnheader">Hire a scriptwriter and an editor</span>
                    <span role="columnheader">produktif.ai</span>
                  </div>
                  {COMPARE.map(([k, a, b]) => (
                    <div key={k} className="compare-row" role="row">
                      <span role="rowheader">{k}</span>
                      <span role="cell">{a}</span>
                      <span role="cell">{b}</span>
                    </div>
                  ))}
                </div>
                <p className="compare-src">Hiring costs from Jakarta job postings on Loker.id and Glints, October 2026.</p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- founder proof ---------- */}
        <section className="sec proof" aria-labelledby="proof-h">
          <div className="wrap">
            <Eyebrow n="05">The playbook</Eyebrow>
            <div className="proof-top">
              <div>
                <Reveal>
                  <h2 id="proof-h" className="h2">
                    Built on the playbook behind 690K followers.
                  </h2>
                </Reveal>
                <Reveal delay={0.08}>
                  <p className="lead proof-lead">
                    Hanif Produktif grew his accounts with short videos about scams and money. Your scripts start from that playbook, written for
                    your niche.
                  </p>
                </Reveal>
              </div>
              <Reveal className="proof-quote" delay={0.12}>
                <p>&ldquo;I read every application myself. If you&rsquo;re picked, you&rsquo;ll hear it from me.&rdquo;</p>
                <span>Hanif Produktif, founder</span>
              </Reveal>
            </div>
            <ul className="stats">
              {STATS.map((s) => (
                <li key={s.label} className="stat">
                  <span className="stat-tag">{s.tag}</span>
                  <b>{s.value}</b>
                  <p>{s.label}</p>
                </li>
              ))}
            </ul>
            <p className="proof-note">
              Numbers as of October 2026. These are Hanif&rsquo;s own accounts, where he films himself. Your account starts somewhere else, and
              nobody can guarantee views.
            </p>
          </div>
        </section>

        {/* ---------- trust ---------- */}
        <section className="sec trust" aria-labelledby="trust-h">
          <div className="wrap trust-grid-wrap">
            <div>
              <Eyebrow n="06">Your face and voice</Eyebrow>
              <Reveal>
                <h2 id="trust-h" className="h2">
                  Your face stays yours.
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="lead">We build one persona per creator, from your recording, with your written and spoken consent. Here&rsquo;s what that means.</p>
              </Reveal>
              <Reveal delay={0.12}>
                <Link href="/consent" className="link trust-link">
                  How we use your face and voice <Arrow />
                </Link>
              </Reveal>
            </div>
            <Stagger className="trust-list" as="ul" gap={0.06}>
              {TRUST.map((t) => (
                <span key={t} className="trust-li">
                  <Check />
                  {t}
                </span>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ---------- who it's for ---------- */}
        <section className="sec fit" aria-labelledby="fit-h">
          <div className="wrap fit-grid">
            <div>
              <Eyebrow n="07">Who it&rsquo;s for</Eyebrow>
              <Reveal>
                <h2 id="fit-h" className="h2">
                  For creators who know what they want to say.
                </h2>
              </Reveal>
            </div>
            <div className="fit-copy">
              <Reveal>
                <p className="lead">
                  You have a niche and an audience. Filming and editing are what eat your week. Indonesia first, and applications from anywhere are
                  welcome.
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="fit-not">
                  <b>Not for:</b> gambling and trading offers, or MLM and get-rich-quick schemes. Regulated professions, such as doctors and
                  financial advisors, join a later cohort.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section className="sec faq" id="faq" aria-labelledby="faq-h">
          <div className="wrap faq-grid">
            <div className="faq-side">
              <Eyebrow n="08">FAQ</Eyebrow>
              <h2 id="faq-h" className="h2">
                Questions before you apply
              </h2>
              <div className="faq-cta">
                <p>About 2 minutes to apply. Nothing to pay now.</p>
                <Link href="/start" className="btn btn--sm">
                  Get started <Arrow />
                </Link>
              </div>
            </div>
            <div className="faq-list">
              {FAQ.map(([q, a], i) => (
                <details key={q} open={i === 0}>
                  <summary>
                    {q}
                    <span className="pm" aria-hidden="true" />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- final ---------- */}
        <section className="final" id="final-cta" aria-labelledby="final-h">
          <div className="wrap final-in">
            <Kinetic as="h2" id="final-h" className="final-h" lines={["You pay.", "You get the videos."]} delay={0} />
            <p className="final-sub">The first cohort is 2 to 3 creators. Hanif reads every application and replies within 2 working days.</p>
            <Link href="/start" className="btn btn--lg btn--light">
              Get started <Arrow />
            </Link>
            <p className="final-fine">About 2 minutes. Nothing to pay now.</p>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <p className="wordmark" aria-hidden="true">
            produktif<i>.</i>ai
          </p>
          <div className="foot-row">
            <div className="foot-brand">
              <Brand />
              <p className="foot-tag">Your videos just show up.</p>
            </div>
            <nav aria-label="Footer">
              <a href="#how">How it works</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
              <Link href="/consent">How we use your face and voice</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <a href="mailto:abuse@produktif.ai">Report misuse</a>
            </nav>
          </div>
          <p className="foot-fine">
            produktif.ai · Yogyakarta, Indonesia · Founded by{" "}
            <a href="https://www.instagram.com/hanifproduktif/" target="_blank" rel="noopener noreferrer">
              Hanif Produktif
            </a>
            . Produktif is Indonesian for productive.
          </p>
        </div>
      </footer>
      <MobileCta />
    </div>
  );
}
