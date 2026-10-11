"use client";

import { useEffect, useRef, useState } from "react";
import Clip, { type ClipSource } from "@/components/home/Clip";

// The v2 hero visual: one persona on the phone, and the month it turns into.
// 60 slots, 2 a day. The first ones are real samples (each used once); the
// rest are numbered slots, because a month that hasn't been made yet is empty.
const SLOTS = 60;

export default function Engine({ hero, samples }: { hero: ClipSource; samples: ClipSource[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setFilled(SLOTS);
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let n = 0;
        // Samples land slowly enough to see; the empty slots count up faster.
        const tick = () => {
          n += 1;
          setFilled(n);
          if (n < SLOTS) timer = window.setTimeout(tick, n < samples.length ? 260 : 32);
        };
        timer = window.setTimeout(tick, 500);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [samples.length]);

  return (
    <div className="eng" ref={ref}>
      <Clip clip={hero} eager className="eng-clip" />
      <div className="eng-month">
        <p className="eng-count" aria-live="off">
          <b>{filled}</b>
          <span>/ 60 this month</span>
        </p>
        <ol className="eng-grid" aria-label="One month of videos: 60 slots, 2 a day">
          {Array.from({ length: SLOTS }, (_, i) => {
            const s = samples[i];
            const on = i < filled;
            return (
              <li key={i} className={`eng-slot${on ? " is-on" : ""}${s ? " is-sample" : ""}`}>
                {s ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.poster} alt="" width={54} height={96} loading="lazy" decoding="async" />
                ) : (
                  <span aria-hidden="true">{i + 1}</span>
                )}
              </li>
            );
          })}
        </ol>
        <p className="eng-note">2 a day, planned a month ahead. The first {samples.length} are real samples.</p>
      </div>
    </div>
  );
}
