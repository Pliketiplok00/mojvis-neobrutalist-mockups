/**
 * Transport Format Utility Tests
 *
 * Tests for transport line title formatting.
 */

import { formatLineTitle } from '../transportFormat';

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
});
