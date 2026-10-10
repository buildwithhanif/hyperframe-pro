import { test } from "node:test";
import assert from "node:assert/strict";
import { formatReplyBy, replyBy } from "./dates.ts";

test("two working days, Jakarta time, skipping weekends", () => {
  // Saturday 10 Oct 2026, 15:00 WIB -> Tuesday 13 Oct
  assert.equal(formatReplyBy(replyBy(new Date("2026-10-10T08:00:00Z"))), "Tuesday, 13 October");
  // Monday 12 Oct 2026, 09:00 WIB -> Wednesday 14 Oct
  assert.equal(formatReplyBy(replyBy(new Date("2026-10-12T02:00:00Z"))), "Wednesday, 14 October");
  // Sunday 23:30 UTC is already Monday in Jakarta -> Wednesday
  assert.equal(formatReplyBy(replyBy(new Date("2026-10-11T23:30:00Z"))), "Wednesday, 14 October");
});
