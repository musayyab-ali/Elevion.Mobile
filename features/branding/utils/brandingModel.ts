/**
 * The shop's branding for the app: its name, theme colours, benefits, contact details and social links.
 * It comes from the API (`/TenantLanding/branding`, written by the shop in the admin under Settings); nothing here belongs to one shop.
 * Pure functions only (no React, no storage), so every rule is tested with `npm test`.
 */

export type ThemeTokens = {
  black: string;
  secondary: string;
  secondary2: string;
  surface: string;
  line: string;
  red: string;
  purple: string;
  green: string;
  success: string;
  yellow: string;
  pink: string;
};

export const BENEFIT_ICONS = ["headset", "return", "shield", "globe", "truck", "gift", "lock", "star", "heart", "card"] as const;
export type BenefitIcon = (typeof BENEFIT_ICONS)[number];

/** The Ionicons name of each benefit icon the admin offers. */
const IONICON: Record<BenefitIcon, string> = {
  headset: "headset-outline",
  return: "return-down-back-outline",
  shield: "shield-checkmark-outline",
  globe: "globe-outline",
  truck: "bicycle-outline",
  gift: "gift-outline",
  lock: "lock-closed-outline",
  star: "star-outline",
  heart: "heart-outline",
  card: "card-outline",
};

export const benefitIonicon = (icon: BenefitIcon): string => IONICON[icon] ?? IONICON.star;

export type BrandingBenefit = { icon: BenefitIcon; title: string; description: string };
export type BrandingSocial = { platform: string; name: string; url: string };

export type Branding = {
  shopName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  newsletterText: string | null;
  theme: { preset: string; colors: Partial<ThemeTokens> };
  benefits: BrandingBenefit[];
  social: BrandingSocial[];
};

export const DEFAULT_SHOP_NAME = "Our Store";

export const defaultBranding = (shopName: string = DEFAULT_SHOP_NAME): Branding => ({
  shopName: shopName || DEFAULT_SHOP_NAME,
  email: null,
  phone: null,
  address: null,
  newsletterText: null,
  theme: { preset: "classic", colors: {} },
  benefits: [],
  social: [],
});

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const THEME_KEYS: (keyof ThemeTokens)[] = ["black", "secondary", "secondary2", "surface", "line", "red", "purple", "green", "success", "yellow", "pink"];

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const t = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();
  return t.length === 0 ? null : t.slice(0, max);
}

/** Only real web addresses are ever opened ("javascript:" and the like are dropped). */
export function safeWebUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return /^https?:\/\/[^\s/$.?#][^\s]*$/i.test(v) ? v : null;
}

/** The API's answer (its `Data` part) turned into something the screens can trust. Anything unexpected is dropped, never thrown. */
export function parseBranding(raw: unknown, fallbackName: string = DEFAULT_SHOP_NAME): Branding {
  const base = defaultBranding(fallbackName);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;

  const theme = (r.Theme ?? {}) as Record<string, unknown>;
  const rawColors = (theme.Colors ?? {}) as Record<string, unknown>;
  const colors: Partial<ThemeTokens> = {};
  for (const key of THEME_KEYS) {
    const value = rawColors[key];
    if (typeof value === "string" && HEX.test(value.trim())) colors[key] = normalizeHex(value);
  }

  const benefits: BrandingBenefit[] = (Array.isArray(r.Benefits) ? r.Benefits : [])
    .map((b): BrandingBenefit | null => {
      const o = (b ?? {}) as Record<string, unknown>;
      const title = text(o.Title, 60);
      if (!title) return null;
      const icon = (BENEFIT_ICONS as readonly string[]).includes(String(o.Icon)) ? (o.Icon as BenefitIcon) : "star";
      return { icon, title, description: text(o.Description, 200) ?? "" };
    })
    .filter((b): b is BrandingBenefit => b !== null)
    .slice(0, 6);

  const social: BrandingSocial[] = (Array.isArray(r.Social) ? r.Social : [])
    .map((s): BrandingSocial | null => {
      const o = (s ?? {}) as Record<string, unknown>;
      const url = safeWebUrl(o.Url);
      const platform = text(o.Platform, 30)?.toLowerCase();
      return url && platform ? { platform, name: text(o.Name, 30) ?? platform, url } : null;
    })
    .filter((s): s is BrandingSocial => s !== null);

  return {
    shopName: text(r.ShopName, 100) ?? base.shopName,
    email: text(r.Email, 200),
    phone: text(r.Phone, 50),
    address: text(r.Address, 500),
    newsletterText: text(r.NewsletterText, 200),
    theme: { preset: text(theme.Preset, 30) ?? "classic", colors },
    benefits,
    social,
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------------------------------------------

export function normalizeHex(value: string): string {
  const h = value.trim().toLowerCase();
  return h.length === 4 ? "#" + h.slice(1).split("").map((c) => c + c).join("") : h;
}

function rgbOf(hex: string): [number, number, number] {
  const h = normalizeHex(hex).slice(1);
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexOf([r, g, b]: [number, number, number]): string {
  const part = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** `amount` 0 = a, 1 = b. */
export function mix(a: string, b: string, amount: number): string {
  const [ar, ag, ab] = rgbOf(a);
  const [br, bg, bb] = rgbOf(b);
  return hexOf([ar + (br - ar) * amount, ag + (bg - ag) * amount, ab + (bb - ab) * amount]);
}

export const lighten = (hex: string, amount: number): string => mix(hex, "#ffffff", amount);
export const darken = (hex: string, amount: number): string => mix(hex, "#000000", amount);

export function luminance(hex: string): number {
  const [r, g, b] = rgbOf(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Darkens a colour until it can be read on white (buttons with white text, coloured text on a white card). */
export function readableOnWhite(hex: string, minimum: number = 3): string {
  let color = normalizeHex(hex);
  for (let i = 0; i < 20 && contrast(color, "#ffffff") < minimum; i++) color = darken(color, 0.1);
  return color;
}

/** Darkens a colour until white text can sit on it (the header). */
export function darkEnoughForWhiteText(hex: string): string {
  let color = normalizeHex(hex);
  for (let i = 0; i < 20 && contrast(color, "#ffffff") < 4.5; i++) color = darken(color, 0.1);
  return color;
}

// ---------------------------------------------------------------------------------------------------------------
// The app's colours
// ---------------------------------------------------------------------------------------------------------------

/** The colour names the screens already use (`Colors.primary` ...). */
export type AppColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  white: string;
  black: string;
  textMain: string;
  error: string;
  success: string;
  container: string;
  headerOne: [string, string];
  darkError: string;
};

/** What the app looks like before a shop has set anything (and while the branding cannot be loaded). */
export const DEFAULT_COLORS: AppColors = {
  primary: "#3490dc",
  secondary: "#F1F5F9",
  tertiary: "#64748b",
  accent: "#0077b6",
  white: "#FFFFFF",
  black: "#000000",
  textMain: "#1e293b",
  error: "#ef4444",
  success: "#008000",
  container: "#001d3d",
  headerOne: ["#001d3d", "#003566"],
  darkError: "#E11D48",
};

/**
 * The shop's theme colours (the same tokens as its web store) turned into the app's colours.
 * Whatever the shop picks, text stays readable: buttons and coloured text are darkened until they read on white,
 * and the header is darkened until white text reads on it. A colour the shop did not set keeps the app's own.
 */
export function appColorsFrom(tokens: Partial<ThemeTokens> | null | undefined): AppColors {
  const t = tokens ?? {};
  const result: AppColors = { ...DEFAULT_COLORS, headerOne: [...DEFAULT_COLORS.headerOne] as [string, string] };

  if (t.purple) {
    result.primary = readableOnWhite(t.purple, 3);
    result.accent = darken(result.primary, 0.18);
  }
  if (t.black) {
    result.container = darkEnoughForWhiteText(t.black);
    result.headerOne = [result.container, lighten(result.container, 0.1)];
  }
  if (t.surface && luminance(t.surface) > 0.7) result.secondary = normalizeHex(t.surface);
  if (t.secondary) result.tertiary = readableOnWhite(t.secondary, 3);
  if (t.red) {
    result.error = readableOnWhite(t.red, 3);
    result.darkError = darken(result.error, 0.15);
  }
  if (t.success) result.success = readableOnWhite(t.success, 3);
  return result;
}

// ---------------------------------------------------------------------------------------------------------------
// What is kept on the phone between launches (a few hundred bytes: SecureStore allows 2 KB per value)
// ---------------------------------------------------------------------------------------------------------------

export const CACHE_KEY = "shop_branding_v1";
export const CACHE_MAX_BYTES = 1800;

type CachedBranding = { v: 1; n: string; c: Partial<ThemeTokens> };

/** The part of the branding the app needs at once, at start (the name and the colours the screens' styles are built from). */
export function toCache(branding: Branding): string {
  const record: CachedBranding = { v: 1, n: branding.shopName, c: branding.theme.colors };
  return JSON.stringify(record);
}

export function fromCache(raw: string | null | undefined, fallbackName: string = DEFAULT_SHOP_NAME): Branding {
  const base = defaultBranding(fallbackName);
  if (!raw || raw.length > CACHE_MAX_BYTES) return base;
  try {
    const value = JSON.parse(raw) as Partial<CachedBranding>;
    if (!value || value.v !== 1) return base;
    const colors: Partial<ThemeTokens> = {};
    for (const key of THEME_KEYS) {
      const c = (value.c as Record<string, unknown> | undefined)?.[key];
      if (typeof c === "string" && HEX.test(c.trim())) colors[key] = normalizeHex(c);
    }
    return { ...base, shopName: text(value.n, 100) ?? base.shopName, theme: { preset: "classic", colors } };
  } catch {
    return base;
  }
}

/** True when the colours of `a` and `b` differ (then the new ones are used from the next start). */
export function sameColors(a: Partial<ThemeTokens>, b: Partial<ThemeTokens>): boolean {
  return THEME_KEYS.every((k) => (a[k] ?? null) === (b[k] ?? null));
}

// ---------------------------------------------------------------------------------------------------------------
// The welcome slides
// ---------------------------------------------------------------------------------------------------------------

export type WelcomeSlide = { id: string; icon: string; title: string; description: string; accentColor: string };

/**
 * The slides shown the first time the app opens: the shop's own "why shop with us" points when it has written some,
 * otherwise three plain slides that only use the shop's name. The accent colours come from the app's own palette.
 */
export function welcomeSlides(branding: Branding, palette: string[]): WelcomeSlide[] {
  const accent = (i: number) => palette[i % Math.max(1, palette.length)] ?? DEFAULT_COLORS.primary;

  if (branding.benefits.length > 0) {
    return branding.benefits.map((b, i) => ({
      id: String(i + 1),
      icon: benefitIonicon(b.icon),
      title: b.title.toUpperCase(),
      description: b.description || branding.shopName,
      accentColor: accent(i),
    }));
  }

  const name = branding.shopName;
  return [
    { id: "1", icon: "storefront-outline", title: `WELCOME TO ${name.toUpperCase()}`, description: "Browse the latest products and collections, right from your phone.", accentColor: accent(0) },
    { id: "2", icon: "search", title: "FIND WHAT YOU WANT", description: "Search and filter by category, price and availability.", accentColor: accent(1) },
    { id: "3", icon: "card-outline", title: "ORDER WITH EASE", description: "Pay securely and follow your order until it arrives.", accentColor: accent(2) },
  ];
}

// ---------------------------------------------------------------------------------------------------------------
// Small helpers for the screens
// ---------------------------------------------------------------------------------------------------------------

/** A phone number for a tel: link: digits and a leading + only. */
export function telUrl(phone: string | null): string | null {
  if (!phone) return null;
  const cleaned = (phone.trim().startsWith("+") ? "+" : "") + phone.replace(/\D/g, "");
  return cleaned.replace("+", "").length >= 5 ? `tel:${cleaned}` : null;
}

export function mailUrl(email: string | null): string | null {
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : null;
}
