import type { Viewport } from "next";
import Link from "next/link";
import { fontVars } from "@/app/fonts";
import "./tokens.css";
import "./home.css";
import Clip, { type ClipSource } from "@/components/home/Clip";
import MonthWall from "@/components/home/MonthWall";
import Nav from "@/components/home/Nav";
import { Wordmark } from "@/components/site/Brand";

export const viewport: Viewport = { themeColor: "#FFFFFF", colorScheme: "only light" };

// Hanif's own videos, made with his AI persona (face and voice). Cut and
// compressed from his posts by scripts/cut-samples.sh. Each loop is the
// opening of a real post: the hook, then B-roll, screen demos and captions.
const clip = (id: string, title: string): ClipSource => ({ id, title, src: `/samples/${id}.mp4`, poster: `/samples/${id}.jpg` });
const HERO_CLIP = clip("qris", "QRIS");
const STRIP = [
  clip("damai", "Kecelakaan"),
  clip("dana", "Salah transfer"),
  clip("colokan", "Colokan listrik"),
  clip("xiaomi", "Iklan HP Xiaomi"),
  clip("ahliwaris", "Ahli waris"),
  clip("bpjs", "BPJS"),
];
const FRAMES = Array.from({ length: 60 }, (_, i) => `/samples/frames/f${String(i + 1).padStart(2, "0")}.jpg`);

const TIRED = [
  "Prompting until 1 a.m.",
  "Paying for 5 AI tools in dollars",
  "Credits that reset before you used them",
  "Re-rendering the same clip 6 times",
  "Fixing auto-captions by hand",
  "Another “best AI video tool” tutorial",
];

// ---------- copy ----------

type Step = { n: string; title: string; body: string; you?: string };

const STEPS: Step[] = [
  {
    n: "01",
    title: "Send your kit",
    body: "Take 3 photos of yourself, then record 2 minutes of you reading a script we send, ending with your spoken consent. A brief and a 30-minute call tell us your niche and your best posts.",
    you: "Your part: about an hour, once.",
  },
  {
    n: "02",
    title: "Approve your test clip",
    body: "We build your AI persona and make 1 test video in the real format. Don’t like it? We redo it once. Still not right after the redo? You get your Rp 1,000,000 deposit back.",
  },
  {
    n: "03",
    title: "Get 14 videos a week",
    body: "Each batch lands on WhatsApp a week before it goes out, with captions and post copy. Reply OK, or send notes within 48 hours.",
    you: "Your part: about 15 minutes a week.",
  },
  { n: "04", title: "Post 2 a day", body: "Switch on the platform’s AI label when you upload. That’s the whole routine." },
];

const STATS = [
  { value: "690K", label: "followers across Hanif’s platforms" },
  { value: "297K", label: "median views on his last 30 Reels (@hanifmuh_)" },
  { value: "17.6M", label: "Instagram views on one Reel" },
  { value: "106.7M", label: "views from 220 carousels in 63 days" },
];

const INCLUDED = [
  "60 videos a month, 30 to 45 seconds each, ready to post 2 a day",
  "Your AI persona on the hook and outro, labeled as AI",
  "Topics and scripts in your niche. Swap any topic",
  "B-roll and screen demos with captions burned in, 9:16",
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
  "Only the creator who signs. Never anyone else’s face.",
  "An ID and live selfie check. 18 and over.",
  "Your persona only does the hook and the outro.",
  "Real stories only: the ones you told us.",
  "Every post carries the platform’s AI label.",
  "You own your videos and your likeness.",
  "Cancel, and we delete everything within 30 days and confirm it in writing.",
];

const FAQ = [
  [
    "Is it really me in the videos?",
    "It’s your AI persona, built from the photos and voice recording you send us. It appears at the start and end of each video, with an AI label. You still approve every video before it goes out.",
  ],
  [
    "Can I see a sample before I pay for a month?",
    "Yes, of your own persona. Within 7 days of the deposit you get 1 test clip in the real format. If it still isn’t right after one redo, the deposit comes back and we delete your files.",
  ],
  [
    "Do I ever have to film?",
    "No. You send the photos and the voice recording once, at the start. You can still post your own filmed videos whenever you like.",
  ],
  [
    "How much of my time does it take?",
    "About an hour to set up, most of it a 30-minute call. Then about 15 minutes a week to watch the batch and reply on WhatsApp.",
  ],
  [
    "Do you post for me?",
    "No. You post, so nothing goes out without you. You get 9:16 files for Reels, TikTok and Shorts, plus the caption, hashtags and CTA to paste.",
  ],
  [
    "Who writes the scripts? Are the facts checked?",
    "We write every script from Hanif’s playbook, in your niche, and log a source for every fact. Hanif checks each claim before a video is made, and you see each week’s scripts first.",
  ],
  [
    "What if I don’t like a video?",
    "Text fixes are free anytime, and every video gets one full redo. Nothing goes out unless you approve it, because you post it yourself.",
  ],
  [
    "Do you guarantee views?",
    "No. Nobody can, and we won’t promise what we don’t control. What you get is 60 finished videos a month, written with the playbook behind the founder’s accounts.",
  ],
  [
    "Will the videos be labeled as AI?",
    "Yes. It’s in the agreement: you switch on the platform’s AI label for every post and keep a line in your bio. We show you how.",
  ],
  [
    "What happens to my face and voice data?",
    "It’s kept in restricted storage with two-factor login, and working copies are wiped after each video is made. If you cancel, we delete everything within 30 days and confirm it in writing.",
  ],
  [
    "Who owns the videos?",
    "You own the videos and your likeness. We get a license to make videos for you while you’re a client. Your videos only appear as our samples if you opt in separately.",
  ],
  [
    "Can I make a persona of someone else?",
    "No. We only build a persona of the creator who signs the agreement and records the consent line.",
  ],
  [
    "How do I pay?",
    "By bank transfer, against a PDF invoice. If you’re picked, the Rp 1,000,000 deposit comes first. Your first month starts the day you approve your persona, and that invoice is Rp 3,000,000 because the deposit comes off it.",
  ],
  [
    "How does canceling work?",
    "It’s month to month. Message us at least 7 days before your next bill, and charges stop after the month you’ve paid for.",
  ],
  [
    "How do I know a message is really from you?",
    "Hanif messages you himself after you apply. We only ask for money after you’re picked, and always with a PDF invoice by email. If anything looks off, reply to your confirmation email before you pay.",
  ],
  [
    "What if I’m not picked for the first cohort?",
    "You stay on the list. After the first cohort, a new one opens every month, and we email you before each one opens.",
  ],
  [
    "Why apply instead of just paying?",
    "Every persona takes real setup, so we start small: 2 to 3 creators in the first cohort, picked by fit. Applying is free, and Hanif reads every application.",
  ],
];

// ---------- bits ----------

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Go({ size }: { size?: "sm" | "lg" }) {
  return (
    <Link href="/start" className={`btn${size ? ` btn--${size}` : ""}`}>
      Get started
    </Link>
  );
}

// ---------- page ----------

export default function Home() {
  return (
    <div className={`pai home ${fontVars}`}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />

      <main id="main">
        <section className="hero" aria-labelledby="hero-h">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <h1 id="hero-h" className="hero-h">
                <span>Post every day.</span> <span>We make the videos.</span>
              </h1>
              <p className="hero-sub">
                <span className="only-wide">
                  Send 3 photos and a <span className="nw">2-minute</span> voice recording, once. We make 60 captioned videos a month with
                  your AI persona and <span className="nw">B-roll</span>, ready to post 2 a day. You approve them on WhatsApp.
                </span>
                <span className="only-narrow">
                  3 photos and a <span className="nw">2-minute</span> voice recording, once. Then 60 finished videos a month with your AI
                  persona, labeled as AI.
                </span>
              </p>
              <div className="hero-ctas" id="hero-cta">
                <Go size="lg" />
                <a href="#how" className="link">
                  See how it works
                </a>
              </div>
              <p className="hero-micro">
                <b>Founding rate: Rp 4,000,000 a month for 60 videos.</b> About 2 minutes to apply, and nothing to pay now.
              </p>
            </div>
            <div className="hero-media">
              <Clip clip={HERO_CLIP} eager className="hero-clip" />
              <p className="hero-note">
                The face and voice in every clip on this page are Hanif&rsquo;s AI persona.{" "}
                <Link href="/consent">How we use a face and voice</Link>
              </p>
            </div>
          </div>
        </section>

        <section className="sec samples" aria-labelledby="samples-h">
          <div className="wrap">
            <div className="sec-head">
              <h2 id="samples-h" className="h-big">
                One persona. A new topic every day.
              </h2>
              <p className="lead">
                These are Hanif&rsquo;s own posts, made with his AI persona. Yours get built the same way around your niche. Your persona
                opens and closes each one, and the <span className="nw">B-roll</span> carries the story in between.
              </p>
            </div>
            <ul className="strip" tabIndex={0} aria-label="Sample videos">
              {STRIP.map((c) => (
                <li key={c.id}>
                  <Clip clip={c} />
                  <p className="strip-t">{c.title}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="sec tired" aria-labelledby="tired-h">
          <div className="wrap tired-grid">
            <h2 id="tired-h" className="h2">
              AI was supposed to save you time.
            </h2>
            <ul className="tired-list">
              {TIRED.map((t) => (
                <li key={t}>
                  <span className="struck">{t}</span>
                </li>
              ))}
            </ul>
            <div className="tired-after">
              <p className="lead">
                Here there&rsquo;s nothing to prompt. You send 3 photos and a <span className="nw">2-minute</span> voice recording once, and
                we handle everything after that, down to the post copy.
              </p>
              <Go />
            </div>
          </div>
        </section>

        <section className="sec how" id="how" aria-labelledby="how-h">
          <div className="wrap">
            <div className="sec-head">
              <h2 id="how-h" className="h2">
                Set up once. Approve once a week.
              </h2>
              <p className="lead">
                About an hour at the start, then about 15 minutes a week on WhatsApp. Before step 1: apply in 2 minutes, and Hanif replies
                within 2 working days.
              </p>
            </div>
            <ol className="steps">
              {STEPS.map((s) => (
                <li key={s.n}>
                  <span className="steps-n">{Number(s.n)}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  {s.you && <p className="steps-you">{s.you}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="sec month" id="month" aria-labelledby="month-h">
          <div className="wrap month-grid">
            <div className="month-copy">
              <h2 id="month-h" className="h-big">
                Two a day, for the whole month.
              </h2>
              <p className="lead">
                60 videos per 30-day cycle, in weekly batches of 14 that land a week before they go out. You never rush a post.
              </p>
              <dl className="month-stats">
                <div>
                  <dt>60</dt>
                  <dd>a month</dd>
                </div>
                <div>
                  <dt>14</dt>
                  <dd>a week</dd>
                </div>
                <div>
                  <dt>2</dt>
                  <dd>a day</dd>
                </div>
              </dl>
            </div>
            <MonthWall frames={FRAMES} />
          </div>
        </section>

        <section className="sec proof" aria-labelledby="proof-h">
          <div className="wrap proof-grid">
            <div>
              <h2 id="proof-h" className="h2">
                Built on the playbook behind 690K followers.
              </h2>
              <p className="lead">
                Hanif Produktif grew his accounts with short videos about scams and money. Your scripts start from that playbook, written
                for your niche.
              </p>
              <blockquote className="proof-quote">
                <p>
                  &ldquo;This started in my DMs. People kept asking if they could pay me to make their videos. I read every application
                  myself, and if you&rsquo;re picked, you&rsquo;ll hear it from me.&rdquo;
                </p>
                <footer>
                  Hanif Produktif, founder,{" "}
                  <a href="https://www.instagram.com/hanifmuh_/" target="_blank" rel="noopener noreferrer">
                    @hanifmuh_
                  </a>
                </footer>
              </blockquote>
            </div>
            <div>
              <dl className="ledger">
                {STATS.map((x) => (
                  <div key={x.label}>
                    <dt>{x.value}</dt>
                    <dd>{x.label}</dd>
                  </div>
                ))}
              </dl>
              <p className="proof-note">
                Founder&rsquo;s accounts, numbers as of October 2026. Your account starts somewhere else, and nobody can guarantee views.
              </p>
            </div>
          </div>
        </section>

        <section className="sec price" id="pricing" aria-labelledby="price-h">
          <div className="wrap price-grid">
            <div>
              <h2 id="price-h" className="h-big">
                Rp 4,000,000 a month. That&rsquo;s the whole bill.
              </h2>
              <p className="lead">60 finished videos, about Rp 66,700 each. No tool subscriptions on top.</p>
              <p className="price-note">
                Applying is free. If you&rsquo;re picked, a Rp 1,000,000 deposit holds your slot and comes off your first month. You see a
                test clip of your own persona first. Still not right after one redo? The deposit comes back.
              </p>
              <div className="price-cta">
                <Go size="lg" />
                <p>You pay nothing until you&rsquo;re accepted.</p>
              </div>
              <p className="price-terms">
                Month to month. Cancel 7 days before your next bill. Once delivery starts, we make up missed videos instead of refunding.{" "}
                <Link href="/terms">Full terms</Link>. The first cohort is 2 to 3 creators, and after it a new cohort opens every month.
              </p>
            </div>
            <div>
              <h3 className="h3">Every month includes</h3>
              <ul className="ticks">
                {INCLUDED.map((t) => (
                  <li key={t}>
                    <Check />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="wrap compare">
            <h3 className="h3">Or hire a team</h3>
            <div className="compare-table" role="table" aria-label="Hiring a team compared with produktif.ai">
              <div className="compare-row compare-head" role="row">
                <span role="columnheader">
                  <span className="sr">Item</span>
                </span>
                <span role="columnheader">A scriptwriter and an editor</span>
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
        </section>

        <section className="sec trust" aria-labelledby="trust-h">
          <div className="wrap trust-grid">
            <div>
              <h2 id="trust-h" className="h2">
                Your face stays yours.
              </h2>
              <p className="lead">We build one persona per creator, from your recording, with your written and spoken consent.</p>
              <Link href="/consent" className="link link--inverse">
                How we use your face and voice
              </Link>
            </div>
            <ul className="rules">
              {TRUST.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="sec fit" aria-labelledby="fit-h">
          <div className="wrap fit-grid">
            <h2 id="fit-h" className="h2">
              For creators who know what they want to say.
            </h2>
            <div>
              <p className="lead">
                You have a niche and an audience. Filming and editing are what eat your week. Indonesia first, and applications from
                anywhere are welcome.
              </p>
              <p className="fit-not">
                Not for gambling and trading offers, or MLM and get-rich-quick schemes. Regulated professions, such as doctors and financial
                advisors, join a later cohort.
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
          <div className="wrap final-in">
            <h2 id="final-h" className="final-h">
              You pay. You get the videos.
            </h2>
            <div className="final-side">
              <p>The first cohort is 2 to 3 creators. Hanif answers every application within 2 working days.</p>
              <Link href="/start" className="btn btn--lg btn--ink">
                Get started
              </Link>
              <p className="final-fine">Takes about 2 minutes. No card needed.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <Wordmark className="foot-wm" />
          <div className="foot-row">
            <p>Your videos just show up.</p>
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
            produktif.ai, Yogyakarta, Indonesia. Founded by{" "}
            <a href="https://www.instagram.com/hanifmuh_/" target="_blank" rel="noopener noreferrer">
              Hanif Produktif
            </a>
            . Produktif is Indonesian for productive.
          </p>
        </div>
      </footer>
    </div>
  );
}
