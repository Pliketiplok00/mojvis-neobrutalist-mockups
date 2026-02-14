/**
 * Transport Format Utility Tests
 *
 * Tests for transport line title formatting and duration display.
 */

import { formatLineTitle, formatDuration } from '../transportFormat';

describe('transportFormat', () => {
  describe('formatLineTitle', () => {
    it('should format line title with number', () => {
      expect(formatLineTitle('602', 'Vis', 'Split')).toBe('602: Vis-Split');
    });

    it('should format line title with different line numbers', () => {
      expect(formatLineTitle('659', 'Komiža', 'Vis')).toBe('659: Komiža-Vis');
    });

    it('should handle null line number', () => {
      expect(formatLineTitle(null, 'Vis', 'Split')).toBe(': Vis-Split');
    });

    it('should handle empty origin', () => {
      expect(formatLineTitle('602', '', 'Split')).toBe('602: -Split');
    });

    it('should handle empty destination', () => {
      expect(formatLineTitle('602', 'Vis', '')).toBe('602: Vis-');
    });

    it('should handle special characters in stop names', () => {
      expect(formatLineTitle('602', 'Vis (luka)', 'Split')).toBe('602: Vis (luka)-Split');
    });

    it('should handle Croatian diacritics', () => {
      expect(formatLineTitle('659', 'Komiža', 'Biševo')).toBe('659: Komiža-Biševo');
    });

    it('should handle long stop names', () => {
      const result = formatLineTitle('9602', 'Komiža', 'Porat (Biševo)');
      expect(result).toBe('9602: Komiža-Porat (Biševo)');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes under 60 as "X min"', () => {
      expect(formatDuration(45)).toBe('45 min');
      expect(formatDuration(30)).toBe('30 min');
      expect(formatDuration(1)).toBe('1 min');
    });

    it('should format exactly 60 minutes as "1h"', () => {
      expect(formatDuration(60)).toBe('1h');
    });

    it('should format exact hours without minutes', () => {
      expect(formatDuration(120)).toBe('2h');
      expect(formatDuration(180)).toBe('3h');
    });

    it('should format hours with remaining minutes', () => {
      expect(formatDuration(90)).toBe('1h 30min');
      expect(formatDuration(75)).toBe('1h 15min');
      expect(formatDuration(145)).toBe('2h 25min');
    });

    it('should handle edge case of 0 minutes', () => {
      expect(formatDuration(0)).toBe('0 min');
    });
  });
});
