"use client";

import { m, useReducedMotion } from "motion/react";
import { Children, Fragment, useEffect, useRef, useState, type ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const; // settle
export const ARRIVE = [0.16, 1, 0.3, 1] as const;
export const CUT = [0.65, 0, 0.35, 1] as const;

// Fades and lifts its children in once, when they scroll into view.
export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" | "p" }) {
  const reduce = useReducedMotion();
  const Tag = m[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

// Staggers direct children in as a group.
export function Stagger({ children, className, gap = 0.08, as = "div" }: { children: ReactNode; className?: string; gap?: number; as?: "div" | "ul" | "ol" | "dl" }) {
  const reduce = useReducedMotion();
  const Tag = m[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {Children.map(children, (child) => (
        <m.div
          className="stagger-item"
          variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
        >
          {child}
        </m.div>
      ))}
    </Tag>
  );
}

// Headline whose words rise out of a mask, line by line. Pure CSS, so it
// renders and plays before any JavaScript loads (see .k-word in home.css).
// Wrap one word in asterisks to set it in the record red: "*videos.*".
export function Kinetic({ lines, className, delay = 0.1, as = "h1", id }: { lines: string[]; className?: string; delay?: number; as?: "h1" | "h2" | "p"; id?: string }) {
  const Tag = as;
  let n = 0;
  return (
    <Tag className={className} id={id} aria-label={lines.join(" ").replace(/\*/g, "")}>
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
                    <span className={rec ? "k-word is-rec" : "k-word"} style={{ animationDelay: `${delay + i * 0.04}s` }}>
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
