/**
 * Admin Menu Extras Routes
 *
 * Admin endpoints for managing menu extras.
 *
 * Routes:
 * - GET /admin/menu/extras - List all menu extras
 * - POST /admin/menu/extras - Create new menu extra
 * - PATCH /admin/menu/extras/:id - Update menu extra
 * - DELETE /admin/menu/extras/:id - Delete menu extra
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllExtras,
  getExtraById,
  createExtra,
  updateExtra,
  deleteExtra,
  countExtras,
} from '../repositories/menu-extras.js';
import {
  validateMenuExtraInput,
  TARGET_REGEX,
  LABEL_MIN_LENGTH,
  LABEL_MAX_LENGTH,
} from '../types/menu-extras.js';
import type {
  MenuExtrasAdminResponse,
  MenuExtraAdmin,
  MenuExtra,
  MenuExtraCreateInput,
  MenuExtraUpdateInput,
} from '../types/menu-extras.js';

/**
 * Convert MenuExtra to admin response format
 */
function toAdminResponse(extra: MenuExtra): MenuExtraAdmin {
  return {
    id: extra.id,
    label_hr: extra.label_hr,
    label_en: extra.label_en,
    target: extra.target,
    display_order: extra.display_order,
    enabled: extra.enabled,
    created_at: extra.created_at.toISOString(),
    updated_at: extra.updated_at.toISOString(),
  };
}

export async function adminMenuExtrasRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /admin/menu/extras
   * List all menu extras (including disabled)
   */
  fastify.get('/admin/menu/extras', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const extras = await getAllExtras();
      const total = await countExtras();

      const response: MenuExtrasAdminResponse = {
        extras: extras.map(toAdminResponse),
        total,
      };

      return reply.send(response);
    } catch (error) {
      fastify.log.error(error, '[AdminMenuExtras] Error fetching extras');
      return reply.status(500).send({ error: true, message: 'Internal server error' });
    }
  });

  /**
   * POST /admin/menu/extras
   * Create new menu extra
   */
  fastify.post(
    '/admin/menu/extras',
    async (
      request: FastifyRequest<{ Body: MenuExtraCreateInput }>,
      reply: FastifyReply
    ) => {
      try {
        const input = request.body;

        // Validate input
        const errors = validateMenuExtraInput(input);
        if (errors.length > 0) {
          return reply.status(400).send({
            error: true,
            message: 'Validation failed',
            errors,
          });
        }

        const extra = await createExtra(input);
        return reply.status(201).send(toAdminResponse(extra));
      } catch (error) {
        fastify.log.error(error, '[AdminMenuExtras] Error creating extra');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  /**
   * PATCH /admin/menu/extras/:id
   * Update existing menu extra
   */
  fastify.patch(
    '/admin/menu/extras/:id',
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: MenuExtraUpdateInput;
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const input = request.body;

        // Check if extra exists
        const existing = await getExtraById(id);
        if (!existing) {
          return reply.status(404).send({ error: true, message: 'Menu extra not found' });
        }

        // Validate partial input
        const errors: { field: string; message: string }[] = [];

        if (input.label_hr !== undefined) {
          if (typeof input.label_hr !== 'string' || input.label_hr.length < LABEL_MIN_LENGTH || input.label_hr.length > LABEL_MAX_LENGTH) {
            errors.push({ field: 'label_hr', message: `label_hr must be ${LABEL_MIN_LENGTH}-${LABEL_MAX_LENGTH} characters` });
          }
        }

        if (input.label_en !== undefined) {
          if (typeof input.label_en !== 'string' || input.label_en.length < LABEL_MIN_LENGTH || input.label_en.length > LABEL_MAX_LENGTH) {
            errors.push({ field: 'label_en', message: `label_en must be ${LABEL_MIN_LENGTH}-${LABEL_MAX_LENGTH} characters` });
          }
        }

        if (input.target !== undefined) {
          if (typeof input.target !== 'string' || !TARGET_REGEX.test(input.target)) {
            errors.push({ field: 'target', message: 'target must be in format StaticPage:<slug>' });
          }
        }

        if (input.display_order !== undefined) {
          if (typeof input.display_order !== 'number' || !Number.isInteger(input.display_order)) {
            errors.push({ field: 'display_order', message: 'display_order must be an integer' });
          }
        }

        if (errors.length > 0) {
          return reply.status(400).send({
            error: true,
            message: 'Validation failed',
            errors,
          });
        }

        const updated = await updateExtra(id, input);
        if (!updated) {
          return reply.status(404).send({ error: true, message: 'Menu extra not found' });
        }

        return reply.send(toAdminResponse(updated));
      } catch (error) {
        fastify.log.error(error, '[AdminMenuExtras] Error updating extra');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  /**
   * DELETE /admin/menu/extras/:id
   * Delete menu extra
   */
  fastify.delete(
    '/admin/menu/extras/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;

        const deleted = await deleteExtra(id);
        if (!deleted) {
          return reply.status(404).send({ error: true, message: 'Menu extra not found' });
        }

        return reply.status(204).send();
      } catch (error) {
        fastify.log.error(error, '[AdminMenuExtras] Error deleting extra');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );
}
