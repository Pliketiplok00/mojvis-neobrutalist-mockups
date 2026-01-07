/**
 * MOJ VIS Backend API
 *
 * Main entry point for the Fastify server.
 *
 * Phase 1: Inbox core & banners.
 * Phase 2: Events & reminders.
 * Phase 3: Static pages CMS.
 * Phase 4: Transport timetables (read-only).
 * Phase 5: Feedback (anonymous, device-based).
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { initDatabase, closeDatabase } from './lib/database.js';
import { healthRoutes } from './routes/health.js';
import { inboxRoutes } from './routes/inbox.js';
import { adminInboxRoutes } from './routes/admin-inbox.js';
import { eventRoutes } from './routes/events.js';
import { adminEventRoutes } from './routes/admin-events.js';
import { adminReminderRoutes } from './routes/admin-reminders.js';
import { staticPageRoutes } from './routes/static-pages.js';
import { adminStaticPageRoutes } from './routes/admin-static-pages.js';
import { roadTransportRoutes, seaTransportRoutes } from './routes/transport.js';
import { feedbackRoutes } from './routes/feedback.js';
import { adminFeedbackRoutes } from './routes/admin-feedback.js';

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

  // Event routes (Phase 2)
  await fastify.register(eventRoutes);

  // Admin event routes (Phase 2)
  await fastify.register(adminEventRoutes);

  // Admin reminder routes (Phase 2)
  await fastify.register(adminReminderRoutes);

  // Static page routes (Phase 3)
  await fastify.register(staticPageRoutes);

  // Admin static page routes (Phase 3)
  await fastify.register(adminStaticPageRoutes);

  // Transport routes (Phase 4) - read-only, no admin routes
  await fastify.register(roadTransportRoutes);
  await fastify.register(seaTransportRoutes);

  // Feedback routes (Phase 5)
  await fastify.register(feedbackRoutes);

  // Admin feedback routes (Phase 5)
  await fastify.register(adminFeedbackRoutes);
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
    console.info(`[Server] Events: http://${env.HOST}:${env.PORT}/events`);
    console.info(`[Server] Admin Inbox: http://${env.HOST}:${env.PORT}/admin/inbox`);
    console.info(`[Server] Admin Events: http://${env.HOST}:${env.PORT}/admin/events`);
    console.info(`[Server] Pages: http://${env.HOST}:${env.PORT}/pages`);
    console.info(`[Server] Admin Pages: http://${env.HOST}:${env.PORT}/admin/pages`);
    console.info(`[Server] Road Transport: http://${env.HOST}:${env.PORT}/transport/road/lines`);
    console.info(`[Server] Sea Transport: http://${env.HOST}:${env.PORT}/transport/sea/lines`);
    console.info(`[Server] Feedback: http://${env.HOST}:${env.PORT}/feedback`);
    console.info(`[Server] Admin Feedback: http://${env.HOST}:${env.PORT}/admin/feedback`);
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
