"use client";

import { m, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { ARRIVE } from "./motion";

// 30 days, two 9:16 slots a day. The pairs fill bottom-up once, when the grid
// is about a third in view. Today's pair is the one red thing.
const OFFSET = 2; // the 1st falls on a Wednesday
const TODAY = 9;

export default function MonthGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const show = inView || reduce;
  return (
    <div ref={ref} className="mg" aria-hidden="true">
      <div className="mg-head">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mg-grid">
        {Array.from({ length: OFFSET }, (_, i) => (
          <span key={`p${i}`} className="mg-pad" />
        ))}
        {Array.from({ length: 30 }, (_, d) => (
          <span key={d} className={`mg-day${d + 1 === TODAY ? " is-today" : ""}`}>
            <em>{d + 1}</em>
            <m.span
              className="mg-pair"
              initial={reduce ? false : { scaleY: 0 }}
              animate={show ? { scaleY: 1 } : undefined}
              transition={{ duration: 0.24, ease: ARRIVE, delay: reduce ? 0 : d * 0.012 }}
            >
              <i />
              <i />
            </m.span>
          </span>
        ))}
      </div>
    </div>
  );
}
