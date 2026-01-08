/**
 * Events Routes (Public)
 *
 * Public endpoints for events.
 *
 * Endpoints:
 * - GET /events - list events (paginated)
 * - GET /events/dates - get dates with events for a month
 * - GET /events/:id - single event
 * - POST /events/:id/subscribe - subscribe to reminder
 * - DELETE /events/:id/subscribe - unsubscribe from reminder
 * - GET /events/:id/subscription - check subscription status
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  getEvents,
  getEventsByDate,
  getEventById,
  getEventDatesForMonth,
  subscribeToReminder,
  unsubscribeFromReminder,
  isSubscribed,
} from '../repositories/event.js';
import type { Event, EventResponse, EventListResponse } from '../types/event.js';

type Language = 'hr' | 'en';

/**
 * Parse Accept-Language header
 */
function getLanguage(acceptLanguage: string | undefined): Language {
  if (!acceptLanguage) return 'hr';
  if (acceptLanguage.toLowerCase().startsWith('en')) return 'en';
  return 'hr';
}

/**
 * Transform Event to localized API response
 * NOTE: No language fallback - returns empty string if translation missing
 */
function toEventResponse(event: Event, language: Language): EventResponse {
  const title = language === 'en' ? event.title_en : event.title_hr;
  const description = language === 'en' ? event.description_en : event.description_hr;
  const location = language === 'en' ? event.location_en : event.location_hr;

  return {
    id: event.id,
    title: title ?? '',
    description: description ?? null,
    start_datetime: event.start_datetime.toISOString(),
    end_datetime: event.end_datetime?.toISOString() ?? null,
    location: location ?? null,
    is_all_day: event.is_all_day,
    created_at: event.created_at.toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function eventRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  /**
   * GET /events
   *
   * List events (paginated) or for a specific date.
   */
  fastify.get<{
    Querystring: {
      page?: string;
      page_size?: string;
      date?: string; // YYYY-MM-DD format
    };
  }>('/events', async (request, reply) => {
    const page = Math.max(1, parseInt(request.query.page ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(request.query.page_size ?? '20', 10)));
    const date = request.query.date;
    const language = getLanguage(request.headers['accept-language']);

    console.info(`[Events] GET /events page=${page} pageSize=${pageSize} date=${date ?? 'all'}`);

    try {
      if (date) {
        // Get events for specific date
        const events = await getEventsByDate(date);
        const response: EventListResponse = {
          events: events.map(e => toEventResponse(e, language)),
          total: events.length,
          page: 1,
          page_size: events.length,
          has_more: false,
        };
        return reply.status(200).send(response);
      }

      // Get paginated events
      const { events, total } = await getEvents(page, pageSize);
      const response: EventListResponse = {
        events: events.map(e => toEventResponse(e, language)),
        total,
        page,
        page_size: pageSize,
        has_more: page * pageSize < total,
      };

      return reply.status(200).send(response);
    } catch (error) {
      console.error('[Events] Error fetching events:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /events/dates
   *
   * Get dates with events for a month (for calendar view).
   */
  fastify.get<{
    Querystring: { year?: string; month?: string };
  }>('/events/dates', async (request, reply) => {
    const now = new Date();
    const year = parseInt(request.query.year ?? String(now.getFullYear()), 10);
    const month = parseInt(request.query.month ?? String(now.getMonth() + 1), 10);

    console.info(`[Events] GET /events/dates year=${year} month=${month}`);

    if (month < 1 || month > 12) {
      return reply.status(400).send({ error: 'Invalid month (1-12)' });
    }

    try {
      const dates = await getEventDatesForMonth(year, month);
      return reply.status(200).send({ dates });
    } catch (error) {
      console.error('[Events] Error fetching event dates:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /events/:id
   *
   * Get single event by ID.
   */
  fastify.get<{
    Params: { id: string };
  }>('/events/:id', async (request, reply) => {
    const { id } = request.params;
    const language = getLanguage(request.headers['accept-language']);

    console.info(`[Events] GET /events/${id}`);

    try {
      const event = await getEventById(id);

      if (!event) {
        return reply.status(404).send({ error: 'Event not found' });
      }

      return reply.status(200).send(toEventResponse(event, language));
    } catch (error) {
      console.error(`[Events] Error fetching event ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * POST /events/:id/subscribe
   *
   * Subscribe to event reminder.
   * Requires X-Device-ID header.
   */
  fastify.post<{
    Params: { id: string };
  }>('/events/:id/subscribe', async (request, reply) => {
    const { id } = request.params;
    const deviceId = request.headers['x-device-id'] as string | undefined;

    console.info(`[Events] POST /events/${id}/subscribe device=${deviceId}`);

    if (!deviceId) {
      return reply.status(400).send({ error: 'X-Device-ID header required' });
    }

    try {
      // Verify event exists
      const event = await getEventById(id);
      if (!event) {
        return reply.status(404).send({ error: 'Event not found' });
      }

      await subscribeToReminder(deviceId, id);
      return reply.status(200).send({ subscribed: true });
    } catch (error) {
      console.error(`[Events] Error subscribing to event ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * DELETE /events/:id/subscribe
   *
   * Unsubscribe from event reminder.
   * Requires X-Device-ID header.
   */
  fastify.delete<{
    Params: { id: string };
  }>('/events/:id/subscribe', async (request, reply) => {
    const { id } = request.params;
    const deviceId = request.headers['x-device-id'] as string | undefined;

    console.info(`[Events] DELETE /events/${id}/subscribe device=${deviceId}`);

    if (!deviceId) {
      return reply.status(400).send({ error: 'X-Device-ID header required' });
    }

    try {
      await unsubscribeFromReminder(deviceId, id);
      return reply.status(200).send({ subscribed: false });
    } catch (error) {
      console.error(`[Events] Error unsubscribing from event ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /events/:id/subscription
   *
   * Check if device is subscribed to event reminder.
   * Requires X-Device-ID header.
   */
  fastify.get<{
    Params: { id: string };
  }>('/events/:id/subscription', async (request, reply) => {
    const { id } = request.params;
    const deviceId = request.headers['x-device-id'] as string | undefined;

    console.info(`[Events] GET /events/${id}/subscription device=${deviceId}`);

    if (!deviceId) {
      return reply.status(400).send({ error: 'X-Device-ID header required' });
    }

    try {
      const subscribed = await isSubscribed(deviceId, id);
      return reply.status(200).send({ subscribed });
    } catch (error) {
      console.error(`[Events] Error checking subscription for event ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
