/**
 * Transport Repository
 *
 * Database access layer for transport data.
 * READ-ONLY operations only (data is imported via seed scripts).
 *
 * Key functions:
 * - Lines: getLinesByType, getLineById
 * - Routes: getRoutesByLineId, getRouteById
 * - Stops: getStopsForRoute
 * - Seasons: getSeasonForDate
 * - Departures: getDeparturesForRouteAndDate, getTodaysDepartures
 * - Contacts: getContactsForLine (BY LINE, not global)
 */

import { query } from '../lib/database.js';
import { getDayType, getActualWeekday, parseDateInZagreb } from '../lib/holidays.js';
import type {
  TransportType,
  TransportLine,
  TransportStop,
  TransportRoute,
  TransportRouteStop,
  TransportDeparture,
  TransportSeason,
  TransportLineContact,
  DayType,
} from '../types/transport.js';

// ============================================================
// Row Types (Database)
// ============================================================

interface LineRow {
  id: string;
  transport_type: TransportType;
  line_number: string | null;
  name_hr: string;
  name_en: string;
  subtype_hr: string | null;
  subtype_en: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface StopRow {
  id: string;
  name_hr: string;
  name_en: string;
  transport_type: TransportType;
  latitude: string | null;
  longitude: string | null;
  created_at: Date;
  updated_at: Date;
}

interface RouteRow {
  id: string;
  line_id: string;
  direction: number;
  direction_label_hr: string;
  direction_label_en: string;
  origin_stop_id: string;
  destination_stop_id: string;
  typical_duration_minutes: number | null;
  marker_note_hr: string | null;
  marker_note_en: string | null;
  created_at: Date;
  updated_at: Date;
}

interface RouteStopRow {
  id: string;
  route_id: string;
  stop_id: string;
  stop_order: number;
}

interface DepartureRow {
  id: string;
  route_id: string;
  season_id: string;
  day_type: DayType;
  departure_time: string;
  stop_times: string; // JSONB stored as string
  notes_hr: string | null;
  notes_en: string | null;
  marker: string | null; // Optional marker symbol (e.g., "*")
  // Date exception fields
  date_from: string | null; // DATE stored as string
  date_to: string | null; // DATE stored as string
  include_dates: string | null; // JSONB stored as string
  exclude_dates: string | null; // JSONB stored as string
  created_at: Date;
  updated_at: Date;
}

interface SeasonRow {
  id: string;
  season_type: string;
  year: number;
  date_from: Date;
  date_to: Date;
  label_hr: string;
  label_en: string;
  created_at: Date;
}

interface ContactRow {
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

// ============================================================
// Lines
// ============================================================

/**
 * Get all active lines for a transport type
 */
export async function getLinesByType(
  transportType: TransportType
): Promise<TransportLine[]> {
  const result = await query<LineRow>(
    `SELECT * FROM transport_lines
     WHERE transport_type = $1 AND is_active = TRUE
     ORDER BY display_order, name_hr`,
    [transportType]
  );

  return result.rows.map(rowToLine);
}

/**
 * Get a single line by ID
 */
export async function getLineById(id: string): Promise<TransportLine | null> {
  const result = await query<LineRow>(
    `SELECT * FROM transport_lines WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;
  return rowToLine(result.rows[0]);
}

// ============================================================
// Routes
// ============================================================

/**
 * Get routes for a line (both directions)
 */
export async function getRoutesByLineId(lineId: string): Promise<TransportRoute[]> {
  const result = await query<RouteRow>(
    `SELECT * FROM transport_routes
     WHERE line_id = $1
     ORDER BY direction`,
    [lineId]
  );

  return result.rows.map(rowToRoute);
}

/**
 * Get a route by ID
 */
export async function getRouteById(id: string): Promise<TransportRoute | null> {
  const result = await query<RouteRow>(
    `SELECT * FROM transport_routes WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;
  return rowToRoute(result.rows[0]);
}

/**
 * Get a route by line ID and direction
 */
export async function getRouteByLineAndDirection(
  lineId: string,
  direction: number
): Promise<TransportRoute | null> {
  const result = await query<RouteRow>(
    `SELECT * FROM transport_routes
     WHERE line_id = $1 AND direction = $2`,
    [lineId, direction]
  );

  if (result.rows.length === 0) return null;
  return rowToRoute(result.rows[0]);
}

// ============================================================
// Stops
// ============================================================

/**
 * Get a stop by ID
 */
export async function getStopById(id: string): Promise<TransportStop | null> {
  const result = await query<StopRow>(
    `SELECT * FROM transport_stops WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;
  return rowToStop(result.rows[0]);
}

/**
 * Get ordered stops for a route
 */
export async function getStopsForRoute(routeId: string): Promise<TransportStop[]> {
  const result = await query<StopRow & { stop_order: number }>(
    `SELECT s.*, rs.stop_order
     FROM transport_route_stops rs
     JOIN transport_stops s ON rs.stop_id = s.id
     WHERE rs.route_id = $1
     ORDER BY rs.stop_order`,
    [routeId]
  );

  return result.rows.map(rowToStop);
}

/**
 * Get route stops (join table entries) for a route
 */
export async function getRouteStops(routeId: string): Promise<TransportRouteStop[]> {
  const result = await query<RouteStopRow>(
    `SELECT * FROM transport_route_stops
     WHERE route_id = $1
     ORDER BY stop_order`,
    [routeId]
  );

  return result.rows;
}

/**
 * Get stop names for a line (first direction, for summary display)
 */
export async function getStopNamesForLine(
  lineId: string
): Promise<{ stops_hr: string[]; stops_en: string[] }> {
  const result = await query<{ name_hr: string; name_en: string }>(
    `SELECT s.name_hr, s.name_en
     FROM transport_routes r
     JOIN transport_route_stops rs ON r.id = rs.route_id
     JOIN transport_stops s ON rs.stop_id = s.id
     WHERE r.line_id = $1 AND r.direction = 0
     ORDER BY rs.stop_order`,
    [lineId]
  );

  return {
    stops_hr: result.rows.map((r) => r.name_hr),
    stops_en: result.rows.map((r) => r.name_en),
  };
}

// ============================================================
// Seasons
// ============================================================

/**
 * Get the active season for a date
 */
export async function getSeasonForDate(date: Date): Promise<TransportSeason | null> {
  const dateStr = formatDate(date);

  const result = await query<SeasonRow>(
    `SELECT * FROM transport_seasons
     WHERE $1::DATE BETWEEN date_from AND date_to
     LIMIT 1`,
    [dateStr]
  );

  if (result.rows.length === 0) return null;
  return rowToSeason(result.rows[0]);
}

/**
 * Get all seasons for a year
 */
export async function getSeasonsForYear(year: number): Promise<TransportSeason[]> {
  const result = await query<SeasonRow>(
    `SELECT * FROM transport_seasons
     WHERE year = $1
     ORDER BY date_from`,
    [year]
  );

  return result.rows.map(rowToSeason);
}

// ============================================================
// Departures
// ============================================================

/**
 * Helper: Query departures for a specific day type
 */
async function queryDeparturesForDayType(
  routeId: string,
  dayType: DayType,
  dateStr: string
): Promise<TransportDeparture[]> {
  const result = await query<DepartureRow>(
    `SELECT d.id, d.route_id, d.season_id, d.day_type,
            d.departure_time::TEXT as departure_time,
            d.stop_times::TEXT as stop_times,
            d.notes_hr, d.notes_en, d.marker,
            d.date_from::TEXT as date_from,
            d.date_to::TEXT as date_to,
            d.include_dates::TEXT as include_dates,
            d.exclude_dates::TEXT as exclude_dates,
            d.created_at, d.updated_at
     FROM transport_departures d
     WHERE d.route_id = $1
       AND d.day_type = $2
       AND (
         -- Departures with explicit date range: check if query date is in range
         (d.date_from IS NOT NULL AND d.date_to IS NOT NULL
          AND $3::DATE >= d.date_from AND $3::DATE <= d.date_to)
         OR
         -- Departures with only date_from: valid from that date onward
         (d.date_from IS NOT NULL AND d.date_to IS NULL AND $3::DATE >= d.date_from)
         OR
         -- Departures with only date_to: valid up to that date
         (d.date_from IS NULL AND d.date_to IS NOT NULL AND $3::DATE <= d.date_to)
         OR
         -- Departures with include_dates: always fetch, filter in app layer
         (d.include_dates IS NOT NULL AND d.include_dates != '[]'::jsonb)
         OR
         -- Departures with no date constraints: always valid (backward compat)
         (d.date_from IS NULL AND d.date_to IS NULL
          AND (d.include_dates IS NULL OR d.include_dates = '[]'::jsonb))
       )
     ORDER BY d.departure_time`,
    [routeId, dayType, dateStr]
  );

  const allDepartures = result.rows.map(rowToDeparture);
  return allDepartures.filter((dep) => isDepartureValidForDate(dep, dateStr));
}

/**
 * Get departures for a route on a specific date
 * Automatically determines season and day type
 * Applies date exception filtering (date_from/date_to, include_dates, exclude_dates)
 *
 * HOLIDAY FALLBACK STRATEGY:
 * - If date is a holiday (PRAZNIK):
 *   1. Check for NO_SERVICE markers → return empty (explicit no service)
 *   2. If PRAZNIK entries exist → return them
 *   3. If no PRAZNIK entries → fall back to actual weekday
 * - If not a holiday → query by actual weekday
 *
 * DATE FILTERING STRATEGY (permanent fix for disjoint seasons):
 * - All departures MUST have explicit date_from/date_to populated during import
 * - Runtime filtering uses ONLY departure-level dates, NOT season dates
 * - This eliminates issues with disjoint seasons (e.g., OFF: Jan-May AND Sep-Dec)
 * - The season_id remains for metadata/grouping but does NOT affect date filtering
 */
export async function getDeparturesForRouteAndDate(
  routeId: string,
  dateStr: string
): Promise<{ departures: TransportDeparture[]; dayType: DayType; isHoliday: boolean }> {
  const date = parseDateInZagreb(dateStr);
  const dayType = getDayType(date);
  const isHoliday = dayType === 'PRAZNIK';

  let departures: TransportDeparture[];

  if (isHoliday) {
    // Query PRAZNIK departures
    const praznikDepartures = await queryDeparturesForDayType(routeId, 'PRAZNIK', dateStr);

    // Check for NO_SERVICE marker - explicit no service on this date
    const hasNoService = praznikDepartures.some((dep) => dep.marker === 'NO_SERVICE');
    if (hasNoService) {
      return {
        departures: [],
        dayType,
        isHoliday,
      };
    }

    // If PRAZNIK entries exist, use them
    if (praznikDepartures.length > 0) {
      departures = praznikDepartures;
    } else {
      // Fallback to actual weekday
      const actualWeekday = getActualWeekday(date);
      departures = await queryDeparturesForDayType(routeId, actualWeekday, dateStr);
    }
  } else {
    // Normal day - query by day type
    departures = await queryDeparturesForDayType(routeId, dayType, dateStr);
  }

  return {
    departures,
    dayType,
    isHoliday,
  };
}

/**
 * Origins allowed in "today" departures view.
 * Simple rule: only Vis and Komiža.
 */
const VIS_ISLAND_ORIGINS = ['Vis', 'Komiža'];

/**
 * Get today's departures for a transport type (aggregated across all lines)
 * Applies date exception filtering (date_from/date_to, include_dates, exclude_dates)
 * IMPORTANT: Only returns island-origin departures (excludes Split-origin routes)
 *
 * DATE FILTERING STRATEGY (permanent fix for disjoint seasons):
 * - Uses departure-level date_from/date_to, NOT season dates
 * - Eliminates issues with disjoint seasons (e.g., OFF: Jan-May AND Sep-Dec)
 */
export async function getTodaysDepartures(
  transportType: TransportType,
  dateStr: string
): Promise<{
  departures: Array<{
    departure_time: string;
    line_id: string;
    line_name_hr: string;
    line_name_en: string;
    route_id: string;
    direction_label_hr: string;
    direction_label_en: string;
    destination_hr: string;
    destination_en: string;
    marker: string | null;
    typical_duration_minutes: number | null;
  }>;
  dayType: DayType;
  isHoliday: boolean;
}> {
  const date = parseDateInZagreb(dateStr);
  const dayType = getDayType(date);
  const isHoliday = dayType === 'PRAZNIK';

  // Query departures using departure-level date filtering, not season dates.
  // Season JOIN removed - date filtering now entirely via departure fields.
  const result = await query<{
    departure_time: string;
    line_id: string;
    line_name_hr: string;
    line_name_en: string;
    route_id: string;
    direction_label_hr: string;
    direction_label_en: string;
    destination_hr: string;
    destination_en: string;
    marker: string | null;
    typical_duration_minutes: number | null;
    // Date exception fields for filtering
    date_from: string | null;
    date_to: string | null;
    include_dates: string | null;
    exclude_dates: string | null;
  }>(
    `SELECT
       d.departure_time::TEXT as departure_time,
       l.id as line_id,
       l.name_hr as line_name_hr,
       l.name_en as line_name_en,
       r.id as route_id,
       r.direction_label_hr,
       r.direction_label_en,
       dest.name_hr as destination_hr,
       dest.name_en as destination_en,
       d.marker,
       r.typical_duration_minutes,
       d.date_from::TEXT as date_from,
       d.date_to::TEXT as date_to,
       d.include_dates::TEXT as include_dates,
       d.exclude_dates::TEXT as exclude_dates
     FROM transport_departures d
     JOIN transport_routes r ON d.route_id = r.id
     JOIN transport_lines l ON r.line_id = l.id
     JOIN transport_stops dest ON r.destination_stop_id = dest.id
     JOIN transport_stops origin ON r.origin_stop_id = origin.id
     WHERE l.transport_type = $1
       AND l.is_active = TRUE
       AND d.day_type = $2
       AND (
         -- Departures with explicit date range: check if query date is in range
         (d.date_from IS NOT NULL AND d.date_to IS NOT NULL
          AND $3::DATE >= d.date_from AND $3::DATE <= d.date_to)
         OR
         -- Departures with only date_from: valid from that date onward
         (d.date_from IS NOT NULL AND d.date_to IS NULL AND $3::DATE >= d.date_from)
         OR
         -- Departures with only date_to: valid up to that date
         (d.date_from IS NULL AND d.date_to IS NOT NULL AND $3::DATE <= d.date_to)
         OR
         -- Departures with include_dates: always fetch, filter in app layer
         (d.include_dates IS NOT NULL AND d.include_dates != '[]'::jsonb)
         OR
         -- Departures with no date constraints: always valid (backward compat)
         (d.date_from IS NULL AND d.date_to IS NULL
          AND (d.include_dates IS NULL OR d.include_dates = '[]'::jsonb))
       )
       AND origin.name_hr IN ($4, $5)
     ORDER BY d.departure_time`,
    [transportType, dayType, dateStr, ...VIS_ISLAND_ORIGINS]
  );

  // Apply date exception filtering
  const filteredRows = result.rows.filter((row) => {
    // Create a minimal departure object for filtering
    const departure: Pick<TransportDeparture, 'date_from' | 'date_to' | 'include_dates' | 'exclude_dates'> = {
      date_from: row.date_from,
      date_to: row.date_to,
      include_dates: row.include_dates ? (JSON.parse(row.include_dates) as string[]) : null,
      exclude_dates: row.exclude_dates ? (JSON.parse(row.exclude_dates) as string[]) : null,
    };
    return isDepartureValidForDate(departure as TransportDeparture, dateStr);
  });

  // Map to response format (without date exception fields)
  const departures = filteredRows.map((row) => ({
    departure_time: row.departure_time,
    line_id: row.line_id,
    line_name_hr: row.line_name_hr,
    line_name_en: row.line_name_en,
    route_id: row.route_id,
    direction_label_hr: row.direction_label_hr,
    direction_label_en: row.direction_label_en,
    destination_hr: row.destination_hr,
    destination_en: row.destination_en,
    marker: row.marker,
    typical_duration_minutes: row.typical_duration_minutes,
  }));

  return {
    departures,
    dayType,
    isHoliday,
  };
}

// ============================================================
// Contacts (BY LINE)
// ============================================================

/**
 * Get contacts for a specific line
 */
export async function getContactsForLine(lineId: string): Promise<TransportLineContact[]> {
  const result = await query<ContactRow>(
    `SELECT * FROM transport_line_contacts
     WHERE line_id = $1
     ORDER BY display_order`,
    [lineId]
  );

  return result.rows.map(rowToContact);
}

// ============================================================
// Helper Functions
// ============================================================

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a departure is valid for a given date based on date exception rules.
 *
 * Rules (in order of evaluation):
 * 1. If exclude_dates contains the date, departure is NOT valid (overrides all).
 * 2. If include_dates is non-empty, departure is valid ONLY if date is in include_dates.
 * 3. If date_from/date_to is set, date must be within the range [date_from, date_to].
 * 4. If both include_dates AND date_from/date_to exist:
 *    - include_dates is the primary allow-list (must match)
 *    - date_from/date_to is an additional constraint (must also match)
 *
 * @param departure The departure to check
 * @param dateStr The date to check against (YYYY-MM-DD format)
 * @returns true if the departure is valid for the date
 */
function isDepartureValidForDate(departure: TransportDeparture, dateStr: string): boolean {
  // Rule 1: exclude_dates always removes service
  if (departure.exclude_dates && departure.exclude_dates.length > 0) {
    if (departure.exclude_dates.includes(dateStr)) {
      return false;
    }
  }

  // Rule 2: If include_dates is present and non-empty, date must be in the list
  const hasIncludeDates = departure.include_dates && departure.include_dates.length > 0;
  if (hasIncludeDates) {
    if (!departure.include_dates!.includes(dateStr)) {
      return false;
    }
  }

  // Rule 3: If date_from/date_to is set, date must be within range
  // Using string comparison for YYYY-MM-DD format (lexicographically correct)
  if (departure.date_from !== null && dateStr < departure.date_from) {
    return false;
  }
  if (departure.date_to !== null && dateStr > departure.date_to) {
    return false;
  }

  // All rules passed
  return true;
}

function rowToLine(row: LineRow): TransportLine {
  return {
    id: row.id,
    transport_type: row.transport_type,
    line_number: row.line_number,
    name_hr: row.name_hr,
    name_en: row.name_en,
    subtype_hr: row.subtype_hr,
    subtype_en: row.subtype_en,
    display_order: row.display_order,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToStop(row: StopRow): TransportStop {
  return {
    id: row.id,
    name_hr: row.name_hr,
    name_en: row.name_en,
    transport_type: row.transport_type,
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToRoute(row: RouteRow): TransportRoute {
  return {
    id: row.id,
    line_id: row.line_id,
    direction: row.direction,
    direction_label_hr: row.direction_label_hr,
    direction_label_en: row.direction_label_en,
    origin_stop_id: row.origin_stop_id,
    destination_stop_id: row.destination_stop_id,
    typical_duration_minutes: row.typical_duration_minutes,
    marker_note_hr: row.marker_note_hr,
    marker_note_en: row.marker_note_en,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToSeason(row: SeasonRow): TransportSeason {
  return {
    id: row.id,
    season_type: row.season_type as TransportSeason['season_type'],
    year: row.year,
    date_from: row.date_from,
    date_to: row.date_to,
    label_hr: row.label_hr,
    label_en: row.label_en,
    created_at: row.created_at,
  };
}

function rowToDeparture(row: DepartureRow): TransportDeparture {
  return {
    id: row.id,
    route_id: row.route_id,
    season_id: row.season_id,
    day_type: row.day_type,
    departure_time: row.departure_time,
    stop_times: JSON.parse(row.stop_times) as (string | null)[],
    notes_hr: row.notes_hr,
    notes_en: row.notes_en,
    marker: row.marker,
    // Date exception fields
    date_from: row.date_from,
    date_to: row.date_to,
    include_dates: row.include_dates ? (JSON.parse(row.include_dates) as string[]) : null,
    exclude_dates: row.exclude_dates ? (JSON.parse(row.exclude_dates) as string[]) : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToContact(row: ContactRow): TransportLineContact {
  return {
    id: row.id,
    line_id: row.line_id,
    operator_hr: row.operator_hr,
    operator_en: row.operator_en,
    phone: row.phone,
    email: row.email,
    website: row.website,
    display_order: row.display_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
