/**
 * Transport Types
 *
 * Core types for the Transport module (Phase 4).
 *
 * Key concepts:
 * - Lines: Named routes (e.g., "Split - Hvar - Vis")
 * - Routes: Directional stop sequences for a line (direction resolved via route_id)
 * - Seasons: Date ranges (OFF, PRE, HIGH, POST) - non-overlapping
 * - Day Types: EXPLICIT weekdays (MON-SUN) + PRAZNIK - no generic WEEKDAY
 * - Departures: Specific services with stop times (null = skipped)
 * - Contacts: BY LINE, not global by transport type
 *
 * READ-ONLY: No admin editing. Data imported via seed scripts.
 */

// ============================================================
// Enums
// ============================================================

export type TransportType = 'road' | 'sea';

export type SeasonType = 'OFF' | 'PRE' | 'HIGH' | 'POST';

// Explicit day types - NO generic WEEKDAY
// Schedules vary by specific weekday
export type DayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN' | 'PRAZNIK';

// All valid day types
export const DAY_TYPES: readonly DayType[] = [
  'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'PRAZNIK',
] as const;

export const SEASON_TYPES: readonly SeasonType[] = [
  'OFF', 'PRE', 'HIGH', 'POST',
] as const;

export const TRANSPORT_TYPES: readonly TransportType[] = [
  'road', 'sea',
] as const;

// ============================================================
// Database Entities
// ============================================================

export interface TransportStop {
  id: string;
  name_hr: string;
  name_en: string;
  transport_type: TransportType;
  latitude: number | null;
  longitude: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface TransportLine {
  id: string;
  transport_type: TransportType;
  name_hr: string;
  name_en: string;
  subtype_hr: string | null;
  subtype_en: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TransportLineContact {
  id: string;
  line_id: string;
  operator_hr: string;
  operator_en: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface TransportRoute {
  id: string;
  line_id: string;
  direction: number; // 0 or 1
  direction_label_hr: string;
  direction_label_en: string;
  origin_stop_id: string;
  destination_stop_id: string;
  typical_duration_minutes: number | null;
  marker_note_hr: string | null; // Explanation of markers (e.g., "* samo radnim danom")
  marker_note_en: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TransportRouteStop {
  id: string;
  route_id: string;
  stop_id: string;
  stop_order: number;
}

export interface TransportSeason {
  id: string;
  season_type: SeasonType;
  year: number;
  date_from: Date;
  date_to: Date;
  label_hr: string;
  label_en: string;
  created_at: Date;
}

export interface TransportDeparture {
  id: string;
  route_id: string;
  season_id: string;
  day_type: DayType;
  departure_time: string; // HH:MM format
  stop_times: (string | null)[]; // Array of HH:MM or null (null = skipped)
  notes_hr: string | null;
  notes_en: string | null;
  marker: string | null; // Optional marker symbol (e.g., "*", "†")
  // Date-based exception fields (all optional, backward-compatible)
  date_from: string | null; // YYYY-MM-DD
  date_to: string | null; // YYYY-MM-DD
  include_dates: string[] | null; // YYYY-MM-DD[]
  exclude_dates: string[] | null; // YYYY-MM-DD[]
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// API Response Types (Localized)
// ============================================================

/**
 * Line summary for list view
 */
export interface LineListItem {
  id: string;
  name: string;
  subtype: string | null;
  stops_summary: string; // e.g., "Split - Milna - Hvar - Vis"
  stops_count: number;
  typical_duration_minutes: number | null;
}

/**
 * Lines list response
 */
export interface LinesListResponse {
  lines: LineListItem[];
}

/**
 * Stop info for route detail
 */
export interface StopInfo {
  id: string;
  name: string;
  order: number;
}

/**
 * Route info for line detail
 */
export interface RouteInfo {
  id: string;
  direction: number;
  direction_label: string;
  origin: string;
  destination: string;
  stops: StopInfo[];
  typical_duration_minutes: number | null;
  marker_note: string | null; // Explanation of markers (localized)
}

/**
 * Contact info (localized)
 */
export interface ContactInfo {
  operator: string;
  phone: string | null;
  email: string | null;
  website: string | null;
}

/**
 * Line detail response
 */
export interface LineDetailResponse {
  id: string;
  name: string;
  subtype: string | null;
  routes: RouteInfo[];
  contacts: ContactInfo[];
}

/**
 * Stop time for departure (only rendered if time is not null)
 */
export interface DepartureStopTime {
  stop_name: string;
  arrival_time: string; // HH:MM - only included if not null
}

/**
 * Departure for API response
 */
export interface DepartureResponse {
  id: string;
  departure_time: string;
  destination: string;
  duration_minutes: number | null;
  notes: string | null;
  marker: string | null; // Optional marker symbol (e.g., "*", "†")
  // Only stops where vessel STOPS (no null times, no placeholders)
  stop_times: DepartureStopTime[];
}

/**
 * Departures list for a route on a date
 */
export interface DeparturesListResponse {
  line_id: string;
  line_name: string;
  route_id: string;
  direction: number;
  direction_label: string;
  date: string; // YYYY-MM-DD
  day_type: DayType;
  is_holiday: boolean;
  marker_note: string | null; // Route-level explanation of markers (localized)
  departures: DepartureResponse[];
}

/**
 * Today's departure item (aggregated view)
 */
export interface TodayDepartureItem {
  departure_time: string;
  line_id: string;
  line_name: string;
  subtype: string | null; // e.g., "Trajekt", "Katamaran", "Autobus"
  route_id: string;
  direction_label: string;
  destination: string;
  marker: string | null; // Optional marker symbol (e.g., "*", "†")
}

/**
 * Today's departures response
 */
export interface TodaysDeparturesResponse {
  date: string;
  day_type: DayType;
  is_holiday: boolean;
  departures: TodayDepartureItem[];
}

/**
 * Contacts list response (BY LINE)
 */
export interface LineContactsResponse {
  line_id: string;
  line_name: string;
  contacts: ContactInfo[];
}

// ============================================================
// Validation Helpers
// ============================================================

/**
 * Check if a transport type is valid
 */
export function isValidTransportType(type: string): type is TransportType {
  return TRANSPORT_TYPES.includes(type as TransportType);
}

/**
 * Check if a day type is valid
 */
export function isValidDayType(type: string): type is DayType {
  return DAY_TYPES.includes(type as DayType);
}

/**
 * Check if a season type is valid
 */
export function isValidSeasonType(type: string): type is SeasonType {
  return SEASON_TYPES.includes(type as SeasonType);
}

/**
 * Validate that seasons do not overlap
 * Returns validation errors (empty array if valid)
 */
export function validateSeasonsNoOverlap(
  seasons: Array<{ date_from: Date; date_to: Date; season_type: SeasonType; year: number }>
): string[] {
  const errors: string[] = [];

  // Group by year
  const byYear = new Map<number, typeof seasons>();
  for (const season of seasons) {
    const yearSeasons = byYear.get(season.year) ?? [];
    yearSeasons.push(season);
    byYear.set(season.year, yearSeasons);
  }

  // Check each year for overlaps
  for (const [year, yearSeasons] of byYear) {
    // Sort by date_from
    const sorted = [...yearSeasons].sort(
      (a, b) => a.date_from.getTime() - b.date_from.getTime()
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      // Check if current.date_to >= next.date_from (overlap)
      if (current.date_to >= next.date_from) {
        errors.push(
          `Season overlap in ${year}: ${current.season_type} (ends ${formatDate(current.date_to)}) ` +
          `overlaps with ${next.season_type} (starts ${formatDate(next.date_from)})`
        );
      }
    }
  }

  return errors;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================================
// Seed Data Types (for JSON import)
// ============================================================

export interface SeedStop {
  id: string;
  name_hr: string;
  name_en: string;
  transport_type: TransportType;
  latitude?: number;
  longitude?: number;
}

export interface SeedLineContact {
  operator_hr: string;
  operator_en: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface SeedRouteStop {
  stop_id: string;
  stop_order: number;
}

export interface SeedDeparture {
  day_type: DayType;
  season_type: SeasonType;
  departure_time: string; // HH:MM
  stop_times: (string | null)[]; // aligned to route stops
  notes_hr?: string;
  notes_en?: string;
  marker?: string; // Optional marker symbol (e.g., "*", "†")
  // Date-based exception fields (all optional, backward-compatible)
  date_from?: string; // YYYY-MM-DD - departure valid from this date
  date_to?: string; // YYYY-MM-DD - departure valid until this date
  include_dates?: string[]; // YYYY-MM-DD[] - departure valid ONLY on these dates
  exclude_dates?: string[]; // YYYY-MM-DD[] - departure NOT valid on these dates (overrides all)
}

export interface SeedRoute {
  direction: number;
  direction_label_hr: string;
  direction_label_en: string;
  origin_stop_id: string;
  destination_stop_id: string;
  typical_duration_minutes?: number;
  marker_note_hr?: string; // Explanation of markers (e.g., "* samo radnim danom")
  marker_note_en?: string;
  stops: SeedRouteStop[];
  departures: SeedDeparture[];
}

export interface SeedLine {
  id: string;
  transport_type: TransportType;
  name_hr: string;
  name_en: string;
  subtype_hr?: string;
  subtype_en?: string;
  display_order: number;
  contacts: SeedLineContact[];
  routes: SeedRoute[];
}

export interface SeedSeason {
  id: string;
  season_type: SeasonType;
  year: number;
  date_from: string; // YYYY-MM-DD
  date_to: string; // YYYY-MM-DD
  label_hr: string;
  label_en: string;
}

export interface TransportSeedData {
  stops: SeedStop[];
  seasons: SeedSeason[];
  lines: SeedLine[];
}
