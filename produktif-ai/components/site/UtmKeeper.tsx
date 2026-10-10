"use client";

import { useEffect } from "react";

// Remembers utm_* tags from the landing URL for this tab, so the apply form can
// record which post sent each signup even after the visitor clicks around.
export default function UtmKeeper() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const keys = ["utm_source", "utm_medium", "utm_campaign"];
      if (!keys.some((k) => params.get(k))) return;
      const tags = Object.fromEntries(keys.map((k) => [k, (params.get(k) || "").slice(0, 100)]));
      window.sessionStorage.setItem("pai-utm", JSON.stringify(tags));
    } catch {}
  }, []);
  return null;
}
