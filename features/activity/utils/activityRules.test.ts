import { test } from "node:test";
import assert from "node:assert/strict";
import { isReportableProduct, SAME_VISIT_MS, shouldReportView, trimRemembered } from "./activityRules.ts";

test("a product never reported before is reported", () => {
  assert.equal(shouldReportView(undefined, 1_000), true);
  assert.equal(shouldReportView(Number.NaN, 1_000), true);
});

test("the same product is not reported again within the same visit", () => {
  const t = 10_000_000;
  assert.equal(shouldReportView(t, t + 1_000), false);
  assert.equal(shouldReportView(t, t + SAME_VISIT_MS - 1), false);
});

test("it is reported again once the visit gap has passed", () => {
  const t = 10_000_000;
  assert.equal(shouldReportView(t, t + SAME_VISIT_MS), true);
});

test("only positive whole product ids are reportable", () => {
  assert.equal(isReportableProduct(12), true);
  for (const bad of [0, -3, 1.5, Number.NaN, "12", null, undefined]) assert.equal(isReportableProduct(bad), false);
});

test("trimming forgets the oldest products first", () => {
  const map = new Map<number, number>([
    [1, 100],
    [2, 300],
    [3, 200],
    [4, 400],
  ]);
  trimRemembered(map, 2);
  assert.deepEqual(Array.from(map.keys()).sort(), [2, 4]);
});

test("trimming does nothing while the list is short", () => {
  const map = new Map<number, number>([[1, 100]]);
  trimRemembered(map, 5);
  assert.equal(map.size, 1);
});
