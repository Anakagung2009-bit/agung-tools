"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type Locale,
  resolveInitialLocale,
  saveLocale,
  detectBrowserLocale,
  buildT,
  type TranslationDict,
} from "@/lib/i18n";
import enDict from "@/i18n/en.json";
import idDict from "@/i18n/id.json";

// ─── Dictionaries ─────────────────────────────────────────────────────────────

const DICTS: Record<Locale, TranslationDict> = {
  en: enDict as TranslationDict,
  id: idDict as TranslationDict,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  detectedLocale: Locale; // the browser-detected language (for display)
}

const I18nContext = createContext<I18nContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * LanguageProvider — wraps the app and resolves language via:
 *   1. localStorage (user's previous choice)
 *   2. navigator.languages / Accept-Language (browser preference)
 *   3. "en" fallback
 *
 * Renders children immediately with the resolved locale (SSR-safe).
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start with "en" for SSR, then resolve on first client render
  const [locale, setLocaleState] = useState<Locale>("en");
  const [detectedLocale, setDetectedLocale] = useState<Locale>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Run only on client — reads localStorage + navigator
    const resolved = resolveInitialLocale();
    const detected = detectBrowserLocale();
    setLocaleState(resolved);
    setDetectedLocale(detected);
    setHydrated(true);

    // Set html lang attribute
    document.documentElement.lang = resolved;
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
    // Update html lang for SEO + screen readers
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = DICTS[locale] ?? DICTS.en;
      return buildT(dict)(key, vars);
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, detectedLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useI18n — returns { locale, setLocale, t, detectedLocale }
 *
 * @example
 * const { t, locale, setLocale } = useI18n();
 * t("nav.dashboard") // → "Dashboard" or "Dasbor"
 * t("encode.capacityInfo", { strength: "Low", size: "1 KB" })
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within a <LanguageProvider>");
  }
  return ctx;
}
