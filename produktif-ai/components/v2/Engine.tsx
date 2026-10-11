"use client";

import { useEffect, useRef, useState } from "react";
import Clip, { type ClipSource } from "@/components/home/Clip";

// The v2 hero visual: one AI-made clip, and the month it turns into.
// Desktop: 30 days, 2 videos each. The real samples are shown from the start;
// the rest of the month fills in once, quickly. Phones: the clip, one line on
// how it's made, and a row of the real samples.
const DAYS = 30;
const SLOTS = DAYS * 2;

export default function Engine({ hero, samples, label }: { hero: ClipSource; samples: ClipSource[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(samples.length);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setFilled(SLOTS);
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let n = samples.length;
        const tick = () => {
          n += 1;
          setFilled(n);
          if (n < SLOTS) timer = window.setTimeout(tick, 16);
        };
        timer = window.setTimeout(tick, 300);
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
      <Clip clip={hero} eager className="eng-clip" label={label} />
      <div className="eng-side">
        <p className="eng-made">Made with AI. Not filmed.</p>
        <p>Hanif&rsquo;s AI version, in a post from his own account. Captions in the original language.</p>
        <p>Yours starts from 3 photos and a 2-minute voice recording.</p>
      </div>
      <div className="eng-month">
        <p className="eng-count">
          <b>60</b>
          <span>videos a month, from one setup</span>
        </p>
        <ol className="eng-days" aria-label="One month: 30 days, 2 videos a day">
          {Array.from({ length: DAYS }, (_, d) => (
            <li key={d} className="eng-day">
              {[0, 1].map((k) => {
                const i = d * 2 + k;
                const s = samples[i];
                return (
                  <span key={k} className={`eng-slot${i < filled ? " is-on" : ""}${s ? " is-sample" : ""}`}>
                    {s && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.poster} alt="" width={54} height={96} loading="lazy" decoding="async" />
                    )}
                  </span>
                );
              })}
            </li>
          ))}
        </ol>
        <p className="eng-note">Samples made with AI. The empty slots are yours, filled after setup.</p>
      </div>
      <div className="eng-row" aria-hidden="true">
        {samples.map((s) => (
          <span key={s.id} className="eng-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.poster} alt="" width={54} height={96} loading="lazy" decoding="async" />
            <i>AI</i>
          </span>
        ))}
      </div>
      <p className="eng-row-note">Samples made with AI. Your plan: 60 a month.</p>
    </div>
  );
}
