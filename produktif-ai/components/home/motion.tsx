"use client";

import { useReducedMotion } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const; // settle
export const ARRIVE = [0.16, 1, 0.3, 1] as const;
export const CUT = [0.65, 0, 0.35, 1] as const;

// A section headline that rises word by word the first time it scrolls into
// view. It renders as plain text on the server and only hides its words after
// hydration, and only when it starts below the fold, so nobody sees a gap.
export function Rise({ lines, as = "h2", id, className = "" }: { lines: string[]; as?: "h2" | "h3"; id?: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const [state, setState] = useState<"idle" | "armed" | "in">("idle");
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setState("armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setState("in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  const Tag = as;
  let n = 0;
  return (
    <Tag ref={ref} id={id} className={`${className} rise${state === "idle" ? "" : ` is-${state}`}`} aria-label={lines.join(" ").replace(/\*/g, "")}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span key={li} className="k-line" aria-hidden="true">
            {words.map((raw, wi) => {
              const i = n++;
              const rec = /^\*.+\*$/.test(raw);
              return (
                <Fragment key={wi}>
                  <span className="k-mask">
                    <span className={rec ? "r-word is-rec" : "r-word"} style={{ transitionDelay: `${i * 0.04}s` }}>
                      {rec ? raw.slice(1, -1) : raw}
                    </span>
                  </span>
                  {wi < words.length - 1 ? " " : ""}
                </Fragment>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
