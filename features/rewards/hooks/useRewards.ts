import { useCallback, useEffect, useState } from "react";
import {
  Loyalty,
  MyReferral,
  Voucher,
  rewardsApi,
  rewardsErrorMessage,
} from "../services/rewardsApi";

type Section<T> = { data: T; error: string | null };

/**
 * Loads the three reward areas independently: a failing one (for example the shop has not set up tiers yet)
 * never hides the others.
 */
export function useRewards() {
  const [vouchers, setVouchers] = useState<Section<Voucher[]>>({ data: [], error: null });
  const [loyalty, setLoyalty] = useState<Section<Loyalty | null>>({ data: null, error: null });
  const [referral, setReferral] = useState<Section<MyReferral | null>>({ data: null, error: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);

    const [v, l, r] = await Promise.allSettled([
      rewardsApi.getMyVouchers(),
      rewardsApi.getMyLoyalty(),
      rewardsApi.getMyReferral(),
    ]);

    setVouchers(
      v.status === "fulfilled"
        ? { data: v.value, error: null }
        : { data: [], error: rewardsErrorMessage(v.reason, "Could not load your vouchers.") },
    );
    setLoyalty(
      l.status === "fulfilled"
        ? { data: l.value, error: null }
        : { data: null, error: rewardsErrorMessage(l.reason, "Could not load your membership.") },
    );
    setReferral(
      r.status === "fulfilled"
        ? { data: r.value, error: null }
        : { data: null, error: rewardsErrorMessage(r.reason, "Could not load your referral details.") },
    );

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const applyCode = useCallback(
    async (code: string): Promise<{ ok: boolean; message: string }> => {
      try {
        const message = await rewardsApi.applyReferralCode(code);
        await load(true);
        return { ok: true, message };
      } catch (error) {
        return { ok: false, message: rewardsErrorMessage(error, "That code could not be used.") };
      }
    },
    [load],
  );

  return {
    vouchers,
    loyalty,
    referral,
    loading,
    refreshing,
    refresh: () => load(true),
    applyCode,
  };
}
