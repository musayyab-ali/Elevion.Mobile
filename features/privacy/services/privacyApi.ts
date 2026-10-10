import apiClient from "../../../services/api/apiClient";

/**
 * GDPR self-service: consent choices (Art. 7) and the personal data export (Art. 15 / 20).
 * Every consent change is kept by the API as evidence (who, when, which policy version).
 */

/** Bump when the privacy policy text changes; it is stored with every consent choice. */
export const PRIVACY_POLICY_VERSION = "2026-10";

export interface ConsentChoice {
  type: number;
  name: string;
  isGranted: boolean;
  updatedOn: string | null;
}

const LABELS: Record<string, { title: string; description: string }> = {
  MarketingEmail: { title: "Marketing emails", description: "Offers, news and vouchers sent to your email." },
  MarketingSms: { title: "Marketing SMS", description: "Offers and reminders sent to your phone." },
  MarketingPush: { title: "Push notifications", description: "Offers and updates sent to your device." },
  Personalization: { title: "Personalised recommendations", description: "Product suggestions based on what you browse and buy." },
};

export const consentLabel = (choice: ConsentChoice) =>
  LABELS[choice.name] ?? { title: choice.name.replace(/([a-z])([A-Z])/g, "$1 $2"), description: "" };

type RawConsent = { Type: number; Name: string; IsGranted: boolean; UpdatedOn: string | null };

const map = (raw?: RawConsent[]): ConsentChoice[] =>
  (raw ?? []).map((c) => ({ type: c.Type, name: c.Name, isGranted: c.IsGranted, updatedOn: c.UpdatedOn }));

export function privacyErrorMessage(error: any, fallback: string): string {
  const status = error?.response?.status;
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  const message = error?.response?.data?.Message ?? error?.message;
  return typeof message === "string" && message.trim() && message !== "Network Error"
    ? message.trim()
    : error?.message === "Network Error"
      ? "Unable to connect. Please check your internet and try again."
      : fallback;
}

export const privacyApi = {
  getConsents: async (): Promise<ConsentChoice[]> => {
    const response = await apiClient.get("/Customer/account/consents");
    return map(response.data?.Data);
  },

  saveConsent: async (type: number, isGranted: boolean): Promise<ConsentChoice[]> => {
    const response = await apiClient.put("/Customer/account/consents", {
      Consents: [{ Type: type, IsGranted: isGranted }],
      Source: "App",
      PolicyVersion: PRIVACY_POLICY_VERSION,
    });
    return map(response.data?.Data);
  },

  /** Everything the shop holds about the customer, as pretty-printed JSON text. */
  exportMyData: async (): Promise<string> => {
    const response = await apiClient.get("/Customer/account/export-data");
    return JSON.stringify(response.data, null, 2);
  },
};
