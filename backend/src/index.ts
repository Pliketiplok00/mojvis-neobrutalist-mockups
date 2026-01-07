/**
 * MOJ VIS Backend API
 *
 * Main entry point for the Fastify server.
 *
 * Phase 1: Inbox core & banners.
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { initDatabase, closeDatabase } from './lib/database.js';
import { healthRoutes } from './routes/health.js';
import { inboxRoutes } from './routes/inbox.js';
import { adminInboxRoutes } from './routes/admin-inbox.js';

// Create Fastify instance with logging
const fastify: FastifyInstance = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

/**
 * Register plugins and routes
 */
async function registerPlugins(): Promise<void> {
  // CORS - allow all origins in development
  await fastify.register(cors, {
    origin: env.NODE_ENV === 'development' ? true : false, // TODO: Configure for production
  });

  // Health routes
  await fastify.register(healthRoutes);

  // Inbox routes (Phase 1)
  await fastify.register(inboxRoutes);

  // Admin routes (Phase 1)
  await fastify.register(adminInboxRoutes);
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string): Promise<void> {
  console.info(`\n[Server] Received ${signal}, shutting down gracefully...`);

  try {
    await fastify.close();
    console.info('[Server] HTTP server closed');

    await closeDatabase();
    console.info('[Server] Database connection closed');

    console.info('[Server] Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('[Server] Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Start the server
 */
async function start(): Promise<void> {
  console.info('='.repeat(50));
  console.info('MOJ VIS Backend API - Starting...');
  console.info('='.repeat(50));
  console.info(`[Server] Environment: ${env.NODE_ENV}`);
  console.info(`[Server] Port: ${env.PORT}`);

  try {
    // Initialize database connection
    await initDatabase();

    // Register all plugins and routes
    await registerPlugins();

    // Start listening
    await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.info('='.repeat(50));
    console.info(`[Server] MOJ VIS API running at http://${env.HOST}:${env.PORT}`);
    console.info(`[Server] Health: http://${env.HOST}:${env.PORT}/health`);
    console.info(`[Server] Inbox: http://${env.HOST}:${env.PORT}/inbox`);
    console.info(`[Server] Banners: http://${env.HOST}:${env.PORT}/banners/active`);
    console.info(`[Server] Admin: http://${env.HOST}:${env.PORT}/admin/inbox`);
    console.info('='.repeat(50));
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
  process.exit(1);
});

// Start the server
void start();
