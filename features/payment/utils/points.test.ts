import test from "node:test";
import assert from "node:assert/strict";
import { checkPointsRequest, maxRedeemablePoints, pointsValue } from "./points.ts";

const base = { balance: 200, applied: 0, payable: 5000, rate: 1 };

test("limited by the balance and so the order never becomes free", () => {
  assert.equal(maxRedeemablePoints({ ...base, balance: 120 }), 120);
  assert.equal(maxRedeemablePoints({ balance: 10000, applied: 0, payable: 500, rate: 1 }), 499);
  assert.equal(maxRedeemablePoints({ balance: 10000, applied: 0, payable: 500, rate: 2 }), 249);
  assert.equal(maxRedeemablePoints({ ...base, rate: 0 }), 0);
});

test("asking for more points than owned is an error, not a smaller number", () => {
  assert.deepEqual(checkPointsRequest("500", base), { ok: false, message: "You only have 200 reward points." });
  assert.deepEqual(checkPointsRequest("200", base), { ok: true, points: 200 });
});

test("asking for more than the order can take says how many it can take", () => {
  assert.deepEqual(checkPointsRequest("600", { balance: 1000, applied: 0, payable: 500, rate: 1 }), {
    ok: false,
    message: "You can use at most 499 points on this order.",
  });
});

test("empty, zero, negative and fractional input are rejected with a reason", () => {
  for (const bad of ["", "  ", "0", "-3", "abc"]) assert.equal(checkPointsRequest(bad, base).ok, false);
  assert.deepEqual(checkPointsRequest("2.5", base), { ok: false, message: "Points must be a whole number." });
});

test("points already on the order count as owned", () => {
  const p = { balance: 20, applied: 100, payable: 400, rate: 1 };
  assert.equal(checkPointsRequest("120", p).ok, true);
  assert.deepEqual(checkPointsRequest("121", p), { ok: false, message: "You only have 120 reward points." });
});

test("value of points", () => {
  assert.equal(pointsValue(30, 2), 60);
  assert.equal(pointsValue(-5, 2), 0);
});
