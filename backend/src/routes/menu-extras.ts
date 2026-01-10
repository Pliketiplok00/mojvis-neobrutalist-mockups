/**
 * Menu Extras Public Routes
 *
 * Public endpoint for fetching enabled menu extras.
 *
 * Routes:
 * - GET /menu/extras - List all enabled menu extras
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getEnabledExtras } from '../repositories/menu-extras.js';
import type {
  MenuExtrasPublicResponse,
  MenuExtraPublic,
  MenuExtra,
} from '../types/menu-extras.js';

/**
 * Convert MenuExtra to public response format
 */
function toPublicResponse(extra: MenuExtra): MenuExtraPublic {
  return {
    id: extra.id,
    labelHr: extra.label_hr,
    labelEn: extra.label_en,
    target: extra.target,
    order: extra.display_order,
  };
}

// eslint-disable-next-line @typescript-eslint/require-await -- Fastify plugin contract requires async
export async function menuExtrasRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /menu/extras
   * Returns all enabled menu extras, ordered by display_order ASC, created_at ASC
   */
  fastify.get('/menu/extras', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const extras = await getEnabledExtras();

      const response: MenuExtrasPublicResponse = {
        extras: extras.map(toPublicResponse),
      };

      return reply.send(response);
    } catch (error) {
      fastify.log.error(error, '[MenuExtras] Error fetching extras');
      return reply.status(500).send({ error: true, message: 'Internal server error' });
    }
  });
}
