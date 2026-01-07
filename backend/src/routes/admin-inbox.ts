/**
 * Admin Inbox Routes
 *
 * CRUD endpoints for inbox messages (admin panel).
 *
 * Endpoints:
 * - GET /admin/inbox - list all messages (admin view, includes soft-deleted)
 * - GET /admin/inbox/:id - single message (includes soft-deleted)
 * - POST /admin/inbox - create message
 * - PATCH /admin/inbox/:id - update message (excludes soft-deleted)
 * - DELETE /admin/inbox/:id - SOFT delete message (sets deleted_at)
 * - POST /admin/inbox/:id/restore - restore soft-deleted message
 *
 * Note: Per spec, messages are LIVE ON SAVE (no draft workflow).
 * IMPORTANT: Hard delete is NOT allowed. All deletes are soft deletes.
 *
 * TODO: Add anonymous device identification middleware.
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  getInboxMessagesAdmin,
  getInboxMessageByIdAdmin,
  createInboxMessage,
  updateInboxMessage,
  softDeleteInboxMessage,
  restoreInboxMessage,
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
  deleted_at: string | null;
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
    deleted_at: message.deleted_at?.toISOString() ?? null,
    is_urgent: isUrgent(message.tags),
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function adminInboxRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  // TODO: Add anonymous device identification middleware here

  /**
   * GET /admin/inbox
   *
   * List all inbox messages (admin view, includes soft-deleted).
   */
  fastify.get<{
    Querystring: { page?: string; page_size?: string };
  }>('/admin/inbox', async (request, reply) => {
    const page = Math.max(1, parseInt(request.query.page ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(request.query.page_size ?? '20', 10)));

    console.info(`[Admin] GET /admin/inbox page=${page} pageSize=${pageSize}`);

    try {
      const { messages, total } = await getInboxMessagesAdmin(page, pageSize);

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
   * Get single message by ID (admin view, includes soft-deleted).
   */
  fastify.get<{
    Params: { id: string };
  }>('/admin/inbox/:id', async (request, reply) => {
    const { id } = request.params;

    console.info(`[Admin] GET /admin/inbox/${id}`);

    try {
      const message = await getInboxMessageByIdAdmin(id);

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
   * SOFT delete inbox message (sets deleted_at = now()).
   * Hard delete is NOT allowed per spec.
   */
  fastify.delete<{
    Params: { id: string };
  }>('/admin/inbox/:id', async (request, reply) => {
    const { id } = request.params;
    const requestId = request.id;

    console.info(`[Admin] DELETE /admin/inbox/${id}`);

    try {
      const deletedMessage = await softDeleteInboxMessage(id);

      if (!deletedMessage) {
        return reply.status(404).send({ error: 'Message not found or already deleted' });
      }

      // Log soft delete action at info level (per spec)
      console.info(JSON.stringify({
        action: 'admin_inbox_soft_delete',
        message_id: id,
        timestamp: new Date().toISOString(),
        request_id: requestId,
      }));

      return reply.status(204).send();
    } catch (error) {
      console.error(`[Admin] Error soft-deleting message ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * POST /admin/inbox/:id/restore
   *
   * Restore a soft-deleted inbox message (sets deleted_at = NULL).
   */
  fastify.post<{
    Params: { id: string };
  }>('/admin/inbox/:id/restore', async (request, reply) => {
    const { id } = request.params;
    const requestId = request.id;

    console.info(`[Admin] POST /admin/inbox/${id}/restore`);

    try {
      const restoredMessage = await restoreInboxMessage(id);

      if (!restoredMessage) {
        return reply.status(404).send({ error: 'Message not found or not deleted' });
      }

      // Log restore action at info level
      console.info(JSON.stringify({
        action: 'admin_inbox_restore',
        message_id: id,
        timestamp: new Date().toISOString(),
        request_id: requestId,
      }));

      return reply.status(200).send(toAdminResponse(restoredMessage));
    } catch (error) {
      console.error(`[Admin] Error restoring message ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
