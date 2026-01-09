/**
 * Menu Extras Validation Tests
 *
 * Tests for menu extras validation rules:
 * - Valid payload accepted
 * - Invalid target rejected (not matching StaticPage:<slug>)
 * - Label length constraints
 * - Order must be integer
 */

import { describe, it, expect } from 'vitest';
import {
  validateMenuExtraInput,
  TARGET_REGEX,
  LABEL_MIN_LENGTH,
  LABEL_MAX_LENGTH,
} from '../types/menu-extras.js';
import type { MenuExtraCreateInput } from '../types/menu-extras.js';

describe('Menu Extras Validation', () => {
  describe('TARGET_REGEX', () => {
    it('should match valid StaticPage:<slug> targets', () => {
      expect(TARGET_REGEX.test('StaticPage:about')).toBe(true);
      expect(TARGET_REGEX.test('StaticPage:flora-fauna')).toBe(true);
      expect(TARGET_REGEX.test('StaticPage:visitor-info-2024')).toBe(true);
      expect(TARGET_REGEX.test('StaticPage:a')).toBe(true);
      expect(TARGET_REGEX.test('StaticPage:a-b-c')).toBe(true);
    });

    it('should reject invalid targets', () => {
      expect(TARGET_REGEX.test('StaticPage:')).toBe(false);
      expect(TARGET_REGEX.test('StaticPage:About')).toBe(false); // uppercase
      expect(TARGET_REGEX.test('StaticPage:flora_fauna')).toBe(false); // underscore
      expect(TARGET_REGEX.test('Screen:Home')).toBe(false); // not StaticPage
      expect(TARGET_REGEX.test('Home')).toBe(false); // no prefix
      expect(TARGET_REGEX.test('staticpage:about')).toBe(false); // wrong case
      expect(TARGET_REGEX.test('StaticPage:with spaces')).toBe(false);
    });
  });

  describe('validateMenuExtraInput', () => {
    const validInput: MenuExtraCreateInput = {
      label_hr: 'O nama',
      label_en: 'About us',
      target: 'StaticPage:about-us',
      display_order: 1,
    };

    describe('valid inputs', () => {
      it('should accept valid input with all fields', () => {
        const errors = validateMenuExtraInput(validInput);
        expect(errors).toHaveLength(0);
      });

      it('should accept valid input without optional fields', () => {
        const input: MenuExtraCreateInput = {
          label_hr: 'O nama',
          label_en: 'About us',
          target: 'StaticPage:about-us',
        };
        const errors = validateMenuExtraInput(input);
        expect(errors).toHaveLength(0);
      });

      it('should accept minimum length labels', () => {
        const input: MenuExtraCreateInput = {
          label_hr: 'Ab',
          label_en: 'Ab',
          target: 'StaticPage:x',
        };
        const errors = validateMenuExtraInput(input);
        expect(errors).toHaveLength(0);
      });

      it('should accept maximum length labels', () => {
        const input: MenuExtraCreateInput = {
          label_hr: 'A'.repeat(60),
          label_en: 'B'.repeat(60),
          target: 'StaticPage:test',
        };
        const errors = validateMenuExtraInput(input);
        expect(errors).toHaveLength(0);
      });
    });

    describe('label_hr validation', () => {
      it('should reject missing label_hr', () => {
        const input = { ...validInput, label_hr: undefined } as unknown as MenuExtraCreateInput;
        const errors = validateMenuExtraInput(input);
        expect(errors).toContainEqual({ field: 'label_hr', message: 'label_hr is required' });
      });

      it('should reject too short label_hr', () => {
        const input = { ...validInput, label_hr: 'A' };
        const errors = validateMenuExtraInput(input);
        expect(errors).toContainEqual({
          field: 'label_hr',
          message: `label_hr must be ${LABEL_MIN_LENGTH}-${LABEL_MAX_LENGTH} characters`,
        });
      });

      it('should reject too long label_hr', () => {
        const input = { ...validInput, label_hr: 'A'.repeat(61) };
        const errors = validateMenuExtraInput(input);
        expect(errors).toContainEqual({
          field: 'label_hr',
          message: `label_hr must be ${LABEL_MIN_LENGTH}-${LABEL_MAX_LENGTH} characters`,
        });
      });
    });

    describe('label_en validation', () => {
      it('should reject missing label_en', () => {
        const input = { ...validInput, label_en: undefined } as unknown as MenuExtraCreateInput;
        const errors = validateMenuExtraInput(input);
        expect(errors).toContainEqual({ field: 'label_en', message: 'label_en is required' });
      });

      it('should reject too short label_en', () => {
        const input = { ...validInput, label_en: 'A' };
        const errors = validateMenuExtraInput(input);
        expect(errors).toContainEqual({
          field: 'label_en',
          message: `label_en must be ${LABEL_MIN_LENGTH}-${LABEL_MAX_LENGTH} characters`,
        });
      });

      it('should reject too long label_en', () => {
        const input = { ...validInput, label_en: 'A'.repeat(61) };
        const errors = validateMenuExtraInput(input);
        expect(errors).toContainEqual({
          field: 'label_en',
          message: `label_en must be ${LABEL_MIN_LENGTH}-${LABEL_MAX_LENGTH} characters`,
        });
      });
    });

    describe('target validation', () => {
      it('should reject missing target', () => {
        const input = { ...validInput, target: undefined } as unknown as MenuExtraCreateInput;
        const errors = validateMenuExtraInput(input);
        expect(errors).toContainEqual({ field: 'target', message: 'target is required' });
      });

      it('should reject invalid target format', () => {
        const invalidTargets = [
          'Home',
          'Screen:Events',
          'StaticPage:',
          'StaticPage:About',
          'staticpage:about',
          'StaticPage:with spaces',
        ];

        for (const target of invalidTargets) {
          const input = { ...validInput, target };
          const errors = validateMenuExtraInput(input);
          expect(errors).toContainEqual({
            field: 'target',
            message: 'target must be in format StaticPage:<slug>',
          });
        }
      });
    });

    describe('display_order validation', () => {
      it('should accept zero order', () => {
        const input = { ...validInput, display_order: 0 };
        const errors = validateMenuExtraInput(input);
        expect(errors).toHaveLength(0);
      });

      it('should accept negative order', () => {
        const input = { ...validInput, display_order: -5 };
        const errors = validateMenuExtraInput(input);
        expect(errors).toHaveLength(0);
      });

      it('should reject non-integer order', () => {
        const input = { ...validInput, display_order: 1.5 };
        const errors = validateMenuExtraInput(input);
        expect(errors).toContainEqual({
          field: 'display_order',
          message: 'display_order must be an integer',
        });
      });

      it('should reject string order', () => {
        const input = { ...validInput, display_order: '1' as unknown as number };
        const errors = validateMenuExtraInput(input);
        expect(errors).toContainEqual({
          field: 'display_order',
          message: 'display_order must be an integer',
        });
      });
    });

    describe('multiple errors', () => {
      it('should report all validation errors at once', () => {
        const input: MenuExtraCreateInput = {
          label_hr: 'A',
          label_en: 'B',
          target: 'Invalid',
          display_order: 1.5,
        };
        const errors = validateMenuExtraInput(input);
        expect(errors.length).toBeGreaterThanOrEqual(3);
        expect(errors.some(e => e.field === 'label_hr')).toBe(true);
        expect(errors.some(e => e.field === 'label_en')).toBe(true);
        expect(errors.some(e => e.field === 'target')).toBe(true);
      });
    });
  });
});
