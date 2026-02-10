/**
 * Transport Import CLI
 *
 * Safe, transactional transport data import tool.
 * Supports per-line replacement without affecting other lines.
 *
 * Usage:
 *   pnpm --dir backend transport:import --lineId <ID> --file <path> [--dry-run]
 *   pnpm --dir backend transport:import --all --dir <path> [--dry-run]
 *
 * Features:
 * - Transactional: all-or-nothing imports (rollback on failure)
 * - Per-line replace: only affects the specified line
 * - Dry-run mode: validates and previews without writing
 * - Pre-flight validation: catches errors before any DB changes
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, basename } from 'path';
import { createHash } from 'crypto';
import { Pool, PoolClient } from 'pg';
import type {
  TransportSeedData,
  SeedLine,
  SeedStop,
  SeedSeason,
  SeedRoute,
  SeedDeparture,
  SeasonType,
  TransportType,
  DayType,
} from '../src/types/transport.js';

// ============================================================
// Types
// ============================================================

interface ImportOptions {
  lineId?: string;
  file?: string;
  dir?: string;
  all?: boolean;
  dryRun?: boolean;
}

interface ImportSummary {
  lineId: string;
  lineName: string;
  seasonsCount: number;
  routesCount: number;
  departuresCount: number;
  stopsReferenced: number;
  newStops: number;
  action: 'create' | 'replace';
  deletedRoutes: number;
  deletedDepartures: number;
  deletedContacts: number;
}

interface ValidationError {
  field: string;
  message: string;
}

interface LineImportData {
  line: SeedLine;
  stops: SeedStop[];
  seasons: SeedSeason[];
}

// Valid types for validation
const VALID_TRANSPORT_TYPES: TransportType[] = ['road', 'sea'];
const VALID_SEASON_TYPES: SeasonType[] = ['OFF', 'PRE', 'HIGH', 'POST'];
const VALID_DAY_TYPES: DayType[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'PRAZNIK'];

// ============================================================
// Stop Time Parsing (supports time ranges like "08:45–08:50")
// ============================================================

/**
 * Regex for valid stop time formats:
 * - Simple: "HH:MM" (e.g., "08:45")
 * - Range: "HH:MM–HH:MM" or "HH:MM-HH:MM" (en-dash or hyphen, optional spaces)
 * Examples: "08:45", "08:45–08:50", "08:45 - 08:50", "08:45-08:50"
 */
const STOP_TIME_REGEX = /^\d{2}:\d{2}(?:\s*[-–]\s*\d{2}:\d{2})?$/;

/**
 * Check if a stop time string is valid (null, simple HH:MM, or range HH:MM-HH:MM)
 */
function isValidStopTime(time: string | null): boolean {
  if (time === null) return true;
  return STOP_TIME_REGEX.test(time);
}

/**
 * Normalize a stop time to simple HH:MM format.
 * For ranges like "08:45–08:50", returns the SECOND time (departure from stop).
 * For simple times, returns as-is.
 * For null, returns null.
 */
function normalizeStopTime(time: string | null): string | null {
  if (time === null) return null;

  // Check if it's a range (contains dash or en-dash)
  const rangeMatch = time.match(/^(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})$/);
  if (rangeMatch) {
    // Return the second time (departure from this stop)
    return rangeMatch[2];
  }

  // Simple HH:MM format, return as-is
  return time;
}

/**
 * Normalize all stop_times in a departure, converting ranges to departure times.
 */
function normalizeStopTimes(stopTimes: (string | null)[]): (string | null)[] {
  return stopTimes.map(normalizeStopTime);
}

// Self-check: verify the parsing logic works correctly
(function validateStopTimeLogic() {
  const testCases: [string | null, string | null][] = [
    [null, null],
    ['08:45', '08:45'],
    ['08:45–08:50', '08:50'],  // en-dash
    ['08:45-08:50', '08:50'],  // hyphen
    ['08:45 – 08:50', '08:50'], // spaces around en-dash
    ['08:45 - 08:50', '08:50'], // spaces around hyphen
  ];
  for (const [input, expected] of testCases) {
    const result = normalizeStopTime(input);
    if (result !== expected) {
      throw new Error(`Stop time normalization failed: normalizeStopTime(${JSON.stringify(input)}) = ${JSON.stringify(result)}, expected ${JSON.stringify(expected)}`);
    }
  }
})();

// ============================================================
// UUID Generation (Deterministic from seed ID)
// ============================================================

/**
 * Generate a deterministic UUID v5 from a seed ID.
 * Uses a fixed namespace UUID for consistency.
 */
function seedIdToUuid(seedId: string): string {
  // MOJ VIS namespace UUID (generated once, fixed forever)
  const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS namespace UUID

  // Create SHA-1 hash of namespace + name
  const hash = createHash('sha1');

  // Parse namespace UUID to bytes
  const namespaceBytes = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  hash.update(namespaceBytes);
  hash.update(seedId);

  const digest = hash.digest();

  // Set version (5) and variant bits
  digest[6] = (digest[6] & 0x0f) | 0x50; // Version 5
  digest[8] = (digest[8] & 0x3f) | 0x80; // Variant

  // Format as UUID string
  const hex = digest.toString('hex').substring(0, 32);
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

// ============================================================
// Argument Parsing
// ============================================================

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2);
  const options: ImportOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--lineId':
        options.lineId = args[++i];
        break;
      case '--file':
        options.file = args[++i];
        break;
      case '--dir':
        options.dir = args[++i];
        break;
      case '--all':
        options.all = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          printUsage();
          process.exit(1);
        }
    }
  }

  return options;
}

function printUsage(): void {
  console.log(`
Transport Import CLI

USAGE:
  pnpm --dir backend transport:import [OPTIONS]

OPTIONS:
  --lineId <ID>    Import a specific line by its seed ID
  --file <path>    Path to a line JSON file (single line definition)
  --dir <path>     Path to directory containing line JSON files
  --all            Import all lines from the directory
  --dry-run        Validate and preview changes without writing to DB
  --help, -h       Show this help message

EXAMPLES:
  # Import a single line from a file
  pnpm --dir backend transport:import --lineId line-602 --file data/lines/line-602.json

  # Dry-run to preview changes
  pnpm --dir backend transport:import --lineId line-602 --file data/lines/line-602.json --dry-run

  # Import all lines from a directory
  pnpm --dir backend transport:import --all --dir data/lines

NOTES:
  - Per-line import replaces ONLY the specified line (other lines unchanged)
  - All imports are transactional (rollback on any error)
  - Dry-run mode performs full validation without DB writes
  - Stops and seasons must be defined (either in file or pre-existing in DB)
`);
}

function validateArgs(options: ImportOptions): void {
  if (options.all) {
    if (!options.dir) {
      console.error('Error: --all requires --dir <path>');
      process.exit(1);
    }
    if (options.lineId || options.file) {
      console.error('Error: --all cannot be combined with --lineId or --file');
      process.exit(1);
    }
  } else {
    if (!options.lineId) {
      console.error('Error: --lineId is required (or use --all for bulk import)');
      printUsage();
      process.exit(1);
    }
    if (!options.file && !options.dir) {
      console.error('Error: --file or --dir is required');
      process.exit(1);
    }
  }
}

// ============================================================
// File Loading
// ============================================================

/**
 * Load a line import data from a JSON file.
 * Supports both single-line format and full seed format.
 */
function loadLineFile(filePath: string): LineImportData {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  let data: unknown;

  try {
    data = JSON.parse(content);
  } catch {
    throw new Error(`Invalid JSON in file: ${filePath}`);
  }

  // Detect format: full seed format or single-line format
  const parsed = data as Record<string, unknown>;

  if (parsed.lines && Array.isArray(parsed.lines)) {
    // Full seed format (with stops, seasons, lines arrays)
    const seedData = parsed as unknown as TransportSeedData;
    if (seedData.lines.length !== 1) {
      throw new Error(`Expected exactly 1 line in file, found ${seedData.lines.length}`);
    }
    return {
      line: seedData.lines[0],
      stops: seedData.stops || [],
      seasons: seedData.seasons || [],
    };
  } else if (parsed.id && parsed.transport_type && parsed.routes) {
    // Single-line format (just the line object)
    const line = parsed as unknown as SeedLine;
    return {
      line,
      stops: [],
      seasons: [],
    };
  } else {
    throw new Error(`Unrecognized file format in: ${filePath}`);
  }
}

/**
 * Find line file in a directory by lineId.
 */
function findLineFile(dir: string, lineId: string): string | null {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    throw new Error(`Directory not found: ${dir}`);
  }

  const files = readdirSync(dir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = join(dir, file);
    try {
      const data = loadLineFile(filePath);
      if (data.line.id === lineId) {
        return filePath;
      }
    } catch {
      // Skip files that can't be parsed
    }
  }

  return null;
}

/**
 * Load all line files from a directory.
 */
function loadAllLineFiles(dir: string): LineImportData[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    throw new Error(`Directory not found: ${dir}`);
  }

  const files = readdirSync(dir).filter(f => f.endsWith('.json'));
  const results: LineImportData[] = [];

  for (const file of files) {
    const filePath = join(dir, file);
    try {
      const data = loadLineFile(filePath);
      results.push(data);
    } catch (error) {
      console.warn(`Warning: Skipping ${file}: ${error instanceof Error ? error.message : error}`);
    }
  }

  return results;
}

// ============================================================
// Validation
// ============================================================

/**
 * Validate a line definition before import.
 * Returns array of validation errors (empty if valid).
 */
async function validateLine(
  data: LineImportData,
  client: PoolClient
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  const { line, stops: providedStops, seasons: providedSeasons } = data;

  // Validate line fields
  if (!line.id || typeof line.id !== 'string') {
    errors.push({ field: 'line.id', message: 'Line ID is required and must be a string' });
  }

  if (!VALID_TRANSPORT_TYPES.includes(line.transport_type)) {
    errors.push({ field: 'line.transport_type', message: `Invalid transport type: ${line.transport_type}` });
  }

  if (!line.name_hr || !line.name_en) {
    errors.push({ field: 'line.name', message: 'Line names (hr and en) are required' });
  }

  if (typeof line.display_order !== 'number') {
    errors.push({ field: 'line.display_order', message: 'Display order must be a number' });
  }

  // Validate contacts
  if (!Array.isArray(line.contacts)) {
    errors.push({ field: 'line.contacts', message: 'Contacts must be an array' });
  } else {
    for (let i = 0; i < line.contacts.length; i++) {
      const contact = line.contacts[i];
      if (!contact.operator_hr || !contact.operator_en) {
        errors.push({ field: `line.contacts[${i}]`, message: 'Operator names are required' });
      }
    }
  }

  // Validate routes
  if (!Array.isArray(line.routes) || line.routes.length === 0) {
    errors.push({ field: 'line.routes', message: 'At least one route is required' });
  } else {
    // Collect all stop IDs referenced in routes
    const referencedStopIds = new Set<string>();
    const referencedSeasonTypes = new Set<SeasonType>();

    for (let i = 0; i < line.routes.length; i++) {
      const route = line.routes[i];

      // Validate direction
      if (route.direction !== 0 && route.direction !== 1) {
        errors.push({ field: `line.routes[${i}].direction`, message: 'Direction must be 0 or 1' });
      }

      // Validate labels
      if (!route.direction_label_hr || !route.direction_label_en) {
        errors.push({ field: `line.routes[${i}].direction_label`, message: 'Direction labels are required' });
      }

      // Collect stop IDs
      referencedStopIds.add(route.origin_stop_id);
      referencedStopIds.add(route.destination_stop_id);

      // Validate stops array
      if (!Array.isArray(route.stops) || route.stops.length < 2) {
        errors.push({ field: `line.routes[${i}].stops`, message: 'At least 2 stops required per route' });
      } else {
        for (const stop of route.stops) {
          referencedStopIds.add(stop.stop_id);
        }

        // Validate stop order continuity
        const orders = route.stops.map(s => s.stop_order).sort((a, b) => a - b);
        for (let j = 0; j < orders.length; j++) {
          if (orders[j] !== j) {
            errors.push({ field: `line.routes[${i}].stops`, message: 'Stop orders must be contiguous starting from 0' });
            break;
          }
        }
      }

      // Validate departures
      if (!Array.isArray(route.departures)) {
        errors.push({ field: `line.routes[${i}].departures`, message: 'Departures must be an array' });
      } else {
        for (let j = 0; j < route.departures.length; j++) {
          const dep = route.departures[j];
          const depErrors = validateDeparture(dep, route.stops.length, i, j);
          errors.push(...depErrors);

          if (dep.season_type) {
            referencedSeasonTypes.add(dep.season_type);
          }
        }
      }
    }

    // Verify all referenced stops exist (in provided data or DB)
    const providedStopIds = new Set(providedStops.map(s => s.id));
    const missingStopIds: string[] = [];

    for (const stopId of referencedStopIds) {
      if (!providedStopIds.has(stopId)) {
        // Check if stop exists in DB
        const uuid = seedIdToUuid(stopId);
        const result = await client.query('SELECT id FROM transport_stops WHERE id = $1', [uuid]);
        if (result.rows.length === 0) {
          missingStopIds.push(stopId);
        }
      }
    }

    if (missingStopIds.length > 0) {
      errors.push({
        field: 'stops',
        message: `Referenced stops not found: ${missingStopIds.join(', ')}. Add them to the import file or ensure they exist in DB.`,
      });
    }

    // Verify all referenced seasons exist (in provided data or DB)
    const providedSeasonsByType = new Map<string, SeedSeason>();
    for (const season of providedSeasons) {
      providedSeasonsByType.set(`${season.season_type}-${season.year}`, season);
    }

    const missingSeasons: string[] = [];
    for (const seasonType of referencedSeasonTypes) {
      // Check for current year (2026) - could be made configurable
      const year = 2026;
      const key = `${seasonType}-${year}`;

      if (!providedSeasonsByType.has(key)) {
        // Check if season exists in DB
        const result = await client.query(
          'SELECT id FROM transport_seasons WHERE season_type = $1 AND year = $2',
          [seasonType, year]
        );
        if (result.rows.length === 0) {
          missingSeasons.push(key);
        }
      }
    }

    if (missingSeasons.length > 0) {
      errors.push({
        field: 'seasons',
        message: `Referenced seasons not found: ${missingSeasons.join(', ')}. Add them to the import file or ensure they exist in DB.`,
      });
    }
  }

  // Validate provided stops
  for (let i = 0; i < providedStops.length; i++) {
    const stop = providedStops[i];
    if (!stop.id || !stop.name_hr || !stop.name_en) {
      errors.push({ field: `stops[${i}]`, message: 'Stop ID and names are required' });
    }
    if (!VALID_TRANSPORT_TYPES.includes(stop.transport_type)) {
      errors.push({ field: `stops[${i}].transport_type`, message: `Invalid transport type: ${stop.transport_type}` });
    }
  }

  // Validate provided seasons
  for (let i = 0; i < providedSeasons.length; i++) {
    const season = providedSeasons[i];
    if (!season.id || !season.label_hr || !season.label_en) {
      errors.push({ field: `seasons[${i}]`, message: 'Season ID and labels are required' });
    }
    if (!VALID_SEASON_TYPES.includes(season.season_type)) {
      errors.push({ field: `seasons[${i}].season_type`, message: `Invalid season type: ${season.season_type}` });
    }
    if (!season.date_from || !season.date_to) {
      errors.push({ field: `seasons[${i}]`, message: 'Season date_from and date_to are required' });
    }
  }

  return errors;
}

/**
 * Validate a single departure.
 */
function validateDeparture(
  dep: SeedDeparture,
  stopCount: number,
  routeIndex: number,
  depIndex: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `line.routes[${routeIndex}].departures[${depIndex}]`;

  // Validate day type
  if (!VALID_DAY_TYPES.includes(dep.day_type)) {
    errors.push({ field: `${prefix}.day_type`, message: `Invalid day type: ${dep.day_type}` });
  }

  // Validate season type
  if (!VALID_SEASON_TYPES.includes(dep.season_type)) {
    errors.push({ field: `${prefix}.season_type`, message: `Invalid season type: ${dep.season_type}` });
  }

  // Validate departure time format (HH:MM)
  if (!/^\d{2}:\d{2}$/.test(dep.departure_time)) {
    errors.push({ field: `${prefix}.departure_time`, message: 'Departure time must be HH:MM format' });
  }

  // Validate stop_times length matches stop count
  if (!Array.isArray(dep.stop_times)) {
    errors.push({ field: `${prefix}.stop_times`, message: 'stop_times must be an array' });
  } else if (dep.stop_times.length !== stopCount) {
    errors.push({
      field: `${prefix}.stop_times`,
      message: `stop_times length (${dep.stop_times.length}) must match route stops count (${stopCount})`,
    });
  } else {
    // Validate each stop time format (accepts HH:MM or HH:MM–HH:MM ranges)
    for (let i = 0; i < dep.stop_times.length; i++) {
      const time = dep.stop_times[i];
      if (!isValidStopTime(time)) {
        errors.push({ field: `${prefix}.stop_times[${i}]`, message: 'Stop time must be HH:MM, HH:MM–HH:MM range, or null' });
      }
    }
  }

  // Validate date exception fields
  if (dep.date_from && !/^\d{4}-\d{2}-\d{2}$/.test(dep.date_from)) {
    errors.push({ field: `${prefix}.date_from`, message: 'date_from must be YYYY-MM-DD format' });
  }
  if (dep.date_to && !/^\d{4}-\d{2}-\d{2}$/.test(dep.date_to)) {
    errors.push({ field: `${prefix}.date_to`, message: 'date_to must be YYYY-MM-DD format' });
  }
  if (dep.date_from && dep.date_to && dep.date_from > dep.date_to) {
    errors.push({ field: `${prefix}`, message: 'date_from must be before or equal to date_to' });
  }

  if (dep.include_dates) {
    if (!Array.isArray(dep.include_dates)) {
      errors.push({ field: `${prefix}.include_dates`, message: 'include_dates must be an array' });
    } else {
      for (const date of dep.include_dates) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          errors.push({ field: `${prefix}.include_dates`, message: `Invalid date format: ${date}` });
        }
      }
    }
  }

  if (dep.exclude_dates) {
    if (!Array.isArray(dep.exclude_dates)) {
      errors.push({ field: `${prefix}.exclude_dates`, message: 'exclude_dates must be an array' });
    } else {
      for (const date of dep.exclude_dates) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          errors.push({ field: `${prefix}.exclude_dates`, message: `Invalid date format: ${date}` });
        }
      }
    }
  }

  return errors;
}

// ============================================================
// Import Summary
// ============================================================

/**
 * Generate import summary (for dry-run and post-import output).
 */
async function generateSummary(
  data: LineImportData,
  client: PoolClient
): Promise<ImportSummary> {
  const { line, stops: providedStops } = data;
  const lineUuid = seedIdToUuid(line.id);

  // Check if line exists
  const existingLine = await client.query(
    'SELECT id FROM transport_lines WHERE id = $1',
    [lineUuid]
  );
  const action: 'create' | 'replace' = existingLine.rows.length > 0 ? 'replace' : 'create';

  // Count existing data that would be deleted
  let deletedRoutes = 0;
  let deletedDepartures = 0;
  let deletedContacts = 0;

  if (action === 'replace') {
    const routes = await client.query('SELECT id FROM transport_routes WHERE line_id = $1', [lineUuid]);
    deletedRoutes = routes.rows.length;

    for (const route of routes.rows) {
      const deps = await client.query('SELECT COUNT(*) FROM transport_departures WHERE route_id = $1', [route.id]);
      deletedDepartures += parseInt(deps.rows[0].count);
    }

    const contacts = await client.query('SELECT COUNT(*) FROM transport_line_contacts WHERE line_id = $1', [lineUuid]);
    deletedContacts = parseInt(contacts.rows[0].count);
  }

  // Count new data
  const routesCount = line.routes.length;
  let departuresCount = 0;
  const stopsReferenced = new Set<string>();

  for (const route of line.routes) {
    departuresCount += route.departures.length;
    stopsReferenced.add(route.origin_stop_id);
    stopsReferenced.add(route.destination_stop_id);
    for (const stop of route.stops) {
      stopsReferenced.add(stop.stop_id);
    }
  }

  // Count new stops (provided but not in DB)
  let newStops = 0;
  for (const stop of providedStops) {
    const uuid = seedIdToUuid(stop.id);
    const exists = await client.query('SELECT id FROM transport_stops WHERE id = $1', [uuid]);
    if (exists.rows.length === 0) {
      newStops++;
    }
  }

  // Count referenced seasons
  const seasonTypes = new Set<string>();
  for (const route of line.routes) {
    for (const dep of route.departures) {
      seasonTypes.add(dep.season_type);
    }
  }

  return {
    lineId: line.id,
    lineName: line.name_hr,
    seasonsCount: seasonTypes.size,
    routesCount,
    departuresCount,
    stopsReferenced: stopsReferenced.size,
    newStops,
    action,
    deletedRoutes,
    deletedDepartures,
    deletedContacts,
  };
}

// ============================================================
// Transactional Import
// ============================================================

/**
 * Import a single line (transactional, per-line replace).
 */
async function importLine(
  data: LineImportData,
  client: PoolClient,
  dryRun: boolean
): Promise<ImportSummary> {
  const { line, stops: providedStops, seasons: providedSeasons } = data;
  const lineUuid = seedIdToUuid(line.id);

  // Generate summary before making changes
  const summary = await generateSummary(data, client);

  if (dryRun) {
    return summary;
  }

  // Step 1: Upsert provided stops
  for (const stop of providedStops) {
    const stopUuid = seedIdToUuid(stop.id);
    await client.query(
      `INSERT INTO transport_stops (id, name_hr, name_en, transport_type, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name_hr = EXCLUDED.name_hr,
         name_en = EXCLUDED.name_en,
         transport_type = EXCLUDED.transport_type,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         updated_at = NOW()`,
      [stopUuid, stop.name_hr, stop.name_en, stop.transport_type, stop.latitude ?? null, stop.longitude ?? null]
    );
  }

  // Step 2: Upsert provided seasons (keyed by id, allows multiple seasons of same type per year)
  // Build map: season_type-year -> [seasons] for departure linking
  const seasonsByTypeYear = new Map<string, SeedSeason[]>();
  for (const season of providedSeasons) {
    const seasonUuid = seedIdToUuid(season.id);
    await client.query(
      `INSERT INTO transport_seasons (id, season_type, year, date_from, date_to, label_hr, label_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         season_type = EXCLUDED.season_type,
         year = EXCLUDED.year,
         date_from = EXCLUDED.date_from,
         date_to = EXCLUDED.date_to,
         label_hr = EXCLUDED.label_hr,
         label_en = EXCLUDED.label_en`,
      [seasonUuid, season.season_type, season.year, season.date_from, season.date_to, season.label_hr, season.label_en]
    );

    // Track seasons by type+year for departure linking
    const key = `${season.season_type}-${season.year}`;
    if (!seasonsByTypeYear.has(key)) {
      seasonsByTypeYear.set(key, []);
    }
    seasonsByTypeYear.get(key)!.push(season);
  }

  // Step 3: Delete existing line (CASCADE deletes routes, departures, contacts)
  await client.query('DELETE FROM transport_lines WHERE id = $1', [lineUuid]);

  // Step 4: Insert new line
  await client.query(
    `INSERT INTO transport_lines (id, transport_type, name_hr, name_en, subtype_hr, subtype_en, display_order, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
    [
      lineUuid,
      line.transport_type,
      line.name_hr,
      line.name_en,
      line.subtype_hr ?? null,
      line.subtype_en ?? null,
      line.display_order,
    ]
  );

  // Step 5: Insert contacts
  for (let i = 0; i < line.contacts.length; i++) {
    const contact = line.contacts[i];
    await client.query(
      `INSERT INTO transport_line_contacts (line_id, operator_hr, operator_en, phone, email, website, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        lineUuid,
        contact.operator_hr,
        contact.operator_en,
        contact.phone ?? null,
        contact.email ?? null,
        contact.website ?? null,
        i,
      ]
    );
  }

  // Step 6: Insert routes with stops and departures
  for (const route of line.routes) {
    const routeUuid = seedIdToUuid(`${line.id}-route-${route.direction}`);
    const originUuid = seedIdToUuid(route.origin_stop_id);
    const destUuid = seedIdToUuid(route.destination_stop_id);

    await client.query(
      `INSERT INTO transport_routes (id, line_id, direction, direction_label_hr, direction_label_en, origin_stop_id, destination_stop_id, typical_duration_minutes, marker_note_hr, marker_note_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        routeUuid,
        lineUuid,
        route.direction,
        route.direction_label_hr,
        route.direction_label_en,
        originUuid,
        destUuid,
        route.typical_duration_minutes ?? null,
        route.marker_note_hr ?? null,
        route.marker_note_en ?? null,
      ]
    );

    // Insert route stops
    for (const stop of route.stops) {
      const stopUuid = seedIdToUuid(stop.stop_id);
      await client.query(
        `INSERT INTO transport_route_stops (route_id, stop_id, stop_order)
         VALUES ($1, $2, $3)`,
        [routeUuid, stopUuid, stop.stop_order]
      );
    }

    // Insert departures with date-aware season linking
    // PERMANENT FIX: For departures without explicit dates, create a row for EACH
    // season period to handle disjoint seasons (e.g., OFF: Jan-May AND Sep-Dec)
    for (const dep of route.departures) {
      const year = 2026;
      const key = `${dep.season_type}-${year}`;
      const providedSeasons = seasonsByTypeYear.get(key) || [];

      // Normalize stop_times once (shared across all inserted rows)
      const normalizedStopTimes = normalizeStopTimes(dep.stop_times);

      // Helper to insert a departure row
      const insertDeparture = async (
        seasonUuid: string,
        dateFrom: string | null,
        dateTo: string | null
      ): Promise<void> => {
        await client.query(
          `INSERT INTO transport_departures (route_id, season_id, day_type, departure_time, stop_times, notes_hr, notes_en, marker, date_from, date_to, include_dates, exclude_dates)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            routeUuid,
            seasonUuid,
            dep.day_type,
            dep.departure_time,
            JSON.stringify(normalizedStopTimes),
            dep.notes_hr ?? null,
            dep.notes_en ?? null,
            dep.marker ?? null,
            dateFrom,
            dateTo,
            dep.include_dates ? JSON.stringify(dep.include_dates) : null,
            dep.exclude_dates ? JSON.stringify(dep.exclude_dates) : null,
          ]
        );
      };

      if (dep.date_from || dep.date_to) {
        // Departure has explicit date range - find the season containing that date
        let matchedSeason: SeedSeason | null = null;
        const refDate = dep.date_from || dep.date_to!;

        // First try provided seasons from this line's JSON
        for (const season of providedSeasons) {
          if (refDate >= season.date_from && refDate <= season.date_to) {
            matchedSeason = season;
            break;
          }
        }

        let seasonUuid: string;
        if (!matchedSeason) {
          // Fallback: query DB for season containing this date
          const seasonResult = await client.query(
            `SELECT id FROM transport_seasons
             WHERE season_type = $1 AND year = $2
               AND $3::DATE BETWEEN date_from AND date_to
             LIMIT 1`,
            [dep.season_type, year, refDate]
          );
          if (seasonResult.rows.length > 0) {
            seasonUuid = seasonResult.rows[0].id;
          } else {
            throw new Error(
              `No season found for departure ${dep.departure_time} ${dep.day_type} ` +
              `with date=${refDate} (season_type=${dep.season_type}, year=${year})`
            );
          }
        } else {
          seasonUuid = seedIdToUuid(matchedSeason.id);
        }

        // Insert single row with explicit dates preserved
        await insertDeparture(seasonUuid, dep.date_from ?? null, dep.date_to ?? null);
      } else {
        // No explicit date range - create a row for EACH season period
        // This handles disjoint seasons like OFF-A (Jan-May) + OFF-B (Sep-Dec)
        let seasonsToUse: Array<{ uuid: string; dateFrom: string; dateTo: string }> = [];

        if (providedSeasons.length > 0) {
          // Line provides its own seasons - use all of them
          seasonsToUse = providedSeasons.map((s) => ({
            uuid: seedIdToUuid(s.id),
            dateFrom: s.date_from,
            dateTo: s.date_to,
          }));
        } else {
          // Line doesn't provide seasons - query DB for ALL seasons of this type
          const seasonResult = await client.query(
            `SELECT id, date_from::TEXT as date_from, date_to::TEXT as date_to
             FROM transport_seasons
             WHERE season_type = $1 AND year = $2
             ORDER BY date_from`,
            [dep.season_type, year]
          );
          if (seasonResult.rows.length === 0) {
            throw new Error(
              `No season found in DB for ${dep.season_type} ${year}. ` +
              `Line must provide seasons array or import a line with seasons first.`
            );
          }
          seasonsToUse = seasonResult.rows.map((row: { id: string; date_from: string; date_to: string }) => ({
            uuid: row.id,
            dateFrom: row.date_from,
            dateTo: row.date_to,
          }));
          if (seasonsToUse.length > 1) {
            console.log(
              `  [INFO] Departure ${dep.departure_time} ${dep.day_type} ${dep.season_type} ` +
              `will be duplicated across ${seasonsToUse.length} season periods`
            );
          }
        }

        // Insert a row for each season period with populated date_from/date_to
        for (const season of seasonsToUse) {
          await insertDeparture(season.uuid, season.dateFrom, season.dateTo);
        }
      }
    }
  }

  return summary;
}

// ============================================================
// Main
// ============================================================

async function main(): Promise<void> {
  const options = parseArgs();
  validateArgs(options);

  console.log('');
  console.log('='.repeat(60));
  console.log('Transport Import CLI');
  console.log('='.repeat(60));

  if (options.dryRun) {
    console.log('MODE: DRY-RUN (no changes will be made)');
  }
  console.log('');

  // Connect to database
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'mojvis',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  const client = await pool.connect();

  try {
    // Load data
    let dataToImport: LineImportData[] = [];

    if (options.all && options.dir) {
      console.log(`Loading all lines from: ${options.dir}`);
      dataToImport = loadAllLineFiles(options.dir);
      console.log(`Found ${dataToImport.length} line files`);
    } else if (options.lineId) {
      let filePath: string | null = null;

      if (options.file) {
        filePath = options.file;
      } else if (options.dir) {
        filePath = findLineFile(options.dir, options.lineId);
        if (!filePath) {
          console.error(`Error: Line ${options.lineId} not found in ${options.dir}`);
          process.exit(1);
        }
      }

      if (!filePath) {
        console.error('Error: No file path determined');
        process.exit(1);
      }

      console.log(`Loading line from: ${filePath}`);
      const data = loadLineFile(filePath);

      // Verify lineId matches
      if (data.line.id !== options.lineId) {
        console.error(`Error: File contains line ${data.line.id}, but --lineId is ${options.lineId}`);
        process.exit(1);
      }

      dataToImport = [data];
    }

    if (dataToImport.length === 0) {
      console.error('Error: No data to import');
      process.exit(1);
    }

    // Start transaction
    await client.query('BEGIN');

    const summaries: ImportSummary[] = [];

    for (const data of dataToImport) {
      console.log('');
      console.log(`Processing: ${data.line.id} (${data.line.name_hr})`);
      console.log('-'.repeat(40));

      // Validate
      console.log('Validating...');
      const errors = await validateLine(data, client);

      if (errors.length > 0) {
        console.error('Validation FAILED:');
        for (const error of errors) {
          console.error(`  - ${error.field}: ${error.message}`);
        }
        throw new Error(`Validation failed for line ${data.line.id}`);
      }
      console.log('Validation passed');

      // Import
      console.log(options.dryRun ? 'Generating summary...' : 'Importing...');
      const summary = await importLine(data, client, options.dryRun ?? false);
      summaries.push(summary);

      // Print summary
      console.log('');
      console.log(`Summary for ${summary.lineId}:`);
      console.log(`  Action: ${summary.action.toUpperCase()}`);
      console.log(`  Line: ${summary.lineName}`);
      console.log(`  Routes: ${summary.routesCount}`);
      console.log(`  Departures: ${summary.departuresCount}`);
      console.log(`  Stops referenced: ${summary.stopsReferenced}`);
      if (summary.newStops > 0) {
        console.log(`  New stops: ${summary.newStops}`);
      }
      if (summary.action === 'replace') {
        console.log(`  Would delete: ${summary.deletedRoutes} routes, ${summary.deletedDepartures} departures, ${summary.deletedContacts} contacts`);
      }
    }

    if (options.dryRun) {
      // Rollback (no changes in dry-run)
      await client.query('ROLLBACK');
      console.log('');
      console.log('DRY-RUN complete. No changes made.');
    } else {
      // Commit transaction
      await client.query('COMMIT');
      console.log('');
      console.log('='.repeat(60));
      console.log('Import SUCCESSFUL');
      console.log(`  Lines imported: ${summaries.length}`);
      console.log(`  Total routes: ${summaries.reduce((sum, s) => sum + s.routesCount, 0)}`);
      console.log(`  Total departures: ${summaries.reduce((sum, s) => sum + s.departuresCount, 0)}`);
      console.log('='.repeat(60));
    }
  } catch (error) {
    // Rollback on any error
    await client.query('ROLLBACK');
    console.error('');
    console.error('Import FAILED (transaction rolled back)');
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
