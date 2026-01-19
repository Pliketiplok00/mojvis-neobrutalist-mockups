/**
 * Transport Detail Fixtures (Design Mirror)
 *
 * Static data for Transport Line Detail mirror screens.
 * Covers road and sea transport detail visual states.
 *
 * Shape matches production types from src/types/transport.ts
 */

import type {
  TransportType,
  DayType,
  LineDetailResponse,
  DeparturesListResponse,
  DepartureResponse,
  RouteInfo,
  StopInfo,
  ContactInfo,
} from '../../types/transport';

// ============================================================
// Road Transport Fixtures
// ============================================================

/**
 * Road line detail - Bus Vis - Komiža
 */
export const roadLineDetailFixture: LineDetailResponse = {
  id: 'road-vis-komiza',
  name: 'Vis – Komiža',
  subtype: 'Lokalna linija',
  routes: [
    {
      id: 'route-vis-komiza-0',
      direction: 0,
      direction_label: 'Vis → Komiža',
      origin: 'Vis',
      destination: 'Komiža',
      typical_duration_minutes: 25,
      marker_note: '* = vozi samo radnim danima',
      stops: [
        { id: 'stop-1', name: 'Vis - Autobusni kolodvor', order: 0 },
        { id: 'stop-2', name: 'Vis - Riva', order: 1 },
        { id: 'stop-3', name: 'Podselje', order: 2 },
        { id: 'stop-4', name: 'Komiža - Centar', order: 3 },
        { id: 'stop-5', name: 'Komiža - Autobusni kolodvor', order: 4 },
      ],
    },
    {
      id: 'route-vis-komiza-1',
      direction: 1,
      direction_label: 'Komiža → Vis',
      origin: 'Komiža',
      destination: 'Vis',
      typical_duration_minutes: 25,
      marker_note: null,
      stops: [
        { id: 'stop-5', name: 'Komiža - Autobusni kolodvor', order: 0 },
        { id: 'stop-4', name: 'Komiža - Centar', order: 1 },
        { id: 'stop-3', name: 'Podselje', order: 2 },
        { id: 'stop-2', name: 'Vis - Riva', order: 3 },
        { id: 'stop-1', name: 'Vis - Autobusni kolodvor', order: 4 },
      ],
    },
  ],
  contacts: [
    {
      operator: 'Autotrans Vis d.o.o.',
      phone: '+385 21 711 123',
      email: 'info@autotrans-vis.hr',
      website: 'www.autotrans-vis.hr',
    },
  ],
};

/**
 * Road departures - direction 0 (Vis → Komiža)
 */
export const roadDeparturesFixture: DeparturesListResponse = {
  line_id: 'road-vis-komiza',
  line_name: 'Vis – Komiža',
  route_id: 'route-vis-komiza-0',
  direction: 0,
  direction_label: 'Vis → Komiža',
  date: '2026-01-19',
  day_type: 'SUN' as DayType,
  is_holiday: false,
  marker_note: '* = vozi samo radnim danima',
  departures: [
    {
      id: 'dep-road-1',
      departure_time: '06:30',
      destination: 'Komiža',
      duration_minutes: 25,
      notes: null,
      marker: '*',
      stop_times: [
        { stop_name: 'Vis - Autobusni kolodvor', arrival_time: '06:30' },
        { stop_name: 'Vis - Riva', arrival_time: '06:35' },
        { stop_name: 'Podselje', arrival_time: '06:45' },
        { stop_name: 'Komiža - Centar', arrival_time: '06:52' },
        { stop_name: 'Komiža - Autobusni kolodvor', arrival_time: '06:55' },
      ],
    },
    {
      id: 'dep-road-2',
      departure_time: '08:00',
      destination: 'Komiža',
      duration_minutes: 25,
      notes: null,
      marker: null,
      stop_times: [
        { stop_name: 'Vis - Autobusni kolodvor', arrival_time: '08:00' },
        { stop_name: 'Vis - Riva', arrival_time: '08:05' },
        { stop_name: 'Podselje', arrival_time: '08:15' },
        { stop_name: 'Komiža - Centar', arrival_time: '08:22' },
        { stop_name: 'Komiža - Autobusni kolodvor', arrival_time: '08:25' },
      ],
    },
    {
      id: 'dep-road-3',
      departure_time: '10:30',
      destination: 'Komiža',
      duration_minutes: 25,
      notes: 'Po potrebi dodatni polazak',
      marker: null,
      stop_times: [
        { stop_name: 'Vis - Autobusni kolodvor', arrival_time: '10:30' },
        { stop_name: 'Vis - Riva', arrival_time: '10:35' },
        { stop_name: 'Podselje', arrival_time: '10:45' },
        { stop_name: 'Komiža - Centar', arrival_time: '10:52' },
        { stop_name: 'Komiža - Autobusni kolodvor', arrival_time: '10:55' },
      ],
    },
    {
      id: 'dep-road-4',
      departure_time: '14:00',
      destination: 'Komiža',
      duration_minutes: 25,
      notes: null,
      marker: null,
      stop_times: [
        { stop_name: 'Vis - Autobusni kolodvor', arrival_time: '14:00' },
        { stop_name: 'Vis - Riva', arrival_time: '14:05' },
        { stop_name: 'Podselje', arrival_time: '14:15' },
        { stop_name: 'Komiža - Centar', arrival_time: '14:22' },
        { stop_name: 'Komiža - Autobusni kolodvor', arrival_time: '14:25' },
      ],
    },
    {
      id: 'dep-road-5',
      departure_time: '17:00',
      destination: 'Komiža',
      duration_minutes: 25,
      notes: null,
      marker: '*',
      stop_times: [
        { stop_name: 'Vis - Autobusni kolodvor', arrival_time: '17:00' },
        { stop_name: 'Vis - Riva', arrival_time: '17:05' },
        { stop_name: 'Podselje', arrival_time: '17:15' },
        { stop_name: 'Komiža - Centar', arrival_time: '17:22' },
        { stop_name: 'Komiža - Autobusni kolodvor', arrival_time: '17:25' },
      ],
    },
  ],
};

/**
 * Road departures - direction 1 (Komiža → Vis) - empty fixture for testing
 */
export const roadDeparturesEmptyFixture: DeparturesListResponse = {
  line_id: 'road-vis-komiza',
  line_name: 'Vis – Komiža',
  route_id: 'route-vis-komiza-1',
  direction: 1,
  direction_label: 'Komiža → Vis',
  date: '2026-01-20',
  day_type: 'MON' as DayType,
  is_holiday: false,
  marker_note: null,
  departures: [],
};

// ============================================================
// Sea Transport Fixtures
// ============================================================

/**
 * Sea line detail - Ferry Split - Vis
 */
export const seaLineDetailFixture: LineDetailResponse = {
  id: 'sea-split-vis',
  name: 'Split – Vis',
  subtype: 'Trajekt',
  routes: [
    {
      id: 'route-split-vis-0',
      direction: 0,
      direction_label: 'Split → Vis',
      origin: 'Split',
      destination: 'Vis',
      typical_duration_minutes: 140,
      marker_note: '† = dodatni polazak tijekom ljetne sezone',
      stops: [
        { id: 'stop-split', name: 'Split - Gradska luka', order: 0 },
        { id: 'stop-vis', name: 'Vis - Trajektna luka', order: 1 },
      ],
    },
    {
      id: 'route-split-vis-1',
      direction: 1,
      direction_label: 'Vis → Split',
      origin: 'Vis',
      destination: 'Split',
      typical_duration_minutes: 140,
      marker_note: null,
      stops: [
        { id: 'stop-vis', name: 'Vis - Trajektna luka', order: 0 },
        { id: 'stop-split', name: 'Split - Gradska luka', order: 1 },
      ],
    },
  ],
  contacts: [
    {
      operator: 'Jadrolinija',
      phone: '+385 21 338 333',
      email: 'jadrolinija@jadrolinija.hr',
      website: 'www.jadrolinija.hr',
    },
    {
      operator: 'Lučka uprava Split',
      phone: '+385 21 362 201',
      email: null,
      website: null,
    },
  ],
};

/**
 * Sea departures - direction 0 (Split → Vis)
 */
export const seaDeparturesFixture: DeparturesListResponse = {
  line_id: 'sea-split-vis',
  line_name: 'Split – Vis',
  route_id: 'route-split-vis-0',
  direction: 0,
  direction_label: 'Split → Vis',
  date: '2026-01-19',
  day_type: 'SUN' as DayType,
  is_holiday: false,
  marker_note: '† = dodatni polazak tijekom ljetne sezone',
  departures: [
    {
      id: 'dep-sea-1',
      departure_time: '06:00',
      destination: 'Vis',
      duration_minutes: 140,
      notes: null,
      marker: null,
      stop_times: [
        { stop_name: 'Split - Gradska luka', arrival_time: '06:00' },
        { stop_name: 'Vis - Trajektna luka', arrival_time: '08:20' },
      ],
    },
    {
      id: 'dep-sea-2',
      departure_time: '09:30',
      destination: 'Vis',
      duration_minutes: 140,
      notes: 'Brza trajektna linija',
      marker: '†',
      stop_times: [
        { stop_name: 'Split - Gradska luka', arrival_time: '09:30' },
        { stop_name: 'Vis - Trajektna luka', arrival_time: '11:50' },
      ],
    },
    {
      id: 'dep-sea-3',
      departure_time: '14:30',
      destination: 'Vis',
      duration_minutes: 140,
      notes: null,
      marker: null,
      stop_times: [
        { stop_name: 'Split - Gradska luka', arrival_time: '14:30' },
        { stop_name: 'Vis - Trajektna luka', arrival_time: '16:50' },
      ],
    },
    {
      id: 'dep-sea-4',
      departure_time: '19:00',
      destination: 'Vis',
      duration_minutes: 140,
      notes: null,
      marker: null,
      stop_times: [
        { stop_name: 'Split - Gradska luka', arrival_time: '19:00' },
        { stop_name: 'Vis - Trajektna luka', arrival_time: '21:20' },
      ],
    },
    {
      id: 'dep-sea-5',
      departure_time: '23:00',
      destination: 'Vis',
      duration_minutes: 140,
      notes: 'Noćna linija - dolazak sutradan',
      marker: null,
      stop_times: [
        { stop_name: 'Split - Gradska luka', arrival_time: '23:00' },
        { stop_name: 'Vis - Trajektna luka', arrival_time: '01:20' },
      ],
    },
  ],
};

/**
 * Sea departures - direction 1 (Vis → Split) with holiday flag
 */
export const seaDeparturesHolidayFixture: DeparturesListResponse = {
  line_id: 'sea-split-vis',
  line_name: 'Split – Vis',
  route_id: 'route-split-vis-1',
  direction: 1,
  direction_label: 'Vis → Split',
  date: '2026-01-01',
  day_type: 'PRAZNIK' as DayType,
  is_holiday: true,
  marker_note: null,
  departures: [
    {
      id: 'dep-sea-h1',
      departure_time: '07:00',
      destination: 'Split',
      duration_minutes: 140,
      notes: 'Praznički vozni red',
      marker: null,
      stop_times: [
        { stop_name: 'Vis - Trajektna luka', arrival_time: '07:00' },
        { stop_name: 'Split - Gradska luka', arrival_time: '09:20' },
      ],
    },
    {
      id: 'dep-sea-h2',
      departure_time: '15:00',
      destination: 'Split',
      duration_minutes: 140,
      notes: null,
      marker: null,
      stop_times: [
        { stop_name: 'Vis - Trajektna luka', arrival_time: '15:00' },
        { stop_name: 'Split - Gradska luka', arrival_time: '17:20' },
      ],
    },
  ],
};

// ============================================================
// UI Labels (Croatian)
// ============================================================

export const transportDetailLabels = {
  header: {
    road: 'Cestovni prijevoz',
    sea: 'Pomorski prijevoz',
  },
  dateSelector: {
    label: 'DATUM',
    selectDate: 'Odaberi datum',
  },
  dayTypes: {
    MON: 'Ponedjeljak',
    TUE: 'Utorak',
    WED: 'Srijeda',
    THU: 'Četvrtak',
    FRI: 'Petak',
    SAT: 'Subota',
    SUN: 'Nedjelja',
    PRAZNIK: 'Blagdan',
  } as Record<DayType, string>,
  sections: {
    direction: 'SMJER',
    departures: 'POLASCI',
    contacts: 'KONTAKTI',
  },
  stations: 'stanica',
  holiday: 'Blagdan',
  empty: {
    title: 'Nema polazaka',
    subtitle: 'Nema polazaka za odabrani datum.',
  },
  duration: {
    minutes: 'min',
    hours: 'h',
  },
};

// ============================================================
// Helper function to format Croatian dates
// ============================================================

/**
 * Format date for display (Croatian style: DD.MM.YYYY.)
 */
export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}.`;
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}
