/**
 * Health Endpoint Tests
 *
 * Phase 0: Basic server startup and health endpoint tests.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { healthRoutes } from '../routes/health.js';

describe('Health Routes', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify({ logger: false });
    await fastify.register(healthRoutes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('GET /health/live', () => {
    it('should return alive status', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/health/live',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ alive: true });
    });
  });

  describe('GET /health', () => {
    it('should return health status object', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/health',
      });

      // Note: Database won't be connected in test, so expect degraded
      interface HealthBody {
        status: string;
        timestamp: string;
        environment: string;
        checks: { server: boolean; database: boolean };
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body: HealthBody = response.json();

      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('environment');
      expect(body).toHaveProperty('checks');
      expect(body.checks).toHaveProperty('server');
      expect(body.checks.server).toBe(true);
    });
  });
});

describe('Environment Configuration', () => {
  it('should load config with sensible defaults', async () => {
    // This test verifies the config module loads without crashing
    // In test mode (set by vitest), defaults should be used
    const { env } = await import('../config/env.js');

    // Vitest sets NODE_ENV to 'test'
    expect(['development', 'test']).toContain(env.NODE_ENV);
    expect(typeof env.PORT).toBe('number');
    expect(typeof env.DB_HOST).toBe('string');
    expect(env.DB_HOST).toBe('localhost'); // Default value in dev/test
  });
});
