/**
 * Navigation Types
 *
 * Type definitions for React Navigation stacks.
 * Phase 0: Basic structure only.
 */

/**
 * Onboarding Stack
 * Shown on first launch or after app reset.
 */
export type OnboardingStackParamList = {
  LanguageSelection: undefined;
  UserModeSelection: undefined;
  MunicipalitySelection: undefined;
};

/**
 * Main App Stack
 * Root screens accessible from menu.
 */
export type MainStackParamList = {
  Home: undefined;
  Events: undefined;
  Transport: undefined;
  Inbox: undefined;
  Settings: undefined;
  // Static content pages accessed by slug
  StaticPage: { slug: string };
};

/**
 * Root Navigator
 * Switches between onboarding and main app.
 */
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

// Declare global types for React Navigation
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
