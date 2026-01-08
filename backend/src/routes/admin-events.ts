/**
 * Admin Events Routes
 *
 * CRUD endpoints for events (admin panel).
 *
 * Endpoints:
 * - GET /admin/events - list all events
 * - GET /admin/events/:id - single event
 * - POST /admin/events - create event
 * - PATCH /admin/events/:id - update event
 * - DELETE /admin/events/:id - delete event
 *
 * Note: Per spec, events are LIVE ON SAVE (no draft workflow).
 * HR and EN are both REQUIRED for events.
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../repositories/event.js';
import type { Event, AdminEventResponse, AdminEventListResponse } from '../types/event.js';

interface CreateEventBody {
  title_hr: string;
  title_en: string;
  description_hr?: string | null;
  description_en?: string | null;
  start_datetime: string;
  end_datetime?: string | null;
  location_hr?: string | null;
  location_en?: string | null;
  is_all_day?: boolean;
}

interface UpdateEventBody {
  title_hr?: string;
  title_en?: string;
  description_hr?: string | null;
  description_en?: string | null;
  start_datetime?: string;
  end_datetime?: string | null;
  location_hr?: string | null;
  location_en?: string | null;
  is_all_day?: boolean;
}

/**
 * Transform Event to admin API response
 */
function toAdminResponse(event: Event): AdminEventResponse {
  return {
    id: event.id,
    title_hr: event.title_hr,
    title_en: event.title_en,
    description_hr: event.description_hr,
    description_en: event.description_en,
    start_datetime: event.start_datetime.toISOString(),
    end_datetime: event.end_datetime?.toISOString() ?? null,
    location_hr: event.location_hr,
    location_en: event.location_en,
    is_all_day: event.is_all_day,
    created_at: event.created_at.toISOString(),
    updated_at: event.updated_at.toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function adminEventRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  // TODO: Add admin authentication middleware here

  /**
   * GET /admin/events
   *
   * List all events (admin view).
   */
  fastify.get<{
    Querystring: { page?: string; page_size?: string };
  }>('/admin/events', async (request, reply) => {
    const page = Math.max(1, parseInt(request.query.page ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(request.query.page_size ?? '20', 10)));

    console.info(`[Admin] GET /admin/events page=${page} pageSize=${pageSize}`);

    try {
      const { events, total } = await getEvents(page, pageSize);

      const response: AdminEventListResponse = {
        events: events.map(toAdminResponse),
        total,
        page,
        page_size: pageSize,
        has_more: page * pageSize < total,
      };

      return reply.status(200).send(response);
    } catch (error) {
      console.error('[Admin] Error fetching events:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /admin/events/:id
   *
   * Get single event by ID (admin view).
   */
  fastify.get<{
    Params: { id: string };
  }>('/admin/events/:id', async (request, reply) => {
    const { id } = request.params;

    console.info(`[Admin] GET /admin/events/${id}`);

    try {
      const event = await getEventById(id);

      if (!event) {
        return reply.status(404).send({ error: 'Event not found' });
      }

      return reply.status(200).send(toAdminResponse(event));
    } catch (error) {
      console.error(`[Admin] Error fetching event ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * POST /admin/events
   *
   * Create new event.
   * Event is LIVE immediately after creation.
   * HR and EN titles are REQUIRED.
   */
  fastify.post<{
    Body: CreateEventBody;
  }>('/admin/events', async (request, reply) => {
    const body = request.body;

    console.info('[Admin] POST /admin/events');

    // Validate required fields (HR and EN both required for events)
    if (!body.title_hr?.trim()) {
      return reply.status(400).send({ error: 'title_hr is required' });
    }
    if (!body.title_en?.trim()) {
      return reply.status(400).send({ error: 'title_en is required' });
    }
    if (!body.start_datetime) {
      return reply.status(400).send({ error: 'start_datetime is required' });
    }

    // Validate date range if end_datetime provided
    if (body.end_datetime) {
      const start = new Date(body.start_datetime);
      const end = new Date(body.end_datetime);
      if (end <= start) {
        return reply.status(400).send({
          error: 'end_datetime must be after start_datetime',
        });
      }
    }

    try {
      const event = await createEvent({
        title_hr: body.title_hr.trim(),
        title_en: body.title_en.trim(),
        description_hr: body.description_hr?.trim() || null,
        description_en: body.description_en?.trim() || null,
        start_datetime: new Date(body.start_datetime),
        end_datetime: body.end_datetime ? new Date(body.end_datetime) : null,
        location_hr: body.location_hr?.trim() || null,
        location_en: body.location_en?.trim() || null,
        is_all_day: body.is_all_day ?? false,
      });

      return reply.status(201).send(toAdminResponse(event));
    } catch (error) {
      console.error('[Admin] Error creating event:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * PATCH /admin/events/:id
   *
   * Update existing event.
   * Changes are LIVE immediately.
   */
  fastify.patch<{
    Params: { id: string };
    Body: UpdateEventBody;
  }>('/admin/events/:id', async (request, reply) => {
    const { id } = request.params;
    const body = request.body;

    console.info(`[Admin] PATCH /admin/events/${id}`);

    // Validate date range if both provided
    if (body.start_datetime !== undefined && body.end_datetime !== undefined) {
      if (body.end_datetime) {
        const start = new Date(body.start_datetime ?? '');
        const end = new Date(body.end_datetime);
        if (end <= start) {
          return reply.status(400).send({
            error: 'end_datetime must be after start_datetime',
          });
        }
      }
    }

    try {
      const updates: Parameters<typeof updateEvent>[1] = {};

      if (body.title_hr !== undefined) {
        updates.title_hr = body.title_hr.trim();
      }
      if (body.title_en !== undefined) {
        updates.title_en = body.title_en.trim();
      }
      if (body.description_hr !== undefined) {
        updates.description_hr = body.description_hr?.trim() || null;
      }
      if (body.description_en !== undefined) {
        updates.description_en = body.description_en?.trim() || null;
      }
      if (body.start_datetime !== undefined) {
        updates.start_datetime = new Date(body.start_datetime);
      }
      if (body.end_datetime !== undefined) {
        updates.end_datetime = body.end_datetime ? new Date(body.end_datetime) : null;
      }
      if (body.location_hr !== undefined) {
        updates.location_hr = body.location_hr?.trim() || null;
      }
      if (body.location_en !== undefined) {
        updates.location_en = body.location_en?.trim() || null;
      }
      if (body.is_all_day !== undefined) {
        updates.is_all_day = body.is_all_day;
      }

      const event = await updateEvent(id, updates);

      if (!event) {
        return reply.status(404).send({ error: 'Event not found' });
      }

      return reply.status(200).send(toAdminResponse(event));
    } catch (error) {
      console.error(`[Admin] Error updating event ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * DELETE /admin/events/:id
   *
   * Delete event.
   */
  fastify.delete<{
    Params: { id: string };
  }>('/admin/events/:id', async (request, reply) => {
    const { id } = request.params;

    console.info(`[Admin] DELETE /admin/events/${id}`);

    try {
      const deleted = await deleteEvent(id);

      if (!deleted) {
        return reply.status(404).send({ error: 'Event not found' });
      }

      return reply.status(204).send();
    } catch (error) {
      console.error(`[Admin] Error deleting event ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
