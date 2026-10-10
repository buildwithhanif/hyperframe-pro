import type { Viewport } from "next";
import Link from "next/link";
import { fontVars } from "@/app/fonts";
import "./tokens.css";
import "./home.css";
import { LangSample, Timeline } from "@/components/home/Anatomy";
import ChaosToCalm from "@/components/home/ChaosToCalm";
import MonthGrid from "@/components/home/MonthGrid";
import Nav from "@/components/home/Nav";
import PhoneReel, { FrameStill } from "@/components/home/PhoneReel";
import Steps, { type Step } from "@/components/home/Steps";
import { Kinetic, Rise } from "@/components/home/motion";
import { Wordmark } from "@/components/site/Brand";
import MotionRoot from "@/components/site/MotionRoot";

export const viewport: Viewport = {
  themeColor: "#F5F2EB",
  colorScheme: "only light",
};

// ---------- copy (BRAND.md section 5) ----------

const NOS = ["No prompts.", "No credits.", "No tool subscriptions.", "Nothing new to learn."];

const STEPS: Step[] = [
  {
    n: "01",
    title: "Send your kit",
    body: "3 photos and a 2-minute voice read that ends with your spoken consent. A short brief and a 30-minute call tell us your niche and your best posts.",
    you: "Your part: about an hour, once.",
  },
  {
    n: "02",
    title: "Approve your test clip",
    body: "We build your AI persona and make 1 video in the real format. Don't like it? We redo it once. Still not right, and your Rp 1,000,000 deposit comes back.",
  },
  {
    n: "03",
    title: "Get 14 videos a week",
    body: "Each batch lands on WhatsApp a week before it goes out, with captions and post copy. Reply OK, or send notes within 48 hours.",
    you: "Your part: about 15 minutes a week.",
  },
  {
    n: "04",
    title: "Post 2 a day",
    body: "Switch on the platform's AI label when you upload. That's the whole routine.",
  },
];

const STATS = [
  { value: "690K", label: "followers across Hanif's platforms" },
  { value: "297K", label: "median views on his last 30 Reels (@hanifmuh_)" },
  { value: "17.6M", label: "Instagram views on one Reel" },
  { value: "106.7M", label: "views from 220 carousels in 63 days" },
];

const INCLUDED = [
  "60 videos a month (30 to 45 s), ready to post 2 a day",
  "Your AI persona on the hook and outro, labeled as AI",
  "Topics and scripts in your niche. Swap any topic",
  "Motion graphics and screen demos, captions burned in, 9:16",
  "A post caption with hashtags and a CTA for every video",
  "Indonesian, English or both, your pick each month",
  "Your approval on every video before it goes out",
  "No tool subscriptions",
];

const COMPARE = [
  ["Monthly cost", "Rp 6.5 to 18 million, before tools", "Rp 4,000,000"],
  ["Tool subscriptions", "You pay for them", "None for you"],
  ["You still film", "Yes", "No"],
  ["Who you manage", "2 people", "1 WhatsApp chat"],
  ["Videos a month", "Whatever the team can make", "60"],
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
    "It's your AI persona, made from your recording: 3 photos and a 2-minute voice read. It opens and closes each video, and every video is labeled as AI. You approve each one before you post it.",
  ],
  ["Do I ever have to film?", "No. You send the photos and the voice read once, at the start. You can still post your own filmed videos whenever you like."],
  [
    "How much of my time does it take?",
    "About an hour to set up, most of it a 30-minute call. Then about 15 minutes a week to watch the batch and reply on WhatsApp.",
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

// ---------- bits ----------

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The primary button: an ink pill whose only red is the record dot.
function Go({ size, light }: { size?: "sm" | "lg"; light?: boolean }) {
  return (
    <Link href="/start" className={`btn${size ? ` btn--${size}` : ""}${light ? " btn--light" : ""}`}>
      <i className="btn-dot" aria-hidden="true" />
      Get started
      <Arrow />
    </Link>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="kicker">{children}</p>;
}

// ---------- page ----------

export default function Home() {
  return (
    <div className={`pai home ${fontVars}`}>
      <MotionRoot>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Nav />

        <main id="main">
          {/* hero */}
          <section className="hero" aria-labelledby="hero-h">
            <div className="wrap hero-grid">
              <div className="hero-copy">
                <p className="kicker hero-kicker arrive">Done-for-you short videos for creators</p>
                <Kinetic id="hero-h" className="hero-h" lines={["Post every day.", "We make the", "*videos.*"]} delay={0.08} />
                <p className="hero-sub arrive a2">
                  <span className="only-wide">
                    Send 3 photos and a 2-minute voice read, once. We turn them into your AI persona and make 60 short videos a month, enough to
                    post 2 a day. You approve them on WhatsApp, then post.
                  </span>
                  <span className="only-narrow">3 photos and a 2-minute voice read, once. Then 60 finished videos a month with your AI persona, ready to post.</span>
                </p>
                <div className="hero-ctas arrive a3" id="hero-cta">
                  <Go size="lg" />
                  <a href="#how" className="link">
                    See how it works
                  </a>
                </div>
                <p className="hero-micro arrive a4">
                  <b>Founding rate: Rp 4,000,000 a month for 60 videos.</b>
                  <br />
                  About 2 minutes to apply. Nothing to pay now.
                </p>
              </div>
              <div className="hero-stage">
                <div className="stack">
                  <FrameStill className="stack-f f-o1" still={{ kind: "list" }} />
                  <FrameStill className="stack-f f-o2" still={{ kind: "persona", words: ["Save", "this", "one."], stress: 1 }} />
                  <FrameStill className="stack-f f-i1" still={{ kind: "price" }} />
                  <FrameStill className="stack-f f-i2" still={{ kind: "persona", words: ["Follow", "for", "part", "2."], stress: 2 }} />
                  <div className="stack-front">
                    <PhoneReel longLabel chipHref="/consent" />
                  </div>
                </div>
                <p className="status-chip" aria-hidden="true">
                  <Check /> Batch 3 · 14 videos ready
                </p>
              </div>
            </div>
          </section>

          {/* the tired band */}
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
              <Go />
            </div>
          </section>

          {/* how it works */}
          <section className="sec how" id="how" aria-labelledby="how-h">
            <div className="wrap">
              <Steps steps={STEPS}>
                <Kicker>How it works</Kicker>
                <Rise id="how-h" className="h2" lines={["Set up once.", "Approve once a week."]} />
                <p className="lead">About an hour at the start. After that, about 15 minutes a week on WhatsApp.</p>
              </Steps>
            </div>
          </section>

          {/* inside one video */}
          <section className="sec anatomy" aria-labelledby="anatomy-h">
            <div className="wrap anatomy-grid">
              <div>
                <Kicker>The product</Kicker>
                <Rise id="anatomy-h" className="h2" lines={["What’s inside every video"]} />
                <p className="lead">30 to 45 seconds. Your persona opens and closes it. The middle does the explaining.</p>
                <Timeline />
                <p className="anatomy-why">Your audience follows a person. Your persona greets them and signs off, and the middle stays on the useful part.</p>
              </div>
              <LangSample />
            </div>
          </section>

          {/* the month */}
          <section className="sec get" id="get" aria-labelledby="get-h">
            <div className="wrap get-grid">
              <div>
                <Kicker>The month</Kicker>
                <Rise id="get-h" className="h2" lines={["Two a day, for the whole month."]} />
                <p className="lead">
                  60 videos per 30-day cycle. They come in weekly batches of 14, a week before they go out, so you&rsquo;re never rushing a post.
                </p>
                <ul className="get-strip">
                  <li>
                    <b>60</b> a month
                  </li>
                  <li>
                    <b>14</b> a week
                  </li>
                  <li>
                    <b>2</b> a day
                  </li>
                  <li>
                    <b>9:16</b> for Reels, TikTok and Shorts
                  </li>
                </ul>
              </div>
              <div className="get-month">
                <div className="get-month-h">
                  <b>Your month</b>
                  <span>
                    <b>60</b> videos
                  </span>
                </div>
                <MonthGrid />
              </div>
            </div>
          </section>

          {/* the playbook */}
          <section className="sec proof" aria-labelledby="proof-h">
            <div className="wrap">
              <div className="proof-top">
                <div>
                  <Kicker>Why the scripts work</Kicker>
                  <Rise id="proof-h" className="h2" lines={["Built on the playbook behind 690K followers."]} />
                  <p className="lead proof-lead">
                    Hanif Produktif grew his accounts with short videos about scams and money. Your scripts start from that playbook, written for your
                    niche.
                  </p>
                </div>
                <figure className="proof-quote">
                  <blockquote>
                    <p>
                      &ldquo;This started in my DMs. People kept asking if they could pay me to make their videos. I read every application myself, and
                      if you&rsquo;re picked, you&rsquo;ll hear it from me.&rdquo;
                    </p>
                  </blockquote>
                  <figcaption>Hanif Produktif, founder</figcaption>
                </figure>
              </div>
              <ul className="stats">
                {STATS.map((s) => (
                  <li key={s.label} className="stat">
                    <span className="stat-tag">Founder&rsquo;s account · as of Oct 2026</span>
                    <b>{s.value}</b>
                    <p>{s.label}</p>
                  </li>
                ))}
              </ul>
              <p className="proof-note">These are Hanif&rsquo;s own accounts, where he films himself. Your account starts somewhere else, and nobody can guarantee views.</p>
            </div>
          </section>

          {/* pricing: kept still on purpose */}
          <section className="sec price" id="pricing" aria-labelledby="price-h">
            <div className="wrap">
              <Kicker>Pricing</Kicker>
              <h2 id="price-h" className="h2">
                Rp 4,000,000 a month.
                <br />
                That&rsquo;s the whole bill.
              </h2>
              <p className="lead">60 finished videos, about Rp 66,700 each. No tool subscriptions on top.</p>
              <div className="plan">
                <div className="plan-l">
                  <p className="plan-k">Founding rate · first cohort</p>
                  <p className="plan-amt">
                    <b>Rp 4,000,000</b>
                    <span className="plan-per">/ month</span>
                  </p>
                  <p className="plan-note">Applying is free. If you&rsquo;re picked, a refundable Rp 1,000,000 deposit holds your slot and comes off your first month.</p>
                  <Go size="lg" />
                  <p className="plan-under">Apply for the first cohort. About 2 minutes, nothing to pay now.</p>
                  <p className="plan-terms">
                    Month to month. Cancel 7 days before your next bill. Once delivery starts, we make up missed videos instead of refunding.{" "}
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
              </div>

              <div className="compare">
                <div>
                  <h3 className="compare-h">Or hire a team.</h3>
                  <p className="compare-sub">
                    Jakarta job postings list Rp 3.5 to 8 million a month for a video editor and Rp 3 to 10 million for a scriptwriter. Tools cost
                    extra, and you manage 2 people.
                  </p>
                </div>
                <div>
                  <div className="compare-table" role="table" aria-label="Hiring a team compared with produktif.ai">
                    <div className="compare-row compare-head" role="row">
                      <span role="columnheader">
                        <span className="sr">Item</span>
                      </span>
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
                </div>
              </div>
            </div>
          </section>

          {/* your face, your rules */}
          <section className="sec trust" aria-labelledby="trust-h">
            <div className="wrap trust-grid">
              <div>
                <Kicker>Your face and voice</Kicker>
                <Rise id="trust-h" className="h2" lines={["Your face stays yours."]} />
                <p className="lead">We build one persona per creator, from your recording, with your written and spoken consent. Here&rsquo;s what that means.</p>
                <Link href="/consent" className="link trust-link">
                  How we use your face and voice <Arrow />
                </Link>
              </div>
              <ul className="trust-list">
                {TRUST.map((t) => (
                  <li key={t}>
                    <Check />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* who it's for */}
          <section className="sec fit" aria-labelledby="fit-h">
            <div className="wrap fit-grid">
              <div>
                <Kicker>Who it&rsquo;s for</Kicker>
                <Rise id="fit-h" className="h2" lines={["For creators who know what they want to say."]} />
              </div>
              <div className="fit-copy">
                <p className="lead">
                  You have a niche and an audience. Filming and editing are what eat your week. Indonesia first, and applications from anywhere are
                  welcome.
                </p>
                <p className="fit-not">
                  <b>Not for:</b> gambling and trading offers, or MLM and get-rich-quick schemes. Regulated professions, such as doctors and financial
                  advisors, join a later cohort.
                </p>
              </div>
            </div>
          </section>

          {/* faq */}
          <section className="sec faq" id="faq" aria-labelledby="faq-h">
            <div className="wrap faq-grid">
              <div className="faq-side">
                <Kicker>FAQ</Kicker>
                <Rise id="faq-h" className="h2" lines={["Questions before you apply"]} />
                <div className="faq-cta">
                  <p>About 2 minutes to apply. Nothing to pay now.</p>
                  <Go size="sm" />
                </div>
              </div>
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

          {/* final call to action */}
          <section className="final" id="final-cta" aria-labelledby="final-h">
            <div className="wrap final-in">
              <Rise id="final-h" className="final-h" lines={["You pay.", "You get the *videos.*"]} />
              <p className="final-sub">The first cohort is 2 to 3 creators. Hanif reads every application and replies within 2 working days.</p>
              <Go size="lg" light />
              <p className="final-fine">Apply for the first cohort. About 2 minutes, nothing to pay now.</p>
            </div>
          </section>
        </main>

        <footer className="foot">
          <div className="wrap">
            <Wordmark className="foot-wm" />
            <div className="foot-row">
              <p className="foot-tag">Your videos just show up.</p>
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
            </p>
            <p className="foot-small">Produktif is Indonesian for productive.</p>
          </div>
        </footer>
      </MotionRoot>
    </div>
  );
}
