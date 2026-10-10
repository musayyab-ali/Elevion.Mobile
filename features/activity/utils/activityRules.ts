/** The server counts a look at the same product within 30 minutes as one visit, so there is no point asking again sooner. */
export const SAME_VISIT_MS = 30 * 60 * 1000;

/** Whether to tell the server about a product view, given when this phone last told it about the same product. */
export function shouldReportView(
  lastReportedAt: number | undefined,
  now: number,
  gapMs: number = SAME_VISIT_MS,
): boolean {
  if (lastReportedAt === undefined || !Number.isFinite(lastReportedAt)) return true;
  return now - lastReportedAt >= gapMs;
}

/** A product id worth reporting: a positive whole number. */
export function isReportableProduct(productId: unknown): productId is number {
  return typeof productId === "number" && Number.isInteger(productId) && productId > 0;
}

/** Keeps the list of remembered products short by dropping the oldest entries. */
export function trimRemembered(map: Map<number, number>, max: number): void {
  if (map.size <= max) return;
  const oldestFirst = Array.from(map.entries()).sort((a, b) => a[1] - b[1]);
  for (let i = 0; i < oldestFirst.length - max; i++) {
    map.delete(oldestFirst[i][0]);
  }
}
