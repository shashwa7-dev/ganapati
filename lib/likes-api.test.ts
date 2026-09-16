import { test } from "node:test";
import assert from "node:assert/strict";
import { parseToggle } from "./likes-api.ts";

const known = (id: number) => id >= 1 && id <= 108;

test("accepts a known id with delta 1 or -1", () => {
  assert.deepEqual(parseToggle({ id: 61, delta: 1 }, known), { id: 61, delta: 1 });
  assert.deepEqual(parseToggle({ id: 1, delta: -1 }, known), { id: 1, delta: -1 });
});

test("rejects anything else", () => {
  assert.equal(parseToggle(null, known), null);
  assert.equal(parseToggle("61", known), null);
  assert.equal(parseToggle({ id: "61", delta: 1 }, known), null);
  assert.equal(parseToggle({ id: 61.5, delta: 1 }, known), null);
  assert.equal(parseToggle({ id: 999, delta: 1 }, known), null);
  assert.equal(parseToggle({ id: 61, delta: 2 }, known), null);
  assert.equal(parseToggle({ id: 61 }, known), null);
});
