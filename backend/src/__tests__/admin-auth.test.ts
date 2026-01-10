/**
 * Admin Auth Routes Tests
 *
 * Tests for /admin/auth/* endpoints.
 * Uses Strategy A: DB-less session injection via preHandler hook.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import { adminAuthRoutes } from '../routes/admin-auth.js';

describe('Admin Auth Routes', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify({ logger: false });
    await fastify.register(adminAuthRoutes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('GET /admin/auth/me', () => {
    it('should return 401 without session cookie', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/admin/auth/me',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.ok).toBe(false);
      expect(body.code).toBe('UNAUTHENTICATED');
    });

    // NOTE: Testing invalid session cookie requires DB connection.
    // This is covered by integration tests with real DB.
    // Unit tests only verify the no-cookie case.
  });

  describe('POST /admin/auth/login', () => {
    it('should return 400 when missing credentials', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/auth/login',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.ok).toBe(false);
      expect(body.code).toBe('MISSING_CREDENTIALS');
    });

    it('should return 400 when missing password', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/auth/login',
        payload: { username: 'testuser' },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.ok).toBe(false);
    });
  });

  describe('POST /admin/auth/logout', () => {
    it('should return 200 even without session (idempotent)', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/auth/logout',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.ok).toBe(true);
    });
  });
});
