/**
 * Inbox Routes
 *
 * API endpoints for inbox messages and banners.
 *
 * Endpoints:
 * - GET /inbox - paginated list of eligible messages
 * - GET /inbox/:id - single message detail
 * - GET /banners/active - active banners for current user context
 *
 * User context is passed via headers:
 * - X-Device-ID: anonymous device identifier
 * - X-User-Mode: 'visitor' | 'local'
 * - X-Municipality: 'vis' | 'komiza' | null (for locals only)
 */

import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import {
  getInboxMessages,
  getInboxMessageById,
  getPotentialBannerMessages,
} from '../repositories/inbox.js';
import {
  filterEligibleMessages,
  filterBannerEligibleMessages,
  filterBannersByScreen,
  type ScreenContext,
} from '../lib/eligibility.js';
import type {
  UserContext,
  UserMode,
  Municipality,
  InboxMessage,
  InboxMessageResponse,
  InboxListResponse,
  BannerResponse,
} from '../types/inbox.js';
import { isUrgent } from '../types/inbox.js';

/**
 * Extract user context from request headers
 */
function getUserContext(request: FastifyRequest): UserContext {
  const headers = request.headers;

  const deviceId = (headers['x-device-id'] as string) || 'anonymous';
  const userMode = (headers['x-user-mode'] as UserMode) || 'visitor';
  const municipalityHeader = headers['x-municipality'] as string | undefined;

  let municipality: Municipality = null;
  if (userMode === 'local' && municipalityHeader) {
    if (municipalityHeader === 'vis' || municipalityHeader === 'komiza') {
      municipality = municipalityHeader;
    }
  }

  return { deviceId, userMode, municipality };
}

/**
 * Get language preference from request
 */
function getLanguage(request: FastifyRequest): 'hr' | 'en' {
  const lang = request.headers['accept-language'];
  if (typeof lang === 'string' && lang.toLowerCase().startsWith('en')) {
    return 'en';
  }
  return 'hr';
}

/**
 * Transform InboxMessage to API response format
 *
 * IMPORTANT: NO implicit language fallback is allowed per spec.
 * HR and EN are separate fields. If EN is requested but not available,
 * the field will be empty string, NOT the HR content.
 */
function toMessageResponse(
  message: InboxMessage,
  language: 'hr' | 'en'
): InboxMessageResponse {
  // NO fallback - return exactly what was requested
  const title = language === 'en'
    ? (message.title_en ?? '')
    : message.title_hr;
  const body = language === 'en'
    ? (message.body_en ?? '')
    : message.body_hr;

  return {
    id: message.id,
    title,
    body,
    tags: message.tags,
    active_from: message.active_from?.toISOString() ?? null,
    active_to: message.active_to?.toISOString() ?? null,
    created_at: message.created_at.toISOString(),
    is_urgent: isUrgent(message.tags),
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function inboxRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  /**
   * GET /inbox
   *
   * Returns paginated list of inbox messages eligible for the user.
   *
   * Query params:
   * - page (default: 1)
   * - page_size (default: 20, max: 50)
   *
   * Headers:
   * - X-Device-ID: device identifier
   * - X-User-Mode: 'visitor' | 'local'
   * - X-Municipality: 'vis' | 'komiza' (for locals)
   * - Accept-Language: 'hr' | 'en'
   */
  fastify.get<{
    Querystring: { page?: string; page_size?: string };
    Reply: InboxListResponse;
  }>('/inbox', async (request, reply) => {
    const context = getUserContext(request);
    const language = getLanguage(request);

    const page = Math.max(1, parseInt(request.query.page ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(request.query.page_size ?? '20', 10)));

    console.info(`[Inbox] GET /inbox page=${page} pageSize=${pageSize} user=${context.deviceId} mode=${context.userMode}`);

    try {
      const { messages, total } = await getInboxMessages(page, pageSize);

      // Filter by eligibility
      const eligibleMessages = filterEligibleMessages(messages, context);

      const response: InboxListResponse = {
        messages: eligibleMessages.map((m) => toMessageResponse(m, language)),
        total,
        page,
        page_size: pageSize,
        has_more: page * pageSize < total,
      };

      return reply.status(200).send(response);
    } catch (error) {
      console.error('[Inbox] Error fetching inbox:', error);
      return reply.status(500).send({
        messages: [],
        total: 0,
        page,
        page_size: pageSize,
        has_more: false,
      });
    }
  });

  /**
   * GET /inbox/:id
   *
   * Returns a single inbox message by ID.
   * Checks eligibility before returning.
   */
  fastify.get<{
    Params: { id: string };
    Reply: InboxMessageResponse | { error: string };
  }>('/inbox/:id', async (request, reply) => {
    const { id } = request.params;
    const context = getUserContext(request);
    const language = getLanguage(request);

    console.info(`[Inbox] GET /inbox/${id} user=${context.deviceId} mode=${context.userMode}`);

    try {
      const message = await getInboxMessageById(id);

      if (!message) {
        return reply.status(404).send({ error: 'Message not found' });
      }

      // Check eligibility (even for direct access)
      const eligibleMessages = filterEligibleMessages([message], context);
      if (eligibleMessages.length === 0) {
        // User not eligible to see this message
        return reply.status(404).send({ error: 'Message not found' });
      }

      return reply.status(200).send(toMessageResponse(message, language));
    } catch (error) {
      console.error(`[Inbox] Error fetching message ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /banners/active
   *
   * Returns currently active banners for the user.
   * Only messages within their active window are returned.
   *
   * Query params:
   * - screen: 'home' | 'transport_road' | 'transport_sea' (required for filtering)
   *
   * Banner placement rules (per spec):
   * - Home: hitno, opcenito, vis/komiza (for matching locals)
   * - Road Transport: cestovni_promet OR hitno ONLY
   * - Sea Transport: pomorski_promet OR hitno ONLY
   */
  fastify.get<{
    Querystring: { screen?: string };
    Reply: BannerResponse;
  }>('/banners/active', async (request, reply) => {
    const userContext = getUserContext(request);
    const language = getLanguage(request);
    const screenParam = request.query.screen;

    // Validate screen context
    const validScreens: ScreenContext[] = ['home', 'transport_road', 'transport_sea'];
    const screenContext: ScreenContext | undefined = validScreens.includes(screenParam as ScreenContext)
      ? (screenParam as ScreenContext)
      : undefined;

    console.info(`[Banners] GET /banners/active user=${userContext.deviceId} screen=${screenContext ?? 'all'}`);

    try {
      const potentialBanners = await getPotentialBannerMessages();
      const now = new Date();

      // Filter by user eligibility and active window
      let activeBanners = filterBannerEligibleMessages(
        potentialBanners,
        userContext,
        now
      );

      // Apply screen context filtering if specified
      if (screenContext) {
        activeBanners = filterBannersByScreen(activeBanners, screenContext);
      }

      const response: BannerResponse = {
        banners: activeBanners.map((m) => toMessageResponse(m, language)),
      };

      return reply.status(200).send(response);
    } catch (error) {
      console.error('[Banners] Error fetching banners:', error);
      return reply.status(500).send({ banners: [] });
    }
  });
}
