/**
 * Transport Diagnostic Script
 *
 * Checks database state for transport issues:
 * 1. Line 602 (Vis-Split ferry) Sunday departures
 * 2. Line 612 (Komiža-Biševo) departures existence
 * 3. Season configuration and overlaps
 * 4. Origin stop IDs for filtering
 */

import { query, closeDatabase, initDatabase } from '../src/lib/database.js';

async function main() {
  await initDatabase();

  console.log('\n' + '='.repeat(60));
  console.log('TRANSPORT DATA DIAGNOSTIC');
  console.log('='.repeat(60));

  // 1. Check all seasons
  console.log('\n--- 1. ALL SEASONS ---');
  const seasons = await query<{
    id: string;
    season_type: string;
    year: number;
    date_from: string;
    date_to: string;
  }>(
    `SELECT id, season_type, year, date_from::TEXT, date_to::TEXT
     FROM transport_seasons
     ORDER BY date_from`
  );
  console.table(seasons.rows);

  // 2. Check which season covers 2026-01-18
  console.log('\n--- 2. SEASONS COVERING 2026-01-18 ---');
  const coveredSeasons = await query<{
    id: string;
    season_type: string;
    date_from: string;
    date_to: string;
  }>(
    `SELECT id, season_type, date_from::TEXT, date_to::TEXT
     FROM transport_seasons
     WHERE '2026-01-18'::DATE BETWEEN date_from AND date_to`
  );
  console.table(coveredSeasons.rows);

  // 3. Check Line 612 (Komiža–Biševo) data
  console.log('\n--- 3. LINE 612 (KOMIŽA–BIŠEVO) DATA ---');
  const line612 = await query<{ id: string; name_hr: string; is_active: boolean }>(
    `SELECT id, name_hr, is_active FROM transport_lines WHERE name_hr LIKE '%Biševo%' OR name_hr LIKE '%Komiža%Biševo%'`
  );
  console.log('Line 612 record:', line612.rows);

  if (line612.rows.length > 0) {
    const lineId = line612.rows[0].id;

    // Check routes
    const routes = await query<{ id: string; direction: number; direction_label_hr: string }>(
      `SELECT id, direction, direction_label_hr FROM transport_routes WHERE line_id = $1`,
      [lineId]
    );
    console.log('Line 612 routes:', routes.rows);

    // Check departures count by season
    const depsBySeason = await query<{
      season_type: string;
      season_from: string;
      season_to: string;
      day_type: string;
      dep_count: string;
    }>(
      `SELECT
         s.season_type,
         s.date_from::TEXT as season_from,
         s.date_to::TEXT as season_to,
         d.day_type,
         COUNT(*) as dep_count
       FROM transport_departures d
       JOIN transport_routes r ON d.route_id = r.id
       JOIN transport_seasons s ON d.season_id = s.id
       WHERE r.line_id = $1
       GROUP BY s.season_type, s.date_from, s.date_to, d.day_type
       ORDER BY s.date_from, d.day_type`,
      [lineId]
    );
    console.log('\nLine 612 departures by season/day_type:');
    if (depsBySeason.rows.length === 0) {
      console.log('  NO DEPARTURES FOUND!');
    } else {
      console.table(depsBySeason.rows);
    }

    // Check if Line 612 departures link to valid seasons
    const orphanedDeps = await query<{ orphan_count: string }>(
      `SELECT COUNT(*) as orphan_count
       FROM transport_departures d
       JOIN transport_routes r ON d.route_id = r.id
       WHERE r.line_id = $1
         AND d.season_id NOT IN (SELECT id FROM transport_seasons)`,
      [lineId]
    );
    console.log('Orphaned departures (bad season_id):', orphanedDeps.rows[0].orphan_count);
  }

  // 4. Check Line 602 Sunday departures
  console.log('\n--- 4. LINE 602 (VIS-SPLIT FERRY) SUN DEPARTURES ---');
  const line602 = await query<{ id: string }>(
    `SELECT id FROM transport_lines WHERE name_hr = 'Vis – Split' AND subtype_hr = 'Trajekt'`
  );

  if (line602.rows.length > 0) {
    const lineId = line602.rows[0].id;

    const sunDeps = await query<{
      departure_time: string;
      direction: number;
      season_type: string;
      season_from: string;
      season_to: string;
      date_from: string | null;
      date_to: string | null;
    }>(
      `SELECT
         d.departure_time::TEXT,
         r.direction,
         s.season_type,
         s.date_from::TEXT as season_from,
         s.date_to::TEXT as season_to,
         d.date_from::TEXT,
         d.date_to::TEXT
       FROM transport_departures d
       JOIN transport_routes r ON d.route_id = r.id
       JOIN transport_seasons s ON d.season_id = s.id
       WHERE r.line_id = $1
         AND d.day_type = 'SUN'
         AND r.direction = 0
       ORDER BY s.date_from, d.departure_time`,
      [lineId]
    );
    console.log('Line 602 SUN Vis→Split departures:');
    console.table(sunDeps.rows);

    // Check for duplicates
    const duplicates = await query<{
      departure_time: string;
      season_type: string;
      count: string;
    }>(
      `SELECT
         d.departure_time::TEXT,
         s.season_type,
         COUNT(*) as count
       FROM transport_departures d
       JOIN transport_routes r ON d.route_id = r.id
       JOIN transport_seasons s ON d.season_id = s.id
       WHERE r.line_id = $1
         AND d.day_type = 'SUN'
         AND r.direction = 0
       GROUP BY d.departure_time, s.season_type
       HAVING COUNT(*) > 1`,
      [lineId]
    );
    if (duplicates.rows.length > 0) {
      console.log('\nDUPLICATE DEPARTURES FOUND:');
      console.table(duplicates.rows);
    } else {
      console.log('\nNo duplicate departures for SUN');
    }
  }

  // 5. Check origin stops (for today filter)
  console.log('\n--- 5. ISLAND ORIGIN STOPS ---');
  const islandStops = await query<{
    id: string;
    name_hr: string;
    name_en: string;
    transport_type: string;
  }>(
    `SELECT id, name_hr, name_en, transport_type
     FROM transport_stops
     WHERE name_hr IN ('Vis', 'Komiža')
        OR name_en IN ('Vis', 'Komiža')`
  );
  console.log('Island stops that should be included in "today" filter:');
  console.table(islandStops.rows);

  // 6. Check what "today" query would return without origin filter
  console.log('\n--- 6. TODAY DEPARTURES (ALL ORIGINS) FOR 2026-01-18 ---');
  const allTodayDeps = await query<{
    departure_time: string;
    line_name: string;
    origin: string;
    destination: string;
    subtype: string | null;
  }>(
    `SELECT
       d.departure_time::TEXT,
       l.name_hr as line_name,
       origin.name_hr as origin,
       dest.name_hr as destination,
       l.subtype_hr as subtype
     FROM transport_departures d
     JOIN transport_routes r ON d.route_id = r.id
     JOIN transport_lines l ON r.line_id = l.id
     JOIN transport_stops dest ON r.destination_stop_id = dest.id
     JOIN transport_stops origin ON r.origin_stop_id = origin.id
     JOIN transport_seasons s ON d.season_id = s.id
     WHERE l.transport_type = 'sea'
       AND l.is_active = TRUE
       AND d.day_type = 'SUN'
       AND '2026-01-18'::DATE BETWEEN s.date_from AND s.date_to
     ORDER BY d.departure_time
     LIMIT 20`
  );
  console.table(allTodayDeps.rows);

  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSTIC COMPLETE');
  console.log('='.repeat(60) + '\n');

  await closeDatabase();
}

main().catch(console.error);
