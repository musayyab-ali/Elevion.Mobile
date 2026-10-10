import apiClient from "../../../services/api/apiClient";

/**
 * Customer rewards: partner vouchers, loyalty tier and the referral ("invite friends") program.
 * The API answers in PascalCase inside { Message, StatusCode, Data }; screens use the camelCase shapes below.
 */

export type VoucherStatusName =
  | "Issued"
  | "Delivered"
  | "Viewed"
  | "Redeemed"
  | "Expired"
  | "Revoked"
  | "Cancelled"
  | string;

export interface Voucher {
  voucherId: number;
  partnerName: string;
  partnerLogoUrl: string | null;
  terms: string | null;
  code: string;
  value: number;
  expiresOn: string | null;
  status: number;
  statusName: VoucherStatusName;
  issuedOn: string | null;
  redeemedOn: string | null;
}

export interface TierLevel {
  name: string;
  color: string | null;
  minSpend: number;
  benefits: string | null;
  reached: boolean;
  current: boolean;
}

export interface Loyalty {
  tiersEnabled: boolean;
  lifetimeSpend: number;
  rewardPoints: number;
  tier: string | null;
  tierColor: string | null;
  benefits: string | null;
  nextTier: string | null;
  spendToNextTier: number;
  progress: number;
  levels: TierLevel[];
}

export interface MyReferral {
  code: string;
  invited: number;
  pending: number;
  qualified: number;
  wasReferred: boolean;
  canApplyCode: boolean;
}

/** Lower-cases the first letter of every key, deeply, so PascalCase and camelCase answers look the same. */
export function camelize<T = any>(value: any): T {
  if (Array.isArray(value)) return value.map(camelize) as any;
  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      out[key.charAt(0).toLowerCase() + key.slice(1)] = camelize(value[key]);
    }
    return out as T;
  }
  return value;
}

/** A readable message from whatever the API or the network gave back. */
export function rewardsErrorMessage(error: any, fallback = "Something went wrong. Please try again."): string {
  if (error?.response?.status === 404) return "This feature is not available yet.";
  const body = error?.response?.data ?? error;
  const message = body?.Message ?? body?.message;
  if (typeof message === "string" && message.trim()) return message.trim();
  if (error?.code === "ECONNABORTED") return "The server took too long to respond. Please try again.";
  if (error?.message === "Network Error") return "Unable to connect. Please check your internet and try again.";
  return fallback;
}

export const rewardsApi = {
  /** Opening the list marks unseen vouchers as viewed on the server. */
  getMyVouchers: async (): Promise<Voucher[]> => {
    const response = await apiClient.get("/CustomerRewards/GetMyVouchers");
    return camelize<Voucher[]>(response.data?.Data ?? []);
  },

  getMyLoyalty: async (): Promise<Loyalty> => {
    const response = await apiClient.get("/CustomerRewards/GetMyLoyalty");
    return camelize<Loyalty>(response.data?.Data ?? { tiersEnabled: false, levels: [] });
  },

  getMyReferral: async (): Promise<MyReferral> => {
    const response = await apiClient.get("/CustomerRewards/GetMyReferral");
    return camelize<MyReferral>(response.data?.Data);
  },

  /** A new customer enters a friend's code. Rejects with the API's message when the code cannot be used. */
  applyReferralCode: async (code: string): Promise<string> => {
    const response = await apiClient.post("/CustomerRewards/ApplyReferralCode", { Code: code.trim() });
    return response.data?.Message ?? "Referral code applied.";
  },
};
