"use client";

import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { Children, Fragment, useEffect, useRef, useState, type ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

// Fades and lifts its children in once, when they scroll into view.
export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" | "p" }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
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
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {Children.map(children, (child) => (
        <motion.div
          className="stagger-item"
          variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
        >
          {child}
        </motion.div>
      ))}
    </Tag>
  );
}

// Headline whose words rise out of a mask, line by line. Pure CSS, so it
// renders and plays before any JavaScript loads (see .k-word in home.css).
export function Kinetic({ lines, className, delay = 0.1, as = "h1", id }: { lines: string[]; className?: string; delay?: number; as?: "h1" | "h2" | "p"; id?: string }) {
  const Tag = as;
  let n = 0;
  return (
    <Tag className={className} id={id}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span key={li} className="k-line">
            {words.map((word, wi) => {
              const i = n++;
              return (
                <Fragment key={wi}>
                  <span className="k-mask">
                    <span className="k-word" style={{ animationDelay: `${delay + i * 0.06}s` }}>
                      {word}
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

// Counts up to a number once it scrolls into view.
export function CountUp({ to, prefix = "", suffix = "", decimals = 0, format = "en-US" }: { to: number; prefix?: string; suffix?: string; decimals?: number; format?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration: 1.4, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [inView, reduce, to]);
  return (
    <span ref={ref}>
      {prefix}
      {v.toLocaleString(format, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
