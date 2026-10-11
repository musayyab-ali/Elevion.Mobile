import * as SecureStore from "expo-secure-store";
import { AppColors, CACHE_KEY, DEFAULT_COLORS, appColorsFrom, fromCache } from "../features/branding/utils/brandingModel";

/**
 * The app's colours. They are the shop's own theme (set by the shop in the admin under Settings -> Branding): the colours of the last
 * visit are read from the phone here, before any screen builds its styles, so every screen starts with the shop's colours.
 * A shop that changes its theme sees it from the next start of the app; before the first visit (or if nothing can be read) the app's own colours are used.
 */
function loadColors(): AppColors {
  try {
    return appColorsFrom(fromCache(SecureStore.getItem(CACHE_KEY)).theme.colors);
  } catch {
    return { ...DEFAULT_COLORS, headerOne: [...DEFAULT_COLORS.headerOne] as [string, string] };
  }
}

export const Colors: AppColors = loadColors();
