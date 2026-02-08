/**
 * Onboarding Context
 *
 * Manages onboarding completion state with AsyncStorage persistence.
 *
 * Usage:
 * - Wrap app with OnboardingProvider
 * - Use useOnboarding() hook to check/complete onboarding
 * - AppNavigator uses isComplete to decide which stack to show
 *
 * Package 4 Stage 13: Local users MUST have municipality selected.
 * If a local user is missing municipality, they are forced to re-onboard.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@mojvis/onboarding_complete',
  USER_MODE: '@mojvis/user_mode',
  MUNICIPALITY: '@mojvis/municipality',
  LANGUAGE: '@mojvis/language',
} as const;

// User mode type
export type UserMode = 'visitor' | 'local';

// Municipality type
export type Municipality = 'vis' | 'komiza';

// Language type
export type Language = 'hr' | 'en';

// Onboarding data stored
export interface OnboardingData {
  language: Language;
  userMode: UserMode;
  municipality: Municipality | null;
}

// Context value type
interface OnboardingContextValue {
  isComplete: boolean;
  isLoading: boolean;
  data: OnboardingData | null;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

// Default context value
const defaultValue: OnboardingContextValue = {
  isComplete: false,
  isLoading: true,
  data: null,
  completeOnboarding: async () => {},
  resetOnboarding: async () => {},
};

// Create context
const OnboardingContext = createContext<OnboardingContextValue>(defaultValue);

// Provider props
interface OnboardingProviderProps {
  children: ReactNode;
}

/**
 * Onboarding Provider
 *
 * Wraps the app and manages onboarding state persistence.
 */
export function OnboardingProvider({ children }: OnboardingProviderProps): React.JSX.Element {
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<OnboardingData | null>(null);

  // Load onboarding state on mount
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const complete = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);

        if (complete === 'true') {
          // Load user preferences
          const [language, userMode, municipality] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
            AsyncStorage.getItem(STORAGE_KEYS.USER_MODE),
            AsyncStorage.getItem(STORAGE_KEYS.MUNICIPALITY),
          ]);

          const parsedUserMode = (userMode as UserMode) || 'visitor';
          const parsedMunicipality = municipality as Municipality | null;

          // Package 4 Stage 13: Local users MUST have municipality selected
          // If a local user is missing municipality, force re-onboarding
          if (parsedUserMode === 'local' && !parsedMunicipality) {
            console.warn('[Onboarding] Local user missing municipality - forcing re-onboarding');
            // Clear the invalid state
            await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
            // Don't set isComplete - user will go through onboarding
          } else {
            setData({
              language: (language as Language) || 'hr',
              userMode: parsedUserMode,
              municipality: parsedMunicipality,
            });
            setIsComplete(true);
          }
        }
      } catch (error) {
        console.error('[Onboarding] Error loading state:', error);
        // On error, default to showing onboarding
      } finally {
        setIsLoading(false);
      }
    };

    void loadOnboardingState();
  }, []);

  // Complete onboarding and persist data
  const completeOnboarding = useCallback(async (onboardingData: OnboardingData) => {
    // Package 4 Stage 13: Validate local users have municipality
    if (onboardingData.userMode === 'local' && !onboardingData.municipality) {
      const error = new Error('Local users must select a municipality');
      console.error('[Onboarding] Validation failed:', error.message);
      throw error;
    }

    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true'),
        AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, onboardingData.language),
        AsyncStorage.setItem(STORAGE_KEYS.USER_MODE, onboardingData.userMode),
        onboardingData.municipality
          ? AsyncStorage.setItem(STORAGE_KEYS.MUNICIPALITY, onboardingData.municipality)
          : AsyncStorage.removeItem(STORAGE_KEYS.MUNICIPALITY),
      ]);

      setData(onboardingData);
      setIsComplete(true);
    } catch (error) {
      console.error('[Onboarding] Error saving state:', error);
      throw error;
    }
  }, []);

  // Reset onboarding (for testing/settings)
  const resetOnboarding = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
        AsyncStorage.removeItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_MODE),
        AsyncStorage.removeItem(STORAGE_KEYS.MUNICIPALITY),
      ]);

      setData(null);
      setIsComplete(false);
    } catch (error) {
      console.error('[Onboarding] Error resetting state:', error);
      throw error;
    }
  }, []);

  const value: OnboardingContextValue = {
    isComplete,
    isLoading,
    data,
    completeOnboarding,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

/**
 * Hook to access onboarding context
 */
export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

/**
 * Get onboarding completion status synchronously (for testing)
 * Returns a promise that resolves to the completion status.
 */
export async function getOnboardingComplete(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return value === 'true';
}

export default OnboardingContext;
