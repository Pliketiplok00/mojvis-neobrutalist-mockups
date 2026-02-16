/**
 * useUserContext Hook Tests
 *
 * Tests for user context retrieval from OnboardingContext and LanguageContext.
 * Verifies fallback values and memoization behavior.
 */

import { renderHook } from '@testing-library/react-native';
import { useUserContext } from '../useUserContext';

// Mock OnboardingContext
const mockOnboardingData = {
  userMode: 'local' as const,
  municipality: 'vis' as const,
  language: 'hr' as const,
};

let mockUseOnboardingReturn = {
  data: mockOnboardingData,
  isComplete: true,
  isLoading: false,
  completeOnboarding: jest.fn(),
  resetOnboarding: jest.fn(),
};

jest.mock('../../contexts/OnboardingContext', () => ({
  useOnboarding: () => mockUseOnboardingReturn,
}));

// Mock LanguageContext
let mockLanguage: 'hr' | 'en' = 'hr';

jest.mock('../../i18n/LanguageContext', () => ({
  useTranslations: () => ({
    language: mockLanguage,
    t: (key: string) => key,
  }),
}));

describe('useUserContext', () => {
  beforeEach(() => {
    // Reset mocks to default state
    mockUseOnboardingReturn = {
      data: mockOnboardingData,
      isComplete: true,
      isLoading: false,
      completeOnboarding: jest.fn(),
      resetOnboarding: jest.fn(),
    };
    mockLanguage = 'hr';
  });

  describe('with complete onboarding data', () => {
    it('should return userMode from onboarding data', () => {
      const { result } = renderHook(() => useUserContext());

      expect(result.current.userMode).toBe('local');
    });

    it('should return municipality from onboarding data', () => {
      const { result } = renderHook(() => useUserContext());

      expect(result.current.municipality).toBe('vis');
    });

    it('should return language from language context', () => {
      const { result } = renderHook(() => useUserContext());

      expect(result.current.language).toBe('hr');
    });

    it('should return komiza municipality when set', () => {
      mockUseOnboardingReturn = {
        ...mockUseOnboardingReturn,
        data: {
          ...mockOnboardingData,
          municipality: 'komiza',
        },
      };

      const { result } = renderHook(() => useUserContext());

      expect(result.current.municipality).toBe('komiza');
    });

    it('should return visitor userMode when set', () => {
      mockUseOnboardingReturn = {
        ...mockUseOnboardingReturn,
        data: {
          ...mockOnboardingData,
          userMode: 'visitor',
          municipality: null,
        },
      };

      const { result } = renderHook(() => useUserContext());

      expect(result.current.userMode).toBe('visitor');
      expect(result.current.municipality).toBeNull();
    });
  });

  describe('fallback values (no onboarding data)', () => {
    it('should return visitor as default userMode when data is null', () => {
      mockUseOnboardingReturn = {
        ...mockUseOnboardingReturn,
        data: null,
      };

      const { result } = renderHook(() => useUserContext());

      expect(result.current.userMode).toBe('visitor');
    });

    it('should return null as default municipality when data is null', () => {
      mockUseOnboardingReturn = {
        ...mockUseOnboardingReturn,
        data: null,
      };

      const { result } = renderHook(() => useUserContext());

      expect(result.current.municipality).toBeNull();
    });

    it('should return hr as default language when context returns undefined', () => {
      mockUseOnboardingReturn = {
        ...mockUseOnboardingReturn,
        data: null,
      };
      // Simulate undefined language (cast to bypass TS)
      mockLanguage = undefined as unknown as 'hr' | 'en';

      const { result } = renderHook(() => useUserContext());

      expect(result.current.language).toBe('hr');
    });
  });

  describe('language switching', () => {
    it('should return English when language context is en', () => {
      mockLanguage = 'en';

      const { result } = renderHook(() => useUserContext());

      expect(result.current.language).toBe('en');
    });

    it('should return Croatian when language context is hr', () => {
      mockLanguage = 'hr';

      const { result } = renderHook(() => useUserContext());

      expect(result.current.language).toBe('hr');
    });
  });

  describe('memoization', () => {
    it('should return same object reference when values unchanged', () => {
      const { result, rerender } = renderHook(() => useUserContext());

      const firstResult = result.current;
      rerender({});
      const secondResult = result.current;

      // Same reference when values don't change
      expect(firstResult).toBe(secondResult);
    });

    it('should return new object reference when userMode changes', () => {
      const { result, rerender } = renderHook(() => useUserContext());

      const firstResult = result.current;
      expect(firstResult.userMode).toBe('local');

      // Change userMode
      mockUseOnboardingReturn = {
        ...mockUseOnboardingReturn,
        data: {
          ...mockOnboardingData,
          userMode: 'visitor',
        },
      };

      rerender({});
      const secondResult = result.current;

      // Different reference when values change
      expect(firstResult).not.toBe(secondResult);
      expect(secondResult.userMode).toBe('visitor');
    });

    it('should return new object reference when municipality changes', () => {
      const { result, rerender } = renderHook(() => useUserContext());

      const firstResult = result.current;
      expect(firstResult.municipality).toBe('vis');

      // Change municipality
      mockUseOnboardingReturn = {
        ...mockUseOnboardingReturn,
        data: {
          ...mockOnboardingData,
          municipality: 'komiza',
        },
      };

      rerender({});
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
      expect(secondResult.municipality).toBe('komiza');
    });

    it('should return new object reference when language changes', () => {
      const { result, rerender } = renderHook(() => useUserContext());

      const firstResult = result.current;
      expect(firstResult.language).toBe('hr');

      // Change language
      mockLanguage = 'en';

      rerender({});
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
      expect(secondResult.language).toBe('en');
    });
  });

  describe('combined scenarios', () => {
    it('should handle local user with vis municipality in Croatian', () => {
      mockUseOnboardingReturn = {
        ...mockUseOnboardingReturn,
        data: {
          userMode: 'local',
          municipality: 'vis',
          language: 'hr',
        },
      };
      mockLanguage = 'hr';

      const { result } = renderHook(() => useUserContext());

      expect(result.current).toEqual({
        userMode: 'local',
        municipality: 'vis',
        language: 'hr',
      });
    });

    it('should handle local user with komiza municipality in English', () => {
      mockUseOnboardingReturn = {
        ...mockUseOnboardingReturn,
        data: {
          userMode: 'local',
          municipality: 'komiza',
          language: 'en',
        },
      };
      mockLanguage = 'en';

      const { result } = renderHook(() => useUserContext());

      expect(result.current).toEqual({
        userMode: 'local',
        municipality: 'komiza',
        language: 'en',
      });
    });

    it('should handle visitor with no municipality', () => {
      mockUseOnboardingReturn = {
        ...mockUseOnboardingReturn,
        data: {
          userMode: 'visitor',
          municipality: null,
          language: 'hr',
        },
      };
      mockLanguage = 'hr';

      const { result } = renderHook(() => useUserContext());

      expect(result.current).toEqual({
        userMode: 'visitor',
        municipality: null,
        language: 'hr',
      });
    });

    it('should handle visitor with English language', () => {
      mockUseOnboardingReturn = {
        ...mockUseOnboardingReturn,
        data: {
          userMode: 'visitor',
          municipality: null,
          language: 'en',
        },
      };
      mockLanguage = 'en';

      const { result } = renderHook(() => useUserContext());

      expect(result.current).toEqual({
        userMode: 'visitor',
        municipality: null,
        language: 'en',
      });
    });
  });
});
