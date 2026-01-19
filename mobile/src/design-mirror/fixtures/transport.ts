/**
 * Transport Fixtures (Design Mirror)
 *
 * Static data for transport mirror screens.
 * These fixtures replicate the shape of real API responses
 * without requiring network calls.
 */

import type { LineListItem, TodayDepartureItem, DayType } from '../../types/transport';
import type { InboxMessage } from '../../types/inbox';

/**
 * Sea transport lines fixture
 */
export const seaLinesFixture: LineListItem[] = [
  {
    id: 'line-602',
    name: 'Linija 602',
    subtype: 'Trajekt',
    stops_summary: 'Split - Vis',
    typical_duration_minutes: 140,
    stops_count: 2,
  },
  {
    id: 'line-9602',
    name: 'Linija 9602',
    subtype: 'Katamaran',
    stops_summary: 'Split - Milna - Hvar - Vis',
    typical_duration_minutes: 130,
    stops_count: 4,
  },
  {
    id: 'line-bisevo',
    name: 'Bisevo',
    subtype: 'Katamaran',
    stops_summary: 'Komiza - Bisevo',
    typical_duration_minutes: 20,
    stops_count: 2,
  },
];

/**
 * Road transport lines fixture
 */
export const roadLinesFixture: LineListItem[] = [
  {
    id: 'line-vis-komiza',
    name: 'Vis - Komiza',
    subtype: 'Autobus',
    stops_summary: 'Vis - Podhumlje - Komiza',
    typical_duration_minutes: 30,
    stops_count: 5,
  },
  {
    id: 'line-vis-milna',
    name: 'Vis - Milna',
    subtype: 'Autobus',
    stops_summary: 'Vis - Rukavac - Milna',
    typical_duration_minutes: 15,
    stops_count: 3,
  },
];

/**
 * Extended TodayDepartureItem with subtype for display
 * (Production API may not include subtype in today departures,
 * but we include it for visual testing in mirror)
 */
export interface MirrorTodayDepartureItem extends TodayDepartureItem {
  subtype?: string;
}

/**
 * Sea today departures fixture
 */
export const seaTodayDeparturesFixture: MirrorTodayDepartureItem[] = [
  {
    departure_time: '06:00',
    line_id: 'line-602',
    line_name: 'Linija 602',
    route_id: 'route-602-vis-split',
    direction_label: 'Vis - Split',
    destination: 'Split',
    marker: null,
    subtype: 'Trajekt',
  },
  {
    departure_time: '09:30',
    line_id: 'line-9602',
    line_name: 'Linija 9602',
    route_id: 'route-9602-vis-split',
    direction_label: 'Vis - Hvar - Milna - Split',
    destination: 'Split',
    marker: null,
    subtype: 'Katamaran',
  },
  {
    departure_time: '14:00',
    line_id: 'line-602',
    line_name: 'Linija 602',
    route_id: 'route-602-vis-split',
    direction_label: 'Vis - Split',
    destination: 'Split',
    marker: null,
    subtype: 'Trajekt',
  },
  {
    departure_time: '17:30',
    line_id: 'line-bisevo',
    line_name: 'Bisevo',
    route_id: 'route-bisevo-komiza',
    direction_label: 'Komiza - Bisevo',
    destination: 'Bisevo',
    marker: null,
    subtype: 'Katamaran',
  },
];

/**
 * Road today departures fixture
 */
export const roadTodayDeparturesFixture: MirrorTodayDepartureItem[] = [
  {
    departure_time: '07:00',
    line_id: 'line-vis-komiza',
    line_name: 'Vis - Komiza',
    route_id: 'route-vis-komiza',
    direction_label: 'Vis - Komiza',
    destination: 'Komiza',
    marker: null,
    subtype: 'Autobus',
  },
  {
    departure_time: '08:30',
    line_id: 'line-vis-milna',
    line_name: 'Vis - Milna',
    route_id: 'route-vis-milna',
    direction_label: 'Vis - Milna',
    destination: 'Milna',
    marker: null,
    subtype: 'Autobus',
  },
  {
    departure_time: '12:00',
    line_id: 'line-vis-komiza',
    line_name: 'Vis - Komiza',
    route_id: 'route-komiza-vis',
    direction_label: 'Komiza - Vis',
    destination: 'Vis',
    marker: null,
    subtype: 'Autobus',
  },
  {
    departure_time: '16:30',
    line_id: 'line-vis-komiza',
    line_name: 'Vis - Komiza',
    route_id: 'route-vis-komiza',
    direction_label: 'Vis - Komiza',
    destination: 'Komiza',
    marker: null,
    subtype: 'Autobus',
  },
];

/**
 * Fixture day type (for header display)
 */
export const fixtureDayType: DayType = 'MON';
export const fixtureIsHoliday = false;

/**
 * Menu items fixture (mirrors CORE_MENU_ITEMS from MenuOverlay)
 */
export const menuItemsFixture = [
  { label: 'Pocetna', labelEn: 'Home', icon: 'home' as const, route: 'Home' },
  { label: 'Dogadaji', labelEn: 'Events', icon: 'calendar' as const, route: 'Events' },
  { label: 'Vozni redovi', labelEn: 'Timetables', icon: 'bus' as const, route: 'TransportHub' },
  { label: 'Flora i fauna', labelEn: 'Flora & Fauna', icon: 'leaf' as const, route: 'StaticPage:flora-fauna' },
  { label: 'Info za posjetitelje', labelEn: 'Visitor info', icon: 'info' as const, route: 'StaticPage:visitor-info' },
  { label: 'Prijavi problem', labelEn: 'Click & Fix', icon: 'wrench' as const, route: 'ClickFixForm' },
  { label: 'Posalji prijedlog', labelEn: 'Feedback', icon: 'message-circle' as const, route: 'FeedbackForm' },
  { label: 'Vazni kontakti', labelEn: 'Important contacts', icon: 'phone' as const, route: 'StaticPage:important-contacts' },
  { label: 'Postavke', labelEn: 'Settings', icon: 'settings' as const, route: 'Settings' },
];

/**
 * Transport banners fixture (for TransportHub)
 * Used by StaticBannerList in mirror screens
 */
export const bannersFixture: InboxMessage[] = [
  {
    id: 'banner-1-transport-delay',
    title: 'Trajektna linija 602 kasni 30 minuta zbog vremenskih uvjeta',
    body: 'Zbog jakog juga, trajekt iz Splita prema Visu kasni približno 30 minuta. Pratite obavijesti za daljnje informacije.',
    tags: ['hitno', 'promet'],
    active_from: '2026-01-19T06:00:00Z',
    active_to: '2026-01-19T20:00:00Z',
    created_at: '2026-01-19T05:30:00Z',
    is_urgent: true,
  },
  {
    id: 'banner-2-schedule-change',
    title: 'Promjena voznog reda autobusa od ponedjeljka',
    body: 'Od ponedjeljka 20.01. na snagu stupaju novi zimski vozni redovi za sve autobusne linije na otoku.',
    tags: ['hitno', 'promet'],
    active_from: '2026-01-17T00:00:00Z',
    active_to: '2026-01-20T23:59:00Z',
    created_at: '2026-01-17T08:00:00Z',
    is_urgent: false,
  },
];

/**
 * Empty banners fixture (for testing no-banner state)
 */
export const emptyBannersFixture: InboxMessage[] = [];
