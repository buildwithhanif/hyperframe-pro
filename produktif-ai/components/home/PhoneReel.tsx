"use client";

import { useEffect, useRef, useState } from "react";

// A 9-second loop of what a produktif.ai video looks like: the creator's AI
// persona opens (hook), motion graphics carry the middle, the persona closes.
const LOOP = 9000;
const SEGMENTS = [
  { id: "hook", from: 0, to: 2800 },
  { id: "body", from: 2800, to: 7000 },
  { id: "outro", from: 7000, to: LOOP },
] as const;

const CAPTIONS = [
  { at: 0, words: ["Stop", "scrolling."] },
  { at: 1100, words: ["This", "costs", "you", "money."] },
  { at: 2800, words: ["Fees", "you", "never", "noticed:"] },
  { at: 4600, words: ["cut", "them", "in", "3", "steps."] },
  { at: 7000, words: ["Part", "2", "tomorrow."] },
] as const;

function useLoopTime(active: boolean) {
  const [t, setT] = useState(3600);
  useEffect(() => {
    if (!active) return;
    const start = performance.now() - 3600;
    const id = window.setInterval(() => setT((performance.now() - start) % LOOP), 90);
    return () => window.clearInterval(id);
  }, [active]);
  return t;
}

export default function PhoneReel({ handle = "@yourhandle" }: { handle?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const t = useLoopTime(active);
  const seg = SEGMENTS.find((s) => t >= s.from && t < s.to) ?? SEGMENTS[1];
  const cap = [...CAPTIONS].reverse().find((c) => t >= c.at) ?? CAPTIONS[0];
  const capNext = CAPTIONS[CAPTIONS.indexOf(cap) + 1]?.at ?? LOOP;
  const per = (capNext - cap.at) / cap.words.length;
  const on = Math.min(cap.words.length - 1, Math.floor((t - cap.at) / per));
  const bodyT = Math.max(0, Math.min(1, (t - 2800) / 3000));

  return (
    <div ref={ref} className="pr" aria-hidden="true">
      <div className="pr-screen">
        <div className="pr-bars">
          {SEGMENTS.map((s) => (
            <span key={s.id}>
              <i style={{ transform: `scaleX(${t >= s.to ? 1 : t <= s.from ? 0 : (t - s.from) / (s.to - s.from)})` }} />
            </span>
          ))}
        </div>
        <div className="pr-top">
          <span className="pr-who">
            <i />
            {handle}
          </span>
          <span className="pr-ai">AI persona</span>
        </div>

        <div className={`pr-scene pr-persona${seg.id === "body" ? "" : " is-on"}`}>
          <svg viewBox="0 0 200 260" className="pr-silhouette">
            <defs>
              <radialGradient id="pr-glow" cx="50%" cy="35%" r="60%">
                <stop offset="0" stopColor="#5a4a3a" />
                <stop offset="1" stopColor="#1a1714" />
              </radialGradient>
            </defs>
            <rect width="200" height="260" fill="url(#pr-glow)" />
            <circle cx="100" cy="98" r="44" fill="#2a2420" />
            <path d="M22 260c4-58 38-92 78-92s74 34 78 92z" fill="#2a2420" />
          </svg>
          <span className="pr-tag">{seg.id === "outro" ? "Outro · your AI face" : "Hook · your AI face"}</span>
        </div>

        <div className={`pr-scene pr-graphics${seg.id === "body" ? " is-on" : ""}`}>
          <p className="pr-g-kicker">Hidden fees per year</p>
          <p className="pr-g-num">Rp {Math.round(2400 * bodyT).toLocaleString("id-ID")}rb</p>
          <div className="pr-g-bars">
            {[0.9, 0.62, 0.38, 0.18].map((h, i) => (
              <span key={i} style={{ transform: `scaleY(${Math.max(0.04, Math.min(1, bodyT * 1.6 - i * 0.18)) * h})` }} />
            ))}
          </div>
          <ol className="pr-g-list">
            {["Check auto-debits", "Cancel the unused", "Move to free plan"].map((x, i) => (
              <li key={x} className={bodyT > 0.45 + i * 0.16 ? "is-done" : ""}>
                {x}
              </li>
            ))}
          </ol>
        </div>

        <div className="pr-cap">
          {cap.words.map((w, i) => (
            <span key={`${cap.at}-${i}`} className={i < on ? "w said" : i === on ? "w on" : "w"}>
              {w}
            </span>
          ))}
        </div>
        <div className="pr-foot">
          <span className="pr-time">0:{String(Math.floor(t / 1000)).padStart(2, "0")} / 0:09</span>
          <span className="pr-label">Labeled as AI</span>
        </div>
      </div>
    </div>
  );
}
