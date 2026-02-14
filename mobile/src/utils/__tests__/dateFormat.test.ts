/**
 * Date Format Utilities Tests
 *
 * Tests for all date formatting functions used across the app.
 */

import {
  formatDateISO,
  formatDateLocaleFull,
  formatTime,
  formatEventTime,
  formatDayWithDate,
  formatDateShort,
  formatDateTimeSlash,
  formatDisplayDate,
  formatDateTimeCroatian,
} from '../dateFormat';

describe('dateFormat utilities', () => {
  // Test fixtures - fixed dates for consistent tests
  const testDate = new Date(2026, 1, 14, 14, 30, 0); // Feb 14, 2026 14:30:00 local
  const testISOString = '2026-02-14T14:30:00.000Z';

  describe('formatDateISO', () => {
    it('should format date to YYYY-MM-DD', () => {
      const result = formatDateISO(testDate);
      expect(result).toBe('2026-02-14');
    });

    it('should pad single digit months', () => {
      const date = new Date(2026, 0, 15); // January
      expect(formatDateISO(date)).toBe('2026-01-15');
    });

    it('should pad single digit days', () => {
      const date = new Date(2026, 1, 5); // Feb 5
      expect(formatDateISO(date)).toBe('2026-02-05');
    });

    it('should handle year boundaries', () => {
      const newYear = new Date(2027, 0, 1);
      expect(formatDateISO(newYear)).toBe('2027-01-01');
    });

    it('should handle end of year', () => {
      const endOfYear = new Date(2026, 11, 31);
      expect(formatDateISO(endOfYear)).toBe('2026-12-31');
    });
  });

  describe('formatDateLocaleFull', () => {
    it('should format in Croatian by default', () => {
      const result = formatDateLocaleFull(testISOString, 'hr');
      expect(result).toContain('2026');
    });

    it('should format in English when locale is en', () => {
      const result = formatDateLocaleFull(testISOString, 'en');
      expect(result).toContain('2026');
      expect(result).toContain('February');
    });

    it('should default to Croatian', () => {
      const result = formatDateLocaleFull(testISOString);
      expect(result).toContain('2026');
    });

    it('should include weekday in output', () => {
      const result = formatDateLocaleFull(testISOString, 'en');
      // Feb 14, 2026 is a Saturday
      expect(result.toLowerCase()).toContain('saturday');
    });
  });

  describe('formatTime', () => {
    it('should format time in Croatian 24h format', () => {
      const result = formatTime(testISOString, 'hr');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should format time in English 12h format', () => {
      const result = formatTime(testISOString, 'en');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should default to Croatian format', () => {
      const result = formatTime(testISOString);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatEventTime', () => {
    it('should return allDayText for all-day events', () => {
      const result = formatEventTime(testISOString, true, 'Cjelodnevno', 'hr');
      expect(result).toBe('Cjelodnevno');
    });

    it('should return allDayText in English for all-day events', () => {
      const result = formatEventTime(testISOString, true, 'All day', 'en');
      expect(result).toBe('All day');
    });

    it('should format time for timed events in HR', () => {
      const result = formatEventTime(testISOString, false, 'Cjelodnevno', 'hr');
      expect(result).not.toBe('Cjelodnevno');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should format time for timed events in EN', () => {
      const result = formatEventTime(testISOString, false, 'All day', 'en');
      expect(result).not.toBe('All day');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatDayWithDate', () => {
    it('should format with Croatian day names and trailing period', () => {
      const result = formatDayWithDate(testDate, 'hr');
      expect(result).toContain('14');
      expect(result).toContain('02');
      expect(result).toContain('2026');
      expect(result.endsWith('.')).toBe(true);
    });

    it('should format with English day names without trailing period', () => {
      const result = formatDayWithDate(testDate, 'en');
      expect(result).toContain('14');
      expect(result).toContain('02');
      expect(result).toContain('2026');
      expect(result.endsWith('.')).toBe(false);
    });

    it('should include comma after day name', () => {
      const result = formatDayWithDate(testDate, 'hr');
      expect(result).toContain(',');
    });
  });

  describe('formatDateShort', () => {
    it('should format as DD/MM/YYYY', () => {
      const result = formatDateShort(testISOString);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should pad single digits', () => {
      const result = formatDateShort('2026-01-05T10:00:00.000Z');
      expect(result).toBe('05/01/2026');
    });
  });

  describe('formatDateTimeSlash', () => {
    it('should format as DD/MM/YYYY, HH:mm', () => {
      const result = formatDateTimeSlash(testISOString);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/);
    });

    it('should include comma separator', () => {
      const result = formatDateTimeSlash(testISOString);
      expect(result).toContain(', ');
    });
  });

  describe('formatDisplayDate', () => {
    it('should format as D.M.YYYY.', () => {
      const result = formatDisplayDate(testISOString);
      expect(result).toContain('.');
      expect(result).toContain('2026');
      expect(result.endsWith('.')).toBe(true);
    });

    it('should not pad day and month', () => {
      const result = formatDisplayDate('2026-01-05T10:00:00.000Z');
      // Should be 5.1.2026. not 05.01.2026.
      expect(result).toBe('5.1.2026.');
    });
  });

  describe('formatDateTimeCroatian', () => {
    it('should format as D.M.YYYY. HH:mm', () => {
      const result = formatDateTimeCroatian(testISOString);
      expect(result).toContain('2026');
      expect(result).toContain(':');
    });

    it('should not pad day and month', () => {
      const result = formatDateTimeCroatian('2026-01-05T09:05:00.000Z');
      // Day and month should not be padded
      expect(result).toMatch(/^\d{1,2}\.\d{1,2}\.\d{4}\. \d{2}:\d{2}$/);
    });

    it('should pad hours and minutes', () => {
      const result = formatDateTimeCroatian('2026-02-14T09:05:00.000Z');
      // Hours and minutes should be padded
      expect(result).toMatch(/\d{2}:\d{2}$/);
    });
  });
});
