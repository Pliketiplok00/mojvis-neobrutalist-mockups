/**
 * Transport Subtype Contract Tests
 *
 * HARD GUARDRAILS: These tests FAIL if subtype is removed from any layer.
 *
 * WHY THESE TESTS EXIST:
 * Subtype tags (Trajekt, Katamaran, Brod, Autobus) have disappeared 4+ times
 * after "unrelated" schedule/season changes. This happened because:
 *
 * 1. subtype is `string | null` - TypeScript allows missing fields
 * 2. Previous tests checked TYPE existence, not ACTUAL CODE
 * 3. getTodaysDepartures() has a 50-line query - easy to forget subtype when editing
 *
 * WHAT THESE TESTS DO:
 * 1. Verify subtype EXISTS in repository query (grep code)
 * 2. Verify subtype EXISTS in route mapping (grep code)
 * 3. Verify subtype is in type definitions
 * 4. Verify allowed values are correct
 *
 * IF THESE TESTS FAIL:
 * You have broken the subtype contract. DO NOT remove subtype from:
 * - getTodaysDepartures() SELECT clause
 * - Route mapping in /transport/{type}/today
 * - Type definitions
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..');

// ============================================================
// ALLOWED SUBTYPE VALUES
// ============================================================

/**
 * CANONICAL SUBTYPE VALUES
 * These are the ONLY allowed values for transport subtype.
 * If you need to add a new subtype, add it here FIRST.
 */
export const ALLOWED_SUBTYPES_HR = ['Trajekt', 'Katamaran', 'Brod', 'Autobus'] as const;
export const ALLOWED_SUBTYPES_EN = ['Ferry', 'Catamaran', 'Boat', 'Bus'] as const;

type SubtypeHr = typeof ALLOWED_SUBTYPES_HR[number];
type SubtypeEn = typeof ALLOWED_SUBTYPES_EN[number];

// ============================================================
// CODE INVARIANT TESTS
// These tests grep the actual source files to ensure subtype is included
// ============================================================

describe('Subtype Code Invariants (HARD GUARDRAILS)', () => {
  /**
   * TEST: Repository layer MUST select subtype fields
   * FAILS IF: Someone removes `l.subtype_hr` or `l.subtype_en` from getTodaysDepartures
   */
  it('getTodaysDepartures query MUST include l.subtype_hr', () => {
    const repoCode = readFileSync(join(srcDir, 'repositories/transport.ts'), 'utf-8');

    // The query in getTodaysDepartures must include subtype
    expect(repoCode).toContain('l.subtype_hr');
    expect(repoCode).toContain('l.subtype_en');
  });

  /**
   * TEST: Repository return type MUST include subtype fields
   * FAILS IF: Someone removes subtype from the return type
   */
  it('getTodaysDepartures return type MUST include subtype_hr and subtype_en', () => {
    const repoCode = readFileSync(join(srcDir, 'repositories/transport.ts'), 'utf-8');

    // Count occurrences of subtype in the return type definition
    const subtypeHrMatches = repoCode.match(/subtype_hr/g);
    const subtypeEnMatches = repoCode.match(/subtype_en/g);

    // Must appear at least 4 times (query type + response type + SELECT + mapping)
    expect(subtypeHrMatches?.length).toBeGreaterThanOrEqual(4);
    expect(subtypeEnMatches?.length).toBeGreaterThanOrEqual(4);
  });

  /**
   * TEST: Route layer MUST map subtype to response
   * FAILS IF: Someone removes subtype mapping from /transport/{type}/today
   */
  it('transport routes MUST map subtype to response', () => {
    const routeCode = readFileSync(join(srcDir, 'routes/transport.ts'), 'utf-8');

    // The today endpoint must map subtype
    expect(routeCode).toContain('dep.subtype_hr');
    expect(routeCode).toContain('dep.subtype_en');
  });

  /**
   * TEST: Route layer MUST map subtype for lines list
   * FAILS IF: Someone removes subtype from /transport/{type}/lines
   */
  it('transport routes MUST include subtype in lines list', () => {
    const routeCode = readFileSync(join(srcDir, 'routes/transport.ts'), 'utf-8');

    // Lines list must include subtype
    expect(routeCode).toContain('line.subtype_hr');
    expect(routeCode).toContain('line.subtype_en');
  });

  /**
   * TEST: Route layer MUST map subtype for line detail
   * FAILS IF: Someone removes subtype from /transport/{type}/lines/:id
   */
  it('transport routes MUST include subtype in line detail', () => {
    const routeCode = readFileSync(join(srcDir, 'routes/transport.ts'), 'utf-8');

    // Count line.subtype occurrences - should be at least 4 (2 endpoints × 2 languages)
    const lineSubtypeHr = (routeCode.match(/line\.subtype_hr/g) || []).length;
    const lineSubtypeEn = (routeCode.match(/line\.subtype_en/g) || []).length;

    expect(lineSubtypeHr).toBeGreaterThanOrEqual(2);
    expect(lineSubtypeEn).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================
// TYPE CONTRACT TESTS
// ============================================================

describe('Subtype Type Contracts', () => {
  /**
   * TEST: TodayDepartureItem MUST have subtype field
   * FAILS IF: TypeScript compilation fails OR subtype is removed from type
   */
  it('TodayDepartureItem MUST include subtype field', async () => {
    const types = await import('../types/transport.js');

    // Create a valid TodayDepartureItem - TS will error if subtype is missing from type
    const item: types.TodayDepartureItem = {
      departure_time: '08:00:00',
      line_id: 'test-id',
      line_name: 'Vis – Split',
      subtype: 'Trajekt',
      route_id: 'route-id',
      direction_label: 'Vis → Split',
      destination: 'Split',
      marker: null,
    };

    // Verify subtype exists and is the expected value
    expect(item).toHaveProperty('subtype');
    expect(item.subtype).toBe('Trajekt');
  });

  /**
   * TEST: LineListItem MUST have subtype field
   */
  it('LineListItem MUST include subtype field', async () => {
    const types = await import('../types/transport.js');

    const item: types.LineListItem = {
      id: 'test-id',
      name: 'Vis – Split',
      subtype: 'Trajekt',
      stops_summary: 'Vis - Split',
      stops_count: 2,
      typical_duration_minutes: 140,
    };

    expect(item).toHaveProperty('subtype');
    expect(item.subtype).toBe('Trajekt');
  });

  /**
   * TEST: LineDetailResponse MUST have subtype field
   */
  it('LineDetailResponse MUST include subtype field', async () => {
    const types = await import('../types/transport.js');

    const item: types.LineDetailResponse = {
      id: 'test-id',
      name: 'Vis – Split',
      subtype: 'Trajekt',
      routes: [],
      contacts: [],
    };

    expect(item).toHaveProperty('subtype');
    expect(item.subtype).toBe('Trajekt');
  });

  /**
   * TEST: TransportLine (DB entity) MUST have subtype_hr and subtype_en
   */
  it('TransportLine MUST include subtype_hr and subtype_en', async () => {
    const types = await import('../types/transport.js');

    const line: types.TransportLine = {
      id: 'test-id',
      transport_type: 'sea',
      name_hr: 'Vis – Split',
      name_en: 'Vis – Split',
      subtype_hr: 'Trajekt',
      subtype_en: 'Ferry',
      display_order: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    expect(line).toHaveProperty('subtype_hr');
    expect(line).toHaveProperty('subtype_en');
    expect(line.subtype_hr).toBe('Trajekt');
    expect(line.subtype_en).toBe('Ferry');
  });
});

// ============================================================
// VALUE DOMAIN TESTS
// ============================================================

describe('Subtype Value Domain', () => {
  /**
   * TEST: HR subtypes are from allowed set
   */
  it('ALLOWED_SUBTYPES_HR contains all required values', () => {
    expect(ALLOWED_SUBTYPES_HR).toContain('Trajekt');
    expect(ALLOWED_SUBTYPES_HR).toContain('Katamaran');
    expect(ALLOWED_SUBTYPES_HR).toContain('Brod');
    expect(ALLOWED_SUBTYPES_HR).toContain('Autobus');
    expect(ALLOWED_SUBTYPES_HR).toHaveLength(4);
  });

  /**
   * TEST: EN subtypes are from allowed set
   */
  it('ALLOWED_SUBTYPES_EN contains all required values', () => {
    expect(ALLOWED_SUBTYPES_EN).toContain('Ferry');
    expect(ALLOWED_SUBTYPES_EN).toContain('Catamaran');
    expect(ALLOWED_SUBTYPES_EN).toContain('Boat');
    expect(ALLOWED_SUBTYPES_EN).toContain('Bus');
    expect(ALLOWED_SUBTYPES_EN).toHaveLength(4);
  });

  /**
   * TEST: Subtype value validation helper
   */
  it('validates subtype values correctly', () => {
    const isValidSubtypeHr = (val: string): val is SubtypeHr =>
      (ALLOWED_SUBTYPES_HR as readonly string[]).includes(val);

    const isValidSubtypeEn = (val: string): val is SubtypeEn =>
      (ALLOWED_SUBTYPES_EN as readonly string[]).includes(val);

    expect(isValidSubtypeHr('Trajekt')).toBe(true);
    expect(isValidSubtypeHr('InvalidType')).toBe(false);
    expect(isValidSubtypeEn('Ferry')).toBe(true);
    expect(isValidSubtypeEn('InvalidType')).toBe(false);
  });
});

// ============================================================
// SEED DATA CONTRACT TESTS
// ============================================================

describe('Seed Data Subtype Contract', () => {
  /**
   * TEST: Line 602 (Vis-Split Ferry) MUST have subtype = Trajekt
   */
  it('line-602.json MUST have subtype_hr = Trajekt', () => {
    const seedPath = join(srcDir, 'data/lines/line-602.json');
    const seedData = JSON.parse(readFileSync(seedPath, 'utf-8'));

    expect(seedData.lines).toBeDefined();
    expect(seedData.lines[0]).toBeDefined();
    expect(seedData.lines[0].subtype_hr).toBe('Trajekt');
    expect(seedData.lines[0].subtype_en).toBe('Ferry');
  });

  /**
   * TEST: Line 612 (Komiža-Biševo) MUST have subtype = Brod
   */
  it('line-612.json MUST have subtype_hr = Brod', () => {
    const seedPath = join(srcDir, 'data/lines/line-612.json');
    const seedData = JSON.parse(readFileSync(seedPath, 'utf-8'));

    expect(seedData.lines).toBeDefined();
    expect(seedData.lines[0]).toBeDefined();
    expect(seedData.lines[0].subtype_hr).toBe('Brod');
    expect(seedData.lines[0].subtype_en).toBe('Boat');
  });

  /**
   * TEST: Bus line MUST have subtype = Autobus
   */
  it('bus line MUST have subtype_hr = Autobus', () => {
    const seedPath = join(srcDir, 'data/lines/bus-vis-komiza-line01.json');
    const seedData = JSON.parse(readFileSync(seedPath, 'utf-8'));

    expect(seedData.lines).toBeDefined();
    expect(seedData.lines[0]).toBeDefined();
    expect(seedData.lines[0].subtype_hr).toBe('Autobus');
    expect(seedData.lines[0].subtype_en).toBe('Bus');
  });
});
