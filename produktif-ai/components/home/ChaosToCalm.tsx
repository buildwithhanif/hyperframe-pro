"use client";

import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import PhoneReel from "./PhoneReel";

// The pile of tabs, trials and renewals a creator juggles today. Generic on
// purpose: no real product names or logos.
const MESS = [
  { title: "1:07 AM", body: "Prompting until 1 a.m.", x: -34, y: -20, r: -6 },
  { title: "Billing", body: "Paying for 5 AI tools in dollars", x: 31, y: -24, r: 5, tone: "warn" },
  { title: "Credits", body: "Credits that reset before you used them", x: -38, y: 6, r: 3 },
  { title: "Render 6 of 6", body: "Re-rendering the same clip 6 times", x: 36, y: 6, r: 7, tone: "warn" },
  { title: "captions_fix.srt", body: "Fixing auto-captions by hand", x: -28, y: 30, r: -4 },
  { title: "Tutorial · 2:14:09", body: "Another “best AI video tool” tutorial", x: 27, y: 32, r: -6 },
  { title: "Drafts · 23 clips", body: "A folder of clips you never posted", x: 2, y: 4, r: -2, wide: true },
  { title: "Free trial ended", body: "Upgrade to keep your projects", x: 4, y: 38, r: 3, tone: "warn", wide: true },
] as const;

function Card({ i, progress, item }: { i: number; progress: MotionValue<number>; item: (typeof MESS)[number] }) {
  // Each card holds still, then gets pulled into the centre and disappears.
  const s = 0.08 + i * 0.026;
  const e = s + 0.3;
  const x = useTransform(progress, [0, s, e], [`${item.x}vw`, `${item.x}vw`, "0vw"]);
  const y = useTransform(progress, [0, s, e], [`${item.y}vh`, `${item.y}vh`, "0vh"]);
  const rotate = useTransform(progress, [0, s, e], [item.r, item.r, 0]);
  const scale = useTransform(progress, [0, s, e], [1, 1, 0.2]);
  const opacity = useTransform(progress, [0, s, e - 0.06, e], [1, 1, 0.9, 0]);
  // Each line gets struck through just before it is pulled away.
  const strike = useTransform(progress, [Math.max(0, s - 0.07), s], ["0% 2px", "100% 2px"]);
  return (
    <m.div
      className={`cc-card${"tone" in item ? " is-warn" : ""}${"wide" in item ? " cc-card--wide" : ""}`}
      style={{ x, y, rotate, scale, opacity }}
      aria-hidden="true"
    >
      <div className="cc-card-bar">
        <i />
        <i />
        <i />
        <span>{item.title}</span>
      </div>
      <p>
        <m.span className="cc-struck" style={{ backgroundSize: strike }}>
          {item.body}
        </m.span>
      </p>
    </m.div>
  );
}

export default function ChaosToCalm() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // Progress through the pinned section, computed from page scroll in JS so
  // every layer reads the same number.
  const { scrollY } = useScroll();
  const [range, setRange] = useState({ top: 0, len: 1 });
  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setRange({ top, len: Math.max(1, el.offsetHeight - window.innerHeight) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  const scrollYProgress = useTransform(scrollY, (y) => Math.min(1, Math.max(0, (y - range.top) / range.len)));

  const beforeOpacity = useTransform(scrollYProgress, [0, 0.28, 0.4], [1, 1, 0]);
  const beforeY = useTransform(scrollYProgress, [0.28, 0.4], [0, -30]);
  const phoneScale = useTransform(scrollYProgress, [0.32, 0.6], [0.55, 0.92]);
  const phoneY = useTransform(scrollYProgress, [0.5, 0.64], ["0vh", "-13vh"]);
  const phoneOpacity = useTransform(scrollYProgress, [0.32, 0.46], [0, 1]);
  const afterOpacity = useTransform(scrollYProgress, [0.5, 0.64], [0, 1]);
  const afterY = useTransform(scrollYProgress, [0.5, 0.64], [30, 0]);

  if (reduce) {
    return (
      <section className="cc cc--static" aria-labelledby="cc-h">
        <div className="cc-static">
          <div>
            <p className="cc-eyebrow">The tool grind</p>
            <h2 id="cc-h">AI was supposed to save you time.</h2>
          </div>
          <div className="cc-static-phone">
            <PhoneReel />
          </div>
          <div>
            <p className="cc-eyebrow">With produktif.ai</p>
            <p className="cc-after-h">Send 3 photos and a 2‑minute voice read. Once.</p>
            <p className="cc-after-sub">From there we do the making: scripts, your persona, motion graphics, captions and the post copy.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="cc" aria-labelledby="cc-h">
      <div className="cc-sticky">
        <m.div className="cc-copy cc-before" style={{ opacity: beforeOpacity, y: beforeY }}>
          <p className="cc-eyebrow">The tool grind</p>
          <h2 id="cc-h">AI was supposed to save you time.</h2>
        </m.div>
        <div className="cc-field">
          {MESS.map((item, i) => (
            <Card key={item.title} i={i} progress={scrollYProgress} item={item} />
          ))}
          <m.div className="cc-phone" style={{ scale: phoneScale, opacity: phoneOpacity, y: phoneY }}>
            <PhoneReel />
          </m.div>
        </div>
        <m.div className="cc-copy cc-after" style={{ opacity: afterOpacity, y: afterY }}>
          <p className="cc-eyebrow">With produktif.ai</p>
          <p className="cc-after-h">Send 3 photos and a 2‑minute voice read. Once.</p>
          <p className="cc-after-sub">From there we do the making: scripts, your persona, motion graphics, captions and the post copy.</p>
        </m.div>
      </div>
    </section>
  );
}
