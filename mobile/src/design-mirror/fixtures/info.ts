/**
 * Info Hub Fixtures (Design Mirror)
 *
 * Static data for Info Hub mirror screen.
 * Covers tile/category layouts and section variants.
 *
 * Note: Production Info/Contacts screens not found.
 * Design based on existing app patterns (StaticPageScreen, HomeScreen categories).
 */

import type { IconName } from '../../ui/Icon';

// ============================================================
// Types
// ============================================================

export interface InfoCategory {
  id: string;
  titleHr: string;
  titleEn: string;
  descriptionHr: string;
  descriptionEn: string;
  icon: IconName;
  backgroundColor: string;
  textColor: string;
}

export interface InfoTile {
  id: string;
  titleHr: string;
  titleEn: string;
  icon: IconName;
}

export interface InfoSection {
  id: string;
  titleHr: string;
  titleEn: string;
  tiles: InfoTile[];
}

export interface InfoHubFixture {
  id: string;
  name: string;
  description: string;
  heroTitleHr: string;
  heroTitleEn: string;
  heroSubtitleHr: string;
  heroSubtitleEn: string;
  categories: InfoCategory[];
  sections: InfoSection[];
}

// ============================================================
// Shared Categories
// ============================================================

export const infoCategories: InfoCategory[] = [
  {
    id: 'about-island',
    titleHr: 'O OTOKU',
    titleEn: 'ABOUT ISLAND',
    descriptionHr: 'Povijest, kultura i znamenitosti',
    descriptionEn: 'History, culture and landmarks',
    icon: 'globe',
    backgroundColor: '#3A5AFF', // skin.colors.primary
    textColor: 'white',
  },
  {
    id: 'practical',
    titleHr: 'PRAKTIČNO',
    titleEn: 'PRACTICAL',
    descriptionHr: 'Korisne informacije za posjetitelje',
    descriptionEn: 'Useful info for visitors',
    icon: 'info',
    backgroundColor: '#FFD93D', // skin.colors.warningAccent
    textColor: '#1A1A1A',
  },
  {
    id: 'nature',
    titleHr: 'PRIRODA',
    titleEn: 'NATURE',
    descriptionHr: 'Parkovi, plaže i staze',
    descriptionEn: 'Parks, beaches and trails',
    icon: 'leaf',
    backgroundColor: '#2E8B57', // skin.colors.successAccent
    textColor: 'white',
  },
  {
    id: 'services',
    titleHr: 'USLUGE',
    titleEn: 'SERVICES',
    descriptionHr: 'Zdravstvo, komunalije, javne službe',
    descriptionEn: 'Healthcare, utilities, public services',
    icon: 'wrench',
    backgroundColor: '#E63946', // skin.colors.urgent
    textColor: 'white',
  },
];

// ============================================================
// Labels
// ============================================================

export const infoLabels = {
  heroTitleHr: 'INFORMACIJE',
  heroTitleEn: 'INFORMATION',
  heroSubtitleHr: 'Sve što trebate znati o otoku Visu',
  heroSubtitleEn: 'Everything you need to know about Vis island',
  sectionsHr: 'KATEGORIJE',
  sectionsEn: 'CATEGORIES',
  quickLinksHr: 'BRZI LINKOVI',
  quickLinksEn: 'QUICK LINKS',
};

// ============================================================
// Fixture 1: Default (full content)
// ============================================================

export const infoHubDefaultFixture: InfoHubFixture = {
  id: 'default',
  name: 'Default',
  description: 'Full hub with 4 categories and 2 sections',
  heroTitleHr: infoLabels.heroTitleHr,
  heroTitleEn: infoLabels.heroTitleEn,
  heroSubtitleHr: infoLabels.heroSubtitleHr,
  heroSubtitleEn: infoLabels.heroSubtitleEn,
  categories: infoCategories,
  sections: [
    {
      id: 'quick-links',
      titleHr: infoLabels.quickLinksHr,
      titleEn: infoLabels.quickLinksEn,
      tiles: [
        { id: 'tl-1', titleHr: 'Radno vrijeme', titleEn: 'Working hours', icon: 'clock' },
        { id: 'tl-2', titleHr: 'Hitni brojevi', titleEn: 'Emergency numbers', icon: 'phone' },
        { id: 'tl-3', titleHr: 'Javni WC', titleEn: 'Public restrooms', icon: 'map-pin' },
        { id: 'tl-4', titleHr: 'Parking', titleEn: 'Parking', icon: 'map-pin' },
      ],
    },
    {
      id: 'useful-info',
      titleHr: 'KORISNO',
      titleEn: 'USEFUL',
      tiles: [
        { id: 'tl-5', titleHr: 'Vremenska prognoza', titleEn: 'Weather forecast', icon: 'globe' },
        { id: 'tl-6', titleHr: 'Mjenjačnice', titleEn: 'Currency exchange', icon: 'info' },
      ],
    },
  ],
};

// ============================================================
// Fixture 2: Minimal (few items)
// ============================================================

export const infoHubMinimalFixture: InfoHubFixture = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Only 2 categories, no sections',
  heroTitleHr: infoLabels.heroTitleHr,
  heroTitleEn: infoLabels.heroTitleEn,
  heroSubtitleHr: infoLabels.heroSubtitleHr,
  heroSubtitleEn: infoLabels.heroSubtitleEn,
  categories: infoCategories.slice(0, 2),
  sections: [],
};

// ============================================================
// Fixture 3: Long Labels (stress test)
// ============================================================

export const infoHubLongLabelsFixture: InfoHubFixture = {
  id: 'long-labels',
  name: 'Long Labels',
  description: 'Stress test with very long category/tile labels',
  heroTitleHr: 'INFORMACIJE I KORISNI SADRŽAJI ZA POSJETITELJE',
  heroTitleEn: 'INFORMATION AND USEFUL CONTENT FOR VISITORS',
  heroSubtitleHr: 'Opsežan vodič kroz sve što trebate znati o otoku Visu, njegovoj povijesti, kulturi, prirodnim ljepotama i praktičnim informacijama',
  heroSubtitleEn: 'Comprehensive guide to everything you need to know about Vis island, its history, culture, natural beauty and practical information',
  categories: [
    {
      id: 'about-island-long',
      titleHr: 'POVIJEST I KULTURNA BAŠTINA OTOKA VISA',
      titleEn: 'HISTORY AND CULTURAL HERITAGE OF VIS ISLAND',
      descriptionHr: 'Detaljne informacije o bogatoj povijesti, kulturnim spomenicima i tradiciji otoka',
      descriptionEn: 'Detailed information about rich history, cultural monuments and island traditions',
      icon: 'globe',
      backgroundColor: '#3A5AFF',
      textColor: 'white',
    },
    {
      id: 'practical-long',
      titleHr: 'PRAKTIČNE INFORMACIJE ZA POSJETITELJE I TURISTE',
      titleEn: 'PRACTICAL INFORMATION FOR VISITORS AND TOURISTS',
      descriptionHr: 'Sve korisne informacije na jednom mjestu za ugodniji boravak na otoku',
      descriptionEn: 'All useful information in one place for a more pleasant stay on the island',
      icon: 'info',
      backgroundColor: '#FFD93D',
      textColor: '#1A1A1A',
    },
  ],
  sections: [
    {
      id: 'long-section',
      titleHr: 'DODATNE INFORMACIJE I KORISNI LINKOVI',
      titleEn: 'ADDITIONAL INFORMATION AND USEFUL LINKS',
      tiles: [
        {
          id: 'tl-long-1',
          titleHr: 'Radno vrijeme trgovina, ljekarna i javnih službi',
          titleEn: 'Working hours of shops, pharmacies and public services',
          icon: 'clock',
        },
        {
          id: 'tl-long-2',
          titleHr: 'Hitni telefonski brojevi i kontakti za izvanredne situacije',
          titleEn: 'Emergency phone numbers and contacts for emergency situations',
          icon: 'phone',
        },
      ],
    },
  ],
};

// ============================================================
// All Fixtures Array
// ============================================================

export const infoHubFixtures: InfoHubFixture[] = [
  infoHubDefaultFixture,
  infoHubMinimalFixture,
  infoHubLongLabelsFixture,
];
