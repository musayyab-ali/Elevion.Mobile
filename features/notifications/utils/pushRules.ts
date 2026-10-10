/**
 * Decisions around push notifications, free of native modules so they can be tested alone.
 */

export type PermissionStatus = "granted" | "denied" | "undetermined";

/**
 * Ask the customer for notification permission only when it can still change something (never asked before)
 * and only once: a refusal is respected, the app does not nag. They can change it later in the phone settings.
 */
export function shouldAskForPermission(status: PermissionStatus, alreadyAsked: boolean): boolean {
  return status === "undetermined" && !alreadyAsked;
}

/** The app screen a tapped notification should open. */
export type PushTarget = { pathname: "/(tabs)/orders" } | null;

/**
 * Order updates open the orders tab. Unknown or malformed data opens nothing: a notification can carry any text,
 * and the app must never navigate somewhere because of an arbitrary value in it.
 */
export function targetForNotification(data: unknown): PushTarget {
  if (!data || typeof data !== "object") return null;
  const type = (data as Record<string, unknown>).type;
  return type === "order" ? { pathname: "/(tabs)/orders" } : null;
}

const TOKEN_FORMAT = /^Expo(nent)?PushToken\[[A-Za-z0-9_\-]{8,200}\]$/;

/** The same shape the server accepts, so a bad value is never sent. */
export function isExpoPushToken(token: unknown): token is string {
  return typeof token === "string" && token.length <= 255 && TOKEN_FORMAT.test(token);
}
