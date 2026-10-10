import { readCache, writeCache } from "../../../services/cache/offlineCache";
import { mergeRecent, type RecentProduct } from "./recentList";

/**
 * Products the customer looked at last, kept only on this phone (private app storage, wiped on logout).
 * Only public catalogue facts are stored.
 */

export type { RecentProduct };

const KEY = "recently-viewed";

export async function getRecentlyViewed(): Promise<RecentProduct[]> {
  const saved = await readCache<RecentProduct[]>(KEY);
  return Array.isArray(saved?.data) ? saved!.data.filter((p) => p && typeof p.ProductId === "number") : [];
}

export async function addRecentlyViewed(product: RecentProduct): Promise<void> {
  try {
    await writeCache(KEY, mergeRecent(await getRecentlyViewed(), product));
  } catch {
    // remembering a product must never affect the screen
  }
}
