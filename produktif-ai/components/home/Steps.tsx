"use client";

import { AnimatePresence, m, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CUT, EASE } from "./motion";

export type Step = { n: string; title: string; body: string; you?: string };

const Check = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Wave({ bars = 36, done = 1 }: { bars?: number; done?: number }) {
  return (
    <span className="sv-wave">
      {Array.from({ length: bars }, (_, i) => {
        const h = 18 + Math.round(70 * Math.abs(Math.sin(i * 1.3) * Math.cos(i * 0.37)));
        return <i key={i} className={i / bars < done ? "on" : ""} style={{ height: `${h}%` }} />;
      })}
    </span>
  );
}

function Visual({ i }: { i: number }) {
  switch (i) {
    case 0:
      return (
        <div className="sv sv-intake">
          <p className="sv-h">Kit received</p>
          <div className="sv-photos">
            {["Front", "Left", "Right"].map((a) => (
              <span key={a} className="sv-photo">
                <svg viewBox="0 0 60 80" aria-hidden="true">
                  <circle cx="30" cy="30" r="13" />
                  <path d="M6 80c1-17 11-27 24-27s23 10 24 27z" />
                </svg>
                <em>{a}</em>
              </span>
            ))}
          </div>
          <div className="sv-row">
            <span className="sv-ok">
              <Check />
            </span>
            <span>
              <b>2-minute voice read</b>
              <Wave />
            </span>
          </div>
          <div className="sv-row">
            <span className="sv-ok">
              <Check />
            </span>
            <span>
              <b>Spoken consent</b> &ldquo;I agree to produktif.ai making my AI persona.&rdquo;
            </span>
          </div>
          <p className="sv-foot sv-mono">3 photos ✓ · voice read 2:00 ✓ · consent line ✓</p>
        </div>
      );
    case 1:
      return (
        <div className="sv sv-persona">
          <p className="sv-h">Test clip ready</p>
          <div className="sv-build">
            {[
              ["Face", "From your 3 photos"],
              ["Voice", "From your 2-minute read"],
              ["Style", "Your colors and fonts"],
            ].map(([k, v], j) => (
              <div key={k} className="sv-build-row">
                <b>{k}</b>
                <span className="sv-meter">
                  <m.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, ease: EASE, delay: 0.2 + j * 0.25 }} />
                </span>
                <em>{v}</em>
              </div>
            ))}
          </div>
          <div className="sv-clip">
            <span className="sv-clip-thumb" />
            <span>
              <b>Your test clip is ready</b>
              <em>Don&rsquo;t like it? We redo it once. Still not right, and your deposit comes back.</em>
            </span>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="sv sv-wa">
          <p className="sv-h">Batch 3 · 14 videos · review closes in 48 h</p>
          <div className="sv-chat">
            <div className="sv-msg them">
              <p>Batch 3 is ready: 14 videos for next week, captions and post copy included.</p>
              <div className="sv-grid">
                {Array.from({ length: 8 }, (_, j) => (
                  <span key={j} />
                ))}
              </div>
              <time>10:02</time>
            </div>
            <div className="sv-msg me">
              <p>All good. Can #6 use a stronger hook?</p>
              <time>10:41</time>
            </div>
            <div className="sv-msg them">
              <p>Done. New #6 attached. Captions and post text are in the folder.</p>
              <time>12:15</time>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="sv sv-post">
          <p className="sv-h">Posted · AI label on</p>
          <div className="sv-week">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, j) => (
              <div key={d} className="sv-day">
                <em>{d}</em>
                <span className={j < 3 ? "is-posted" : ""} />
                <span className={j < 2 ? "is-posted" : ""} />
              </div>
            ))}
          </div>
          <div className="sv-row">
            <span className="sv-ok">
              <Check />
            </span>
            <span>
              <b>Caption, hashtags and call to action</b> written for every video
            </span>
          </div>
          <div className="sv-row">
            <span className="sv-ok">
              <Check />
            </span>
            <span>
              <b>AI label on</b> when you upload. Takes one tap.
            </span>
          </div>
        </div>
      );
  }
}

function StepText({ step, i, active, onActive }: { step: Step; i: number; active: boolean; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(i);
  }, [inView, i, onActive]);
  return (
    <li ref={ref} className={`st-step${active ? " is-active" : ""}`}>
      <span className="st-n">{step.n}</span>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
      {step.you && <p className="st-you">{step.you}</p>}
      <div className="st-inline">
        <Visual i={i} />
      </div>
    </li>
  );
}

export default function Steps({ steps, children }: { steps: Step[]; children?: ReactNode }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  return (
    <div className="st">
      <div className="st-left">
        {children}
        <ol className="st-list">
          {steps.map((s, i) => (
            <StepText key={s.n} step={s} i={i} active={i === active} onActive={setActive} />
          ))}
        </ol>
      </div>
      <div className="st-right" aria-hidden="true">
        <div className="st-sticky">
          <div className="st-dots">
            {steps.map((s, i) => (
              <span key={s.n} className={i === active ? "on" : ""} />
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={active}
              className="st-visual"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.32, ease: CUT }}
            >
              <Visual i={active} />
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
