/**
 * Hitno Validation Rules Tests (Phase 3)
 *
 * Tests for validateHitnoRules function ensuring:
 * - hitno messages require exactly one context tag
 * - hitno messages require both active_from and active_to
 */

import { describe, it, expect } from 'vitest';
import { validateHitnoRules } from '../types/inbox.js';
import type { InboxTag } from '../types/inbox.js';

describe('validateHitnoRules', () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  describe('non-hitno messages', () => {
    it('should pass validation for non-hitno messages without context tags', () => {
      const result = validateHitnoRules(['opcenito'], null, null);
      expect(result.valid).toBe(true);
    });

    it('should pass validation for non-hitno messages with dates', () => {
      const result = validateHitnoRules(['kultura'], now, tomorrow);
      expect(result.valid).toBe(true);
    });

    it('should pass validation for empty tags', () => {
      const result = validateHitnoRules([], null, null);
      expect(result.valid).toBe(true);
    });
  });

  describe('hitno with context tag', () => {
    it('should pass for hitno + promet with valid dates', () => {
      const result = validateHitnoRules(['hitno', 'promet'], now, tomorrow);
      expect(result.valid).toBe(true);
    });

    it('should pass for hitno + kultura with valid dates', () => {
      const result = validateHitnoRules(['hitno', 'kultura'], now, tomorrow);
      expect(result.valid).toBe(true);
    });

    it('should pass for hitno + opcenito with valid dates', () => {
      const result = validateHitnoRules(['hitno', 'opcenito'], now, tomorrow);
      expect(result.valid).toBe(true);
    });

    it('should pass for hitno + vis with valid dates', () => {
      const result = validateHitnoRules(['hitno', 'vis'], now, tomorrow);
      expect(result.valid).toBe(true);
    });

    it('should pass for hitno + komiza with valid dates', () => {
      const result = validateHitnoRules(['hitno', 'komiza'], now, tomorrow);
      expect(result.valid).toBe(true);
    });
  });

  describe('hitno without context tag', () => {
    it('should fail for hitno alone (no context tag)', () => {
      const tags: InboxTag[] = ['hitno'];
      const result = validateHitnoRules(tags, now, tomorrow);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('HITNO_MISSING_CONTEXT');
        expect(result.error).toContain('context tag');
      }
    });
  });

  describe('hitno with missing dates', () => {
    it('should fail for hitno + context without active_from', () => {
      const result = validateHitnoRules(['hitno', 'promet'], null, tomorrow);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('HITNO_MISSING_DATES');
        expect(result.error).toContain('active_from');
      }
    });

    it('should fail for hitno + context without active_to', () => {
      const result = validateHitnoRules(['hitno', 'promet'], now, null);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('HITNO_MISSING_DATES');
        expect(result.error).toContain('active_to');
      }
    });

    it('should fail for hitno + context without both dates', () => {
      const result = validateHitnoRules(['hitno', 'opcenito'], null, null);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('HITNO_MISSING_DATES');
      }
    });
  });

  describe('order independence', () => {
    it('should work regardless of tag order (context first)', () => {
      const result = validateHitnoRules(['promet', 'hitno'], now, tomorrow);
      expect(result.valid).toBe(true);
    });

    it('should work regardless of tag order (hitno first)', () => {
      const result = validateHitnoRules(['hitno', 'opcenito'], now, tomorrow);
      expect(result.valid).toBe(true);
    });
  });
});
