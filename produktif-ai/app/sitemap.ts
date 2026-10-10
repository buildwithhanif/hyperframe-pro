import type { MetadataRoute } from "next";

const BASE = "https://produktif.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-10-11");
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/start`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/consent`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
