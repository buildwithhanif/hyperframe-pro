"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/site/Brand";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Brand({ className = "brand" }: { className?: string }) {
  return (
    <Link href="/" className={className} aria-label="produktif.ai home">
      <Wordmark title={null} className="brand-wm" />
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
