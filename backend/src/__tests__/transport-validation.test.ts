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
