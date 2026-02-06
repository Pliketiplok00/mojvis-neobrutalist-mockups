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
 * Phase 6: Added Click & Fix screens.
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
  ClickFixForm: undefined;
  ClickFixConfirmation: { clickFixId: string };
  ClickFixDetail: { clickFixId: string };
  Flora: undefined;
  Fauna: undefined;
  Settings: undefined;
  StaticPage: { slug: string };
  // Dev-only screens (gated by __DEV__)
  UiInventory: undefined;
};

/**
 * Design Mirror Stack (dev-only)
 * Routes for mirror screens used in visual auditing.
 * These are NOT part of production navigation.
 */
export type MirrorStackParamList = {
  MirrorHome: undefined;
  MirrorMenuOverlay: undefined;
  MirrorTransportSea: undefined;
  MirrorTransportRoad: undefined;
  MirrorTransportHub: undefined;
  MirrorStaticPage: undefined;
  MirrorSettings: undefined;
  MirrorFeedbackForm: undefined;
  MirrorFeedbackConfirmation: undefined;
  MirrorFeedbackDetail: undefined;
  MirrorInboxList: undefined;
  MirrorInboxDetail: undefined;
  MirrorEvents: undefined;
  MirrorEventDetail: undefined;
  MirrorRoadLineDetail: undefined;
  MirrorSeaLineDetail: undefined;
  MirrorLanguageSelection: undefined;
  MirrorUserModeSelection: undefined;
  MirrorMunicipalitySelection: undefined;
  MirrorHomeComposite: undefined;
  MirrorInfoHub: undefined;
  MirrorContactsList: undefined;
  MirrorContactDetail: undefined;
  MirrorClickFixForm: undefined;
  MirrorClickFixConfirmation: undefined;
  MirrorClickFixDetail: undefined;
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
