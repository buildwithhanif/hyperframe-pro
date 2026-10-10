import { Fragment } from "react";
import type { Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./landing.css";
import HeroReel from "@/components/HeroReel";
import WaitlistForm, { Arrow, Receipt } from "@/components/WaitlistForm";

export const viewport: Viewport = {
  themeColor: "#F5F2EB",
  colorScheme: "light",
};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

// Hero month: today is Monday the 10th. Day 1 falls on a Saturday, so the
// 30 days fill five Mon–Sun rows exactly.
const MONTH_OFFSET = 5;
const TODAY = 10;
function slot(day: number, pm: boolean) {
  if (day < TODAY || (day === TODAY && !pm)) return "d";
  if (day === TODAY) return "now";
  return "";
}

// "Who does the work": 14 days on desktop, fewer on narrow screens (CSS hides the rest).
const DAYS = 14;
const WORK = ["Research", "Script", "Generate", "Caption", "Format", "Deliver"];
const late = (i: number) => (i >= 10 ? " g-x10" : i >= 6 ? " g-x6" : "");

const REC_WAVE = range(64).map((j) => 8 + Math.round(70 * Math.abs(Math.sin(j * 0.9) * Math.cos(j * 0.23))));

const INCLUDED = [
  "60 talking-head videos a month, two a day",
  "Topic research and scripts",
  "Your own AI persona",
  "Burned-in captions, 9:16 for Reels, TikTok and Shorts",
  "Your approval on every video before it goes live",
];

// Founder's own numbers (social profile, Oct 2026). 297K, 17.6M and 106.7M are all @hanifmuh_.
const STATS = [
  { tag: "Founder’s accounts", value: "690K", label: "followers across his platforms" },
  { tag: "@hanifmuh_", value: "297K", label: "median views on his recent Reels" },
  { tag: "@hanifmuh_", value: "17.6M", label: "views on a single Reel" },
  { tag: "@hanifmuh_", value: "106.7M", label: "views from 220 carousels in 63 days" },
];

const FAQ = [
  {
    q: "Is it really me in the videos?",
    a: "It’s an AI persona made from your one recording session. You approve every video before it’s posted.",
  },
  {
    q: "Do I really only record once?",
    a: "Yes. One session at the start, and that’s it. You don’t film again.",
  },
  {
    q: "Do you guarantee views?",
    a: "No. Nobody can, and we won’t promise what we can’t control. What you’re guaranteed is 60 finished videos a month, written with the same playbook Hanif uses on his own accounts.",
  },
  {
    q: "Can I make a persona of someone else?",
    a: "No. We only build one for the person who records and gives consent.",
  },
  {
    q: "Will the videos be labeled as AI?",
    a: "They should be. Instagram and TikTok ask for realistic AI content to be labeled. You switch the label on when you upload, and we’ll show you how.",
  },
  {
    q: "Who is this for?",
    a: "Business owners, consultants, coaches and educators in Indonesia who know they should be posting but never have the time.",
  },
];

function Check({ width = 1.7 }: { width?: number }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SecHead({ n, label }: { n: string; label: string }) {
  return (
    <p className="sec-head mono">
      <span className="n">{n}</span>
      <span className="l">{label}</span>
    </p>
  );
}

export default function Home() {
  return (
    <div className={`lp ${GeistSans.variable} ${GeistMono.variable}`}>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <header className="top">
        <div className="wrap">
          <a className="brand" href="#main" aria-label="produktif.ai home">
            <span className="brand-mark" aria-hidden="true" />
            <span>
              produktif<i>.</i>ai
            </span>
          </a>
          <ul className="top-links">
            <li>
              <a href="#how">How it works</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
          </ul>
          <a className="lp-btn lp-btn--sm" href="#waitlist">
            Join the waitlist
          </a>
        </div>
      </header>

      <main id="main">
        {/* ---------- hero ---------- */}
        <section className="hero" aria-labelledby="hero-h">
          <div className="wrap">
            <div className="gridlines" aria-hidden="true" />
            <div className="hero-grid">
              <div className="hero-copy">
                <div>
                  <p className="eyebrow mono rise">
                    <span className="muted">Done-for-you AI content</span>
                    <span className="sep" aria-hidden="true" />
                    <span className="live">
                      <i aria-hidden="true" />
                      First cohort forming now
                    </span>
                  </p>
                  <h1 id="hero-h" className="rise d1">
                    <span>Let AI work.</span> <span>Go live your life.</span>
                  </h1>
                  <p className="lead rise d2">
                    produktif.ai turns your face and voice into an AI persona, then delivers two ready-to-post talking-head videos every
                    day. You record once. We handle the rest.
                  </p>
                </div>
                <div className="hero-act rise d3">
                  <div className="ctas">
                    <a className="lp-btn" href="#waitlist">
                      Join the waitlist <Arrow />
                    </a>
                    <a className="link" href="#how">
                      <span>See the steps</span>
                    </a>
                  </div>
                  <p className="micro">
                    <strong>Rp 4,000,000 a month for 60 videos.</strong> Signing up costs nothing.
                  </p>
                </div>
              </div>

              <div className="hero-stage">
                <div
                  className="win rise d2"
                  role="img"
                  aria-label="Product preview: today's queue with a 9:16 talking-head video, burned-in captions, and a month of videos arriving two a day"
                >
                  <div className="win-bar mono" aria-hidden="true">
                    <span className="crumb">
                      <b>Your queue</b>
                      <span>/</span>Today
                    </span>
                    <span className="right">
                      <span className="live">
                        <i />
                      </span>
                      Delivering
                    </span>
                  </div>
                  <div className="win-body" aria-hidden="true">
                    <HeroReel />
                    <div className="log">
                      <div className="log-h mono">
                        <span>Queue</span>
                        <span>2 a day</span>
                      </div>
                      <div className="item cur">
                        <div className="row">
                          <span className="when">MON 07:00</span>
                          <span className="st st-ok">
                            <Check />
                            Approved
                          </span>
                        </div>
                        <span className="what">Stop. Before you transfer that money back, read this.</span>
                      </div>
                      <div className="item">
                        <span className="when">MON 19:00</span>
                        <div className="row">
                          <span className="what">Ready to post</span>
                          <span className="mini-btn">Approve</span>
                        </div>
                      </div>
                      <div className="item dim">
                        <span className="when">TUE 07:00</span>
                        <span className="what">Scripting</span>
                        <div className="pbar">
                          <i />
                        </div>
                      </div>
                      <div className="item dim">
                        <span className="when">TUE 19:00</span>
                        <span className="what">Researching</span>
                      </div>
                      <div className="month">
                        <div className="month-h">
                          <b>60 videos</b>
                          <span className="mono muted">This month</span>
                        </div>
                        <div className="cal">
                          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                            <span key={i} className="cal-wd mono">
                              {d}
                            </span>
                          ))}
                          {range(MONTH_OFFSET).map((i) => (
                            <span key={`pad-${i}`} />
                          ))}
                          {range(30).map((i) => (
                            <span key={i} className="cal-d">
                              <i className={slot(i + 1, false)} />
                              <i className={slot(i + 1, true)} />
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- what you won't need ---------- */}
        <section className="nos-band" aria-label="What you won't need">
          <div className="wrap">
            <ul className="nos">
              <li>
                <span>No prompts.</span>
                <i className="x" aria-hidden="true" />
              </li>
              <li>
                <span>No agents.</span>
                <i className="x" aria-hidden="true" />
              </li>
              <li>
                <span>No API keys.</span>
                <i className="x" aria-hidden="true" />
              </li>
              <li className="nos-last">
                <span>Nothing new to learn.</span>
                <a className="lp-btn" href="#waitlist">
                  Get on the list <Arrow />
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* ---------- 01 positioning ---------- */}
        <section className="pos" aria-labelledby="pos-h">
          <div className="wrap">
            <SecHead n="01" label="What we do" />
            <h2 className="pos-h" id="pos-h">
              <span className="q">Everyone&rsquo;s selling you AI tools.</span> <span className="a">We deliver the videos.</span>
            </h2>
            <p className="pos-body">
              There&rsquo;s no app to learn and no agent to babysit. Two finished videos reach you every day, and you get back to running
              your business.
            </p>

            <figure
              className="gantt"
              role="img"
              aria-label="Who does the work: you record once on day one. produktif.ai researches, scripts, generates, captions, formats and delivers two videos every day."
            >
              <div className="g-head mono" aria-hidden="true">
                <span>Who does the work</span>
                <span className="g-right">
                  Every day <Arrow />
                </span>
              </div>
              <div className="g-body" aria-hidden="true">
                <div className="g-l h" />
                {range(DAYS).map((i) => (
                  <div key={i} className={`g-c h${i === 0 ? " d1" : ""}${late(i)}`}>
                    {i === 0 && <span>Day one</span>}
                  </div>
                ))}
                <div className="g-sep" />
                <div className="g-l you">You</div>
                {range(DAYS).map((i) => (
                  <div key={i} className={`g-c you${i === 0 ? " d1" : ""}${late(i)}`}>
                    {i === 0 && (
                      <>
                        <span className="g-rec" />
                        <span className="g-rec-l">Recording session</span>
                      </>
                    )}
                  </div>
                ))}
                <div className="g-sep" />
                <div className="g-l us">produktif.ai</div>
                {range(DAYS).map((i) => (
                  <div key={i} className={`g-c us${late(i)}`} />
                ))}
                {WORK.map((t) => (
                  <Fragment key={t}>
                    <div className="g-l">{t}</div>
                    {range(DAYS).map((i) => (
                      <div key={i} className={`g-c${late(i)}`}>
                        {i > 0 &&
                          (t === "Deliver" ? (
                            <span className="g-pair">
                              <i />
                              <i />
                            </span>
                          ) : (
                            <span className="g-seg" />
                          ))}
                      </div>
                    ))}
                  </Fragment>
                ))}
              </div>
            </figure>
          </div>
        </section>

        {/* ---------- 02 how it works ---------- */}
        <section className="how" id="how" aria-labelledby="how-h">
          <div className="wrap">
            <SecHead n="02" label="How it works" />
            <h2 id="how-h" className="how-h">
              You show up once.
              <br />
              The daily work is ours.
            </h2>
            <ol className="steps">
              <li className="step">
                <span className="step-n mono">01</span>
                <div className="step-c">
                  <h3>Record once.</h3>
                  <p>One session on camera and mic. It&rsquo;s the only time you&rsquo;ll need to film.</p>
                </div>
                <div className="step-v">
                  <div className="vis" aria-hidden="true">
                    <div className="vis-top mono">
                      <span className="rec-dot" />
                      <span>Recording</span>
                      <span className="r">One session</span>
                    </div>
                    <div className="rec-wave">
                      {REC_WAVE.map((h, j) => (
                        <span key={j} className={j > 46 ? "fut" : undefined} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="chips">
                      <span className="chip">
                        <Check />
                        Camera
                      </span>
                      <span className="chip">
                        <Check />
                        Mic
                      </span>
                    </div>
                  </div>
                </div>
              </li>
              <li className="step">
                <span className="step-n mono">02</span>
                <div className="step-c">
                  <h3>We build your persona.</h3>
                  <p>Your AI face and voice, made only from your own recording, with your permission.</p>
                </div>
                <div className="step-v">
                  <div className="vis" aria-hidden="true">
                    <div className="vis-top mono">
                      <span>Persona</span>
                      <span className="r">From your recording</span>
                    </div>
                    <div className="build">
                      <div className="build-row">
                        <b>Face</b>
                        <div className="pbar">
                          <i />
                        </div>
                        <span className="st">Done</span>
                      </div>
                      <div className="build-row">
                        <b>Voice</b>
                        <div className="pbar">
                          <i />
                        </div>
                        <span className="st">Done</span>
                      </div>
                      <div className="build-row">
                        <b>Permission</b>
                        <span className="tog">
                          <i />
                        </span>
                        <span className="st">Given by you</span>
                      </div>
                    </div>
                    <div className="build-foot">
                      <span className="st st-ok">
                        <Check />
                        Persona ready
                      </span>
                      <span className="mono muted">Only you</span>
                    </div>
                  </div>
                </div>
              </li>
              <li className="step">
                <span className="step-n mono">03</span>
                <div className="step-c">
                  <h3>Videos arrive daily.</h3>
                  <p>Two talking-head videos a day, scripted, captioned and cut to 9:16. You approve each one before it goes live.</p>
                </div>
                <div className="step-v">
                  <div className="vis" aria-hidden="true">
                    <div className="vis-top mono">
                      <span>Delivered</span>
                      <span className="r">2 a day</span>
                    </div>
                    <div className="thumbs">
                      {[
                        ["Mon", "07:00"],
                        ["Mon", "19:00"],
                        ["Tue", "07:00"],
                      ].map(([d, t]) => (
                        <div key={d + t} className="th">
                          <div className="th-f">
                            <span className="ok-b">
                              <Check />
                            </span>
                          </div>
                          <div className="th-l">
                            <span>{d}</span>
                            <span>{t}</span>
                          </div>
                        </div>
                      ))}
                      <div className="th next">
                        <div className="th-f">
                          <span className="pend">Approve</span>
                        </div>
                        <div className="th-l">
                          <span>Tue</span>
                          <span>19:00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* ---------- 03 pricing ---------- */}
        <section className="price" id="pricing" aria-labelledby="price-h">
          <div className="wrap">
            <SecHead n="03" label="Pricing" />
            <h2 id="price-h">
              One plan.
              <br />
              Everything done for&nbsp;you.
            </h2>
            <div className="plan">
              <div className="plan-top">
                <div className="plan-l">
                  <p className="mono muted">Done-for-you</p>
                  <p className="amt">
                    <b>
                      <span className="cur">Rp</span>4,000,000
                    </b>{" "}
                    <span className="per">/ month</span>
                  </p>
                  <p className="plan-note">Less than what you&rsquo;d pay one full-time hire in Jakarta.</p>
                  <a className="lp-btn" href="#waitlist">
                    Count me in <Arrow />
                  </a>
                  <p className="fine">Nothing to pay yet. We&rsquo;ll message you on WhatsApp before we open.</p>
                </div>
                <div className="plan-r">
                  <p className="mono muted">Included</p>
                  <ul className="inc">
                    {INCLUDED.map((x) => (
                      <li key={x}>
                        <Check width={1.6} />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <dl className="nums">
                <div>
                  <dt>60</dt>
                  <dd>every month</dd>
                </div>
                <div>
                  <dt>2</dt>
                  <dd>daily</dd>
                </div>
                <div>
                  <dt>9:16</dt>
                  <dd>for Reels, TikTok and Shorts</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ---------- 04 founder proof ---------- */}
        <section className="proof" aria-labelledby="proof-h">
          <div className="wrap">
            <SecHead n="04" label="Built by Hanif Produktif" />
            <div className="proof-top">
              <h2 id="proof-h">Scripts written with the playbook that grew the founder&rsquo;s accounts.</h2>
              <div className="note">
                <p className="mono">Note</p>
                <p>
                  These are the founder&rsquo;s own accounts, where he appears on camera himself. Your account starts somewhere else, and
                  nobody can guarantee views.
                </p>
              </div>
            </div>
            <ul className="stats">
              {STATS.map((s) => (
                <li key={s.value} className="stat">
                  <span className={s.tag.startsWith("@") ? "mono handle" : "mono"}>{s.tag}</span>
                  <b>{s.value}</b>
                  <p>{s.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- 05 faq ---------- */}
        <section className="faq" id="faq" aria-labelledby="faq-h">
          <div className="wrap">
            <SecHead n="05" label="FAQ" />
            <div className="faq-grid">
              <div className="faq-side">
                <h2 id="faq-h">Questions</h2>
                <div className="faq-cta">
                  <p>Seen enough?</p>
                  <a className="lp-btn lp-btn--sm" href="#waitlist">
                    Get on the list <Arrow />
                  </a>
                </div>
              </div>
              <dl className="qa">
                {FAQ.map((f) => (
                  <div key={f.q} className="qa-row">
                    <dt>{f.q}</dt>
                    <dd>{f.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ---------- 06 waitlist ---------- */}
        <section className="join" id="waitlist" aria-labelledby="join-h">
          <div className="wrap">
            <SecHead n="06" label="Waitlist" />
            <div className="join-grid">
              <div className="join-head">
                <h2 id="join-h">Be in the first cohort.</h2>
                <p className="lead">Leave your name and WhatsApp. That&rsquo;s all we need for now.</p>
              </div>
              <div className="wl-card wl-preview" aria-label="Example of the confirmation you'll see" role="group">
                <div className="wl-head">
                  <span>After you join</span>
                  <span>Preview</span>
                </div>
                <Receipt name="Your name" whatsapp="0812 3456 7890" />
              </div>
              <div className="join-form">
                <WaitlistForm source="footer" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <p className="wordmark" aria-hidden="true">
            produktif<i>.</i>ai
          </p>
          <div className="foot-row">
            <p>
              <span>© 2026 produktif.ai</span>
              <span className="dot"> · </span>
              <span>Yogyakarta, Indonesia</span>
              <span className="dot"> · </span>
              <span>
                Made by{" "}
                <a href="https://www.instagram.com/hanifproduktif/" target="_blank" rel="noopener noreferrer">
                  @hanifproduktif
                </a>
              </span>
            </p>
            <ul>
              <li>
                <a href="#how">How it works</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
