/**
 * Feedback Routes (Public)
 *
 * Phase 5: User feedback submission and retrieval.
 *
 * Endpoints:
 * - POST /feedback - submit new feedback
 * - GET /feedback/:id - get feedback detail (device owner only)
 * - GET /feedback/sent - get sent items for device (Inbox → Sent tab)
 *
 * Headers:
 * - X-Device-ID: anonymous device identifier (required)
 * - X-User-Mode: 'visitor' | 'local'
 * - X-Municipality: 'vis' | 'komiza' (for locals)
 * - Accept-Language: 'hr' | 'en'
 */

import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import type { Municipality, UserMode } from '../types/inbox.js';
import type {
  FeedbackLanguage,
  SubmitFeedbackRequest,
  FeedbackSubmitResponse,
  FeedbackDetailResponse,
  FeedbackReplyResponse,
} from '../types/feedback.js';
import {
  validateFeedbackSubmission,
  RATE_LIMIT_ERROR,
  getStatusLabel,
} from '../types/feedback.js';
import {
  checkRateLimit,
  createFeedback,
  getFeedbackByIdForDevice,
  getFeedbackReplies,
  getSentItemsForDevice,
} from '../repositories/feedback.js';

/**
 * Extract user context from request headers
 */
function getUserContext(request: FastifyRequest): {
  deviceId: string;
  userMode: UserMode;
  municipality: Municipality;
} {
  const headers = request.headers;

  const deviceId = headers['x-device-id'] as string | undefined;
  const userMode = (headers['x-user-mode'] as UserMode) || 'visitor';
  const municipalityHeader = headers['x-municipality'] as string | undefined;

  let municipality: Municipality = null;
  if (userMode === 'local' && municipalityHeader) {
    if (municipalityHeader === 'vis' || municipalityHeader === 'komiza') {
      municipality = municipalityHeader;
    }
  }

  return {
    deviceId: deviceId || '',
    userMode,
    municipality,
  };
}

/**
 * Get language preference from request
 */
function getLanguage(request: FastifyRequest): FeedbackLanguage {
  const lang = request.headers['accept-language'];
  if (typeof lang === 'string' && lang.toLowerCase().startsWith('en')) {
    return 'en';
  }
  return 'hr';
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function feedbackRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  /**
   * POST /feedback
   *
   * Submit new feedback.
   *
   * Request body:
   * - subject: string (required, max 120 chars)
   * - body: string (required, max 4000 chars)
   *
   * Rate limit: 3 per device per day (Europe/Zagreb timezone)
   */
  fastify.post<{
    Body: SubmitFeedbackRequest;
    Reply: FeedbackSubmitResponse | { error: string; error_hr?: string; error_en?: string };
  }>('/feedback', async (request, reply) => {
    const context = getUserContext(request);
    const language = getLanguage(request);

    // Check for device ID
    if (!context.deviceId) {
      return reply.status(400).send({
        error: 'X-Device-ID header is required',
      });
    }

    console.info(`[Feedback] POST /feedback device=${context.deviceId} mode=${context.userMode} lang=${language}`);

    // Check rate limit
    const rateCheck = await checkRateLimit(context.deviceId);
    if (!rateCheck.allowed) {
      console.info(`[Feedback] Rate limit exceeded for device=${context.deviceId}`);
      return reply.status(429).send({
        error: language === 'en' ? RATE_LIMIT_ERROR.en : RATE_LIMIT_ERROR.hr,
        error_hr: RATE_LIMIT_ERROR.hr,
        error_en: RATE_LIMIT_ERROR.en,
      });
    }

    // Validate input
    const { subject, body: messageBody } = request.body || {};
    const validation = validateFeedbackSubmission(subject || '', messageBody || '');

    if (!validation.valid) {
      return reply.status(400).send({
        error: validation.errors.join('. '),
      });
    }

    try {
      // Create feedback
      const feedback = await createFeedback(
        context.deviceId,
        context.userMode,
        context.municipality,
        language,
        subject.trim(),
        messageBody.trim()
      );

      // Success message
      const successMessage = language === 'en'
        ? 'Your message has been sent successfully.'
        : 'Vaša poruka je uspješno poslana.';

      const response: FeedbackSubmitResponse = {
        id: feedback.id,
        message: successMessage,
      };

      return reply.status(201).send(response);
    } catch (error) {
      console.error('[Feedback] Error creating feedback:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /feedback/:id
   *
   * Get feedback detail.
   * Only accessible by the device that submitted it.
   */
  fastify.get<{
    Params: { id: string };
    Reply: FeedbackDetailResponse | { error: string };
  }>('/feedback/:id', async (request, reply) => {
    const { id } = request.params;
    const context = getUserContext(request);
    const language = getLanguage(request);

    if (!context.deviceId) {
      return reply.status(400).send({
        error: 'X-Device-ID header is required',
      });
    }

    console.info(`[Feedback] GET /feedback/${id} device=${context.deviceId}`);

    try {
      // Get feedback (device check is done in repository)
      const feedback = await getFeedbackByIdForDevice(id, context.deviceId);

      if (!feedback) {
        return reply.status(404).send({ error: 'Feedback not found' });
      }

      // Get replies
      const replies = await getFeedbackReplies(id);

      const response: FeedbackDetailResponse = {
        id: feedback.id,
        subject: feedback.subject,
        body: feedback.body,
        status: feedback.status,
        status_label: getStatusLabel(feedback.status, language),
        language: feedback.language,
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
      console.error(`[Feedback] Error fetching feedback ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /feedback/sent
   *
   * Get sent items for the device (for Inbox → Sent tab).
   */
  fastify.get<{
    Querystring: { page?: string; page_size?: string };
    Reply: {
      items: Array<{
        id: string;
        subject: string;
        status: string;
        status_label: string;
        created_at: string;
      }>;
      total: number;
      page: number;
      page_size: number;
      has_more: boolean;
    } | { error: string };
  }>('/feedback/sent', async (request, reply) => {
    const context = getUserContext(request);
    const language = getLanguage(request);

    if (!context.deviceId) {
      return reply.status(400).send({
        error: 'X-Device-ID header is required',
      });
    }

    const page = Math.max(1, parseInt(request.query.page ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(request.query.page_size ?? '20', 10)));

    console.info(`[Feedback] GET /feedback/sent device=${context.deviceId} page=${page}`);

    try {
      const { items, total } = await getSentItemsForDevice(context.deviceId, page, pageSize);

      return reply.status(200).send({
        items: items.map((f) => ({
          id: f.id,
          subject: f.subject,
          status: f.status,
          status_label: getStatusLabel(f.status, language),
          created_at: f.created_at.toISOString(),
        })),
        total,
        page,
        page_size: pageSize,
        has_more: page * pageSize < total,
      });
    } catch (error) {
      console.error('[Feedback] Error fetching sent items:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
