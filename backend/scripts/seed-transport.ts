/**
 * Transport Data Seed Script
 *
 * Populates transport data from JSON seed file.
 * Run with: npx tsx scripts/seed-transport.ts
 *
 * TODO: Replace this seed data with real imported datasets.
 *       This is for Phase 4 testing only.
 *
 * The seed format matches the final import format 1:1.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import type {
  TransportSeedData,
  SeedLine,
  SeedRoute,
  SeedDeparture,
  SeasonType,
  validateSeasonsNoOverlap,
} from '../src/types/transport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'mojvis',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

/**
 * Load seed data from JSON file
 */
function loadSeedData(): TransportSeedData {
  const seedPath = join(__dirname, '..', 'src', 'data', 'seed', 'transport-seed.json');
  const data = readFileSync(seedPath, 'utf-8');
  return JSON.parse(data) as TransportSeedData;
}

/**
 * Validate seasons do not overlap
 */
function validateSeasons(seasons: TransportSeedData['seasons']): void {
  const seasonsForValidation = seasons.map((s) => ({
    date_from: new Date(s.date_from),
    date_to: new Date(s.date_to),
    season_type: s.season_type,
    year: s.year,
  }));

  // Group by year
  const byYear = new Map<number, typeof seasonsForValidation>();
  for (const season of seasonsForValidation) {
    const yearSeasons = byYear.get(season.year) ?? [];
    yearSeasons.push(season);
    byYear.set(season.year, yearSeasons);
  }

  // Check each year for overlaps
  for (const [year, yearSeasons] of byYear) {
    const sorted = [...yearSeasons].sort(
      (a, b) => a.date_from.getTime() - b.date_from.getTime()
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (current.date_to >= next.date_from) {
        throw new Error(
          `Season overlap in ${year}: ${current.season_type} (ends ${current.date_to.toISOString().split('T')[0]}) ` +
          `overlaps with ${next.season_type} (starts ${next.date_from.toISOString().split('T')[0]})`
        );
      }
    }
  }

  console.log('[Seed] Seasons validation passed - no overlaps');
}

/**
 * Clear existing transport data
 */
async function clearExistingData(): Promise<void> {
  console.log('[Seed] Clearing existing transport data...');

  await pool.query('DELETE FROM transport_departures');
  await pool.query('DELETE FROM transport_route_stops');
  await pool.query('DELETE FROM transport_routes');
  await pool.query('DELETE FROM transport_line_contacts');
  await pool.query('DELETE FROM transport_lines');
  await pool.query('DELETE FROM transport_stops');
  await pool.query('DELETE FROM transport_seasons');

  console.log('[Seed] Existing data cleared');
}

/**
 * Insert stops
 */
async function insertStops(stops: TransportSeedData['stops']): Promise<void> {
  console.log(`[Seed] Inserting ${stops.length} stops...`);

  for (const stop of stops) {
    await pool.query(
      `INSERT INTO transport_stops (id, name_hr, name_en, transport_type, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [stop.id, stop.name_hr, stop.name_en, stop.transport_type, stop.latitude ?? null, stop.longitude ?? null]
    );
  }

  console.log('[Seed] Stops inserted');
}

/**
 * Insert seasons
 */
async function insertSeasons(seasons: TransportSeedData['seasons']): Promise<void> {
  console.log(`[Seed] Inserting ${seasons.length} seasons...`);

  for (const season of seasons) {
    await pool.query(
      `INSERT INTO transport_seasons (id, season_type, year, date_from, date_to, label_hr, label_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        season.id,
        season.season_type,
        season.year,
        season.date_from,
        season.date_to,
        season.label_hr,
        season.label_en,
      ]
    );
  }

  console.log('[Seed] Seasons inserted');
}

/**
 * Get season ID by type and year
 */
async function getSeasonId(seasonType: SeasonType, year: number = 2026): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `SELECT id FROM transport_seasons WHERE season_type = $1 AND year = $2`,
    [seasonType, year]
  );

  if (result.rows.length === 0) {
    throw new Error(`Season not found: ${seasonType} ${year}`);
  }

  return result.rows[0].id;
}

/**
 * Insert a line with its routes, contacts, and departures
 */
async function insertLine(line: SeedLine): Promise<void> {
  console.log(`[Seed] Inserting line: ${line.name_hr}`);

  // Insert line
  await pool.query(
    `INSERT INTO transport_lines (id, transport_type, name_hr, name_en, subtype_hr, subtype_en, display_order, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
    [
      line.id,
      line.transport_type,
      line.name_hr,
      line.name_en,
      line.subtype_hr ?? null,
      line.subtype_en ?? null,
      line.display_order,
    ]
  );

  // Insert contacts
  for (let i = 0; i < line.contacts.length; i++) {
    const contact = line.contacts[i];
    await pool.query(
      `INSERT INTO transport_line_contacts (line_id, operator_hr, operator_en, phone, email, website, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        line.id,
        contact.operator_hr,
        contact.operator_en,
        contact.phone ?? null,
        contact.email ?? null,
        contact.website ?? null,
        i,
      ]
    );
  }

  // Insert routes
  for (const route of line.routes) {
    await insertRoute(line.id, route);
  }

  console.log(`[Seed] Line inserted: ${line.name_hr}`);
}

/**
 * Insert a route with its stops and departures
 */
async function insertRoute(lineId: string, route: SeedRoute): Promise<void> {
  const routeId = `${lineId}-dir-${route.direction}`;

  // Insert route
  await pool.query(
    `INSERT INTO transport_routes (id, line_id, direction, direction_label_hr, direction_label_en, origin_stop_id, destination_stop_id, typical_duration_minutes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      routeId,
      lineId,
      route.direction,
      route.direction_label_hr,
      route.direction_label_en,
      route.origin_stop_id,
      route.destination_stop_id,
      route.typical_duration_minutes ?? null,
    ]
  );

  // Insert route stops
  for (const stop of route.stops) {
    await pool.query(
      `INSERT INTO transport_route_stops (route_id, stop_id, stop_order)
       VALUES ($1, $2, $3)`,
      [routeId, stop.stop_id, stop.stop_order]
    );
  }

  // Insert departures
  for (const departure of route.departures) {
    await insertDeparture(routeId, departure);
  }
}

/**
 * Insert a departure
 */
async function insertDeparture(routeId: string, departure: SeedDeparture): Promise<void> {
  const seasonId = await getSeasonId(departure.season_type);

  await pool.query(
    `INSERT INTO transport_departures (route_id, season_id, day_type, departure_time, stop_times, notes_hr, notes_en)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      routeId,
      seasonId,
      departure.day_type,
      departure.departure_time,
      JSON.stringify(departure.stop_times),
      departure.notes_hr ?? null,
      departure.notes_en ?? null,
    ]
  );
}

/**
 * Main seed function
 */
async function seed(): Promise<void> {
  console.log('='.repeat(50));
  console.log('Transport Data Seed Script');
  console.log('='.repeat(50));
  console.log('');
  console.log('TODO: Replace this seed data with real imported datasets.');
  console.log('      This is for Phase 4 testing only.');
  console.log('');

  try {
    // Load seed data
    const data = loadSeedData();
    console.log(`[Seed] Loaded seed data:`);
    console.log(`  - ${data.stops.length} stops`);
    console.log(`  - ${data.seasons.length} seasons`);
    console.log(`  - ${data.lines.length} lines`);

    // Validate seasons do not overlap
    validateSeasons(data.seasons);

    // Clear existing data
    await clearExistingData();

    // Insert data
    await insertStops(data.stops);
    await insertSeasons(data.seasons);

    for (const line of data.lines) {
      await insertLine(line);
    }

    // Count results
    const lineCount = await pool.query('SELECT COUNT(*) FROM transport_lines');
    const routeCount = await pool.query('SELECT COUNT(*) FROM transport_routes');
    const departureCount = await pool.query('SELECT COUNT(*) FROM transport_departures');

    console.log('');
    console.log('='.repeat(50));
    console.log('[Seed] Transport data seeded successfully!');
    console.log(`  - Lines: ${lineCount.rows[0].count}`);
    console.log(`  - Routes: ${routeCount.rows[0].count}`);
    console.log(`  - Departures: ${departureCount.rows[0].count}`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('[Seed] Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run seed
seed().catch((error) => {
  console.error('[Seed] Fatal error:', error);
  process.exit(1);
});
