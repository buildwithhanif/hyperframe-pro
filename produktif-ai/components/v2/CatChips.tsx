"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { CATEGORIES } from "@/lib/waitlist-options";

// The first question of the application, asked on the page itself. A tap
// opens /v2/start with the answer filled in, so the visitor has already begun.
export default function CatChips({ id, pos }: { id?: string; pos: "hero" | "final" }) {
  return (
    <div className="cat" id={id}>
      <p className="cat-q" id={`${pos}-cat-q`}>
        What do you sell?
      </p>
      <ul className="cat-list" aria-labelledby={`${pos}-cat-q`}>
        {CATEGORIES.map((c) => (
          <li key={c.value}>
            <Link
              href={`/v2/start?cat=${c.value}`}
              className="cat-chip"
              onClick={() => {
                try {
                  track("hero_answer", { pos, cat: c.value });
                } catch {}
              }}
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
