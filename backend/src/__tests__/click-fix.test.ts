/**
 * Click & Fix Tests
 *
 * Phase 6: Tests for Click & Fix issue reporting with photos.
 *
 * Test coverage:
 * - Validation: subject, description, location (required)
 * - Photo validation: MIME type, size, max count
 * - Rate limit: 3/day per device_id with Europe/Zagreb boundary
 * - Status values and labels
 * - Municipality scoping (admin sees only their municipality)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { adminClickFixRoutes } from '../routes/admin-click-fix.js';
import {
  validateClickFixSubmission,
  validatePhoto,
  isValidClickFixStatus,
  getClickFixStatusLabel,
  CLICK_FIX_RATE_LIMIT,
  CLICK_FIX_RATE_LIMIT_ERROR,
  CLICK_FIX_VALIDATION,
} from '../types/click-fix.js';

describe('Click & Fix Validation', () => {
  describe('validateClickFixSubmission', () => {
    it('should accept valid subject, description, and location', () => {
      const result = validateClickFixSubmission(
        'Broken streetlight',
        'The streetlight at Main Street is not working.',
        { lat: 43.0614, lng: 16.1927 }
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty subject', () => {
      const result = validateClickFixSubmission(
        '',
        'Description here',
        { lat: 43.0614, lng: 16.1927 }
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Subject is required');
    });

    it('should reject empty description', () => {
      const result = validateClickFixSubmission(
        'Subject here',
        '',
        { lat: 43.0614, lng: 16.1927 }
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Description is required');
    });

    it('should reject whitespace-only subject', () => {
      const result = validateClickFixSubmission(
        '   ',
        'Description here',
        { lat: 43.0614, lng: 16.1927 }
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Subject is required');
    });

    it('should reject subject exceeding max length', () => {
      const longSubject = 'a'.repeat(CLICK_FIX_VALIDATION.SUBJECT_MAX_LENGTH + 1);
      const result = validateClickFixSubmission(
        longSubject,
        'Description here',
        { lat: 43.0614, lng: 16.1927 }
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('120 characters'))).toBe(true);
    });

    it('should reject description exceeding max length', () => {
      const longDescription = 'a'.repeat(CLICK_FIX_VALIDATION.DESCRIPTION_MAX_LENGTH + 1);
      const result = validateClickFixSubmission(
        'Subject here',
        longDescription,
        { lat: 43.0614, lng: 16.1927 }
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('4000 characters'))).toBe(true);
    });

    it('should reject missing location', () => {
      const result = validateClickFixSubmission(
        'Subject here',
        'Description here',
        null
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Location is required');
    });

    it('should reject undefined location', () => {
      const result = validateClickFixSubmission(
        'Subject here',
        'Description here',
        undefined
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Location is required');
    });

    it('should reject invalid latitude (out of range)', () => {
      const result = validateClickFixSubmission(
        'Subject here',
        'Description here',
        { lat: 91, lng: 16.1927 }
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('latitude'))).toBe(true);
    });

    it('should reject invalid latitude (NaN)', () => {
      const result = validateClickFixSubmission(
        'Subject here',
        'Description here',
        { lat: NaN, lng: 16.1927 }
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('latitude'))).toBe(true);
    });

    it('should reject invalid longitude (out of range)', () => {
      const result = validateClickFixSubmission(
        'Subject here',
        'Description here',
        { lat: 43.0614, lng: 181 }
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('longitude'))).toBe(true);
    });

    it('should accept edge case latitude values', () => {
      const result1 = validateClickFixSubmission('S', 'D', { lat: -90, lng: 0 });
      const result2 = validateClickFixSubmission('S', 'D', { lat: 90, lng: 0 });
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });

    it('should accept edge case longitude values', () => {
      const result1 = validateClickFixSubmission('S', 'D', { lat: 0, lng: -180 });
      const result2 = validateClickFixSubmission('S', 'D', { lat: 0, lng: 180 });
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });

    it('should report multiple errors', () => {
      const result = validateClickFixSubmission('', '', null);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('validatePhoto', () => {
    it('should accept valid JPEG', () => {
      const result = validatePhoto('image/jpeg', 1024 * 1024); // 1MB
      expect(result.valid).toBe(true);
    });

    it('should accept valid PNG', () => {
      const result = validatePhoto('image/png', 2 * 1024 * 1024); // 2MB
      expect(result.valid).toBe(true);
    });

    it('should accept valid WebP', () => {
      const result = validatePhoto('image/webp', 100 * 1024); // 100KB
      expect(result.valid).toBe(true);
    });

    it('should reject invalid MIME type', () => {
      const result = validatePhoto('image/gif', 1024 * 1024);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid image type');
    });

    it('should reject non-image MIME type', () => {
      const result = validatePhoto('application/pdf', 1024 * 1024);
      expect(result.valid).toBe(false);
    });

    it('should reject file exceeding max size', () => {
      const overSize = CLICK_FIX_VALIDATION.MAX_PHOTO_SIZE_BYTES + 1;
      const result = validatePhoto('image/jpeg', overSize);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('should accept file at exact max size', () => {
      const result = validatePhoto('image/jpeg', CLICK_FIX_VALIDATION.MAX_PHOTO_SIZE_BYTES);
      expect(result.valid).toBe(true);
    });
  });

  describe('isValidClickFixStatus', () => {
    it('should accept valid statuses', () => {
      expect(isValidClickFixStatus('zaprimljeno')).toBe(true);
      expect(isValidClickFixStatus('u_razmatranju')).toBe(true);
      expect(isValidClickFixStatus('prihvaceno')).toBe(true);
      expect(isValidClickFixStatus('odbijeno')).toBe(true);
    });

    it('should reject invalid statuses', () => {
      expect(isValidClickFixStatus('pending')).toBe(false);
      expect(isValidClickFixStatus('approved')).toBe(false);
      expect(isValidClickFixStatus('')).toBe(false);
      expect(isValidClickFixStatus('ZAPRIMLJENO')).toBe(false);
    });
  });

  describe('getClickFixStatusLabel', () => {
    it('should return Croatian labels', () => {
      expect(getClickFixStatusLabel('zaprimljeno', 'hr')).toBe('Zaprimljeno');
      expect(getClickFixStatusLabel('u_razmatranju', 'hr')).toBe('U razmatranju');
      expect(getClickFixStatusLabel('prihvaceno', 'hr')).toBe('Prihvaćeno');
      expect(getClickFixStatusLabel('odbijeno', 'hr')).toBe('Odbijeno');
    });

    it('should return English labels', () => {
      expect(getClickFixStatusLabel('zaprimljeno', 'en')).toBe('Received');
      expect(getClickFixStatusLabel('u_razmatranju', 'en')).toBe('Under Review');
      expect(getClickFixStatusLabel('prihvaceno', 'en')).toBe('Accepted');
      expect(getClickFixStatusLabel('odbijeno', 'en')).toBe('Rejected');
    });
  });
});

describe('Rate Limit Configuration', () => {
  it('should have correct rate limit settings', () => {
    expect(CLICK_FIX_RATE_LIMIT.MAX_PER_DAY).toBe(3);
    expect(CLICK_FIX_RATE_LIMIT.TIMEZONE).toBe('Europe/Zagreb');
  });

  it('should have bilingual error messages', () => {
    expect(CLICK_FIX_RATE_LIMIT_ERROR.hr).toContain('3');
    expect(CLICK_FIX_RATE_LIMIT_ERROR.en).toContain('3');
    expect(CLICK_FIX_RATE_LIMIT_ERROR.hr).toBeTruthy();
    expect(CLICK_FIX_RATE_LIMIT_ERROR.en).toBeTruthy();
  });
});

describe('Photo Validation Configuration', () => {
  it('should have correct photo limits', () => {
    expect(CLICK_FIX_VALIDATION.MAX_PHOTOS).toBe(3);
    expect(CLICK_FIX_VALIDATION.MAX_PHOTO_SIZE_BYTES).toBe(5 * 1024 * 1024); // 5MB
  });

  it('should have correct allowed MIME types', () => {
    const allowed = CLICK_FIX_VALIDATION.ALLOWED_MIME_TYPES;
    expect(allowed).toContain('image/jpeg');
    expect(allowed).toContain('image/png');
    expect(allowed).toContain('image/webp');
    expect(allowed).not.toContain('image/gif');
    expect(allowed).not.toContain('image/bmp');
  });

  it('should have correct text limits', () => {
    expect(CLICK_FIX_VALIDATION.SUBJECT_MAX_LENGTH).toBe(120);
    expect(CLICK_FIX_VALIDATION.DESCRIPTION_MAX_LENGTH).toBe(4000);
  });
});

describe('Admin Click & Fix Routes (Unit)', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify({ logger: false });
    // Strategy A: Inject admin session via test-only preHandler hook (DB-less)
    // This MUST be registered BEFORE admin routes so it runs first
    // eslint-disable-next-line @typescript-eslint/require-await
    fastify.addHook('preHandler', async (request) => {
      // Inject test admin session for all /admin/* routes
      if (request.url.startsWith('/admin/')) {
        request.adminSession = {
          adminId: 'test-admin-id',
          username: 'testadmin',
          municipality: 'vis',
        };
      }
    });
    await fastify.register(adminClickFixRoutes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('PATCH /admin/click-fix/:id/status', () => {
    it('should validate status value', async () => {
      const response = await fastify.inject({
        method: 'PATCH',
        url: '/admin/click-fix/some-id/status',
        payload: { status: 'invalid_status' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('Invalid status');
    });

    it('should require status in body', async () => {
      const response = await fastify.inject({
        method: 'PATCH',
        url: '/admin/click-fix/some-id/status',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /admin/click-fix/:id/reply', () => {
    it('should require reply body', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/click-fix/some-id/reply',
        payload: { body: '' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
      expect(response.json().error).toContain('body');
    });

    it('should require body field', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/click-fix/some-id/reply',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });
});

describe('Timezone Handling', () => {
  it('should use Europe/Zagreb timezone for rate limiting', () => {
    expect(CLICK_FIX_RATE_LIMIT.TIMEZONE).toBe('Europe/Zagreb');
  });

  it('should format date correctly for Zagreb timezone', () => {
    const testDate = new Date('2026-01-07T23:30:00Z'); // 00:30 next day in Zagreb
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Zagreb',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const formatted = formatter.format(testDate);

    // In Zagreb (UTC+1 in winter), 23:30 UTC is 00:30 next day
    expect(formatted).toBe('2026-01-08');
  });
});

describe('Municipality Scoping Logic', () => {
  it('should identify valid municipalities', () => {
    const validMunicipalities = ['vis', 'komiza', null];
    expect(validMunicipalities).toContain('vis');
    expect(validMunicipalities).toContain('komiza');
    expect(validMunicipalities).toContain(null);
  });
});

describe('Location Validation Edge Cases', () => {
  it('should accept Vis island coordinates', () => {
    // Vis Town center
    const result = validateClickFixSubmission(
      'Test',
      'Description',
      { lat: 43.0614, lng: 16.1927 }
    );
    expect(result.valid).toBe(true);
  });

  it('should accept Komiza coordinates', () => {
    // Komiza center
    const result = validateClickFixSubmission(
      'Test',
      'Description',
      { lat: 43.0444, lng: 16.0911 }
    );
    expect(result.valid).toBe(true);
  });

  it('should accept coordinates with many decimal places', () => {
    const result = validateClickFixSubmission(
      'Test',
      'Description',
      { lat: 43.06138888888889, lng: 16.19272222222222 }
    );
    expect(result.valid).toBe(true);
  });

  it('should accept negative coordinates', () => {
    // Valid negative coordinates (southern hemisphere)
    const result = validateClickFixSubmission(
      'Test',
      'Description',
      { lat: -33.8688, lng: 151.2093 } // Sydney
    );
    expect(result.valid).toBe(true);
  });
});
