/**
 * Transport Types
 *
 * Types for transport timetables in the mobile app.
 * Phase 4: Road & Sea Transport (read-only informational content).
 *
 * Key concepts:
 * - Day types are EXPLICIT (MON-SUN, PRAZNIK) - no generic WEEKDAY
 * - Direction is resolved via route_id
 * - Stops with null times are not rendered (skipped entirely)
 * - Contacts are BY LINE
 */

// ============================================================
// Enums
// ============================================================

export type TransportType = 'road' | 'sea';

// Explicit day types - NO generic WEEKDAY
export type DayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN' | 'PRAZNIK';

// ============================================================
// API Response Types
// ============================================================

/**
 * Line summary for list view
 */
export interface LineListItem {
  id: string;
  name: string;
  subtype: string | null;
  stops_summary: string;
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
}

/**
 * Contact info (BY LINE)
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
 * Stop time for departure
 * Only includes stops where vessel STOPS (no null times)
 */
export interface DepartureStopTime {
  stop_name: string;
  arrival_time: string;
}

/**
 * Departure for display
 */
export interface DepartureResponse {
  id: string;
  departure_time: string;
  destination: string;
  duration_minutes: number | null;
  notes: string | null;
  stop_times: DepartureStopTime[];
}

/**
 * Departures list response
 */
export interface DeparturesListResponse {
  line_id: string;
  line_name: string;
  route_id: string;
  direction: number;
  direction_label: string;
  date: string;
  day_type: DayType;
  is_holiday: boolean;
  departures: DepartureResponse[];
}

/**
 * Today's departure item (aggregated view)
 */
export interface TodayDepartureItem {
  departure_time: string;
  line_id: string;
  line_name: string;
  route_id: string;
  direction_label: string;
  destination: string;
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
