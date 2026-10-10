"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { EASE } from "./motion";

// 30 days, two 9:16 slots a day, filling up as it scrolls into view.
const OFFSET = 2; // the 1st falls on a Wednesday
export default function MonthGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
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
          <span key={d} className="mg-day">
            <em>{d + 1}</em>
            {[0, 1].map((k) => (
              <motion.i
                key={k}
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                animate={inView || reduce ? { opacity: 1, scale: 1 } : undefined}
                transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.15 + (d * 2 + k) * 0.018 }}
              />
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
