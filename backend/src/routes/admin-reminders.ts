/**
 * Admin Reminders Routes
 *
 * Admin endpoints for reminder management.
 *
 * Endpoints:
 * - POST /admin/reminders/generate - Trigger reminder generation
 *
 * TODO: Schedule automatic execution at 00:01 Europe/Zagreb.
 * This endpoint allows manual triggering for testing/backup.
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { generateReminders } from '../jobs/reminder-generation.js';

// eslint-disable-next-line @typescript-eslint/require-await
export async function adminReminderRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  // TODO: Add admin authentication middleware here

  /**
   * POST /admin/reminders/generate
   *
   * Manually trigger reminder generation.
   * Optionally specify a date (YYYY-MM-DD format).
   */
  fastify.post<{
    Querystring: { date?: string };
  }>('/admin/reminders/generate', async (request, reply) => {
    const { date } = request.query;

    console.info(`[Admin] POST /admin/reminders/generate date=${date ?? 'today'}`);

    try {
      const count = await generateReminders(date);

      return reply.status(200).send({
        success: true,
        reminders_generated: count,
        date: date ?? 'today (Europe/Zagreb)',
      });
    } catch (error) {
      console.error('[Admin] Error generating reminders:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
