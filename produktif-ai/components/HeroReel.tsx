"use client";

import { Fragment, useEffect, useRef, useState } from "react";

// Word-by-word burned-in captions, the way talking-head Reels look.
const CHUNKS = [["Stop."], ["Before", "you", "transfer"], ["that", "money", "back,"], ["read", "this."]];
const SEQ = CHUNKS.flatMap((words, ci) => words.map((_, wi) => [ci, wi] as const));
const STEP = 420;
const PAUSE = 900;
const TOTAL = SEQ.length * STEP + PAUSE;

const WAVE = Array.from({ length: 40 }, (_, i) => ({
  h: (0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45))).toFixed(2),
  delay: -((i * 97) % 1100),
}));

function clock(ms: number) {
  const s = Math.floor(ms / 1000);
  return `0:${s < 10 ? "0" : ""}${s}`;
}

export default function HeroReel() {
  // Server render and reduced motion both show this still frame.
  const [[ci, wi], setPos] = useState<readonly [number, number]>([1, 2]);
  const bar = useRef<HTMLElement>(null);
  const time = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let n = 0;
    let timer = 0;
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      setPos(SEQ[n % SEQ.length]);
      n++;
      timer = window.setTimeout(tick, n % SEQ.length === 0 ? STEP + PAUSE : STEP);
    };
    const loop = (now: number) => {
      const t = (now - start) % TOTAL;
      if (bar.current) bar.current.style.width = `${((t / TOTAL) * 100).toFixed(2)}%`;
      if (time.current) time.current.textContent = clock(t * 1.4);
      raf = requestAnimationFrame(loop);
    };
    tick();
    raf = requestAnimationFrame(loop);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="reel" aria-hidden="true">
      <div className="reel-top">
        <span className="t">MON 07:00</span>
        <span className="chip-ai">AI info</span>
      </div>
      <div className="cap">
        <span>
          {CHUNKS[ci].map((w, idx) => (
            <Fragment key={`${ci}-${idx}`}>
              {idx > 0 && " "}
              <span className={idx < wi ? "w said" : idx === wi ? "w on" : "w"}>{w}</span>
            </Fragment>
          ))}
        </span>
      </div>
      <div className="reel-foot">
        <div className="who">
          <i />
          @yourhandle
        </div>
        <div className="wave">
          {WAVE.map((b, i) => (
            <span key={i} style={{ "--h": b.h, animationDelay: `${b.delay}ms` } as React.CSSProperties} />
          ))}
        </div>
        <div className="prog">
          <div className="bar">
            <i ref={bar} style={{ width: "38%" }} />
          </div>
          <span className="ts" ref={time}>
            0:04
          </span>
        </div>
      </div>
    </div>
  );
}
