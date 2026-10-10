import { test } from "node:test";
import assert from "node:assert/strict";
import { checkDeck, DeckSchema, GenerateRequestSchema, normalizeHandle, splitAnchor } from "./schema.ts";
import { SAMPLE_DECK } from "./sample.ts";

test("splitAnchor finds the anchor case-insensitively and keeps original casing", () => {
  assert.deepEqual(splitAnchor("Jangan transfer balik sekarang", "TRANSFER balik"), ["Jangan ", "transfer balik", " sekarang"]);
});

test("splitAnchor leaves the title whole when the anchor is missing or empty", () => {
  assert.deepEqual(splitAnchor("Judul", "nggak ada"), ["Judul", "", ""]);
  assert.deepEqual(splitAnchor("Judul", "  "), ["Judul", "", ""]);
});

test("normalizeHandle adds a single @", () => {
  assert.equal(normalizeHandle("hanifmuh_"), "@hanifmuh_");
  assert.equal(normalizeHandle("@hanifmuh_"), "@hanifmuh_");
  assert.equal(normalizeHandle("  "), "");
});

test("request schema applies defaults and rejects bad input", () => {
  const ok = GenerateRequestSchema.parse({ mode: "topic", input: "modus transfer nyasar" });
  assert.equal(ok.slideCount, 8);
  assert.equal(ok.handle, "");
  assert.equal(ok.receipts, "");
  assert.equal(GenerateRequestSchema.safeParse({ mode: "topic", input: "ab" }).success, false);
  assert.equal(GenerateRequestSchema.safeParse({ mode: "topic", input: "abc", slideCount: 13 }).success, false);
  assert.equal(GenerateRequestSchema.safeParse({ mode: "topic", input: "abc", handle: "bad handle!" }).success, false);
  assert.equal(GenerateRequestSchema.safeParse({ mode: "video", input: "abc" }).success, false);
});

test("sample deck matches the model schema and passes its own checks", () => {
  assert.equal(DeckSchema.safeParse(SAMPLE_DECK).success, true);
  assert.deepEqual(checkDeck(SAMPLE_DECK, SAMPLE_DECK.slides.length), []);
});

test("checkDeck reports count, hook and anchor problems", () => {
  const bad = structuredClone(SAMPLE_DECK);
  bad.slides[0].kind = "step";
  bad.slides[1].anchor = "kata yang nggak ada";
  const issues = checkDeck(bad, 10);
  assert.equal(issues.length, 3);
});
