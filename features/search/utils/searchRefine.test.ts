import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_REFINEMENT, pushRecentSearch, refineProducts } from "./searchRefine.ts";

const p = (name: string, price: number, extra: Record<string, unknown> = {}) => ({ ProductName: name, MinPrice: price, ...extra });
const items = [p("Blue Jeans", 3000, { IsNewProduct: true }), p("Jeans Jacket", 5000, { IsProductInStock: false }), p("Cotton Tee", 450)];

test("price sorting", () => {
  assert.deepEqual(refineProducts(items, { ...DEFAULT_REFINEMENT, sort: "price-asc" }).map((i) => i.MinPrice), [450, 3000, 5000]);
  assert.deepEqual(refineProducts(items, { ...DEFAULT_REFINEMENT, sort: "price-desc" }).map((i) => i.MinPrice), [5000, 3000, 450]);
});

test("in-stock filter removes only explicit sold-out items", () => {
  const names = refineProducts(items, { ...DEFAULT_REFINEMENT, inStockOnly: true }).map((i) => i.ProductName);
  assert.deepEqual(names, ["Blue Jeans", "Cotton Tee"]);
});

test("new arrivals first; best match prefers names that start with the query", () => {
  assert.equal(refineProducts(items, { ...DEFAULT_REFINEMENT, sort: "newest" })[0].ProductName, "Blue Jeans");
  assert.equal(refineProducts(items, DEFAULT_REFINEMENT, "jeans")[0].ProductName, "Jeans Jacket");
});

test("recent searches: newest first, no duplicates, short or empty ignored, capped", () => {
  assert.deepEqual(pushRecentSearch(["shoes", "bag"], "Shoes"), ["Shoes", "bag"]);
  assert.deepEqual(pushRecentSearch(["a1"], "x"), ["a1"]);
  assert.deepEqual(pushRecentSearch([], "  red   shirt "), ["red shirt"]);
  assert.equal(pushRecentSearch(Array.from({ length: 8 }, (_, i) => `item${i}`), "new one").length, 8);
});
