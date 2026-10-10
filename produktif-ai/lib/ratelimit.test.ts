import { test } from "node:test";
import assert from "node:assert/strict";
import { clientKey, ipBucket, limitFromEnv, rateLimit } from "./ratelimit.ts";

test("allows up to the limit inside the window, then blocks", () => {
  const t0 = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(rateLimit("a", 3, t0 + i).ok, true);
  const blocked = rateLimit("a", 3, t0 + 10);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfterSec > 0 && blocked.retryAfterSec <= 3600);
});

test("window slides: old hits expire after an hour", () => {
  const t0 = 5_000_000;
  for (let i = 0; i < 2; i++) rateLimit("b", 2, t0);
  assert.equal(rateLimit("b", 2, t0 + 1000).ok, false);
  assert.equal(rateLimit("b", 2, t0 + 60 * 60 * 1000 + 1).ok, true);
});

test("clientKey trusts x-real-ip, then the last x-forwarded-for hop", () => {
  assert.equal(clientKey(new Headers({ "x-real-ip": "5.6.7.8", "x-forwarded-for": "6.6.6.6" })), "5.6.7.8");
  assert.equal(clientKey(new Headers({ "x-forwarded-for": "6.6.6.6, 1.2.3.4" })), "1.2.3.4");
  assert.equal(clientKey(new Headers()), "unknown");
});

test("IPv6 addresses are bucketed by /64", () => {
  assert.equal(ipBucket("2001:db8:1:2::1"), "2001:db8:1:2::/64");
  assert.equal(ipBucket("2001:db8:1:2:aaaa:bbbb:cccc:dddd"), "2001:db8:1:2::/64");
  assert.equal(ipBucket("2001:db8::5"), "2001:db8:0:0::/64");
  assert.equal(ipBucket("::1"), "0:0:0:0::/64");
  assert.equal(ipBucket("1.2.3.4"), "1.2.3.4");
});

test("limitFromEnv keeps 0 as a real stop and falls back on junk", () => {
  assert.equal(limitFromEnv(undefined, 8), 8);
  assert.equal(limitFromEnv("", 8), 8);
  assert.equal(limitFromEnv("0", 8), 0);
  assert.equal(limitFromEnv("20", 8), 20);
  assert.equal(limitFromEnv("abc", 8), 8);
  assert.equal(limitFromEnv("-3", 8), 8);
});
