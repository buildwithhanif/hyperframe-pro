// Fixed-window limiter kept in memory. On serverless hosts each instance has its
// own memory, so this only slows down casual abuse. The real spend ceiling is the
// workspace spend limit in the Anthropic Console; move this to a shared store
// (Upstash/Vercel KV) before promoting the site widely.

const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, now = Date.now()): { ok: boolean; retryAfterSec: number } {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) {
    hits.set(key, recent);
    const oldest = recent[0] ?? now;
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return { ok: true, retryAfterSec: 0 };
}

// One IPv6 holder usually controls a whole /64, so bucket by that prefix.
export function ipBucket(ip: string): string {
  if (!ip.includes(":")) return ip;
  const [head, tail = ""] = ip.toLowerCase().split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const full = ip.includes("::") ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right] : left;
  return `${full.slice(0, 4).map((h) => h || "0").join(":")}::/64`;
}

// Trust only headers a proxy sets. Vercel and a typical nginx setup write
// x-real-ip; with an appending proxy the last x-forwarded-for hop is the one it
// added. A bare `next start` exposed to the internet cannot be protected this
// way: put it behind a proxy that overwrites these headers.
export function clientKey(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return ipBucket(real);
  const hops = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  const last = hops[hops.length - 1];
  return last ? ipBucket(last) : "unknown";
}

// Parse an hourly limit from the environment. An empty or invalid value means
// the default; 0 is a deliberate "stop generating" switch.
export function limitFromEnv(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}
