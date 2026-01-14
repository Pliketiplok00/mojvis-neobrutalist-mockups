/**
 * Transport Validation Tests
 *
 * Phase 4: Tests for transport data validation.
 *
 * Key test: Season overlap detection must FAIL if seasons overlap.
 */

import { describe, it, expect } from 'vitest';
import {
  validateSeasonsNoOverlap,
  isValidTransportType,
  isValidDayType,
  isValidSeasonType,
  type SeasonType,
} from '../types/transport.js';

describe('Transport Type Validation', () => {
  describe('isValidTransportType', () => {
    it('should accept "road"', () => {
      expect(isValidTransportType('road')).toBe(true);
    });

    it('should accept "sea"', () => {
      expect(isValidTransportType('sea')).toBe(true);
    });

    it('should reject invalid types', () => {
      expect(isValidTransportType('air')).toBe(false);
      expect(isValidTransportType('rail')).toBe(false);
      expect(isValidTransportType('')).toBe(false);
    });
  });

  describe('isValidDayType', () => {
    it('should accept all explicit weekdays', () => {
      expect(isValidDayType('MON')).toBe(true);
      expect(isValidDayType('TUE')).toBe(true);
      expect(isValidDayType('WED')).toBe(true);
      expect(isValidDayType('THU')).toBe(true);
      expect(isValidDayType('FRI')).toBe(true);
      expect(isValidDayType('SAT')).toBe(true);
      expect(isValidDayType('SUN')).toBe(true);
    });

    it('should accept PRAZNIK', () => {
      expect(isValidDayType('PRAZNIK')).toBe(true);
    });

    it('should reject generic WEEKDAY (per spec)', () => {
      expect(isValidDayType('WEEKDAY')).toBe(false);
    });

    it('should reject invalid types', () => {
      expect(isValidDayType('MONDAY')).toBe(false);
      expect(isValidDayType('')).toBe(false);
      expect(isValidDayType('mon')).toBe(false);
    });
  });

  describe('isValidSeasonType', () => {
    it('should accept all season types', () => {
      expect(isValidSeasonType('OFF')).toBe(true);
      expect(isValidSeasonType('PRE')).toBe(true);
      expect(isValidSeasonType('HIGH')).toBe(true);
      expect(isValidSeasonType('POST')).toBe(true);
    });

    it('should reject invalid types', () => {
      expect(isValidSeasonType('SUMMER')).toBe(false);
      expect(isValidSeasonType('WINTER')).toBe(false);
      expect(isValidSeasonType('')).toBe(false);
    });
  });
});

describe('Season Overlap Validation', () => {
  /**
   * Helper to create a season object for testing
   */
  function makeSeason(
    seasonType: SeasonType,
    year: number,
    dateFrom: string,
    dateTo: string
  ) {
    return {
      season_type: seasonType,
      year,
      date_from: new Date(dateFrom),
      date_to: new Date(dateTo),
    };
  }

  describe('validateSeasonsNoOverlap', () => {
    it('should return empty errors for non-overlapping seasons', () => {
      const seasons = [
        makeSeason('OFF', 2026, '2026-01-01', '2026-04-30'),
        makeSeason('PRE', 2026, '2026-05-01', '2026-06-14'),
        makeSeason('HIGH', 2026, '2026-06-15', '2026-09-15'),
        makeSeason('POST', 2026, '2026-09-16', '2026-12-31'),
      ];

      const errors = validateSeasonsNoOverlap(seasons);
      expect(errors).toEqual([]);
    });

    it('should return empty errors for adjacent seasons (no gap, no overlap)', () => {
      // Seasons that are exactly adjacent (one ends on day X, next starts on day X+1)
      const seasons = [
        makeSeason('OFF', 2026, '2026-01-01', '2026-03-31'),
        makeSeason('PRE', 2026, '2026-04-01', '2026-05-31'),
      ];

      const errors = validateSeasonsNoOverlap(seasons);
      expect(errors).toEqual([]);
    });

    it('should FAIL with errors when seasons overlap', () => {
      // CRITICAL TEST: Must detect overlapping seasons
      const seasons = [
        makeSeason('OFF', 2026, '2026-01-01', '2026-05-01'), // ends May 1
        makeSeason('PRE', 2026, '2026-05-01', '2026-06-14'), // starts May 1 - OVERLAP!
      ];

      const errors = validateSeasonsNoOverlap(seasons);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('overlap');
    });

    it('should FAIL when seasons completely contain each other', () => {
      const seasons = [
        makeSeason('OFF', 2026, '2026-01-01', '2026-12-31'), // full year
        makeSeason('HIGH', 2026, '2026-06-01', '2026-08-31'), // within OFF
      ];

      const errors = validateSeasonsNoOverlap(seasons);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should FAIL when seasons have partial overlap', () => {
      const seasons = [
        makeSeason('PRE', 2026, '2026-05-01', '2026-06-20'),
        makeSeason('HIGH', 2026, '2026-06-15', '2026-09-15'), // starts before PRE ends
      ];

      const errors = validateSeasonsNoOverlap(seasons);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('PRE');
      expect(errors[0]).toContain('HIGH');
    });

    it('should validate seasons independently per year', () => {
      // Same dates in different years should be allowed
      const seasons = [
        makeSeason('HIGH', 2026, '2026-06-15', '2026-09-15'),
        makeSeason('HIGH', 2027, '2027-06-15', '2027-09-15'),
      ];

      const errors = validateSeasonsNoOverlap(seasons);
      expect(errors).toEqual([]);
    });

    it('should FAIL only for the year with overlap', () => {
      const seasons = [
        // 2026: valid
        makeSeason('OFF', 2026, '2026-01-01', '2026-04-30'),
        makeSeason('PRE', 2026, '2026-05-01', '2026-06-14'),
        // 2027: invalid (overlap)
        makeSeason('OFF', 2027, '2027-01-01', '2027-05-15'), // ends May 15
        makeSeason('PRE', 2027, '2027-05-01', '2027-06-14'), // starts May 1 - OVERLAP!
      ];

      const errors = validateSeasonsNoOverlap(seasons);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('2027');
    });

    it('should handle empty seasons array', () => {
      const errors = validateSeasonsNoOverlap([]);
      expect(errors).toEqual([]);
    });

    it('should handle single season', () => {
      const seasons = [makeSeason('HIGH', 2026, '2026-06-15', '2026-09-15')];
      const errors = validateSeasonsNoOverlap(seasons);
      expect(errors).toEqual([]);
    });

    it('should detect multiple overlaps in same year', () => {
      const seasons = [
        makeSeason('OFF', 2026, '2026-01-01', '2026-05-10'),
        makeSeason('PRE', 2026, '2026-05-01', '2026-06-20'), // overlaps with OFF
        makeSeason('HIGH', 2026, '2026-06-15', '2026-09-15'), // overlaps with PRE
      ];

      const errors = validateSeasonsNoOverlap(seasons);
      expect(errors.length).toBe(2); // Two overlaps: OFF/PRE and PRE/HIGH
    });
  });
});

describe('Date Exception Filtering', () => {
  /**
   * Helper to create a minimal departure object for testing date exception logic.
   * Note: This tests the filtering logic directly, not through the repository.
   */
  interface TestDeparture {
    date_from: string | null;
    date_to: string | null;
    include_dates: string[] | null;
    exclude_dates: string[] | null;
  }

  /**
   * Replicates the isDepartureValidForDate logic for testing.
   * This is a direct copy of the logic from repositories/transport.ts
   * to allow unit testing without database dependency.
   */
  function isDepartureValidForDate(departure: TestDeparture, dateStr: string): boolean {
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
    if (departure.date_from !== null && dateStr < departure.date_from) {
      return false;
    }
    if (departure.date_to !== null && dateStr > departure.date_to) {
      return false;
    }

    return true;
  }

  describe('exclude_dates', () => {
    it('should remove service on excluded dates (e.g. Christmas)', () => {
      const departure: TestDeparture = {
        date_from: null,
        date_to: null,
        include_dates: null,
        exclude_dates: ['2026-12-25', '2026-01-01'],
      };

      expect(isDepartureValidForDate(departure, '2026-12-25')).toBe(false);
      expect(isDepartureValidForDate(departure, '2026-01-01')).toBe(false);
      expect(isDepartureValidForDate(departure, '2026-12-24')).toBe(true);
      expect(isDepartureValidForDate(departure, '2026-06-15')).toBe(true);
    });

    it('should override include_dates and date range', () => {
      const departure: TestDeparture = {
        date_from: '2026-01-01',
        date_to: '2026-12-31',
        include_dates: ['2026-12-25'],
        exclude_dates: ['2026-12-25'],
      };

      // Even though 12-25 is in include_dates and within range, exclude wins
      expect(isDepartureValidForDate(departure, '2026-12-25')).toBe(false);
    });
  });

  describe('include_dates (one-off service)', () => {
    it('should allow service ONLY on included dates', () => {
      const departure: TestDeparture = {
        date_from: null,
        date_to: null,
        include_dates: ['2026-07-04', '2026-08-05'],
        exclude_dates: null,
      };

      expect(isDepartureValidForDate(departure, '2026-07-04')).toBe(true);
      expect(isDepartureValidForDate(departure, '2026-08-05')).toBe(true);
      expect(isDepartureValidForDate(departure, '2026-07-05')).toBe(false);
      expect(isDepartureValidForDate(departure, '2026-06-01')).toBe(false);
    });

    it('should work with date_from/date_to as additional constraint', () => {
      const departure: TestDeparture = {
        date_from: '2026-07-01',
        date_to: '2026-07-31',
        include_dates: ['2026-06-15', '2026-07-15'], // June date is outside range
        exclude_dates: null,
      };

      // 06-15 is in include_dates but outside date range -> invalid
      expect(isDepartureValidForDate(departure, '2026-06-15')).toBe(false);
      // 07-15 is in include_dates AND within range -> valid
      expect(isDepartureValidForDate(departure, '2026-07-15')).toBe(true);
    });
  });

  describe('date_from/date_to (date range)', () => {
    it('should constrain departure to date range', () => {
      const departure: TestDeparture = {
        date_from: '2026-06-01',
        date_to: '2026-08-31',
        include_dates: null,
        exclude_dates: null,
      };

      expect(isDepartureValidForDate(departure, '2026-05-31')).toBe(false);
      expect(isDepartureValidForDate(departure, '2026-06-01')).toBe(true);
      expect(isDepartureValidForDate(departure, '2026-07-15')).toBe(true);
      expect(isDepartureValidForDate(departure, '2026-08-31')).toBe(true);
      expect(isDepartureValidForDate(departure, '2026-09-01')).toBe(false);
    });

    it('should handle open-ended ranges (only date_from)', () => {
      const departure: TestDeparture = {
        date_from: '2026-06-01',
        date_to: null,
        include_dates: null,
        exclude_dates: null,
      };

      expect(isDepartureValidForDate(departure, '2026-05-31')).toBe(false);
      expect(isDepartureValidForDate(departure, '2026-06-01')).toBe(true);
      expect(isDepartureValidForDate(departure, '2030-12-31')).toBe(true);
    });

    it('should handle open-ended ranges (only date_to)', () => {
      const departure: TestDeparture = {
        date_from: null,
        date_to: '2026-08-31',
        include_dates: null,
        exclude_dates: null,
      };

      expect(isDepartureValidForDate(departure, '2020-01-01')).toBe(true);
      expect(isDepartureValidForDate(departure, '2026-08-31')).toBe(true);
      expect(isDepartureValidForDate(departure, '2026-09-01')).toBe(false);
    });
  });

  describe('no constraints (backward compatibility)', () => {
    it('should allow all dates when no exception fields are set', () => {
      const departure: TestDeparture = {
        date_from: null,
        date_to: null,
        include_dates: null,
        exclude_dates: null,
      };

      expect(isDepartureValidForDate(departure, '2020-01-01')).toBe(true);
      expect(isDepartureValidForDate(departure, '2026-06-15')).toBe(true);
      expect(isDepartureValidForDate(departure, '2030-12-31')).toBe(true);
    });

    it('should treat empty arrays as no constraint', () => {
      const departure: TestDeparture = {
        date_from: null,
        date_to: null,
        include_dates: [],
        exclude_dates: [],
      };

      expect(isDepartureValidForDate(departure, '2026-06-15')).toBe(true);
    });
  });

  describe('combined rules', () => {
    it('should handle all constraints together', () => {
      // Complex scenario: range + include + exclude
      const departure: TestDeparture = {
        date_from: '2026-07-01',
        date_to: '2026-07-31',
        include_dates: ['2026-07-04', '2026-07-14'],
        exclude_dates: ['2026-07-04'], // 4th excluded even though it's in include
      };

      // 07-04: in include, in range, but in exclude -> false
      expect(isDepartureValidForDate(departure, '2026-07-04')).toBe(false);
      // 07-14: in include, in range, not excluded -> true
      expect(isDepartureValidForDate(departure, '2026-07-14')).toBe(true);
      // 07-15: not in include -> false (include_dates is primary allow-list)
      expect(isDepartureValidForDate(departure, '2026-07-15')).toBe(false);
    });
  });
});

describe('Seed Data Validation Integration', () => {
  it('should validate actual seed data has no overlapping seasons', async () => {
    // This test reads the actual seed data and validates it
    // It will FAIL if someone introduces overlapping seasons in seed data
    try {
      const { default: seedData } = (await import(
        '../data/seed/transport-seed.json',
        { with: { type: 'json' } }
      )) as { default: { seasons: Array<{ season_type: SeasonType; year: number; date_from: string; date_to: string }> } };

      const seasons = seedData.seasons.map((s) => ({
        season_type: s.season_type,
        year: s.year,
        date_from: new Date(s.date_from),
        date_to: new Date(s.date_to),
      }));

      const errors = validateSeasonsNoOverlap(seasons);
      expect(errors).toEqual([]);
    } catch (err) {
      // If seed file doesn't exist yet, skip this test
      if ((err as NodeJS.ErrnoException).code === 'ERR_MODULE_NOT_FOUND') {
        console.warn('Seed data not found, skipping validation test');
        return;
      }
      throw err;
    }
  });
});
