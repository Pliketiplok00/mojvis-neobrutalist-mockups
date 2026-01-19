/**
 * Events Fixtures (Design Mirror)
 *
 * Static data for Events mirror screens.
 * Covers calendar view and event detail visual states.
 *
 * Shape matches production types from src/types/event.ts
 */

import type { Event } from '../../types/event';

// ============================================================
// Events List Fixtures (Calendar View)
// ============================================================

/**
 * Sample events covering all visual states:
 * - All-day vs timed events
 * - With/without end time
 * - With/without location
 * - With/without image
 * - Long titles
 * - Various date ranges
 */
export const eventListFixture: Event[] = [
  // 1. Featured event with image, full info
  {
    id: 'event-001',
    title: 'Fešta Ribara',
    description:
      'Tradicionalna ribarsko-gastronomska manifestacija na rivi u gradu Visu. Uz bogatu ponudu svježe ribe i morskih specijaliteta, posjetitelje očekuje kulturno-zabavni program s nastupom lokalnih glazbenika i folklornih skupina.',
    start_datetime: '2026-01-25T18:00:00Z',
    end_datetime: '2026-01-25T23:00:00Z',
    location: 'Riva, Vis',
    organizer: 'Turistička zajednica Vis',
    is_all_day: false,
    image_url: 'https://example.com/festa-ribara.jpg',
    created_at: '2026-01-10T10:00:00Z',
  },
  // 2. All-day event (no specific time)
  {
    id: 'event-002',
    title: 'Dan Grada Visa',
    description:
      'Svečano obilježavanje Dana Grada Visa s raznim kulturnim i društvenim programima tijekom cijelog dana.',
    start_datetime: '2026-02-02T00:00:00Z',
    end_datetime: null,
    location: 'Grad Vis',
    organizer: 'Grad Vis',
    is_all_day: true,
    image_url: null,
    created_at: '2026-01-15T08:00:00Z',
  },
  // 3. Event with long title, no image
  {
    id: 'event-003',
    title: 'Izložba fotografija "More i ljudi kroz vrijeme" - retrospektiva viške fotografije od 1900. do danas',
    description:
      'Jedinstvena izložba koja prikazuje život na otoku Visu kroz objektiv lokalnih i gostujućih fotografa tijekom više od stotinu godina.',
    start_datetime: '2026-01-28T19:00:00Z',
    end_datetime: '2026-02-15T20:00:00Z',
    location: 'Galerija Kut, Vis',
    organizer: 'Udruga Kut',
    is_all_day: false,
    image_url: null,
    created_at: '2026-01-12T14:00:00Z',
  },
  // 4. Event without location (online/TBA)
  {
    id: 'event-004',
    title: 'Online predavanje: Povijest otoka Visa',
    description:
      'Virtualno predavanje o bogatoj povijesti otoka Visa od antičkih vremena do danas. Predavač: prof. dr. Ivan Horvat.',
    start_datetime: '2026-01-30T19:00:00Z',
    end_datetime: '2026-01-30T20:30:00Z',
    location: null,
    organizer: 'Pučko otvoreno učilište Vis',
    is_all_day: false,
    image_url: null,
    created_at: '2026-01-18T11:00:00Z',
  },
  // 5. Multi-day event with image
  {
    id: 'event-005',
    title: 'Viška regata',
    description:
      'Tradicionalna jedriličarska regata oko otoka Visa. Prijave do 20. siječnja. Start i cilj na rivi u Visu.',
    start_datetime: '2026-02-08T10:00:00Z',
    end_datetime: '2026-02-09T18:00:00Z',
    location: 'Viški kanal',
    organizer: 'JK Vis',
    is_all_day: false,
    image_url: 'https://example.com/regata.jpg',
    created_at: '2026-01-05T09:00:00Z',
  },
  // 6. Simple event with minimal description
  {
    id: 'event-006',
    title: 'Tržnica domaćih proizvoda',
    description: 'Prodaja lokalnih proizvoda na trgu.',
    start_datetime: '2026-01-26T08:00:00Z',
    end_datetime: '2026-01-26T13:00:00Z',
    location: 'Trg, Komiža',
    organizer: 'Grad Komiža',
    is_all_day: false,
    image_url: null,
    created_at: '2026-01-20T07:00:00Z',
  },
];

/**
 * Empty events list fixture
 */
export const eventListEmptyFixture: Event[] = [];

// ============================================================
// Event Detail Fixtures
// ============================================================

/**
 * Full detail fixture - event with all optional fields populated
 */
export const eventDetailFixture: Event = eventListFixture[0];

/**
 * Minimal detail fixture - event with only required fields
 */
export const eventDetailMinimalFixture: Event = {
  id: 'event-minimal',
  title: 'Sastanak Mjesnog odbora',
  description: null,
  start_datetime: '2026-01-27T18:00:00Z',
  end_datetime: null,
  location: null,
  organizer: 'Mjesni odbor Vis',
  is_all_day: false,
  image_url: null,
  created_at: '2026-01-19T12:00:00Z',
};

/**
 * All-day event detail fixture
 */
export const eventDetailAllDayFixture: Event = eventListFixture[1];

// ============================================================
// UI Labels (Croatian)
// ============================================================

export const eventsLabels = {
  header: {
    title: 'Događanja',
    subtitle: 'Kulturna i društvena događanja na Visu',
  },
  calendar: {
    today: 'Danas',
    noEvents: 'Nema događanja za ovaj dan',
  },
  empty: {
    title: 'Nema događanja',
    subtitle: 'Trenutno nema zakazanih događanja.',
  },
  detail: {
    when: 'Kada',
    where: 'Gdje',
    organizer: 'Organizator',
    description: 'Opis',
    allDay: 'Cijeli dan',
    reminder: 'Podsjeti me',
    share: 'Podijeli',
    loading: 'Učitavanje...',
    error: 'Greška pri učitavanju događaja.',
    notFound: 'Događaj nije pronađen.',
  },
};

/**
 * Month names in Croatian
 */
export const monthNames: string[] = [
  'Siječanj',
  'Veljača',
  'Ožujak',
  'Travanj',
  'Svibanj',
  'Lipanj',
  'Srpanj',
  'Kolovoz',
  'Rujan',
  'Listopad',
  'Studeni',
  'Prosinac',
];

/**
 * Day names in Croatian (short)
 */
export const dayNamesShort: string[] = [
  'Ned',
  'Pon',
  'Uto',
  'Sri',
  'Čet',
  'Pet',
  'Sub',
];
