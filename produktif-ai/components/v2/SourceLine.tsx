"use client";

import { useEffect, useState } from "react";

// One line above the headline that matches where the visitor came from
// (utm_source on the link). Plain text, same height either way.
const LINES: Record<string, string> = {
  dm: "From Hanif’s DMs: here’s how it works and what it costs.",
  ig_bio: "From Hanif, whose account you just came from.",
  tt_bio: "From Hanif, whose account you just came from.",
  x_bio: "From Hanif, whose account you just came from.",
  post: "From Hanif, whose account you just came from.",
};
const DEFAULT = "For business owners on Instagram and TikTok.";

export default function SourceLine() {
  const [line, setLine] = useState(DEFAULT);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const saved = JSON.parse(window.sessionStorage.getItem("pai-utm") || "{}");
      const src = (params.get("utm_source") || saved.utm_source || "").toLowerCase();
      if (LINES[src]) setLine(LINES[src]);
    } catch {}
  }, []);
  return <p className="src-line">{line}</p>;
}
