/**
 * Sorting / filtering of search results on the phone. The API returns matches in name order only, so price
 * and "new" ordering is done here on the fetched matches. Pure functions (no React, no network).
 */

export type SortKey = "relevance" | "price-asc" | "price-desc" | "newest";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Best match" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "newest", label: "New arrivals" },
];

export interface Refinement {
  sort: SortKey;
  inStockOnly: boolean;
}

export const DEFAULT_REFINEMENT: Refinement = { sort: "relevance", inStockOnly: false };

interface RefinableProduct {
  ProductName: string;
  Price?: number;
  MinPrice?: number;
  IsNewProduct?: boolean;
  IsProductInStock?: boolean;
}

const priceOf = (p: RefinableProduct) => Number(p.MinPrice ?? p.Price ?? 0) || 0;

/** Names that start with the query rank before names that merely contain it; API order is kept inside a group. */
function rank(p: RefinableProduct, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const name = p.ProductName.toLowerCase();
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (name.includes(q)) return 2;
  return 3;
}

export function refineProducts<T extends RefinableProduct>(products: T[], refinement: Refinement, query = ""): T[] {
  // An unknown stock state counts as available: only an explicit false is treated as sold out.
  const list = products.filter((p) => !refinement.inStockOnly || p.IsProductInStock !== false);

  switch (refinement.sort) {
    case "price-asc":
      return [...list].sort((a, b) => priceOf(a) - priceOf(b));
    case "price-desc":
      return [...list].sort((a, b) => priceOf(b) - priceOf(a));
    case "newest":
      return [...list].sort((a, b) => Number(!!b.IsNewProduct) - Number(!!a.IsNewProduct));
    default:
      return [...list].sort((a, b) => rank(a, query) - rank(b, query));
  }
}

/** Remembers a search at the top of the list (no duplicates, case-insensitive, newest first). */
export function pushRecentSearch(list: string[], query: string, max = 8): string[] {
  const q = query.trim().replace(/\s+/g, " ").slice(0, 60);
  if (q.length < 2) return list;
  return [q, ...list.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, max);
}
