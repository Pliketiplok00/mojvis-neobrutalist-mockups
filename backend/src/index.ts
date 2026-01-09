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
 * Phase 6: Click & Fix (anonymous issue reporting with photos).
 * Phase 7: Push notifications (emergency hitno messages only).
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { env } from './config/env.js';
import { initDatabase, closeDatabase, tryEnableMockMode } from './lib/database.js';
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
import { clickFixRoutes } from './routes/click-fix.js';
import { adminClickFixRoutes } from './routes/admin-click-fix.js';
import { deviceRoutes } from './routes/device.js';
import { menuExtrasRoutes } from './routes/menu-extras.js';
import { adminMenuExtrasRoutes } from './routes/admin-menu-extras.js';

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

  // Static file serving for uploads (Phase 6: Click & Fix photos)
  await fastify.register(fastifyStatic, {
    root: join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    decorateReply: false,
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

  // Click & Fix routes (Phase 6)
  await fastify.register(clickFixRoutes);

  // Admin Click & Fix routes (Phase 6)
  await fastify.register(adminClickFixRoutes);

  // Device routes (Phase 7) - push token registration
  await fastify.register(deviceRoutes);

  // Menu extras routes (Server-driven menu)
  await fastify.register(menuExtrasRoutes);

  // Admin menu extras routes
  await fastify.register(adminMenuExtrasRoutes);
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
    try {
      await initDatabase();
    } catch (dbError) {
      console.error('[Server] Database connection failed:', (dbError as Error).message);
      // Only enable mock mode if explicitly configured
      const mockEnabled = tryEnableMockMode();
      if (!mockEnabled) {
        console.warn('[Server] Running in DEGRADED mode - admin APIs may fail');
      }
    }

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
    console.info(`[Server] Click & Fix: http://${env.HOST}:${env.PORT}/click-fix`);
    console.info(`[Server] Admin Click & Fix: http://${env.HOST}:${env.PORT}/admin/click-fix`);
    console.info(`[Server] Device (Push): http://${env.HOST}:${env.PORT}/device/push-token`);
    console.info(`[Server] Menu Extras: http://${env.HOST}:${env.PORT}/menu/extras`);
    console.info(`[Server] Admin Menu Extras: http://${env.HOST}:${env.PORT}/admin/menu/extras`);
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
