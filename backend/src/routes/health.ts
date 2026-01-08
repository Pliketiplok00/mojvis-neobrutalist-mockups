/**
 * Health Check Routes
 *
 * Provides endpoints for monitoring server and database health.
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { isDatabaseHealthy } from '../lib/database.js';
import { env } from '../config/env.js';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  environment: string;
  checks: {
    server: boolean;
    database: boolean;
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function healthRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  /**
   * GET /health
   *
   * Returns overall health status of the API.
   * Used by load balancers and monitoring systems.
   */
  fastify.get<{ Reply: HealthResponse }>('/health', async (_request, reply) => {
    const dbHealthy = await isDatabaseHealthy();

    const response: HealthResponse = {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      checks: {
        server: true,
        database: dbHealthy,
      },
    };

    // Return 503 if database is unhealthy
    const statusCode = dbHealthy ? 200 : 503;

    return reply.status(statusCode).send(response);
  });

  /**
   * GET /health/live
   *
   * Simple liveness check - just confirms server is responding.
   */
  fastify.get('/health/live', async (_request, reply) => {
    return reply.status(200).send({ alive: true });
  });

  /**
   * GET /health/ready
   *
   * Readiness check - confirms server is ready to handle requests.
   * Checks database connectivity.
   */
  fastify.get('/health/ready', async (_request, reply) => {
    const dbHealthy = await isDatabaseHealthy();

    if (!dbHealthy) {
      return reply.status(503).send({
        ready: false,
        reason: 'Database connection unavailable',
      });
    }

    return reply.status(200).send({ ready: true });
  });
}
