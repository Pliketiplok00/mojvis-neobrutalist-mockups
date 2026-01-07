/**
 * Navigation Types
 *
 * Type definitions for React Navigation stacks.
 * Phase 1: Added Inbox screens.
 * Phase 2: Added Events screens.
 * Phase 4: Added Transport screens (hub, road, sea, line detail).
 * Phase 5: Added Feedback screens.
 * Phase 5.1: Updated onboarding params for persistence.
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
 * Root screens accessible from menu.
 */
export type MainStackParamList = {
  Home: undefined;
  Events: undefined;
  EventDetail: { eventId: string };
  // Transport (Phase 4)
  TransportHub: undefined;
  RoadTransport: undefined;
  RoadLineDetail: { lineId: string };
  SeaTransport: undefined;
  SeaLineDetail: { lineId: string };
  // Inbox
  Inbox: undefined;
  InboxDetail: { messageId: string };
  // Feedback (Phase 5)
  FeedbackForm: undefined;
  FeedbackConfirmation: { feedbackId: string };
  FeedbackDetail: { feedbackId: string };
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
