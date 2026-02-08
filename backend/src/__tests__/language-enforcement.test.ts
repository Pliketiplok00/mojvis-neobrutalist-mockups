/**
 * Language Enforcement Tests
 *
 * Package 3 Stage 9: Tests for EN requirement enforcement.
 *
 * Rule: EN is mandatory everywhere EXCEPT municipal-only messages (vis OR komiza tag).
 *
 * Test coverage:
 * - validateLanguageRequirement function
 * - Non-municipal messages require EN (title_en AND body_en)
 * - Municipal messages (vis or komiza) can be HR-only
 * - Whitespace-only strings count as empty
 */

import { describe, it, expect } from 'vitest';
import { validateLanguageRequirement } from '../types/inbox.js';

describe('Language Enforcement', () => {
  describe('validateLanguageRequirement', () => {
    describe('non-municipal messages (EN required)', () => {
      it('should reject missing EN for opcenito tag', () => {
        const result = validateLanguageRequirement(['opcenito'], null, null);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should reject missing EN for promet tag', () => {
        const result = validateLanguageRequirement(['promet'], null, null);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should reject missing EN for kultura tag', () => {
        const result = validateLanguageRequirement(['kultura'], null, null);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should reject missing EN for hitno + opcenito tags', () => {
        const result = validateLanguageRequirement(['hitno', 'opcenito'], null, null);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should reject missing EN for hitno + promet tags', () => {
        const result = validateLanguageRequirement(['hitno', 'promet'], null, null);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should reject when only title_en is provided', () => {
        const result = validateLanguageRequirement(['opcenito'], 'Title EN', null);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should reject when only body_en is provided', () => {
        const result = validateLanguageRequirement(['opcenito'], null, 'Body EN');
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should allow non-municipal message with both EN fields', () => {
        const result = validateLanguageRequirement(['opcenito'], 'Title EN', 'Body EN');
        expect(result.valid).toBe(true);
      });

      it('should allow promet + hitno with both EN fields', () => {
        const result = validateLanguageRequirement(['promet', 'hitno'], 'Urgent Notice', 'Details here');
        expect(result.valid).toBe(true);
      });
    });

    describe('municipal messages (EN optional)', () => {
      it('should allow vis message without EN', () => {
        const result = validateLanguageRequirement(['vis'], null, null);
        expect(result.valid).toBe(true);
      });

      it('should allow komiza message without EN', () => {
        const result = validateLanguageRequirement(['komiza'], null, null);
        expect(result.valid).toBe(true);
      });

      it('should allow vis + hitno message without EN', () => {
        const result = validateLanguageRequirement(['vis', 'hitno'], null, null);
        expect(result.valid).toBe(true);
      });

      it('should allow komiza + hitno message without EN', () => {
        const result = validateLanguageRequirement(['komiza', 'hitno'], null, null);
        expect(result.valid).toBe(true);
      });

      it('should allow vis message with EN (optional but accepted)', () => {
        const result = validateLanguageRequirement(['vis'], 'Title EN', 'Body EN');
        expect(result.valid).toBe(true);
      });

      it('should allow komiza message with EN (optional but accepted)', () => {
        const result = validateLanguageRequirement(['komiza'], 'Title EN', 'Body EN');
        expect(result.valid).toBe(true);
      });

      it('should allow vis message with partial EN', () => {
        // Municipal messages don't require EN, so partial is fine
        const result = validateLanguageRequirement(['vis'], 'Title EN', null);
        expect(result.valid).toBe(true);
      });
    });

    describe('whitespace handling', () => {
      it('should treat whitespace-only title_en as empty', () => {
        const result = validateLanguageRequirement(['opcenito'], '   ', 'Body EN');
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should treat whitespace-only body_en as empty', () => {
        const result = validateLanguageRequirement(['opcenito'], 'Title EN', '   ');
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should treat tabs and newlines as empty', () => {
        const result = validateLanguageRequirement(['promet'], '\t\n', '\t\n');
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should accept text with leading/trailing whitespace', () => {
        const result = validateLanguageRequirement(['kultura'], '  Title EN  ', '  Body EN  ');
        expect(result.valid).toBe(true);
      });
    });

    describe('empty string handling', () => {
      it('should treat empty string title_en as missing', () => {
        const result = validateLanguageRequirement(['opcenito'], '', 'Body EN');
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should treat empty string body_en as missing', () => {
        const result = validateLanguageRequirement(['opcenito'], 'Title EN', '');
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });
    });

    describe('error messages', () => {
      it('should return Croatian error message', () => {
        const result = validateLanguageRequirement(['opcenito'], null, null);
        if (!result.valid) {
          expect(result.error).toContain('Engleski prijevod');
          expect(result.error).toContain('title_en');
          expect(result.error).toContain('body_en');
        }
      });

      it('should return EN_REQUIRED code', () => {
        const result = validateLanguageRequirement(['promet'], null, null);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });
    });

    describe('edge cases', () => {
      it('should handle undefined as null', () => {
        const result = validateLanguageRequirement(['opcenito'], undefined, undefined);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });

      it('should handle mixed undefined and null', () => {
        const result = validateLanguageRequirement(['promet'], undefined, null);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('EN_REQUIRED');
        }
      });
    });
  });
});
