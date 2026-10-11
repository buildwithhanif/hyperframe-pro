"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { useEffect, useState } from "react";

// Phones only (CSS): one Get started button that shows once the hero's
// question has scrolled away and hides again when the final one is in view.
export default function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero-cat");
    const final = document.getElementById("final-cta");
    if (!hero || !final) return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting);
      const heroGone = seen.get(hero) === false && hero.getBoundingClientRect().top < 0;
      setShow(heroGone && !seen.get(final));
    });
    io.observe(hero);
    io.observe(final);
    return () => io.disconnect();
  }, []);
  return (
    <div className={`sticky-cta${show ? " is-on" : ""}`} aria-hidden={!show}>
      <p>
        <b>Rp 4,000,000</b> a month. Test clip before your first bill.
      </p>
      <Link
        href="/v2/start"
        className="btn"
        tabIndex={show ? 0 : -1}
        onClick={() => {
          try {
            track("cta_click", { pos: "sticky" });
          } catch {}
        }}
      >
        Get started
      </Link>
    </div>
  );
}
