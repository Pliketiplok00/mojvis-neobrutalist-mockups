/**
 * useUserContext Hook
 *
 * Returns the user context (userMode + municipality) from OnboardingContext.
 * Used for API requests that require user eligibility filtering.
 *
 * Provides safe fallbacks when onboarding data is not yet loaded.
 *
 * IMPORTANT: The return value is memoized to prevent infinite re-render loops
 * in components that use this context in useCallback/useEffect dependencies.
 */

import { useMemo } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import type { UserMode, Municipality } from '../types/inbox';

export interface UserContext {
  userMode: UserMode;
  municipality: Municipality;
}

/**
 * Hook to get the current user context for API requests.
 *
 * @returns UserContext with userMode and municipality from onboarding,
 *          with fallback to visitor/null if not yet loaded.
 */
export function useUserContext(): UserContext {
  const { data } = useOnboarding();

  const userMode = data?.userMode ?? 'visitor';
  const municipality = data?.municipality ?? null;

  // Memoize to ensure stable reference for useCallback/useEffect dependencies
  return useMemo(
    () => ({ userMode, municipality }),
    [userMode, municipality]
  );
}

export default useUserContext;
