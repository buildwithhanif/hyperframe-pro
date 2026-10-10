"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="produktif.ai home">
      <svg className="brand-mark" viewBox="0 0 14 22" aria-hidden="true">
        <rect x="0.75" y="0.75" width="12.5" height="20.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="15.5" width="6" height="1.6" rx="0.8" fill="var(--accent)" />
      </svg>
      <span>
        produktif<i>.</i>ai
      </span>
    </Link>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="nav-in">
        <Brand />
        <nav aria-label="Main">
          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/start" className="btn btn--sm">
          Get started
        </Link>
      </div>
    </header>
  );
}

// A thumb-reach CTA on phones once the hero's buttons have scrolled away.
export function MobileCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero-cta");
    const end = document.getElementById("final-cta");
    if (!hero) return;
    let pastHero = false;
    let atEnd = false;
    const update = () => setShow(pastHero && !atEnd);
    const io1 = new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      update();
    });
    const io2 = new IntersectionObserver(([e]) => {
      atEnd = e.isIntersecting;
      update();
    });
    io1.observe(hero);
    if (end) io2.observe(end);
    return () => {
      io1.disconnect();
      io2.disconnect();
    };
  }, []);
  return (
    <div className={`mcta${show ? " is-on" : ""}`} aria-hidden={!show}>
      <span>
        <b>Rp 4,000,000</b> / month · 60 videos
      </span>
      <Link href="/start" className="btn" tabIndex={show ? 0 : -1}>
        Get started
      </Link>
    </div>
  );
}
