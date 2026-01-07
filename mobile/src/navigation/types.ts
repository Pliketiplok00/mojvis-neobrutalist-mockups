/**
 * Navigation Types
 *
 * Type definitions for React Navigation stacks.
 * Phase 1: Added Inbox screens.
 * Phase 2: Added Events screens.
 * Phase 4: Added Transport screens (hub, road, sea, line detail).
 * Phase 5: Added Feedback screens.
 * Phase 5.1: Updated onboarding params for persistence.
 * Phase 5.2: Simplified to use MenuOverlay instead of drawer navigation.
 */

// Onboarding data types
export type OnboardingLanguage = 'hr' | 'en';
export type OnboardingUserMode = 'visitor' | 'local';
export type OnboardingMunicipality = 'vis' | 'komiza';

/**
 * Onboarding Stack
 * Shown on first launch or after app reset.
 */
export type OnboardingStackParamList = {
  LanguageSelection: undefined;
  UserModeSelection: { language: OnboardingLanguage };
  MunicipalitySelection: { language: OnboardingLanguage };
};

/**
 * Main App Stack
 * All screens accessible after onboarding.
 */
export type MainStackParamList = {
  Home: undefined;
  Events: undefined;
  EventDetail: { eventId: string };
  TransportHub: undefined;
  RoadTransport: undefined;
  RoadLineDetail: { lineId: string };
  SeaTransport: undefined;
  SeaLineDetail: { lineId: string };
  Inbox: undefined;
  InboxDetail: { messageId: string };
  FeedbackForm: undefined;
  FeedbackConfirmation: { feedbackId: string };
  FeedbackDetail: { feedbackId: string };
  Settings: undefined;
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
