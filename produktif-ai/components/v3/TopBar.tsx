"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/site/Brand";
import { DIALOG_EVENT } from "./HeroMedia";

// A white bar with one Get started button. It slides in once the hero button
// has scrolled away above the screen, and steps aside while the closing
// button is on screen or the sound dialog is open, so two Get started buttons
// never show at once.
export default function TopBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("v3-hero-cta");
    const end = document.getElementById("v3-end-cta");
    if (!hero || !end) return;
    let heroGone = false;
    let endIn = false;
    let dialog = false;
    const update = () => setShow(heroGone && !endIn && !dialog);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === hero) heroGone = !e.isIntersecting && e.boundingClientRect.top < 0;
          if (e.target === end) endIn = e.intersectionRatio >= 0.5;
        }
        update();
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(hero);
    io.observe(end);
    const onDialog = (e: Event) => {
      dialog = !!(e as CustomEvent<boolean>).detail;
      update();
    };
    window.addEventListener(DIALOG_EVENT, onDialog);
    return () => {
      io.disconnect();
      window.removeEventListener(DIALOG_EVENT, onDialog);
    };
  }, []);
  return (
    <div className={`v3-bar${show ? " is-on" : ""}`} aria-hidden={!show}>
      <Wordmark title={null} className="v3-bar-wm" />
      <Link
        href="/v3/start"
        className="v3-btn v3-btn--bar"
        tabIndex={show ? 0 : -1}
        onClick={() => {
          try {
            track("cta_click", { pos: "v3_header" });
          } catch {}
        }}
      >
        Get started
      </Link>
    </div>
  );
}
