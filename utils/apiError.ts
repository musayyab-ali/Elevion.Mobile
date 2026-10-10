/**
 * The server's own sentence for a failed request ("Only 3 of Suit left in stock ..."), or the fallback.
 * The API client rejects with the raw axios error, so the message sits in error.response.data.Message;
 * reading error.Message (as some screens did) always gives nothing and hides the real reason.
 */
export function apiErrorMessage(error: any, fallback: string): string {
  if (error?.code === "ECONNABORTED") {
    return "The server took too long to respond. Please try again.";
  }
  if (error?.message === "Network Error" && !error?.response) {
    return "Unable to connect. Please check your internet and try again.";
  }

  const body = error?.response?.data;
  const message = body?.Message ?? body?.ExceptionMessage ?? body?.message;
  return typeof message === "string" && message.trim() ? message.trim() : fallback;
}

export function apiErrorStatus(error: any): number | undefined {
  return typeof error?.response?.status === "number" ? error.response.status : undefined;
}

/** 409 (cart) and 503 (order) both mean "not enough stock" in this API. */
export function isStockError(error: any): boolean {
  const status = apiErrorStatus(error);
  return status === 409 || status === 503;
}
