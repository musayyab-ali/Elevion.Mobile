/**
 * The one place that reads the app's environment settings (EXPO_PUBLIC_* values, set in .env or in the EAS build profile).
 *
 * Be aware: everything EXPO_PUBLIC_* is compiled into the app and can be extracted by anyone who has the app, so the API
 * security key is an identifier for the API, not a secret. The API must (and does) check the signed-in customer's token on
 * every protected call. Never put a real secret in here.
 */

function clean(value: string | undefined): string {
  return (value ?? "").trim().replace(/\/+$/, "");
}

/** Version 1 of the API, e.g. https://api.example.com/api/v1 */
export const API_URL = clean(process.env.EXPO_PUBLIC_API_URL);

/** Version 2 of the API (a few account calls), e.g. https://api.example.com/api/v2 */
export const API_URL_V2 = clean(process.env.EXPO_PUBLIC_API_URL_TWO) || API_URL.replace(/\/v1$/, "/v2");

/** Value of the "api-security-key" header the API asks every client to send. */
export const API_KEY = (process.env.EXPO_PUBLIC_API_KEY ?? "").trim();

/** A request that takes longer than this is cancelled instead of leaving the screen loading forever. */
export const API_TIMEOUT_MS = 30_000;

/** True when the API address is plain http (the app then has to allow cleartext traffic; see app.config.js). */
export const API_IS_INSECURE = API_URL.startsWith("http://");

if (!API_URL || !API_KEY) {
  // Fail loudly in development instead of sending requests to nowhere.
  console.warn(
    "[config] EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_KEY must be set (copy .env.example to .env, or set them in the EAS build profile).",
  );
}
