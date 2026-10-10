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
import { CountUp, Kinetic, Reveal, Stagger } from "@/components/home/motion";

export const viewport: Viewport = {
  themeColor: "#F5F2EB",
  colorScheme: "light",
};

// ---------- copy ----------

const NOS = ["No prompts.", "No editing apps.", "No tool subscriptions.", "No filming days."];

const STEPS: Step[] = [
  {
    n: "01",
    title: "Send your kit",
    body: "Three photos and a 2-minute voice read, recorded on your phone. You never film for us again.",
    you: "Your part: about 10 minutes, once.",
  },
  {
    n: "02",
    title: "We build your AI persona",
    body: "Your face and voice, made only from your own recording and with your written consent. You see a test clip before your first month starts.",
  },
  {
    n: "03",
    title: "Approve the week on WhatsApp",
    body: "Every week, 14 finished videos land in your WhatsApp. Reply OK, or ask for a change. Each video gets one full redo, and text fixes are free.",
    you: "Your part: a few minutes a week.",
  },
  {
    n: "04",
    title: "Post. Two a day.",
    body: "Every video comes with its caption, hashtags and call to action. Switch on the AI label, post, and get back to your day.",
  },
];

const INCLUDED = [
  ["Topic research", "A month of topics in your niche. Swap any you don't like."],
  ["Scripts that sound like you", "Written with Hanif's playbook. Facts checked, sources logged."],
  ["Your AI persona", "Your face and voice, from your own photos and recording."],
  ["Motion graphics and screen demos", "So every idea is easy to follow, even with the sound off."],
  ["Captions burned in", "9:16, ready for Reels, TikTok and Shorts."],
  ["Post copy", "Caption, hashtags and a call to action for every video."],
  ["Bahasa Indonesia or English", "Pick per month, or split them."],
  ["One redo per video", "Text fixes are always free."],
];

const YOU = ["Send 3 photos and a 2-minute voice read, once", "Approve a weekly batch on WhatsApp", "Post"];
const US = [
  "Research topics in your niche",
  "Write and fact-check every script",
  "Build and maintain your AI persona",
  "Generate, edit and caption every video",
  "Design the graphics and screen demos",
  "Write captions, hashtags and calls to action",
  "Deliver 14 videos every week",
];

const STATS = [
  { tag: "Founder's accounts", to: 690, suffix: "K", decimals: 0, label: "followers across his platforms" },
  { tag: "@hanifmuh_", to: 297, suffix: "K", decimals: 0, label: "median views on his recent Reels" },
  { tag: "@hanifmuh_", to: 17.6, suffix: "M", decimals: 1, label: "views on a single Reel" },
  { tag: "@hanifmuh_", to: 106.7, suffix: "M", decimals: 1, label: "views from 220 carousels in 63 days" },
];

const TRUST = [
  ["Only you", "We only build a persona of the person who records and gives consent. Never anyone else."],
  ["You approve everything", "Nothing goes out without your OK. You post every video yourself."],
  ["Labeled as AI", "Every post carries the platform's AI label, plus a line in your bio."],
  ["Gone when you leave", "Your photos, voice and persona are deleted everywhere within 30 days."],
];

const FAQ = [
  [
    "Is it really me in the videos?",
    "It's an AI persona made from your own photos and voice. It opens and closes each video, and graphics carry the middle. You approve every video before it goes out.",
  ],
  ["Do I ever have to film?", "No. You send 3 photos and a 2-minute voice read once, from your phone. That's it."],
  [
    "Who writes the scripts?",
    "We do, in your niche, with the playbook Hanif uses on his own accounts. You get the month's topics first and can swap any. We only tell personal stories you've actually shared with us.",
  ],
  ["Do you guarantee views?", "No. Nobody can, and we won't pretend to. What we guarantee is 60 finished videos a month."],
  [
    "Will the videos be labeled as AI?",
    "Yes. You switch on the platform's AI label when you post and keep a line in your bio. It keeps you honest with your audience and inside platform rules.",
  ],
  [
    "What happens to my face and voice?",
    "They're used only for your videos, kept in a restricted drive, and processed by AI providers outside Indonesia that we name in your signed consent. Leave, and we delete everything within 30 days.",
  ],
  ["Who owns the videos?", "You do. You own the videos and your likeness. We only show a sample if you say yes in writing."],
  [
    "What if I don't like my persona?",
    "You see a test clip before your first month starts. If it's off, we redo it once. Still not right? Your Rp 1,000,000 deposit comes back.",
  ],
  ["Can I cancel?", "Yes. It's month to month. Tell us at least 7 days before your next billing date."],
  [
    "Who is this for?",
    "Creators who know what they want to say and are done with the tools, the prompts and the filming days. Indonesia first. The waitlist is open worldwide.",
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
                <span>Done-for-you AI videos for creators</span>
                <span className="live">
                  <i aria-hidden="true" />
                  First cohort open
                </span>
              </p>
              <Kinetic id="hero-h" className="hero-h" lines={["Stop prompting.", "Start posting."]} />
              <p className="hero-sub fade-in d2">
                Send us 3 photos and a 2-minute voice note, once. We turn them into your AI persona and deliver{" "}
                <b>60 ready-to-post videos every month</b>, in your face and your voice.
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
                <b>Rp 4,000,000 a month</b> · founding rate · month to month
                <br />
                Every video uses your AI persona and is labeled as AI.
              </p>
            </div>
            <div className="hero-stage fade-in d2">
              <div className="hero-phone">
                <PhoneReel />
              </div>
              <span className="chip chip-1">
                <Check /> Script approved
              </span>
              <span className="chip chip-2">
                <i className="chip-dot" /> 14 videos ready · Monday
              </span>
              <span className="chip chip-3">
                <Check /> Captions burned in
              </span>
              <span className="chip chip-4">
                <Check /> Post copy written
              </span>
            </div>
          </div>
          <div className="wrap">
            <ul className="nos" aria-label="What you won't need">
              {NOS.map((n) => (
                <li key={n}>
                  <span className="x" aria-hidden="true" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- before / after ---------- */}
        <ChaosToCalm />

        {/* ---------- how it works ---------- */}
        <section className="sec how" id="how" aria-labelledby="how-h">
          <div className="wrap">
            <Steps steps={STEPS}>
              <Eyebrow n="01">How it works</Eyebrow>
              <Reveal>
                <h2 id="how-h" className="h2">
                  Ten minutes from you.
                  <br />
                  The rest is on us.
                </h2>
              </Reveal>
            </Steps>
          </div>
        </section>

        {/* ---------- anatomy ---------- */}
        <section className="sec anatomy" aria-labelledby="anatomy-h">
          <div className="wrap anatomy-grid">
            <div>
              <Eyebrow n="02">What a video looks like</Eyebrow>
              <Reveal>
                <h2 id="anatomy-h" className="h2">
                  Your face opens.
                  <br />
                  Your face closes.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="lead">
                  Each video runs 30 to 45 seconds. Your AI persona delivers the hook and the outro. In between, motion graphics and screen
                  demos carry the idea, with captions burned in, so it works with the sound off.
                </p>
              </Reveal>
              <Stagger className="anatomy-tl" as="ol">
                <div className="tl-seg tl-hook">
                  <b>Hook</b>
                  <span>0 to 3 s · your AI face grabs attention</span>
                </div>
                <div className="tl-seg tl-body">
                  <b>Body</b>
                  <span>Graphics, demos and captions do the explaining</span>
                </div>
                <div className="tl-seg tl-outro">
                  <b>Outro</b>
                  <span>Your AI face asks for the follow</span>
                </div>
              </Stagger>
            </div>
            <Reveal className="anatomy-phone" delay={0.15}>
              <PhoneReel />
            </Reveal>
          </div>
        </section>

        {/* ---------- what you get ---------- */}
        <section className="sec get" id="get" aria-labelledby="get-h">
          <div className="wrap">
            <Eyebrow n="03">What you get</Eyebrow>
            <div className="get-top">
              <Reveal>
                <h2 id="get-h" className="h2">
                  Sixty a month.
                  <br />
                  Ready every Monday.
                </h2>
              </Reveal>
              <Reveal className="get-count" delay={0.1}>
                <span className="get-big">
                  <CountUp to={60} />
                </span>
                <span className="get-big-l">videos a month, 2 a day, in weekly batches of 14</span>
              </Reveal>
            </div>
            <div className="get-grid">
              <Stagger className="get-list" as="ul" gap={0.05}>
                {INCLUDED.map(([t, d]) => (
                  <div key={t} className="get-item">
                    <Check />
                    <div>
                      <b>{t}</b>
                      <span>{d}</span>
                    </div>
                  </div>
                ))}
              </Stagger>
              <Reveal className="get-month" delay={0.1}>
                <div className="get-month-h">
                  <b>Your month</b>
                  <span>2 a day</span>
                </div>
                <MonthGrid />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- you vs us ---------- */}
        <section className="sec split" aria-labelledby="split-h">
          <div className="wrap">
            <Eyebrow n="04">Who does the work</Eyebrow>
            <Reveal>
              <h2 id="split-h" className="h2">
                Your job is tiny.
                <br />
                Ours is everything else.
              </h2>
            </Reveal>
            <div className="split-grid">
              <Reveal className="split-col split-you">
                <p className="split-h">You</p>
                <ol>
                  {YOU.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ol>
              </Reveal>
              <Reveal className="split-col split-us" delay={0.1}>
                <p className="split-h">produktif.ai</p>
                <Stagger as="ol" gap={0.06}>
                  {US.map((x) => (
                    <span key={x} className="split-li">
                      <Check />
                      {x}
                    </span>
                  ))}
                </Stagger>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- founder proof ---------- */}
        <section className="sec proof" aria-labelledby="proof-h">
          <div className="wrap">
            <Eyebrow n="05">Built by Hanif Produktif</Eyebrow>
            <div className="proof-top">
              <Reveal>
                <h2 id="proof-h" className="h2">
                  Scripts written with the playbook that grew the founder&rsquo;s accounts.
                </h2>
              </Reveal>
              <Reveal className="proof-note" delay={0.1}>
                <p className="proof-note-h">Note</p>
                <p>
                  These are the founder&rsquo;s own accounts, where he appears on camera himself. Your account starts somewhere else, and
                  nobody can guarantee views.
                </p>
              </Reveal>
            </div>
            <ul className="stats">
              {STATS.map((s) => (
                <li key={s.label} className="stat">
                  <span className={s.tag.startsWith("@") ? "stat-tag is-handle" : "stat-tag"}>{s.tag}</span>
                  <b>
                    <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals} />
                  </b>
                  <p>{s.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- pricing ---------- */}
        <section className="sec price" id="pricing" aria-labelledby="price-h">
          <div className="wrap">
            <Eyebrow n="06">Pricing</Eyebrow>
            <Reveal>
              <h2 id="price-h" className="h2">
                One plan.
                <br />
                Founding rate.
              </h2>
            </Reveal>
            <Reveal className="plan" delay={0.1}>
              <div className="plan-l">
                <p className="plan-k">Founding cohort</p>
                <p className="plan-amt">
                  <span className="plan-cur">Rp</span>
                  <b>4,000,000</b>
                  <span className="plan-per">/ month</span>
                </p>
                <p className="plan-note">60 videos a month. Less than hiring a scriptwriter and an editor.</p>
                <Link href="/start" className="btn btn--lg">
                  Apply for the first cohort <Arrow />
                </Link>
                <ul className="plan-terms">
                  <li>Month to month. Cancel with 7 days&rsquo; notice.</li>
                  <li>No setup fee. No tool subscriptions: we cover every tool.</li>
                  <li>
                    A refundable Rp 1,000,000 deposit holds your spot. It counts toward month one, and comes back if you don&rsquo;t like your
                    test clip.
                  </li>
                </ul>
              </div>
              <ul className="plan-r">
                {INCLUDED.map(([t]) => (
                  <li key={t}>
                    <Check />
                    {t}
                  </li>
                ))}
                <li>
                  <Check />
                  Your approval on every video
                </li>
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ---------- trust ---------- */}
        <section className="sec trust" aria-labelledby="trust-h">
          <div className="wrap">
            <Eyebrow n="07">Your face and voice</Eyebrow>
            <Reveal>
              <h2 id="trust-h" className="h2">
                Your face.
                <br />
                Your rules.
              </h2>
            </Reveal>
            <Stagger className="trust-grid" gap={0.08}>
              {TRUST.map(([t, d]) => (
                <div key={t} className="trust-item">
                  <b>{t}</b>
                  <p>{d}</p>
                </div>
              ))}
            </Stagger>
            <Reveal>
              <Link href="/consent" className="link trust-link">
                How we use your face and voice <Arrow />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section className="sec faq" id="faq" aria-labelledby="faq-h">
          <div className="wrap faq-grid">
            <div className="faq-side">
              <Eyebrow n="08">FAQ</Eyebrow>
              <h2 id="faq-h" className="h2">
                Questions
              </h2>
              <div className="faq-cta">
                <p>Still deciding? Applying takes about 2 minutes and costs nothing.</p>
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
            <Kinetic as="h2" id="final-h" className="final-h" lines={["Let AI work.", "Go live your life."]} delay={0} />
            <p className="final-sub">Apply in about 2 minutes. We reply within 2 working days.</p>
            <Link href="/start" className="btn btn--lg btn--light">
              Get started <Arrow />
            </Link>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <p className="wordmark" aria-hidden="true">
            produktif<i>.</i>ai
          </p>
          <div className="foot-row">
            <Brand />
            <nav aria-label="Footer">
              <a href="#how">How it works</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
              <Link href="/consent">Face and voice</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
          <p className="foot-fine">
            © 2026 produktif.ai · Yogyakarta, Indonesia · Made by{" "}
            <a href="https://www.instagram.com/hanifproduktif/" target="_blank" rel="noopener noreferrer">
              @hanifproduktif
            </a>
          </p>
        </div>
      </footer>
      <MobileCta />
    </div>
  );
}
