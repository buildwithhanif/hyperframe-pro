"use client";

import { useEffect, useRef, useState } from "react";
import { AiChip } from "@/components/site/Brand";

// A 9-second loop of what a produktif.ai video looks like: the creator's AI
// persona opens (hook), motion graphics carry the middle, the persona closes.
// The persona is drawn as the brand's record dot at the face line, never as a
// stock face.
const LOOP = 9000;
const SEGMENTS = [
  { id: "hook", from: 0, to: 2800, tag: "Hook · your AI persona" },
  { id: "body", from: 2800, to: 7000, tag: "" },
  { id: "outro", from: 7000, to: LOOP, tag: "Outro · your AI persona" },
] as const;

// The word in each line that gets the red caption box.
const CAPTIONS = [
  { at: 0, words: ["Stop", "paying", "for", "five", "tools."], stress: 3 },
  { at: 2800, words: ["Add", "up", "every", "renewal."], stress: 2 },
  { at: 4800, words: ["Cancel", "the", "ones", "you", "forgot."], stress: 4 },
  { at: 7000, words: ["Part", "2", "tomorrow."], stress: 1 },
] as const;

function useLoopTime(active: boolean) {
  const [t, setT] = useState(1800);
  useEffect(() => {
    if (!active) return;
    const start = performance.now() - 1800;
    const id = window.setInterval(() => setT((performance.now() - start) % LOOP), 60);
    return () => window.clearInterval(id);
  }, [active]);
  return t;
}

const clock = (ms: number) => `0:${String(Math.floor(ms / 1000)).padStart(2, "0")}`;

// chipHref turns the AI label into a link (to /consent). The frame itself is
// hidden from screen readers and described in one sentence instead.
export default function PhoneReel({ longLabel = false, chipHref }: { longLabel?: boolean; chipHref?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    // The first frame is already a finished caption, so the loop can wait
    // until the page has loaded and settled before it starts.
    let io: IntersectionObserver | undefined;
    const start = () => {
      io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.15 });
      io.observe(el);
    };
    const timer = window.setTimeout(start, document.readyState === "complete" ? 600 : 1800);
    return () => {
      window.clearTimeout(timer);
      io?.disconnect();
    };
  }, []);

  const t = useLoopTime(active);
  const seg = SEGMENTS.find((s) => t >= s.from && t < s.to) ?? SEGMENTS[1];
  const cap = [...CAPTIONS].reverse().find((c) => t >= c.at) ?? CAPTIONS[0];
  const capNext = CAPTIONS[CAPTIONS.indexOf(cap) + 1]?.at ?? LOOP;
  // Words land about a beat apart; the box jumps to the stressed word once it lands.
  const beat = Math.min(260, (capNext - cap.at) / (cap.words.length + 1));
  const said = Math.min(cap.words.length, Math.floor((t - cap.at) / beat) + 1);
  const bodyT = Math.max(0, Math.min(1, (t - 2800) / 3000));
  const fees = Math.round(2400 * bodyT);

  return (
    <div ref={ref} className="pr">
      <p className="sr">A 9:16 sample video. An AI persona opens it, motion graphics follow.</p>
      {chipHref ? (
        <a href={chipHref} className="pr-chip-link">
          <AiChip long={longLabel} className="pr-chip" />
        </a>
      ) : (
        <AiChip long={longLabel} className="pr-chip" />
      )}
      <div className="pr-body" aria-hidden="true">
      <div className={`pr-scene pr-persona${seg.id === "body" ? "" : " is-on"}`}>
        <span className="pr-face" />
        <span className="pr-tag">{seg.tag || "Hook · your AI persona"}</span>
      </div>

      <div className={`pr-scene pr-graphics${seg.id === "body" ? " is-on" : ""}`}>
        <p className="pr-g-kicker">Tool renewals per year</p>
        <p className="pr-g-num">Rp {fees.toLocaleString("id-ID")}rb</p>
        <div className="pr-g-bars">
          {[0.9, 0.62, 0.38, 0.18].map((h, i) => (
            <span key={i} style={{ transform: `scaleY(${Math.max(0.04, Math.min(1, bodyT * 1.6 - i * 0.18)) * h})` }} />
          ))}
        </div>
        <ol className="pr-g-list">
          {["List every renewal", "Cancel the unused", "Keep the one you use"].map((x, i) => (
            <li key={x} className={bodyT > 0.45 + i * 0.16 ? "is-done" : ""}>
              {x}
            </li>
          ))}
        </ol>
      </div>

      <p className="pr-cap" key={cap.at}>
        {cap.words.map((w, i) => (
          <span key={i} className={`w${i < said ? " in" : ""}${i === cap.stress && i < said ? " box" : ""}`}>
            {w}
          </span>
        ))}
      </p>

      <div className="pr-foot">
        <span>{clock(t)}</span>
        <span className="pr-prog">
          <i style={{ transform: `scaleX(${t / LOOP})` }} />
        </span>
        <span>0:09</span>
      </div>
      </div>
    </div>
  );
}

type Still =
  | { kind: "persona"; words: string[]; stress: number }
  | { kind: "price" }
  | { kind: "list" };

// Static frames for the fanned stack behind the live one.
export function FrameStill({ still, className = "" }: { still: Still; className?: string }) {
  return (
    <div className={`pr pr--still ${className}`} aria-hidden="true">
      <AiChip className="pr-chip" />
      {still.kind === "persona" && (
        <>
          <div className="pr-scene pr-persona is-on">
            <span className="pr-face" />
          </div>
          <p className="pr-cap">
            {still.words.map((w, i) => (
              <span key={i} className={`w in${i === still.stress ? " box" : ""}`}>
                {w}
              </span>
            ))}
          </p>
        </>
      )}
      {still.kind === "price" && (
        <div className="pr-scene pr-graphics is-on">
          <p className="pr-g-kicker">Per video</p>
          <p className="pr-g-num">Rp 66,700</p>
          <span className="pr-g-meter">
            <i />
          </span>
          <p className="pr-g-sub">60 a month, all included</p>
        </div>
      )}
      {still.kind === "list" && (
        <div className="pr-scene pr-graphics is-on">
          <p className="pr-g-kicker">This week</p>
          <ol className="pr-g-list">
            {["Script approved", "Hook and outro", "Captions burned in", "Post copy written"].map((x) => (
              <li key={x} className="is-done">
                {x}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
