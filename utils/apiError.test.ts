import test from "node:test";
import assert from "node:assert/strict";
import { apiErrorMessage, apiErrorStatus, isStockError } from "./apiError.ts";

test("the server's own message wins", () => {
  const err = { response: { status: 409, data: { Message: "Only 3 of Suit left in stock." } } };
  assert.equal(apiErrorMessage(err, "fallback"), "Only 3 of Suit left in stock.");
});

test("falls back when there is no readable message", () => {
  assert.equal(apiErrorMessage({ response: { status: 500, data: {} } }, "fallback"), "fallback");
  assert.equal(apiErrorMessage(undefined, "fallback"), "fallback");
  assert.equal(apiErrorMessage({ response: { data: { Message: "   " } } }, "fallback"), "fallback");
});

test("connection problems are named", () => {
  assert.match(apiErrorMessage({ message: "Network Error" }, "x"), /Unable to connect/);
  assert.match(apiErrorMessage({ code: "ECONNABORTED" }, "x"), /too long/);
});

test("stock errors are recognised by status", () => {
  assert.equal(isStockError({ response: { status: 409 } }), true);
  assert.equal(isStockError({ response: { status: 503 } }), true);
  assert.equal(isStockError({ response: { status: 400 } }), false);
  assert.equal(apiErrorStatus({}), undefined);
});
