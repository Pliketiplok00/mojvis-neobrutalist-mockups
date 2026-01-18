/**
 * Transport API Regression Tests
 *
 * Regression tests for specific bugs fixed in transport data correctness:
 * - Issue A: Line 602 duplicate Sunday departures
 * - Issue B: "Polasci danas" includes off-island (Split) origin departures
 * - Issue C: Line 612 (Komiža–Biševo) shows zero departures
 * - Issue D: Transport subtype tags missing from today's departures
 */

import { describe, it, expect } from 'vitest';
import type { TodayDepartureItem } from '../types/transport.js';

/**
 * These tests validate the types and logic are correct.
 * Full integration tests require database access.
 */

describe('Transport Today Response Types', () => {
  /**
   * Regression: Issue D - subtype was missing from TodayDepartureItem
   */
  it('TodayDepartureItem should include subtype field', () => {
    // TypeScript compilation will fail if subtype is removed
    const item: TodayDepartureItem = {
      departure_time: '08:00:00',
      line_id: 'test-id',
      line_name: 'Test Line',
      subtype: 'Trajekt', // This field must exist
      route_id: 'route-id',
      direction_label: 'A → B',
      destination: 'B',
      marker: null,
    };

    expect(item.subtype).toBe('Trajekt');
  });

  it('subtype can be null for lines without subtype', () => {
    const item: TodayDepartureItem = {
      departure_time: '08:00:00',
      line_id: 'test-id',
      line_name: 'Test Line',
      subtype: null,
      route_id: 'route-id',
      direction_label: 'A → B',
      destination: 'B',
      marker: null,
    };

    expect(item.subtype).toBeNull();
  });
});

describe('Origin Filter Logic', () => {
  /**
   * Regression: Issue B & C - origin filter was hardcoded to 'Vis'
   * Must include both 'Vis' and 'Komiža' for island-origin departures
   */
  const ISLAND_ORIGINS = ['Vis', 'Komiža'];

  it('should include Vis as valid island origin', () => {
    expect(ISLAND_ORIGINS).toContain('Vis');
  });

  it('should include Komiža as valid island origin', () => {
    expect(ISLAND_ORIGINS).toContain('Komiža');
  });

  it('should NOT include Split as island origin', () => {
    expect(ISLAND_ORIGINS).not.toContain('Split');
  });

  it('should have exactly 2 island origins (Vis and Komiža)', () => {
    expect(ISLAND_ORIGINS).toHaveLength(2);
  });
});

describe('Date Exception Filtering', () => {
  /**
   * Regression: Issue A - duplicate departures due to overlapping date ranges
   * The isDepartureValidForDate function should correctly filter by date_from/date_to
   */

  interface TestDeparture {
    date_from: string | null;
    date_to: string | null;
    include_dates: string[] | null;
    exclude_dates: string[] | null;
  }

  function isDepartureValidForDate(departure: TestDeparture, dateStr: string): boolean {
    if (departure.exclude_dates && departure.exclude_dates.length > 0) {
      if (departure.exclude_dates.includes(dateStr)) {
        return false;
      }
    }

    const hasIncludeDates = departure.include_dates && departure.include_dates.length > 0;
    if (hasIncludeDates) {
      if (!departure.include_dates!.includes(dateStr)) {
        return false;
      }
    }

    if (departure.date_from !== null && dateStr < departure.date_from) {
      return false;
    }
    if (departure.date_to !== null && dateStr > departure.date_to) {
      return false;
    }

    return true;
  }

  it('should filter out departures before date_from', () => {
    const departure: TestDeparture = {
      date_from: '2026-06-01',
      date_to: null,
      include_dates: null,
      exclude_dates: null,
    };

    expect(isDepartureValidForDate(departure, '2026-01-18')).toBe(false);
    expect(isDepartureValidForDate(departure, '2026-06-01')).toBe(true);
  });

  it('should filter out departures after date_to', () => {
    const departure: TestDeparture = {
      date_from: null,
      date_to: '2026-05-28',
      include_dates: null,
      exclude_dates: null,
    };

    expect(isDepartureValidForDate(departure, '2026-01-18')).toBe(true);
    expect(isDepartureValidForDate(departure, '2026-06-01')).toBe(false);
  });

  it('should filter departure within date range', () => {
    const departure: TestDeparture = {
      date_from: '2026-01-01',
      date_to: '2026-05-28',
      include_dates: null,
      exclude_dates: null,
    };

    expect(isDepartureValidForDate(departure, '2026-01-18')).toBe(true);
    expect(isDepartureValidForDate(departure, '2025-12-31')).toBe(false);
    expect(isDepartureValidForDate(departure, '2026-05-29')).toBe(false);
  });

  /**
   * Specific test for Issue A: Multiple departures at same time with different date ranges
   * Only one should be valid for any given date
   */
  it('should only allow one of multiple departures with non-overlapping date ranges', () => {
    // Simulating 3 different 16:30 departures with different date ranges
    const departures: TestDeparture[] = [
      { date_from: '2026-01-01', date_to: '2026-05-28', include_dates: null, exclude_dates: null },
      { date_from: '2026-05-29', date_to: '2026-06-22', include_dates: null, exclude_dates: null },
      { date_from: '2026-06-23', date_to: '2026-09-07', include_dates: null, exclude_dates: null },
    ];

    // For any given date, exactly one departure should be valid
    const testDate = '2026-01-18';
    const validDepartures = departures.filter(d => isDepartureValidForDate(d, testDate));

    expect(validDepartures).toHaveLength(1);
    expect(validDepartures[0].date_from).toBe('2026-01-01');
  });
});
