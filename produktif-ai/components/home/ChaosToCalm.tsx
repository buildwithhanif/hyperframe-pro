"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import PhoneReel from "./PhoneReel";

// The pile of tabs, trials and renewals a creator juggles today. Generic on
// purpose: no real product names or logos.
const MESS = [
  { title: "prompt_v14_FINAL(2).txt", body: "make it sound more like me but not cringe…", x: -38, y: -30, r: -6 },
  { title: "Free trial ended", body: "Upgrade to keep your projects.", x: 30, y: -34, r: 5, tone: "warn" },
  { title: "Subscription renewed", body: "US$29.00 charged to •••• 4471", x: -6, y: -40, r: -2 },
  { title: "Render failed", body: "Export 3 of 7 stopped. Try again?", x: 40, y: 2, r: 8, tone: "warn" },
  { title: "Voice settings", body: "Stability 0.42 · Clarity 0.77 · Style 0.13", x: -42, y: 8, r: 4 },
  { title: "Tutorial · 2h 14m", body: "The ONLY AI video workflow you need", x: 26, y: 30, r: -7 },
  { title: "Captions app", body: "Watermark removed on Pro plan", x: -28, y: 36, r: -4 },
  { title: "New AI tool just dropped", body: "Is this the one? (thread, 41 replies)", x: 4, y: 40, r: 3 },
  { title: "Script ideas.docx", body: "1. ??? 2. post consistently 3. ???", x: -10, y: -8, r: 2 },
  { title: "Calendar", body: "Film this week: Mon? Wed? Sat?", x: 18, y: -14, r: -5 },
] as const;

function Card({ i, progress, item }: { i: number; progress: MotionValue<number>; item: (typeof MESS)[number] }) {
  // Each card holds still, then gets pulled into the centre and disappears.
  const s = 0.08 + i * 0.022;
  const e = s + 0.3;
  const x = useTransform(progress, [0, s, e], [`${item.x}vw`, `${item.x}vw`, "0vw"]);
  const y = useTransform(progress, [0, s, e], [`${item.y}vh`, `${item.y}vh`, "0vh"]);
  const rotate = useTransform(progress, [0, s, e], [item.r, item.r, 0]);
  const scale = useTransform(progress, [0, s, e], [1, 1, 0.2]);
  const opacity = useTransform(progress, [0, s, e - 0.06, e], [1, 1, 0.9, 0]);
  return (
    <motion.div className={`cc-card${"tone" in item ? " is-warn" : ""}`} style={{ x, y, rotate, scale, opacity }} aria-hidden="true">
      <div className="cc-card-bar">
        <i />
        <i />
        <i />
        <span>{item.title}</span>
      </div>
      <p>{item.body}</p>
    </motion.div>
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
  const phoneScale = useTransform(scrollYProgress, [0.32, 0.6], [0.55, 1]);
  const phoneOpacity = useTransform(scrollYProgress, [0.32, 0.46], [0, 1]);
  const afterOpacity = useTransform(scrollYProgress, [0.5, 0.64], [0, 1]);
  const afterY = useTransform(scrollYProgress, [0.5, 0.64], [30, 0]);

  if (reduce) {
    return (
      <section className="cc cc--static" aria-labelledby="cc-h">
        <div className="cc-static">
          <div>
            <p className="cc-eyebrow">Today</p>
            <h2 id="cc-h">Tabs, trials, renewals, failed renders. Still no video.</h2>
          </div>
          <div className="cc-static-phone">
            <PhoneReel />
          </div>
          <div>
            <p className="cc-eyebrow">With produktif.ai</p>
            <p className="cc-after-h">Your videos, ready to post. Every day.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="cc" aria-labelledby="cc-h">
      <div className="cc-sticky">
        <motion.div className="cc-copy cc-before" style={{ opacity: beforeOpacity, y: beforeY }}>
          <p className="cc-eyebrow">Today</p>
          <h2 id="cc-h">Tabs, trials, renewals, failed renders. Still no video.</h2>
        </motion.div>
        <div className="cc-field">
          {MESS.map((item, i) => (
            <Card key={item.title} i={i} progress={scrollYProgress} item={item} />
          ))}
          <motion.div className="cc-phone" style={{ scale: phoneScale, opacity: phoneOpacity }}>
            <PhoneReel />
          </motion.div>
        </div>
        <motion.div className="cc-copy cc-after" style={{ opacity: afterOpacity, y: afterY }}>
          <p className="cc-eyebrow">With produktif.ai</p>
          <p className="cc-after-h">Your videos, ready to post. Every day.</p>
        </motion.div>
      </div>
    </section>
  );
}
