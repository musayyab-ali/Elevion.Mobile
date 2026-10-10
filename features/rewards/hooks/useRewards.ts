import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loyalty,
  MyReferral,
  Voucher,
  rewardsApi,
  rewardsErrorMessage,
} from "../services/rewardsApi";
import { isOfflineError, readCache, writeCache } from "../../../services/cache/offlineCache";

/**
 * data       what the screen shows (fresh, or the last saved copy when the server could not be reached)
 * error      set only when there is nothing to show
 * staleSince time the shown copy was saved, set only when it is an old copy
 */
type Section<T> = { data: T; error: string | null; staleSince: number | null };

const CACHE_KEYS = {
  vouchers: "rewards-vouchers",
  loyalty: "rewards-loyalty",
  referral: "rewards-referral",
} as const;

/** Fetches one section; on a connection failure falls back to the saved copy instead of showing an error. */
async function loadSection<T>(
  key: string,
  fetcher: () => Promise<T>,
  empty: T,
  errorText: string,
): Promise<Section<T>> {
  try {
    const data = await fetcher();
    void writeCache(key, data);
    return { data, error: null, staleSince: null };
  } catch (error) {
    if (isOfflineError(error)) {
      const saved = await readCache<T>(key);
      if (saved) return { data: saved.data, error: null, staleSince: saved.savedAt };
    }
    return { data: empty, error: rewardsErrorMessage(error, errorText), staleSince: null };
  }
}

/**
 * Loads the three reward areas independently: a failing one (for example the shop has not set up tiers yet)
 * never hides the others. Saved copies are shown at once while fresh data is on its way, and kept as a
 * fallback when the phone is offline.
 */
export function useRewards() {
  const [vouchers, setVouchers] = useState<Section<Voucher[]>>({ data: [], error: null, staleSince: null });
  const [loyalty, setLoyalty] = useState<Section<Loyalty | null>>({ data: null, error: null, staleSince: null });
  const [referral, setReferral] = useState<Section<MyReferral | null>>({ data: null, error: null, staleSince: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);
  const freshLoaded = useRef(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);

    const [v, l, r] = await Promise.all([
      loadSection(CACHE_KEYS.vouchers, rewardsApi.getMyVouchers, [] as Voucher[], "Could not load your vouchers."),
      loadSection<Loyalty | null>(CACHE_KEYS.loyalty, rewardsApi.getMyLoyalty, null, "Could not load your membership."),
      loadSection<MyReferral | null>(CACHE_KEYS.referral, rewardsApi.getMyReferral, null, "Could not load your referral details."),
    ]);

    if (!mounted.current) return;
    freshLoaded.current = true;
    setVouchers(v);
    setLoyalty(l);
    setReferral(r);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    mounted.current = true;

    // Show the saved copies immediately (no spinner) while the fresh answer loads.
    (async () => {
      const [v, l, r] = await Promise.all([
        readCache<Voucher[]>(CACHE_KEYS.vouchers),
        readCache<Loyalty | null>(CACHE_KEYS.loyalty),
        readCache<MyReferral | null>(CACHE_KEYS.referral),
      ]);
      // A slow disk read must never overwrite an answer that has already arrived from the server.
      if (!mounted.current || freshLoaded.current || !(v || l || r)) return;
      if (v) setVouchers({ data: v.data, error: null, staleSince: null });
      if (l) setLoyalty({ data: l.data, error: null, staleSince: null });
      if (r) setReferral({ data: r.data, error: null, staleSince: null });
      setLoading(false);
    })();

    load();
    return () => {
      mounted.current = false;
    };
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
