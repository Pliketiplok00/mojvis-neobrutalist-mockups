/**
 * Home Screen Fixtures (Design Mirror)
 *
 * Static data for Home composite mirror screen.
 * Covers banner variants, events, and category grid states.
 */

import type { IconName } from '../../ui/Icon';

// ============================================================
// Types
// ============================================================

export interface HomeBanner {
  id: string;
  title: string;
  is_urgent: boolean;
}

export interface HomeEvent {
  id: string;
  title: string;
  location: string | null;
  start_datetime: string;
}

export interface HomeCategory {
  key: string;
  labelHr: string;
  labelEn: string;
  icon: IconName;
  backgroundColor: string;
  textColor: string;
}

export interface HomeFixture {
  id: string;
  name: string;
  description: string;
  banners: HomeBanner[];
  events: HomeEvent[];
  heroTitleHr: string;
  heroSubtitleHr: string;
}

// ============================================================
// Shared Data
// ============================================================

/**
 * Category configuration matching production
 */
export const homeCategories: HomeCategory[] = [
  {
    key: 'events',
    labelHr: 'DOGAĐANJA',
    labelEn: 'EVENTS',
    icon: 'calendar',
    backgroundColor: '#3A5AFF', // skin.colors.primary
    textColor: 'white',
  },
  {
    key: 'transport',
    labelHr: 'PRIJEVOZ',
    labelEn: 'TRANSPORT',
    icon: 'ship',
    backgroundColor: '#2E8B57', // skin.colors.successAccent
    textColor: 'white',
  },
  {
    key: 'info',
    labelHr: 'INFORMACIJE',
    labelEn: 'INFO',
    icon: 'info',
    backgroundColor: '#FFD93D', // skin.colors.warningAccent
    textColor: '#1A1A1A',
  },
  {
    key: 'contacts',
    labelHr: 'KONTAKTI',
    labelEn: 'CONTACTS',
    icon: 'phone',
    backgroundColor: '#E63946', // skin.colors.urgent
    textColor: 'white',
  },
];

/**
 * Feedback CTA labels
 */
export const homeFeedbackLabels = {
  titleHr: 'VAŠE MIŠLJENJE',
  titleEn: 'YOUR FEEDBACK',
  subtitleHr: 'Pomozite nam poboljšati aplikaciju',
  subtitleEn: 'Help us improve the app',
};

// ============================================================
// Fixture 1: Default (mixed content)
// ============================================================

export const homeDefaultFixture: HomeFixture = {
  id: 'default',
  name: 'Default',
  description: 'Mixed content with 2 banners and 3 events',
  banners: [
    {
      id: 'banner-1',
      title: 'Otkazana trajektna linija Split-Vis',
      is_urgent: false,
    },
    {
      id: 'banner-2',
      title: 'Nova autobusna linija Vis-Komiža',
      is_urgent: false,
    },
  ],
  events: [
    {
      id: 'event-1',
      title: 'Fešta Ribara',
      location: 'Riva, Vis',
      start_datetime: '2026-01-25T18:00:00Z',
    },
    {
      id: 'event-2',
      title: 'Dan Grada Visa',
      location: 'Grad Vis',
      start_datetime: '2026-02-02T00:00:00Z',
    },
    {
      id: 'event-3',
      title: 'Viška regata',
      location: 'Viški kanal',
      start_datetime: '2026-02-08T10:00:00Z',
    },
  ],
  heroTitleHr: 'DOBRODOŠLI NA VIS',
  heroSubtitleHr: 'Sve informacije o otoku na jednom mjestu',
};

// ============================================================
// Fixture 2: No Banners (empty banner state)
// ============================================================

export const homeNoBannersFixture: HomeFixture = {
  id: 'no-banners',
  name: 'No Banners',
  description: 'No active banners, normal events',
  banners: [],
  events: [
    {
      id: 'event-1',
      title: 'Tržnica domaćih proizvoda',
      location: 'Trg, Komiža',
      start_datetime: '2026-01-26T08:00:00Z',
    },
    {
      id: 'event-2',
      title: 'Izložba fotografija',
      location: 'Galerija Kut, Vis',
      start_datetime: '2026-01-28T19:00:00Z',
    },
  ],
  heroTitleHr: 'DOBRODOŠLI NA VIS',
  heroSubtitleHr: 'Sve informacije o otoku na jednom mjestu',
};

// ============================================================
// Fixture 3: Urgent Banner
// ============================================================

export const homeUrgentBannerFixture: HomeFixture = {
  id: 'urgent-banner',
  name: 'Urgent Banner',
  description: 'Single urgent banner with warning',
  banners: [
    {
      id: 'banner-urgent-1',
      title: 'HITNO: Nestanak struje u naselju Kut od 09:00 do 13:00',
      is_urgent: true,
    },
  ],
  events: [
    {
      id: 'event-1',
      title: 'Sastanak Mjesnog odbora',
      location: null,
      start_datetime: '2026-01-27T18:00:00Z',
    },
  ],
  heroTitleHr: 'DOBRODOŠLI NA VIS',
  heroSubtitleHr: 'Sve informacije o otoku na jednom mjestu',
};

// ============================================================
// Fixture 4: Many Banners (scroll stress test)
// ============================================================

export const homeManyBannersFixture: HomeFixture = {
  id: 'many-banners',
  name: 'Many Banners',
  description: 'Scroll stress: 5 banners stacked',
  banners: [
    {
      id: 'banner-m1',
      title: 'HITNO: Zatvoren put prema Komiži zbog radova',
      is_urgent: true,
    },
    {
      id: 'banner-m2',
      title: 'Promjena voznog reda autobusne linije',
      is_urgent: false,
    },
    {
      id: 'banner-m3',
      title: 'Obavijest o radu Turističkog ureda',
      is_urgent: false,
    },
    {
      id: 'banner-m4',
      title: 'HITNO: Planirani nestanak vode u gradu Visu',
      is_urgent: true,
    },
    {
      id: 'banner-m5',
      title: 'Nova kulturna manifestacija u Komiži',
      is_urgent: false,
    },
  ],
  events: [
    {
      id: 'event-1',
      title: 'Fešta Ribara',
      location: 'Riva, Vis',
      start_datetime: '2026-01-25T18:00:00Z',
    },
  ],
  heroTitleHr: 'DOBRODOŠLI NA VIS',
  heroSubtitleHr: 'Sve informacije o otoku na jednom mjestu',
};

// ============================================================
// Fixture 5: Mixed Cards (varied event count)
// ============================================================

export const homeMixedCardsFixture: HomeFixture = {
  id: 'mixed-cards',
  name: 'Mixed Cards',
  description: 'No events placeholder state',
  banners: [
    {
      id: 'banner-mc1',
      title: 'Dobrodošli u novu sezonu!',
      is_urgent: false,
    },
  ],
  events: [], // Empty events to show placeholder
  heroTitleHr: 'DOBRODOŠLI NA VIS',
  heroSubtitleHr: 'Sve informacije o otoku na jednom mjestu',
};

// ============================================================
// All Fixtures Array
// ============================================================

export const homeFixtures: HomeFixture[] = [
  homeDefaultFixture,
  homeNoBannersFixture,
  homeUrgentBannerFixture,
  homeManyBannersFixture,
  homeMixedCardsFixture,
];

// ============================================================
// UI Labels
// ============================================================

export const homeLabels = {
  sections: {
    categoriesHr: 'KATEGORIJE',
    categoriesEn: 'CATEGORIES',
    eventsHr: 'NADOLAZEĆI DOGAĐAJI',
    eventsEn: 'UPCOMING EVENTS',
  },
  events: {
    placeholderHr: 'Nema nadolazećih događanja',
    placeholderEn: 'No upcoming events',
    viewAllHr: 'Pogledaj sve',
    viewAllEn: 'View all',
  },
  feedback: {
    titleHr: 'VAŠE MIŠLJENJE',
    titleEn: 'YOUR FEEDBACK',
    subtitleHr: 'Pomozite nam poboljšati aplikaciju',
    subtitleEn: 'Help us improve the app',
  },
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Format event date for display (day + month abbreviation)
 */
export function formatEventDate(isoString: string): { day: string; month: string } {
  const date = new Date(isoString);
  const day = date.getDate().toString();
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'KOL', 'RUJ', 'LIS', 'STU', 'PRO'];
  const month = monthNames[date.getMonth()];
  return { day, month };
}
