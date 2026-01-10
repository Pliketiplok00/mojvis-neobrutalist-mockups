/**
 * Admin Click & Fix Routes
 *
 * Phase 6: Admin management of Click & Fix issue reports.
 *
 * All endpoints require authentication (enforced by adminAuthHook).
 * Admin identity and municipality derived from session, NOT headers.
 *
 * Endpoints:
 * - GET /admin/click-fix - list issues (filtered by municipality scope)
 * - GET /admin/click-fix/:id - get issue detail
 * - PATCH /admin/click-fix/:id/status - update status
 * - POST /admin/click-fix/:id/reply - add reply
 *
 * Admin context:
 * - Municipality scope restricts visibility (from session)
 * - Reply language must match original submission language
 */

import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import type { Municipality } from '../types/inbox.js';
import type { FeedbackStatus } from '../types/feedback.js';
import { isValidFeedbackStatus } from '../types/feedback.js';
import type {
  UpdateClickFixStatusRequest,
  CreateClickFixReplyRequest,
  AdminClickFixListResponse,
  AdminClickFixDetailResponse,
  AdminClickFixListItem,
  ClickFixPhotoResponse,
  ClickFixReplyResponse,
} from '../types/click-fix.js';
import { getClickFixStatusLabel } from '../types/click-fix.js';
import {
  getClickFixListAdmin,
  getClickFixByIdAdmin,
  getClickFixPhotos,
  getClickFixReplies,
  updateClickFixStatus,
  createClickFixReply,
} from '../repositories/click-fix.js';
import { getAdminId, getAdminMunicipality } from '../middleware/auth.js';

// ============================================================
// NOTE: Admin identity derived from session, NOT headers.
// X-Admin-Municipality, X-Admin-Id headers are NOT trusted.
// ============================================================

/**
 * Get admin context from session (NOT headers)
 */
function getAdminContext(request: FastifyRequest): {
  adminMunicipality: Municipality;
  adminId: string;
} {
  return {
    adminMunicipality: getAdminMunicipality(request),
    adminId: getAdminId(request),
  };
}

/**
 * Generate photo URL from file path
 */
function getPhotoUrl(filePath: string): string {
  return `/uploads/click-fix/${filePath}`;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function adminClickFixRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  /**
   * GET /admin/click-fix
   *
   * List Click & Fix items filtered by admin municipality scope.
   */
  fastify.get<{
    Querystring: { page?: string; page_size?: string };
    Reply: AdminClickFixListResponse | { error: string };
  }>('/admin/click-fix', async (request, reply) => {
    const { adminMunicipality } = getAdminContext(request);

    const page = Math.max(1, parseInt(request.query.page ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(request.query.page_size ?? '20', 10)));

    console.info(`[Admin] GET /admin/click-fix page=${page} municipality=${adminMunicipality ?? 'all'}`);

    try {
      const { items, total } = await getClickFixListAdmin(page, pageSize, adminMunicipality);

      const response: AdminClickFixListResponse = {
        items: items.map((cf): AdminClickFixListItem => ({
          id: cf.id,
          device_id: cf.device_id,
          user_mode: cf.user_mode,
          municipality: cf.municipality,
          language: cf.language,
          subject: cf.subject,
          status: cf.status,
          status_label: getClickFixStatusLabel(cf.status, 'hr'), // Admin UI is in Croatian
          photo_count: cf.photo_count,
          reply_count: cf.reply_count,
          location: {
            lat: cf.location_lat,
            lng: cf.location_lng,
          },
          created_at: cf.created_at.toISOString(),
          updated_at: cf.updated_at.toISOString(),
        })),
        total,
        page,
        page_size: pageSize,
        has_more: page * pageSize < total,
      };

      return reply.status(200).send(response);
    } catch (error) {
      console.error('[Admin] Error fetching click-fix list:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /admin/click-fix/:id
   *
   * Get Click & Fix detail for admin.
   */
  fastify.get<{
    Params: { id: string };
    Reply: AdminClickFixDetailResponse | { error: string };
  }>('/admin/click-fix/:id', async (request, reply) => {
    const { id } = request.params;
    const { adminMunicipality } = getAdminContext(request);

    console.info(`[Admin] GET /admin/click-fix/${id} municipality=${adminMunicipality ?? 'all'}`);

    try {
      const clickFix = await getClickFixByIdAdmin(id);

      if (!clickFix) {
        return reply.status(404).send({ error: 'Report not found' });
      }

      // Check municipality scope
      if (adminMunicipality) {
        // Admin can only see issues from their municipality or visitors
        if (clickFix.municipality !== null && clickFix.municipality !== adminMunicipality) {
          return reply.status(403).send({ error: 'Access denied' });
        }
      }

      // Get photos and replies
      const photos = await getClickFixPhotos(id);
      const replies = await getClickFixReplies(id);

      const response: AdminClickFixDetailResponse = {
        id: clickFix.id,
        device_id: clickFix.device_id,
        user_mode: clickFix.user_mode,
        municipality: clickFix.municipality,
        language: clickFix.language,
        subject: clickFix.subject,
        description: clickFix.description,
        location: {
          lat: clickFix.location_lat,
          lng: clickFix.location_lng,
        },
        status: clickFix.status,
        status_label: getClickFixStatusLabel(clickFix.status, 'hr'),
        created_at: clickFix.created_at.toISOString(),
        updated_at: clickFix.updated_at.toISOString(),
        photos: photos.map((p): ClickFixPhotoResponse => ({
          id: p.id,
          url: getPhotoUrl(p.file_path),
          file_name: p.file_name,
          mime_type: p.mime_type,
          file_size: p.file_size,
          display_order: p.display_order,
        })),
        replies: replies.map((r): ClickFixReplyResponse => ({
          id: r.id,
          body: r.body,
          created_at: r.created_at.toISOString(),
        })),
      };

      return reply.status(200).send(response);
    } catch (error) {
      console.error(`[Admin] Error fetching click-fix ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * PATCH /admin/click-fix/:id/status
   *
   * Update Click & Fix status.
   */
  fastify.patch<{
    Params: { id: string };
    Body: UpdateClickFixStatusRequest;
    Reply: { status: FeedbackStatus; status_label: string } | { error: string };
  }>('/admin/click-fix/:id/status', async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body || {};
    const { adminMunicipality, adminId } = getAdminContext(request);

    console.info(`[Admin] PATCH /admin/click-fix/${id}/status status=${status}`);

    // Validate status
    if (!status || !isValidFeedbackStatus(status)) {
      return reply.status(400).send({
        error: 'Invalid status. Must be one of: zaprimljeno, u_razmatranju, prihvaceno, odbijeno',
      });
    }

    try {
      // Check access
      const existing = await getClickFixByIdAdmin(id);
      if (!existing) {
        return reply.status(404).send({ error: 'Report not found' });
      }

      if (adminMunicipality) {
        if (existing.municipality !== null && existing.municipality !== adminMunicipality) {
          return reply.status(403).send({ error: 'Access denied' });
        }
      }

      // Update status
      const updated = await updateClickFixStatus(id, status, adminId);

      if (!updated) {
        return reply.status(404).send({ error: 'Report not found' });
      }

      return reply.status(200).send({
        status: updated.status,
        status_label: getClickFixStatusLabel(updated.status, 'hr'),
      });
    } catch (error) {
      console.error(`[Admin] Error updating click-fix status ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * POST /admin/click-fix/:id/reply
   *
   * Add reply to Click & Fix.
   * Reply language must match original submission language.
   */
  fastify.post<{
    Params: { id: string };
    Body: CreateClickFixReplyRequest;
    Reply: ClickFixReplyResponse | { error: string };
  }>('/admin/click-fix/:id/reply', async (request, reply) => {
    const { id } = request.params;
    const { body: replyBody } = request.body || {};
    const { adminMunicipality, adminId } = getAdminContext(request);

    console.info(`[Admin] POST /admin/click-fix/${id}/reply`);

    // Validate body
    if (!replyBody || replyBody.trim().length === 0) {
      return reply.status(400).send({ error: 'Reply body is required' });
    }

    try {
      // Check access
      const existing = await getClickFixByIdAdmin(id);
      if (!existing) {
        return reply.status(404).send({ error: 'Report not found' });
      }

      if (adminMunicipality) {
        if (existing.municipality !== null && existing.municipality !== adminMunicipality) {
          return reply.status(403).send({ error: 'Access denied' });
        }
      }

      // Create reply (repository handles inbox message creation)
      const clickFixReply = await createClickFixReply(id, replyBody.trim(), adminId);

      const response: ClickFixReplyResponse = {
        id: clickFixReply.id,
        body: clickFixReply.body,
        created_at: clickFixReply.created_at.toISOString(),
      };

      return reply.status(201).send(response);
    } catch (error) {
      console.error(`[Admin] Error creating reply for click-fix ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
