import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { fetchBranding } from "../services/brandingApi";
import { Branding, CACHE_KEY, fromCache, toCache } from "../utils/brandingModel";

type BrandingState = {
  branding: Branding;
  /** True once the API has answered (or failed to) in this session. */
  settled: boolean;
};

const BrandingContext = createContext<BrandingState>({ branding: fromCache(null), settled: false });

function readSaved(): string | null {
  try {
    return SecureStore.getItem(CACHE_KEY);
  } catch {
    return null; // not available on this platform: the default is used
  }
}

/**
 * Gives every screen the shop's branding.
 *  - At once: the name and colours saved on the phone from the last visit (the colours the screens' styles were built from, see constants/Theme.ts).
 *  - Then: the API's answer replaces the name, contact details, benefits and social links straight away. New theme colours are saved
 *    and used from the next start of the app (the screens' styles are built once, when the app starts).
 * The app never waits for the network and never fails because of it.
 */
export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BrandingState>(() => ({ branding: fromCache(readSaved()), settled: false }));

  useEffect(() => {
    let cancelled = false;

    fetchBranding(state.branding.shopName).then(async (fresh) => {
      if (cancelled) return;
      if (!fresh) {
        setState((s) => ({ ...s, settled: true }));
        return;
      }

      setState({ branding: fresh, settled: true });

      // Keep the name and colours for the next start.
      try {
        const packed = toCache(fresh);
        if (readSaved() !== packed) await SecureStore.setItemAsync(CACHE_KEY, packed);
      } catch {
        /* nothing to keep it in: the next start asks again */
      }
    });

    return () => {
      cancelled = true;
    };
    // The saved name is only the first guess for the request; it must not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => state, [state]);
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding(): BrandingState {
  return useContext(BrandingContext);
}
