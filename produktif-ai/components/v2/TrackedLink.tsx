"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import type { ReactNode } from "react";

// A Get started link that also records where on the page it was tapped.
// Custom events need Vercel's Pro plan; on Hobby this is a harmless no-op.
export default function TrackedLink({ href, pos, className, children }: { href: string; pos: string; className?: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        try {
          track("cta_click", { pos });
        } catch {}
      }}
    >
      {children}
    </Link>
  );
}
