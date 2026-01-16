/**
 * Transport Import Tests
 *
 * Tests for the transactional, per-line transport import functionality.
 *
 * Key test scenarios:
 * 1. Non-destructive import: importing line A does not affect line B
 * 2. Transaction rollback: invalid data causes no DB changes
 * 3. Dry-run mode: no DB writes occur
 * 4. Replace semantics: importing same line twice keeps only second version
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createHash } from 'crypto';

// ============================================================
// UUID Generation (copied from import script for testing)
// ============================================================

function seedIdToUuid(seedId: string): string {
  const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const hash = createHash('sha1');
  const namespaceBytes = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  hash.update(namespaceBytes);
  hash.update(seedId);
  const digest = hash.digest();
  digest[6] = (digest[6] & 0x0f) | 0x50;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  const hex = digest.toString('hex').substring(0, 32);
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

// ============================================================
// Mock Database State
// ============================================================

interface MockRow {
  id: string;
  [key: string]: unknown;
}

class MockDatabase {
  private tables: Map<string, MockRow[]> = new Map();
  private snapshot: Map<string, MockRow[]> | null = null;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.tables = new Map([
      ['transport_stops', []],
      ['transport_seasons', []],
      ['transport_lines', []],
      ['transport_line_contacts', []],
      ['transport_routes', []],
      ['transport_route_stops', []],
      ['transport_departures', []],
    ]);
    this.snapshot = null;
  }

  begin(): void {
    // Save snapshot for rollback
    this.snapshot = new Map();
    for (const [table, rows] of this.tables) {
      this.snapshot.set(table, JSON.parse(JSON.stringify(rows)) as MockRow[]);
    }
  }

  commit(): void {
    this.snapshot = null;
  }

  rollback(): void {
    if (this.snapshot) {
      this.tables = this.snapshot;
      this.snapshot = null;
    }
  }

  getTable(name: string): MockRow[] {
    return this.tables.get(name) || [];
  }

  insert(table: string, row: MockRow): void {
    const rows = this.tables.get(table);
    if (rows) {
      rows.push(row);
    }
  }

  delete(table: string, predicate: (row: MockRow) => boolean): number {
    const rows = this.tables.get(table);
    if (!rows) return 0;

    const toDelete = rows.filter(predicate);
    const remaining = rows.filter((r) => !predicate(r));
    this.tables.set(table, remaining);

    return toDelete.length;
  }

  select(table: string, predicate?: (row: MockRow) => boolean): MockRow[] {
    const rows = this.tables.get(table) || [];
    return predicate ? rows.filter(predicate) : rows;
  }

  count(table: string, predicate?: (row: MockRow) => boolean): number {
    return this.select(table, predicate).length;
  }

  upsert(table: string, row: MockRow, conflictKey: string): void {
    const rows = this.tables.get(table);
    if (!rows) return;

    const existingIndex = rows.findIndex((r) => r[conflictKey] === row[conflictKey]);
    if (existingIndex >= 0) {
      rows[existingIndex] = row;
    } else {
      rows.push(row);
    }
  }
}

const mockDb = new MockDatabase();

// ============================================================
// Import Logic (extracted for unit testing)
// ============================================================

interface SeedStop {
  id: string;
  name_hr: string;
  name_en: string;
  transport_type: string;
  latitude?: number;
  longitude?: number;
}

interface SeedSeason {
  id: string;
  season_type: string;
  year: number;
  date_from: string;
  date_to: string;
  label_hr: string;
  label_en: string;
}

interface SeedRouteStop {
  stop_id: string;
  stop_order: number;
}

interface SeedDeparture {
  day_type: string;
  season_type: string;
  departure_time: string;
  stop_times: (string | null)[];
  notes_hr?: string;
  notes_en?: string;
  date_from?: string;
  date_to?: string;
  include_dates?: string[];
  exclude_dates?: string[];
}

interface SeedRoute {
  direction: number;
  direction_label_hr: string;
  direction_label_en: string;
  origin_stop_id: string;
  destination_stop_id: string;
  typical_duration_minutes?: number;
  stops: SeedRouteStop[];
  departures: SeedDeparture[];
}

interface SeedLineContact {
  operator_hr: string;
  operator_en: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

interface SeedLine {
  id: string;
  transport_type: string;
  name_hr: string;
  name_en: string;
  subtype_hr?: string;
  subtype_en?: string;
  display_order: number;
  contacts: SeedLineContact[];
  routes: SeedRoute[];
}

interface LineImportData {
  line: SeedLine;
  stops: SeedStop[];
  seasons: SeedSeason[];
}

/**
 * Simulate the import logic using mock database.
 */
function simulateImport(data: LineImportData, dryRun: boolean): { success: boolean; error?: string } {
  const { line, stops, seasons } = data;
  const lineUuid = seedIdToUuid(line.id);

  if (dryRun) {
    // Dry run: no changes, just validation
    return { success: true };
  }

  mockDb.begin();

  try {
    // Upsert stops
    for (const stop of stops) {
      const stopUuid = seedIdToUuid(stop.id);
      mockDb.upsert('transport_stops', {
        id: stopUuid,
        name_hr: stop.name_hr,
        name_en: stop.name_en,
        transport_type: stop.transport_type,
        latitude: stop.latitude ?? null,
        longitude: stop.longitude ?? null,
      }, 'id');
    }

    // Upsert seasons
    for (const season of seasons) {
      const seasonUuid = seedIdToUuid(season.id);
      const existingSeason = mockDb.select('transport_seasons', (r) =>
        r.season_type === season.season_type && r.year === season.year
      );

      if (existingSeason.length === 0) {
        mockDb.insert('transport_seasons', {
          id: seasonUuid,
          season_type: season.season_type,
          year: season.year,
          date_from: season.date_from,
          date_to: season.date_to,
          label_hr: season.label_hr,
          label_en: season.label_en,
        });
      }
    }

    // Delete existing line data (CASCADE simulation)
    const existingRoutes = mockDb.select('transport_routes', (r) => r.line_id === lineUuid);
    for (const route of existingRoutes) {
      mockDb.delete('transport_departures', (r) => r.route_id === route.id);
      mockDb.delete('transport_route_stops', (r) => r.route_id === route.id);
    }
    mockDb.delete('transport_routes', (r) => r.line_id === lineUuid);
    mockDb.delete('transport_line_contacts', (r) => r.line_id === lineUuid);
    mockDb.delete('transport_lines', (r) => r.id === lineUuid);

    // Insert new line
    mockDb.insert('transport_lines', {
      id: lineUuid,
      transport_type: line.transport_type,
      name_hr: line.name_hr,
      name_en: line.name_en,
      subtype_hr: line.subtype_hr ?? null,
      subtype_en: line.subtype_en ?? null,
      display_order: line.display_order,
      is_active: true,
    });

    // Insert contacts
    for (let i = 0; i < line.contacts.length; i++) {
      const contact = line.contacts[i];
      mockDb.insert('transport_line_contacts', {
        id: seedIdToUuid(`${line.id}-contact-${i}`),
        line_id: lineUuid,
        operator_hr: contact.operator_hr,
        operator_en: contact.operator_en,
        phone: contact.phone ?? null,
        email: contact.email ?? null,
        website: contact.website ?? null,
        display_order: i,
      });
    }

    // Insert routes
    for (const route of line.routes) {
      const routeUuid = seedIdToUuid(`${line.id}-route-${route.direction}`);

      mockDb.insert('transport_routes', {
        id: routeUuid,
        line_id: lineUuid,
        direction: route.direction,
        direction_label_hr: route.direction_label_hr,
        direction_label_en: route.direction_label_en,
        origin_stop_id: seedIdToUuid(route.origin_stop_id),
        destination_stop_id: seedIdToUuid(route.destination_stop_id),
        typical_duration_minutes: route.typical_duration_minutes ?? null,
      });

      // Insert route stops
      for (const stop of route.stops) {
        mockDb.insert('transport_route_stops', {
          id: seedIdToUuid(`${line.id}-route-${route.direction}-stop-${stop.stop_order}`),
          route_id: routeUuid,
          stop_id: seedIdToUuid(stop.stop_id),
          stop_order: stop.stop_order,
        });
      }

      // Insert departures
      for (let i = 0; i < route.departures.length; i++) {
        const dep = route.departures[i];
        const season = mockDb.select('transport_seasons', (r) =>
          r.season_type === dep.season_type && r.year === 2026
        )[0];

        if (!season) {
          throw new Error(`Season not found: ${dep.season_type}`);
        }

        mockDb.insert('transport_departures', {
          id: seedIdToUuid(`${line.id}-route-${route.direction}-dep-${i}`),
          route_id: routeUuid,
          season_id: season.id,
          day_type: dep.day_type,
          departure_time: dep.departure_time,
          stop_times: JSON.stringify(dep.stop_times),
          notes_hr: dep.notes_hr ?? null,
          notes_en: dep.notes_en ?? null,
          date_from: dep.date_from ?? null,
          date_to: dep.date_to ?? null,
          include_dates: dep.include_dates ? JSON.stringify(dep.include_dates) : null,
          exclude_dates: dep.exclude_dates ? JSON.stringify(dep.exclude_dates) : null,
        });
      }
    }

    mockDb.commit();
    return { success: true };
  } catch (error) {
    mockDb.rollback();
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ============================================================
// Test Data
// ============================================================

const testLineA: LineImportData = {
  stops: [
    { id: 'stop-test-a1', name_hr: 'Test A1', name_en: 'Test A1', transport_type: 'sea' },
    { id: 'stop-test-a2', name_hr: 'Test A2', name_en: 'Test A2', transport_type: 'sea' },
  ],
  seasons: [
    {
      id: 'season-off-2026',
      season_type: 'OFF',
      year: 2026,
      date_from: '2026-01-01',
      date_to: '2026-05-28',
      label_hr: 'Izvan sezone',
      label_en: 'Off season',
    },
  ],
  line: {
    id: 'line-test-a',
    transport_type: 'sea',
    name_hr: 'Test Linija A',
    name_en: 'Test Line A',
    display_order: 100,
    contacts: [{ operator_hr: 'Op A', operator_en: 'Op A' }],
    routes: [
      {
        direction: 0,
        direction_label_hr: 'A1 → A2',
        direction_label_en: 'A1 → A2',
        origin_stop_id: 'stop-test-a1',
        destination_stop_id: 'stop-test-a2',
        stops: [
          { stop_id: 'stop-test-a1', stop_order: 0 },
          { stop_id: 'stop-test-a2', stop_order: 1 },
        ],
        departures: [
          { day_type: 'MON', season_type: 'OFF', departure_time: '08:00', stop_times: ['08:00', '08:30'] },
          { day_type: 'TUE', season_type: 'OFF', departure_time: '08:00', stop_times: ['08:00', '08:30'] },
        ],
      },
    ],
  },
};

const testLineB: LineImportData = {
  stops: [
    { id: 'stop-test-b1', name_hr: 'Test B1', name_en: 'Test B1', transport_type: 'sea' },
    { id: 'stop-test-b2', name_hr: 'Test B2', name_en: 'Test B2', transport_type: 'sea' },
  ],
  seasons: [
    {
      id: 'season-off-2026',
      season_type: 'OFF',
      year: 2026,
      date_from: '2026-01-01',
      date_to: '2026-05-28',
      label_hr: 'Izvan sezone',
      label_en: 'Off season',
    },
  ],
  line: {
    id: 'line-test-b',
    transport_type: 'sea',
    name_hr: 'Test Linija B',
    name_en: 'Test Line B',
    display_order: 101,
    contacts: [{ operator_hr: 'Op B', operator_en: 'Op B' }],
    routes: [
      {
        direction: 0,
        direction_label_hr: 'B1 → B2',
        direction_label_en: 'B1 → B2',
        origin_stop_id: 'stop-test-b1',
        destination_stop_id: 'stop-test-b2',
        stops: [
          { stop_id: 'stop-test-b1', stop_order: 0 },
          { stop_id: 'stop-test-b2', stop_order: 1 },
        ],
        departures: [
          { day_type: 'MON', season_type: 'OFF', departure_time: '10:00', stop_times: ['10:00', '10:45'] },
        ],
      },
    ],
  },
};

const testLineAUpdated: LineImportData = {
  ...testLineA,
  line: {
    ...testLineA.line,
    name_hr: 'Test Linija A (Updated)',
    name_en: 'Test Line A (Updated)',
    routes: [
      {
        ...testLineA.line.routes[0],
        departures: [
          { day_type: 'MON', season_type: 'OFF', departure_time: '09:00', stop_times: ['09:00', '09:30'] },
          { day_type: 'TUE', season_type: 'OFF', departure_time: '09:00', stop_times: ['09:00', '09:30'] },
          { day_type: 'WED', season_type: 'OFF', departure_time: '09:00', stop_times: ['09:00', '09:30'] },
        ],
      },
    ],
  },
};

// ============================================================
// Tests
// ============================================================

describe('Transport Import', () => {
  beforeEach(() => {
    mockDb.reset();
  });

  describe('Non-destructive import (per-line isolation)', () => {
    it('importing line A should not affect line B', () => {
      // First, import line B
      const resultB = simulateImport(testLineB, false);
      expect(resultB.success).toBe(true);

      const lineBUuid = seedIdToUuid('line-test-b');
      const lineBBefore = mockDb.select('transport_lines', (r) => r.id === lineBUuid);
      expect(lineBBefore.length).toBe(1);

      const routesBBefore = mockDb.select('transport_routes', (r) => r.line_id === lineBUuid);
      expect(routesBBefore.length).toBe(1);

      const depsBBefore = mockDb.select('transport_departures', (r) => r.route_id === routesBBefore[0].id);
      expect(depsBBefore.length).toBe(1);

      // Now import line A
      const resultA = simulateImport(testLineA, false);
      expect(resultA.success).toBe(true);

      // Verify line B is unchanged
      const lineBAfter = mockDb.select('transport_lines', (r) => r.id === lineBUuid);
      expect(lineBAfter.length).toBe(1);
      expect(lineBAfter[0].name_hr).toBe('Test Linija B');

      const routesBAfter = mockDb.select('transport_routes', (r) => r.line_id === lineBUuid);
      expect(routesBAfter.length).toBe(1);

      const depsBAfter = mockDb.select('transport_departures', (r) => r.route_id === routesBAfter[0].id);
      expect(depsBAfter.length).toBe(1);
      expect(depsBAfter[0].departure_time).toBe('10:00');

      // Verify line A was added
      const lineAUuid = seedIdToUuid('line-test-a');
      const lineA = mockDb.select('transport_lines', (r) => r.id === lineAUuid);
      expect(lineA.length).toBe(1);
      expect(lineA[0].name_hr).toBe('Test Linija A');
    });

    it('importing line A should not delete stops used by line B', () => {
      // Import both lines (they share a season but have different stops)
      simulateImport(testLineB, false);
      simulateImport(testLineA, false);

      // Verify all stops exist
      const stopA1 = mockDb.select('transport_stops', (r) => r.id === seedIdToUuid('stop-test-a1'));
      const stopA2 = mockDb.select('transport_stops', (r) => r.id === seedIdToUuid('stop-test-a2'));
      const stopB1 = mockDb.select('transport_stops', (r) => r.id === seedIdToUuid('stop-test-b1'));
      const stopB2 = mockDb.select('transport_stops', (r) => r.id === seedIdToUuid('stop-test-b2'));

      expect(stopA1.length).toBe(1);
      expect(stopA2.length).toBe(1);
      expect(stopB1.length).toBe(1);
      expect(stopB2.length).toBe(1);
    });
  });

  describe('Transaction rollback on failure', () => {
    it('should rollback all changes if import fails mid-way', () => {
      // First, successfully import line B
      simulateImport(testLineB, false);

      const lineCountBefore = mockDb.count('transport_lines');
      const routeCountBefore = mockDb.count('transport_routes');
      const depCountBefore = mockDb.count('transport_departures');

      expect(lineCountBefore).toBe(1);
      expect(routeCountBefore).toBe(1);
      expect(depCountBefore).toBe(1);

      // Try to import invalid data (missing season)
      const invalidData: LineImportData = {
        stops: [{ id: 'stop-x', name_hr: 'X', name_en: 'X', transport_type: 'sea' }],
        seasons: [], // No season provided!
        line: {
          id: 'line-invalid',
          transport_type: 'sea',
          name_hr: 'Invalid',
          name_en: 'Invalid',
          display_order: 999,
          contacts: [],
          routes: [
            {
              direction: 0,
              direction_label_hr: 'X',
              direction_label_en: 'X',
              origin_stop_id: 'stop-x',
              destination_stop_id: 'stop-x',
              stops: [{ stop_id: 'stop-x', stop_order: 0 }],
              departures: [
                { day_type: 'MON', season_type: 'HIGH', departure_time: '08:00', stop_times: ['08:00'] },
              ],
            },
          ],
        },
      };

      const result = simulateImport(invalidData, false);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Season not found');

      // Verify DB state is unchanged
      const lineCountAfter = mockDb.count('transport_lines');
      const routeCountAfter = mockDb.count('transport_routes');
      const depCountAfter = mockDb.count('transport_departures');

      expect(lineCountAfter).toBe(lineCountBefore);
      expect(routeCountAfter).toBe(routeCountBefore);
      expect(depCountAfter).toBe(depCountBefore);
    });
  });

  describe('Dry-run mode', () => {
    it('should not write anything to DB in dry-run mode', () => {
      const lineCountBefore = mockDb.count('transport_lines');
      const stopCountBefore = mockDb.count('transport_stops');

      const result = simulateImport(testLineA, true);
      expect(result.success).toBe(true);

      const lineCountAfter = mockDb.count('transport_lines');
      const stopCountAfter = mockDb.count('transport_stops');

      expect(lineCountAfter).toBe(lineCountBefore);
      expect(stopCountAfter).toBe(stopCountBefore);
    });
  });

  describe('Replace semantics', () => {
    it('updating same lineId twice should keep only second version', () => {
      // Import original version
      const result1 = simulateImport(testLineA, false);
      expect(result1.success).toBe(true);

      const lineUuid = seedIdToUuid('line-test-a');
      let line = mockDb.select('transport_lines', (r) => r.id === lineUuid);
      expect(line.length).toBe(1);
      expect(line[0].name_hr).toBe('Test Linija A');

      const routes1 = mockDb.select('transport_routes', (r) => r.line_id === lineUuid);
      expect(routes1.length).toBe(1);

      const deps1 = mockDb.select('transport_departures', (r) => r.route_id === routes1[0].id);
      expect(deps1.length).toBe(2);
      expect(deps1[0].departure_time).toBe('08:00');

      // Import updated version
      const result2 = simulateImport(testLineAUpdated, false);
      expect(result2.success).toBe(true);

      // Verify only one line exists
      line = mockDb.select('transport_lines', (r) => r.id === lineUuid);
      expect(line.length).toBe(1);
      expect(line[0].name_hr).toBe('Test Linija A (Updated)');

      // Verify routes were replaced
      const routes2 = mockDb.select('transport_routes', (r) => r.line_id === lineUuid);
      expect(routes2.length).toBe(1);

      // Verify departures were replaced (3 instead of 2, with new time)
      const deps2 = mockDb.select('transport_departures', (r) => r.route_id === routes2[0].id);
      expect(deps2.length).toBe(3);
      expect(deps2[0].departure_time).toBe('09:00');
    });

    it('should maintain total line count when replacing existing line', () => {
      // Import two lines
      simulateImport(testLineA, false);
      simulateImport(testLineB, false);

      expect(mockDb.count('transport_lines')).toBe(2);

      // Replace line A
      simulateImport(testLineAUpdated, false);

      // Should still be 2 lines total
      expect(mockDb.count('transport_lines')).toBe(2);
    });
  });

  describe('UUID generation', () => {
    it('should generate deterministic UUIDs from seed IDs', () => {
      const uuid1 = seedIdToUuid('line-test-a');
      const uuid2 = seedIdToUuid('line-test-a');
      const uuid3 = seedIdToUuid('line-test-b');

      expect(uuid1).toBe(uuid2);
      expect(uuid1).not.toBe(uuid3);

      // Should be valid UUID format
      expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  describe('Shared resources', () => {
    it('should not duplicate seasons when both lines reference same season', () => {
      simulateImport(testLineA, false);
      const seasonCountAfterA = mockDb.count('transport_seasons');

      simulateImport(testLineB, false);
      const seasonCountAfterB = mockDb.count('transport_seasons');

      // Both lines reference OFF season 2026, should only be one entry
      expect(seasonCountAfterA).toBe(1);
      expect(seasonCountAfterB).toBe(1);
    });

    it('should preserve stops when line using them is deleted and reimported', () => {
      simulateImport(testLineA, false);

      const stopA1Before = mockDb.select('transport_stops', (r) => r.id === seedIdToUuid('stop-test-a1'));
      expect(stopA1Before.length).toBe(1);

      // Reimport (replace) line A
      simulateImport(testLineAUpdated, false);

      // Stop should still exist
      const stopA1After = mockDb.select('transport_stops', (r) => r.id === seedIdToUuid('stop-test-a1'));
      expect(stopA1After.length).toBe(1);
    });
  });
});
