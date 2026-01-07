/**
 * Admin Inbox Routes
 *
 * CRUD endpoints for inbox messages (admin panel).
 *
 * Endpoints:
 * - GET /admin/inbox - list all messages (admin view)
 * - GET /admin/inbox/:id - single message
 * - POST /admin/inbox - create message
 * - PATCH /admin/inbox/:id - update message
 * - DELETE /admin/inbox/:id - delete message
 *
 * Note: Per spec, messages are LIVE ON SAVE (no draft workflow).
 * TODO: Add authentication and authorization middleware.
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  getInboxMessages,
  getInboxMessageById,
  createInboxMessage,
  updateInboxMessage,
  deleteInboxMessage,
} from '../repositories/inbox.js';
import type {
  InboxMessage,
  AdminInboxListResponse,
  InboxTag,
} from '../types/inbox.js';
import { validateTags, isUrgent } from '../types/inbox.js';

interface CreateMessageBody {
  title_hr: string;
  title_en?: string | null;
  body_hr: string;
  body_en?: string | null;
  tags: InboxTag[];
  active_from?: string | null;
  active_to?: string | null;
}

interface UpdateMessageBody {
  title_hr?: string;
  title_en?: string | null;
  body_hr?: string;
  body_en?: string | null;
  tags?: InboxTag[];
  active_from?: string | null;
  active_to?: string | null;
}

/**
 * Transform InboxMessage to admin API response
 */
function toAdminResponse(message: InboxMessage): {
  id: string;
  title_hr: string;
  title_en: string | null;
  body_hr: string;
  body_en: string | null;
  tags: InboxTag[];
  active_from: string | null;
  active_to: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_urgent: boolean;
} {
  return {
    id: message.id,
    title_hr: message.title_hr,
    title_en: message.title_en,
    body_hr: message.body_hr,
    body_en: message.body_en,
    tags: message.tags,
    active_from: message.active_from?.toISOString() ?? null,
    active_to: message.active_to?.toISOString() ?? null,
    created_at: message.created_at.toISOString(),
    updated_at: message.updated_at.toISOString(),
    created_by: message.created_by,
    is_urgent: isUrgent(message.tags),
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function adminInboxRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  // TODO: Add authentication middleware here
  // fastify.addHook('onRequest', requireAuth);

  /**
   * GET /admin/inbox
   *
   * List all inbox messages (admin view, no eligibility filtering).
   */
  fastify.get<{
    Querystring: { page?: string; page_size?: string };
  }>('/admin/inbox', async (request, reply) => {
    const page = Math.max(1, parseInt(request.query.page ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(request.query.page_size ?? '20', 10)));

    console.info(`[Admin] GET /admin/inbox page=${page} pageSize=${pageSize}`);

    try {
      const { messages, total } = await getInboxMessages(page, pageSize);

      const response: AdminInboxListResponse = {
        messages: messages.map(toAdminResponse),
        total,
        page,
        page_size: pageSize,
        has_more: page * pageSize < total,
      };

      return reply.status(200).send(response);
    } catch (error) {
      console.error('[Admin] Error fetching inbox:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /admin/inbox/:id
   *
   * Get single message by ID (admin view).
   */
  fastify.get<{
    Params: { id: string };
  }>('/admin/inbox/:id', async (request, reply) => {
    const { id } = request.params;

    console.info(`[Admin] GET /admin/inbox/${id}`);

    try {
      const message = await getInboxMessageById(id);

      if (!message) {
        return reply.status(404).send({ error: 'Message not found' });
      }

      return reply.status(200).send(toAdminResponse(message));
    } catch (error) {
      console.error(`[Admin] Error fetching message ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * POST /admin/inbox
   *
   * Create new inbox message.
   * Message is LIVE immediately after creation.
   */
  fastify.post<{
    Body: CreateMessageBody;
  }>('/admin/inbox', async (request, reply) => {
    const body = request.body;

    console.info('[Admin] POST /admin/inbox');

    // Validate required fields
    if (!body.title_hr?.trim()) {
      return reply.status(400).send({ error: 'title_hr is required' });
    }
    if (!body.body_hr?.trim()) {
      return reply.status(400).send({ error: 'body_hr is required' });
    }

    // Validate tags
    const tags = body.tags || [];
    if (!validateTags(tags)) {
      return reply.status(400).send({
        error: 'Invalid tags. Max 2 tags allowed from fixed taxonomy.',
      });
    }

    // Validate date range
    if (body.active_from && body.active_to) {
      const from = new Date(body.active_from);
      const to = new Date(body.active_to);
      if (from >= to) {
        return reply.status(400).send({
          error: 'active_to must be after active_from',
        });
      }
    }

    try {
      const message = await createInboxMessage({
        title_hr: body.title_hr.trim(),
        title_en: body.title_en?.trim() || null,
        body_hr: body.body_hr.trim(),
        body_en: body.body_en?.trim() || null,
        tags: tags,
        active_from: body.active_from ? new Date(body.active_from) : null,
        active_to: body.active_to ? new Date(body.active_to) : null,
        created_by: null, // TODO: Get from authenticated user
      });

      return reply.status(201).send(toAdminResponse(message));
    } catch (error) {
      console.error('[Admin] Error creating message:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * PATCH /admin/inbox/:id
   *
   * Update existing inbox message.
   * Changes are LIVE immediately.
   */
  fastify.patch<{
    Params: { id: string };
    Body: UpdateMessageBody;
  }>('/admin/inbox/:id', async (request, reply) => {
    const { id } = request.params;
    const body = request.body;

    console.info(`[Admin] PATCH /admin/inbox/${id}`);

    // Validate tags if provided
    if (body.tags !== undefined) {
      if (!validateTags(body.tags)) {
        return reply.status(400).send({
          error: 'Invalid tags. Max 2 tags allowed from fixed taxonomy.',
        });
      }
    }

    // Validate date range if both provided
    if (body.active_from !== undefined && body.active_to !== undefined) {
      if (body.active_from && body.active_to) {
        const from = new Date(body.active_from);
        const to = new Date(body.active_to);
        if (from >= to) {
          return reply.status(400).send({
            error: 'active_to must be after active_from',
          });
        }
      }
    }

    try {
      const updates: Parameters<typeof updateInboxMessage>[1] = {};

      if (body.title_hr !== undefined) {
        updates.title_hr = body.title_hr.trim();
      }
      if (body.title_en !== undefined) {
        updates.title_en = body.title_en?.trim() || null;
      }
      if (body.body_hr !== undefined) {
        updates.body_hr = body.body_hr.trim();
      }
      if (body.body_en !== undefined) {
        updates.body_en = body.body_en?.trim() || null;
      }
      if (body.tags !== undefined) {
        updates.tags = body.tags;
      }
      if (body.active_from !== undefined) {
        updates.active_from = body.active_from ? new Date(body.active_from) : null;
      }
      if (body.active_to !== undefined) {
        updates.active_to = body.active_to ? new Date(body.active_to) : null;
      }

      const message = await updateInboxMessage(id, updates);

      if (!message) {
        return reply.status(404).send({ error: 'Message not found' });
      }

      return reply.status(200).send(toAdminResponse(message));
    } catch (error) {
      console.error(`[Admin] Error updating message ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * DELETE /admin/inbox/:id
   *
   * Delete inbox message.
   */
  fastify.delete<{
    Params: { id: string };
  }>('/admin/inbox/:id', async (request, reply) => {
    const { id } = request.params;

    console.info(`[Admin] DELETE /admin/inbox/${id}`);

    try {
      const deleted = await deleteInboxMessage(id);

      if (!deleted) {
        return reply.status(404).send({ error: 'Message not found' });
      }

      return reply.status(204).send();
    } catch (error) {
      console.error(`[Admin] Error deleting message ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
