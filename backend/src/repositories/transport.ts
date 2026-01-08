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
import { getDayType, parseDateInZagreb } from '../lib/holidays.js';
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
 * Get departures for a route on a specific date
 * Automatically determines season and day type
 */
export async function getDeparturesForRouteAndDate(
  routeId: string,
  dateStr: string
): Promise<{ departures: TransportDeparture[]; dayType: DayType; isHoliday: boolean }> {
  const date = parseDateInZagreb(dateStr);
  const dayType = getDayType(date);
  const isHoliday = dayType === 'PRAZNIK';
  const season = await getSeasonForDate(date);

  if (!season) {
    return { departures: [], dayType, isHoliday };
  }

  const result = await query<DepartureRow>(
    `SELECT id, route_id, season_id, day_type,
            departure_time::TEXT as departure_time,
            stop_times::TEXT as stop_times,
            notes_hr, notes_en, created_at, updated_at
     FROM transport_departures
     WHERE route_id = $1
       AND season_id = $2
       AND day_type = $3
     ORDER BY departure_time`,
    [routeId, season.id, dayType]
  );

  return {
    departures: result.rows.map(rowToDeparture),
    dayType,
    isHoliday,
  };
}

/**
 * Get today's departures for a transport type (aggregated across all lines)
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
  }>;
  dayType: DayType;
  isHoliday: boolean;
}> {
  const date = parseDateInZagreb(dateStr);
  const dayType = getDayType(date);
  const isHoliday = dayType === 'PRAZNIK';
  const season = await getSeasonForDate(date);

  if (!season) {
    return { departures: [], dayType, isHoliday };
  }

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
       dest.name_en as destination_en
     FROM transport_departures d
     JOIN transport_routes r ON d.route_id = r.id
     JOIN transport_lines l ON r.line_id = l.id
     JOIN transport_stops dest ON r.destination_stop_id = dest.id
     WHERE l.transport_type = $1
       AND l.is_active = TRUE
       AND d.season_id = $2
       AND d.day_type = $3
     ORDER BY d.departure_time`,
    [transportType, season.id, dayType]
  );

  return {
    departures: result.rows,
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

function rowToLine(row: LineRow): TransportLine {
  return {
    id: row.id,
    transport_type: row.transport_type,
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
