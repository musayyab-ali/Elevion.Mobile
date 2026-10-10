import apiClient from "../../../services/api/apiClient";
import { isReportableProduct, shouldReportView, trimRemembered } from "../utils/activityRules";

const MAX_REMEMBERED = 100;
const lastReported = new Map<number, number>();

/**
 * Tells the shop that the signed-in customer opened a product (used for "still thinking about it?" advice).
 * Fire and forget: it never throws and never shows anything. The server only records it for customers who agreed to
 * analytics or personalization, and does nothing for everyone else. Call it only when the customer is signed in.
 */
export function trackProductView(productId: unknown): void {
  if (!isReportableProduct(productId)) return;

  const now = Date.now();
  if (!shouldReportView(lastReported.get(productId), now)) return;

  lastReported.set(productId, now);
  trimRemembered(lastReported, MAX_REMEMBERED);
  void apiClient.post("/api/v1/CustomerActivity/ProductViewed", { ProductId: productId }).catch(() => {
    /* a missing view is not worth an error message */
  });
}

/** Forgets what was reported (on logout), so the next customer on this phone starts fresh. */
export function resetTrackedViews(): void {
  lastReported.clear();
}
