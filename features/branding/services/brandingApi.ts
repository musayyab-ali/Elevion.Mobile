import apiClient from "../../../services/api/apiClient";
import { Branding, parseBranding } from "../utils/brandingModel";

const TIMEOUT_MS = 8000;

/** The shop's branding from the API (name, theme, benefits, contact details, social links). Null when it cannot be reached: the app keeps what it has. */
export async function fetchBranding(fallbackName: string): Promise<Branding | null> {
  try {
    const response = await apiClient.get("/TenantLanding/branding", { timeout: TIMEOUT_MS });
    const data = (response.data as { Data?: unknown } | undefined)?.Data;
    return data ? parseBranding(data, fallbackName) : null;
  } catch (error) {
    if (__DEV__) console.log("Branding could not be loaded:", (error as Error)?.message);
    return null;
  }
}
