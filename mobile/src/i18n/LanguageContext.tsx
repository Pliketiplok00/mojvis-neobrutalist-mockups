/**
 * Language Context
 *
 * Minimal i18n system for MOJ VIS mobile app.
 * Reads language preference from OnboardingContext.
 * Provides t(key) function for translations.
 *
 * Flight Test Phase 4 - i18n Integration
 *
 * Usage:
 *   const { t } = useTranslations();
 *   <Text>{t('inbox.empty.received')}</Text>
 *
 * Rules:
 * - Keys must be stable & explicit (no dynamic construction)
 * - OnboardingContext is the single source of truth for language
 * - Falls back to key if translation missing (dev warning)
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useOnboarding, type Language } from '../contexts/OnboardingContext';

// Import locale files
import hrLocale from './locales/hr.json';
import enLocale from './locales/en.json';

// Locale map
const LOCALES: Record<Language, Record<string, unknown>> = {
  hr: hrLocale,
  en: enLocale,
};

// Default language when onboarding not complete
const DEFAULT_LANGUAGE: Language = 'hr';

// ============================================================
// Types
// ============================================================

interface LanguageContextValue {
  /** Current language code */
  language: Language;
  /** Translation function - returns translated string for key */
  t: (key: string) => string;
}

// ============================================================
// Helper: Get nested value from object by dot-notation key
// ============================================================

function getNestedValue(obj: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current === 'string') {
    return current;
  }

  return undefined;
}

// ============================================================
// Context
// ============================================================

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ============================================================
// Provider
// ============================================================

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps): React.JSX.Element {
  const { data } = useOnboarding();

  // Get language from onboarding data, default to HR
  const language: Language = data?.language ?? DEFAULT_LANGUAGE;

  // Memoize the t() function to avoid re-renders
  const value = useMemo<LanguageContextValue>(() => {
    const locale = LOCALES[language] ?? LOCALES[DEFAULT_LANGUAGE];

    const t = (key: string): string => {
      const translation = getNestedValue(locale, key);

      if (translation === undefined) {
        // Dev warning for missing translation
        if (__DEV__) {
          console.warn(`[i18n] Missing translation: "${key}" for language "${language}"`);
        }
        // Return key as fallback (makes missing translations visible)
        return key;
      }

      return translation;
    };

    return { language, t };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

/**
 * Hook to access translations
 *
 * @returns { language, t } - Current language and translation function
 * @throws Error if used outside LanguageProvider
 *
 * @example
 * const { t } = useTranslations();
 * <Text>{t('common.loading')}</Text>
 */
export function useTranslations(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useTranslations must be used within LanguageProvider');
  }

  return context;
}

// ============================================================
// Export
// ============================================================

export default LanguageContext;
