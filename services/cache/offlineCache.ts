import * as FileSystem from "expo-file-system/legacy";

/**
 * Small on-device cache so a screen can show the last known data while offline or while the server is slow.
 *
 * - Files live in the app's private storage, one per key.
 * - It holds account data (vouchers, consents), so it MUST be wiped on logout: see clearOfflineCache().
 * - Every function swallows storage errors: not being able to cache must never break a screen.
 */

const DIR = `${FileSystem.documentDirectory ?? ""}offline-cache/`;

export type CachedValue<T> = { data: T; savedAt: number };

const fileFor = (key: string) => `${DIR}${key.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
}

export async function readCache<T>(key: string, maxAgeMs?: number): Promise<CachedValue<T> | null> {
  if (!FileSystem.documentDirectory) return null;
  try {
    const raw = await FileSystem.readAsStringAsync(fileFor(key));
    const parsed = JSON.parse(raw) as CachedValue<T>;
    if (typeof parsed?.savedAt !== "number" || parsed.data === undefined) return null;
    if (maxAgeMs !== undefined && Date.now() - parsed.savedAt > maxAgeMs) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, data: T): Promise<void> {
  if (!FileSystem.documentDirectory) return;
  try {
    await ensureDir();
    const value: CachedValue<T> = { data, savedAt: Date.now() };
    await FileSystem.writeAsStringAsync(fileFor(key), JSON.stringify(value));
  } catch {
    // ignore: the screen already has the fresh data
  }
}

/** Deletes everything cached for the signed-in customer. Call on logout and on account deletion. */
export async function clearOfflineCache(): Promise<void> {
  if (!FileSystem.documentDirectory) return;
  try {
    await FileSystem.deleteAsync(DIR, { idempotent: true });
  } catch {
    // ignore
  }
}

/** True when the failure is "no connection / timed out" rather than an answer from the server. */
export function isOfflineError(error: any): boolean {
  if (error?.response) return false;
  return error?.message === "Network Error" || error?.code === "ECONNABORTED" || error?.code === "ERR_NETWORK";
}

/** "5 minutes ago", "2 hours ago", "3 days ago". */
export function timeAgo(savedAt: number, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - savedAt) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
