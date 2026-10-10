import test from "node:test";
import assert from "node:assert/strict";
import { mergeRecent, MAX_RECENT, type RecentProduct } from "./recentList.ts";

const p = (id: number): RecentProduct => ({ ProductId: id, ProductName: "p" + id, MinPrice: 1 });

test("newest first", () => {
  assert.deepEqual(mergeRecent([p(1), p(2)], p(3)).map((x) => x.ProductId), [3, 1, 2]);
});

test("a product seen again moves to the front instead of repeating", () => {
  assert.deepEqual(mergeRecent([p(1), p(2), p(3)], p(3)).map((x) => x.ProductId), [3, 1, 2]);
});

test("list is capped", () => {
  const many = Array.from({ length: MAX_RECENT }, (_, i) => p(i + 10));
  const result = mergeRecent(many, p(1));
  assert.equal(result.length, MAX_RECENT);
  assert.equal(result[0].ProductId, 1);
});
