import test from "node:test";
import assert from "node:assert/strict";
import { isExpoPushToken, shouldAskForPermission, targetForNotification } from "./pushRules.ts";

test("permission is asked once, and only while undecided", () => {
  assert.equal(shouldAskForPermission("undetermined", false), true);
  assert.equal(shouldAskForPermission("undetermined", true), false); // asked before: do not nag
  assert.equal(shouldAskForPermission("denied", false), false);       // a refusal is respected
  assert.equal(shouldAskForPermission("granted", false), false);
});

test("order notifications open the orders tab, anything else opens nothing", () => {
  assert.deepEqual(targetForNotification({ type: "order", orderId: "5" }), { pathname: "/(tabs)/orders" });
  assert.equal(targetForNotification({ type: "promo" }), null);
  assert.equal(targetForNotification({ type: "order\"; drop" }), null);
  assert.equal(targetForNotification(null), null);
  assert.equal(targetForNotification("order"), null);
  assert.equal(targetForNotification(undefined), null);
});

test("only well-formed Expo tokens are sent to the server", () => {
  assert.equal(isExpoPushToken("ExponentPushToken[abcdEFGH1234567]"), true);
  assert.equal(isExpoPushToken("ExpoPushToken[abcdEFGH1234567]"), true);
  assert.equal(isExpoPushToken("ExponentPushToken[x]"), false);
  assert.equal(isExpoPushToken("raw-fcm-token"), false);
  assert.equal(isExpoPushToken(42), false);
  assert.equal(isExpoPushToken(undefined), false);
});
