/**
 * User Context Middleware Tests
 *
 * Unit tests for user context extraction and validation.
 * Package 4 Stage 12: Local users must have municipality set.
 */

import { describe, it, expect } from 'vitest';
import { extractUserContext, type UserContextResult } from '../middleware/user-context.js';
import type { FastifyRequest } from 'fastify';

/**
 * Create a mock FastifyRequest with specified headers
 */
function mockRequest(headers: Record<string, string | undefined>): FastifyRequest {
  return {
    headers: headers as Record<string, string>,
  } as FastifyRequest;
}

describe('User Context Middleware', () => {
  describe('extractUserContext', () => {
    describe('visitor mode', () => {
      it('should allow visitor without municipality', () => {
        const request = mockRequest({
          'x-device-id': 'device-123',
          'x-user-mode': 'visitor',
        });

        const result = extractUserContext(request);

        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.context.deviceId).toBe('device-123');
          expect(result.context.userMode).toBe('visitor');
          expect(result.context.municipality).toBeNull();
        }
      });

      it('should default to visitor when no mode specified', () => {
        const request = mockRequest({
          'x-device-id': 'device-123',
        });

        const result = extractUserContext(request);

        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.context.userMode).toBe('visitor');
          expect(result.context.municipality).toBeNull();
        }
      });

      it('should allow visitor with municipality set (ignored)', () => {
        const request = mockRequest({
          'x-device-id': 'device-123',
          'x-user-mode': 'visitor',
          'x-municipality': 'vis',
        });

        const result = extractUserContext(request);

        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.context.userMode).toBe('visitor');
          expect(result.context.municipality).toBe('vis');
        }
      });

      it('should default deviceId to anonymous when not provided', () => {
        const request = mockRequest({
          'x-user-mode': 'visitor',
        });

        const result = extractUserContext(request);

        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.context.deviceId).toBe('anonymous');
        }
      });
    });

    describe('local mode', () => {
      it('should allow local user with valid municipality (vis)', () => {
        const request = mockRequest({
          'x-device-id': 'device-123',
          'x-user-mode': 'local',
          'x-municipality': 'vis',
        });

        const result = extractUserContext(request);

        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.context.userMode).toBe('local');
          expect(result.context.municipality).toBe('vis');
        }
      });

      it('should allow local user with valid municipality (komiza)', () => {
        const request = mockRequest({
          'x-device-id': 'device-123',
          'x-user-mode': 'local',
          'x-municipality': 'komiza',
        });

        const result = extractUserContext(request);

        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.context.userMode).toBe('local');
          expect(result.context.municipality).toBe('komiza');
        }
      });

      it('should reject local user without municipality (Stage 12 guard)', () => {
        const request = mockRequest({
          'x-device-id': 'device-123',
          'x-user-mode': 'local',
        });

        const result = extractUserContext(request);

        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('MUNICIPALITY_REQUIRED');
          expect(result.error).toContain('municipality');
        }
      });

      it('should reject local user with empty municipality', () => {
        const request = mockRequest({
          'x-device-id': 'device-123',
          'x-user-mode': 'local',
          'x-municipality': '',
        });

        const result = extractUserContext(request);

        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('MUNICIPALITY_REQUIRED');
        }
      });

      it('should reject local user with invalid municipality', () => {
        const request = mockRequest({
          'x-device-id': 'device-123',
          'x-user-mode': 'local',
          'x-municipality': 'invalid',
        });

        const result = extractUserContext(request);

        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('MUNICIPALITY_REQUIRED');
        }
      });

      it('should reject local user with null municipality', () => {
        const request = mockRequest({
          'x-device-id': 'device-123',
          'x-user-mode': 'local',
          'x-municipality': undefined,
        });

        const result = extractUserContext(request);

        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.code).toBe('MUNICIPALITY_REQUIRED');
        }
      });
    });

    describe('error response format', () => {
      it('should return proper error structure for invalid context', () => {
        const request = mockRequest({
          'x-device-id': 'device-123',
          'x-user-mode': 'local',
        });

        const result = extractUserContext(request);

        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result).toHaveProperty('error');
          expect(result).toHaveProperty('code');
          expect(typeof result.error).toBe('string');
          expect(typeof result.code).toBe('string');
        }
      });
    });
  });
});
