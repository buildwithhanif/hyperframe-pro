"use client";

import { useEffect, useRef, useState } from "react";

// A month of posts, two a day, filled with stills from Hanif's real AI persona
// videos. It fills in once, day by day, the first time it scrolls into view.
const OFFSET = 2; // the 1st falls on a Wednesday

export default function MonthWall({ frames }: { frames: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setOn(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setOn(true);
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`mw${on ? " is-on" : ""}`} aria-hidden="true">
      <div className="mw-head">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mw-grid">
        {/* The empty days before the 1st carry the wall's one AI label. */}
        <span className="mw-pad">
          <span className="mw-label">AI persona</span>
        </span>
        {Array.from({ length: OFFSET - 1 }, (_, i) => (
          <span key={`p${i}`} />
        ))}
        {Array.from({ length: 30 }, (_, d) => (
          <div key={d} className="mw-day" style={{ ["--i" as string]: d }}>
            <em>{d + 1}</em>
            <div className="mw-pair">
              {[0, 1].map((k) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={k} src={frames[(d * 2 + k) % frames.length]} alt="" loading="lazy" decoding="async" width={90} height={160} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
