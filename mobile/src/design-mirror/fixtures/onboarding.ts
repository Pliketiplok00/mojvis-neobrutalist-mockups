/**
 * Onboarding Fixtures (Design Mirror)
 *
 * Static data for Onboarding mirror screens.
 * Covers language, user mode, and municipality selection states.
 */

// ============================================================
// Types
// ============================================================

export type Language = 'hr' | 'en';
export type UserMode = 'visitor' | 'local';
export type Municipality = 'vis' | 'komiza';

// ============================================================
// Language Selection Fixtures
// ============================================================

export interface LanguageOption {
  code: Language;
  label: string;
}

export const languageOptions: LanguageOption[] = [
  { code: 'hr', label: 'Hrvatski' },
  { code: 'en', label: 'English' },
];

export const languageSelectionLabels = {
  logo: 'MOJ VIS',
  title: 'Dobrodošli / Welcome',
  subtitle: 'Odaberite jezik / Select language',
};

// ============================================================
// User Mode Selection Fixtures
// ============================================================

export interface UserModeOption {
  mode: UserMode;
  icon: 'globe' | 'home';
  titleHr: string;
  titleEn: string;
  descriptionHr: string;
  descriptionEn: string;
}

export const userModeOptions: UserModeOption[] = [
  {
    mode: 'visitor',
    icon: 'globe',
    titleHr: 'Posjetitelj',
    titleEn: 'Visitor',
    descriptionHr: 'Turisticka posjeta otoku',
    descriptionEn: 'Visiting the island as a tourist',
  },
  {
    mode: 'local',
    icon: 'home',
    titleHr: 'Lokalac',
    titleEn: 'Local',
    descriptionHr: 'Živim ili radim na otoku',
    descriptionEn: 'I live or work on the island',
  },
];

export const userModeSelectionLabels = {
  titleHr: 'Kako koristite aplikaciju?',
  titleEn: 'How do you use the app?',
  hintHr: 'Možete promijeniti kasnije u postavkama.',
  hintEn: 'You can change this later in settings.',
};

// ============================================================
// Municipality Selection Fixtures
// ============================================================

export interface MunicipalityOption {
  id: Municipality;
  name: string;
  descriptionHr: string;
}

export const municipalityOptions: MunicipalityOption[] = [
  {
    id: 'vis',
    name: 'Vis',
    descriptionHr: 'Grad Vis i okolica',
  },
  {
    id: 'komiza',
    name: 'Komiža',
    descriptionHr: 'Grad Komiža i okolica',
  },
];

export const municipalitySelectionLabels = {
  backHr: 'Natrag',
  backEn: 'Back',
  titleHr: 'Odaberite općinu',
  titleEn: 'Select your municipality',
  hintHr: 'Ovo određuje koje općinske obavijesti primate.',
  hintEn: 'This determines which municipal notifications you receive.',
};

// ============================================================
// Selection State Fixtures (for visual testing)
// ============================================================

/**
 * Fixture: Language HR selected
 */
export const languageSelectedHrFixture: Language = 'hr';

/**
 * Fixture: Language EN selected
 */
export const languageSelectedEnFixture: Language = 'en';

/**
 * Fixture: User mode visitor selected
 */
export const userModeVisitorFixture: UserMode = 'visitor';

/**
 * Fixture: User mode local selected
 */
export const userModeLocalFixture: UserMode = 'local';

/**
 * Fixture: Municipality Vis selected
 */
export const municipalityVisFixture: Municipality = 'vis';

/**
 * Fixture: Municipality Komiža selected
 */
export const municipalityKomizaFixture: Municipality = 'komiza';

/**
 * Fixture: No municipality selected (initial state)
 */
export const municipalityNoneFixture: Municipality | null = null;
