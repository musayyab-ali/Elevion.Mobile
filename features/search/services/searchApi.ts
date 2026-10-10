import apiClient from "../../../services/api/apiClient";
import type { Product } from "../../shop/types/shopTypes";

export const SEARCH_LIMIT = 50;

export interface SearchResult {
  products: Product[];
  total: number;
}

/**
 * Server-side search by product name: the phone only receives the (at most SEARCH_LIMIT) matches, never the catalogue.
 * BrandId -1 = every brand, the same as the category lists in this app.
 */
export async function searchProducts(query: string, signal?: AbortSignal): Promise<SearchResult> {
  const q = query.trim().slice(0, 100);
  const response = await apiClient.get("/Product/by-category", {
    params: { BrandId: -1, PageNumber: 1, PageSize: SEARCH_LIMIT, SortBy: "name", ProductName: q },
    signal,
  });

  const data = response.data?.Data ?? {};
  const list: Product[] = data.ProductListViewModel ?? data.productListViewModel ?? [];
  const products = list.filter((p) => Boolean(p?.ProductId));
  return { products, total: Number(data.TotalRecords) || products.length };
}
