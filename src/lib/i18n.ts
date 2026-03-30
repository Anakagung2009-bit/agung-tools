/**
 * i18n.ts
 * Language detection utilities + translation lookup.
 * No external dependencies — pure browser APIs.
 */

export type Locale = "en" | "id";

export const SUPPORTED_LOCALES: Locale[] = ["en", "id"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "agung-tools-locale";

// ─── Browser Language Detection ───────────────────────────────────────────────

/**
 * Normalise a BCP-47 tag (e.g. "en-US", "id-ID", "en") to a supported locale.
 * Falls back to DEFAULT_LOCALE if no match.
 *
 * Priority: exact match → language prefix match → default
 */
function normaliseTag(tag: string): Locale | null {
  const lower = tag.toLowerCase();

  // Exact match first (e.g. "en", "id")
  if (SUPPORTED_LOCALES.includes(lower as Locale)) {
    return lower as Locale;
  }

  // Language prefix match (e.g. "en-US" → "en", "id-ID" → "id")
  const prefix = lower.split("-")[0];
  if (SUPPORTED_LOCALES.includes(prefix as Locale)) {
    return prefix as Locale;
  }

  return null;
}

/**
 * Detect the best locale from the browser's language preferences.
 * Mirrors the Accept-Language header logic.
 *
 * @returns A supported Locale ("en" | "id"), never throws.
 */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;

  // navigator.languages is the full Accept-Language list (ordered by preference)
  const languages =
    navigator.languages?.length > 0
      ? [...navigator.languages]
      : [navigator.language ?? "en"];

  for (const lang of languages) {
    const match = normaliseTag(lang);
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}

/**
 * Read a previously persisted locale from localStorage.
 * Returns null if none saved or if called on the server.
 */
export function getSavedLocale(): Locale | null {
  if (typeof localStorage === "undefined") return null;
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) {
    return saved as Locale;
  }
  return null;
}

/**
 * Persist a locale to localStorage.
 */
export function saveLocale(locale: Locale): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

/**
 * Resolve the initial locale using the priority chain:
 *   1. localStorage (user manually picked)
 *   2. Browser navigator.languages (Accept-Language equivalent)
 *   3. DEFAULT_LOCALE ("en")
 */
export function resolveInitialLocale(): Locale {
  return getSavedLocale() ?? detectBrowserLocale();
}

// ─── Translation Lookup ───────────────────────────────────────────────────────

export type TranslationDict = Record<string, unknown>;

/**
 * Deep-get a dot-separated key from a nested object.
 * e.g. get("nav.dashboard", dict) → "Dashboard"
 */
function deepGet(obj: TranslationDict, key: string): string | undefined {
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

/**
 * Build a typed `t(key, vars?)` function from a translation dictionary.
 *
 * - Supports simple interpolation: t("encode.capacityInfo", { strength: "Low", size: "1 KB" })
 *   Template: "Capacity at {strength} strength: {size}"
 * - Falls back to the key itself if not found (so nothing breaks if a key is missing)
 */
export function buildT(dict: TranslationDict) {
  return function t(key: string, vars?: Record<string, string | number>): string {
    const raw = deepGet(dict, key) ?? key;
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
  };
}
