"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

// A plain link that records one named event when tapped (custom events need
// Vercel's Pro plan; on Hobby this is a harmless no-op).
export default function EventLink({
  href,
  event,
  data,
  className,
  external,
  children,
}: {
  href: string;
  event: string;
  data?: Record<string, string>;
  className?: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      onClick={() => {
        try {
          track(event, data);
        } catch {}
      }}
    >
      {children}
    </a>
  );
}
