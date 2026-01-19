/**
 * Settings Fixtures (Design Mirror)
 *
 * Static data for Settings mirror screen.
 * Includes all user preference states for visual testing.
 */

/**
 * Settings fixture data shape
 */
export interface SettingsFixture {
  /** User's selected language */
  language: 'hr' | 'en';
  /** User mode (visitor or local resident) */
  userMode: 'visitor' | 'local';
  /** Selected municipality (only for local users) */
  municipality: 'vis' | 'komiza' | null;
  /** Push notification opt-in status */
  pushOptIn: boolean;
  /** Whether push is registered on device */
  pushRegistered: boolean;
  /** Controls Dev Tools section visibility (fixture-controlled, NOT __DEV__) */
  isDev: boolean;
}

/**
 * Default settings fixture - Croatian local user with push enabled
 */
export const settingsFixture: SettingsFixture = {
  language: 'hr',
  userMode: 'local',
  municipality: 'vis',
  pushOptIn: true,
  pushRegistered: true,
  isDev: true,
};

/**
 * English visitor settings fixture
 */
export const settingsVisitorFixture: SettingsFixture = {
  language: 'en',
  userMode: 'visitor',
  municipality: null,
  pushOptIn: false,
  pushRegistered: true,
  isDev: true,
};

/**
 * Settings with push disabled/unregistered
 */
export const settingsPushDisabledFixture: SettingsFixture = {
  language: 'hr',
  userMode: 'local',
  municipality: 'komiza',
  pushOptIn: false,
  pushRegistered: false,
  isDev: false,
};

/**
 * Display labels for settings values
 */
export const settingsLabels = {
  language: {
    hr: 'Hrvatski',
    en: 'English',
  },
  userMode: {
    visitor: {
      hr: 'Posjetitelj',
      en: 'Visitor',
    },
    local: {
      hr: 'Stanovnik',
      en: 'Local',
    },
  },
  municipality: {
    vis: 'Vis',
    komiza: 'Komiža',
  },
} as const;
