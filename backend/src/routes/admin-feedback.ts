/**
 * Admin Feedback Routes
 *
 * Phase 5: Admin management of user feedback.
 *
 * All endpoints require authentication (enforced by adminAuthHook).
 * Admin identity and municipality derived from session, NOT headers.
 *
 * Endpoints:
 * - GET /admin/feedback - list feedback (filtered by municipality scope)
 * - GET /admin/feedback/:id - get feedback detail
 * - PATCH /admin/feedback/:id/status - update status
 * - POST /admin/feedback/:id/reply - add reply
 *
 * Admin context:
 * - Municipality scope restricts visibility (from session)
 * - Reply language must match original feedback language
 */

import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import type { Municipality } from '../types/inbox.js';
import type {
  FeedbackStatus,
  UpdateFeedbackStatusRequest,
  CreateFeedbackReplyRequest,
  AdminFeedbackListResponse,
  AdminFeedbackDetailResponse,
  FeedbackReplyResponse,
} from '../types/feedback.js';
import { isValidFeedbackStatus, getStatusLabel } from '../types/feedback.js';
import {
  getFeedbackListAdmin,
  getFeedbackByIdAdmin,
  getFeedbackReplies,
  updateFeedbackStatus,
  createFeedbackReply,
} from '../repositories/feedback.js';
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

// eslint-disable-next-line @typescript-eslint/require-await
export async function adminFeedbackRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  /**
   * GET /admin/feedback
   *
   * List feedback items filtered by admin municipality scope.
   */
  fastify.get<{
    Querystring: { page?: string; page_size?: string };
    Reply: AdminFeedbackListResponse | { error: string };
  }>('/admin/feedback', async (request, reply) => {
    const { adminMunicipality } = getAdminContext(request);

    const page = Math.max(1, parseInt(request.query.page ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(request.query.page_size ?? '20', 10)));

    console.info(`[Admin] GET /admin/feedback page=${page} municipality=${adminMunicipality ?? 'all'}`);

    try {
      const { feedback, total } = await getFeedbackListAdmin(page, pageSize, adminMunicipality);

      const response: AdminFeedbackListResponse = {
        feedback: feedback.map((f) => ({
          id: f.id,
          device_id: f.device_id,
          user_mode: f.user_mode,
          municipality: f.municipality,
          language: f.language,
          subject: f.subject,
          status: f.status,
          status_label: getStatusLabel(f.status, 'hr'), // Admin UI is in Croatian
          reply_count: f.reply_count,
          created_at: f.created_at.toISOString(),
          updated_at: f.updated_at.toISOString(),
        })),
        total,
        page,
        page_size: pageSize,
        has_more: page * pageSize < total,
      };

      return reply.status(200).send(response);
    } catch (error) {
      console.error('[Admin] Error fetching feedback list:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /admin/feedback/:id
   *
   * Get feedback detail for admin.
   */
  fastify.get<{
    Params: { id: string };
    Reply: AdminFeedbackDetailResponse | { error: string };
  }>('/admin/feedback/:id', async (request, reply) => {
    const { id } = request.params;
    const { adminMunicipality } = getAdminContext(request);

    console.info(`[Admin] GET /admin/feedback/${id} municipality=${adminMunicipality ?? 'all'}`);

    try {
      const feedback = await getFeedbackByIdAdmin(id);

      if (!feedback) {
        return reply.status(404).send({ error: 'Feedback not found' });
      }

      // Check municipality scope
      if (adminMunicipality) {
        // Admin can only see feedback from their municipality or visitors
        if (feedback.municipality !== null && feedback.municipality !== adminMunicipality) {
          return reply.status(403).send({ error: 'Access denied' });
        }
      }

      // Get replies
      const replies = await getFeedbackReplies(id);

      const response: AdminFeedbackDetailResponse = {
        id: feedback.id,
        device_id: feedback.device_id,
        user_mode: feedback.user_mode,
        municipality: feedback.municipality,
        language: feedback.language,
        subject: feedback.subject,
        body: feedback.body,
        status: feedback.status,
        status_label: getStatusLabel(feedback.status, 'hr'),
        created_at: feedback.created_at.toISOString(),
        updated_at: feedback.updated_at.toISOString(),
        replies: replies.map((r): FeedbackReplyResponse => ({
          id: r.id,
          body: r.body,
          created_at: r.created_at.toISOString(),
        })),
      };

      return reply.status(200).send(response);
    } catch (error) {
      console.error(`[Admin] Error fetching feedback ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * PATCH /admin/feedback/:id/status
   *
   * Update feedback status.
   */
  fastify.patch<{
    Params: { id: string };
    Body: UpdateFeedbackStatusRequest;
    Reply: { status: FeedbackStatus; status_label: string } | { error: string };
  }>('/admin/feedback/:id/status', async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body || {};
    const { adminMunicipality } = getAdminContext(request);

    console.info(`[Admin] PATCH /admin/feedback/${id}/status status=${status}`);

    // Validate status
    if (!status || !isValidFeedbackStatus(status)) {
      return reply.status(400).send({
        error: 'Invalid status. Must be one of: zaprimljeno, u_razmatranju, prihvaceno, odbijeno',
      });
    }

    try {
      // Check access
      const existing = await getFeedbackByIdAdmin(id);
      if (!existing) {
        return reply.status(404).send({ error: 'Feedback not found' });
      }

      if (adminMunicipality) {
        if (existing.municipality !== null && existing.municipality !== adminMunicipality) {
          return reply.status(403).send({ error: 'Access denied' });
        }
      }

      // Update status
      const updated = await updateFeedbackStatus(id, status);

      if (!updated) {
        return reply.status(404).send({ error: 'Feedback not found' });
      }

      return reply.status(200).send({
        status: updated.status,
        status_label: getStatusLabel(updated.status, 'hr'),
      });
    } catch (error) {
      console.error(`[Admin] Error updating feedback status ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * POST /admin/feedback/:id/reply
   *
   * Add reply to feedback.
   * Reply language must match original feedback language.
   */
  fastify.post<{
    Params: { id: string };
    Body: CreateFeedbackReplyRequest;
    Reply: FeedbackReplyResponse | { error: string };
  }>('/admin/feedback/:id/reply', async (request, reply) => {
    const { id } = request.params;
    const { body: replyBody } = request.body || {};
    const { adminMunicipality, adminId } = getAdminContext(request);

    console.info(`[Admin] POST /admin/feedback/${id}/reply`);

    // Validate body
    if (!replyBody || replyBody.trim().length === 0) {
      return reply.status(400).send({ error: 'Reply body is required' });
    }

    try {
      // Check access
      const existing = await getFeedbackByIdAdmin(id);
      if (!existing) {
        return reply.status(404).send({ error: 'Feedback not found' });
      }

      if (adminMunicipality) {
        if (existing.municipality !== null && existing.municipality !== adminMunicipality) {
          return reply.status(403).send({ error: 'Access denied' });
        }
      }

      // Create reply (repository handles inbox message creation)
      const feedbackReply = await createFeedbackReply(id, replyBody.trim(), adminId);

      const response: FeedbackReplyResponse = {
        id: feedbackReply.id,
        body: feedbackReply.body,
        created_at: feedbackReply.created_at.toISOString(),
      };

      return reply.status(201).send(response);
    } catch (error) {
      console.error(`[Admin] Error creating reply for feedback ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
