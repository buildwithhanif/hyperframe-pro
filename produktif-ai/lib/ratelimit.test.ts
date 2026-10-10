import { test } from "node:test";
import assert from "node:assert/strict";
import { clientKey, rateLimit } from "./ratelimit.ts";

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

test("clientKey prefers the first x-forwarded-for hop", () => {
  assert.equal(clientKey(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" })), "1.2.3.4");
  assert.equal(clientKey(new Headers({ "x-real-ip": "5.6.7.8" })), "5.6.7.8");
  assert.equal(clientKey(new Headers()), "unknown");
});
