/**
 * Transport Routes (Public)
 *
 * Public endpoints for transport timetables.
 * READ-ONLY API - no admin routes (data imported via seed scripts).
 *
 * Endpoints:
 * - GET /transport/road/lines - list road lines
 * - GET /transport/sea/lines - list sea lines
 * - GET /transport/road/lines/:id - road line detail
 * - GET /transport/sea/lines/:id - sea line detail
 * - GET /transport/road/lines/:id/departures - road line departures
 * - GET /transport/sea/lines/:id/departures - sea line departures
 * - GET /transport/road/today - today's road departures
 * - GET /transport/sea/today - today's sea departures
 *
 * Direction is resolved via route_id (no free-form strings).
 * Stops with null times are NOT rendered (skipped entirely).
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  getLinesByType,
  getLineById,
  getRoutesByLineId,
  getRouteByLineAndDirection,
  getStopsForRoute,
  getStopNamesForLine,
  getDeparturesForRouteAndDate,
  getTodaysDepartures,
  getContactsForLine,
} from '../repositories/transport.js';
import { getTodayInZagreb, parseDateInZagreb } from '../lib/holidays.js';
import type {
  TransportType,
  LinesListResponse,
  LineListItem,
  LineDetailResponse,
  DeparturesListResponse,
  DepartureResponse,
  DepartureStopTime,
  TodaysDeparturesResponse,
  LineContactsResponse,
} from '../types/transport.js';

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
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Create transport routes for a specific type
 */
function createTransportRoutes(transportType: TransportType) {
  // eslint-disable-next-line @typescript-eslint/require-await -- Fastify plugin contract requires async
  return async function transportRoutes(
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions
  ): Promise<void> {
    const prefix = transportType === 'road' ? 'road' : 'sea';

    /**
     * GET /transport/{type}/lines
     * List all lines for this transport type
     */
    fastify.get(`/transport/${prefix}/lines`, async (request, reply) => {
      const language = getLanguage(request.headers['accept-language']);

      console.info(`[Transport] GET /transport/${prefix}/lines`);

      try {
        const lines = await getLinesByType(transportType);

        const lineItems: LineListItem[] = await Promise.all(
          lines.map(async (line) => {
            const { stops_hr, stops_en } = await getStopNamesForLine(line.id);
            const routes = await getRoutesByLineId(line.id);
            const duration = routes[0]?.typical_duration_minutes ?? null;

            const stops = language === 'en' ? stops_en : stops_hr;

            return {
              id: line.id,
              name: language === 'en' ? line.name_en : line.name_hr,
              subtype: language === 'en' ? line.subtype_en : line.subtype_hr,
              stops_summary: stops.join(' - '),
              stops_count: stops.length,
              typical_duration_minutes: duration,
            };
          })
        );

        const response: LinesListResponse = { lines: lineItems };
        return reply.status(200).send(response);
      } catch (error) {
        console.error(`[Transport] Error fetching ${prefix} lines:`, error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    });

    /**
     * GET /transport/{type}/lines/:id
     * Get line detail with routes and contacts
     */
    fastify.get<{ Params: { id: string } }>(
      `/transport/${prefix}/lines/:id`,
      async (request, reply) => {
        const { id } = request.params;
        const language = getLanguage(request.headers['accept-language']);

        console.info(`[Transport] GET /transport/${prefix}/lines/${id}`);

        try {
          const line = await getLineById(id);
          if (!line || line.transport_type !== transportType) {
            return reply.status(404).send({ error: 'Line not found' });
          }

          const routes = await getRoutesByLineId(id);
          const contacts = await getContactsForLine(id);

          const routeInfos = await Promise.all(
            routes.map(async (route) => {
              const stops = await getStopsForRoute(route.id);
              return {
                id: route.id,
                direction: route.direction,
                direction_label:
                  language === 'en'
                    ? route.direction_label_en
                    : route.direction_label_hr,
                origin: stops[0]
                  ? language === 'en'
                    ? stops[0].name_en
                    : stops[0].name_hr
                  : '',
                destination: stops[stops.length - 1]
                  ? language === 'en'
                    ? stops[stops.length - 1].name_en
                    : stops[stops.length - 1].name_hr
                  : '',
                stops: stops.map((s, i) => ({
                  id: s.id,
                  name: language === 'en' ? s.name_en : s.name_hr,
                  order: i,
                })),
                typical_duration_minutes: route.typical_duration_minutes,
              };
            })
          );

          const response: LineDetailResponse = {
            id: line.id,
            name: language === 'en' ? line.name_en : line.name_hr,
            subtype: language === 'en' ? line.subtype_en : line.subtype_hr,
            routes: routeInfos,
            contacts: contacts.map((c) => ({
              operator: language === 'en' ? c.operator_en : c.operator_hr,
              phone: c.phone,
              email: c.email,
              website: c.website,
            })),
          };

          return reply.status(200).send(response);
        } catch (error) {
          console.error(`[Transport] Error fetching line ${id}:`, error);
          return reply.status(500).send({ error: 'Internal server error' });
        }
      }
    );

    /**
     * GET /transport/{type}/lines/:id/departures
     * Get departures for a line on a specific date and direction
     *
     * Query params:
     * - date: YYYY-MM-DD (default: today)
     * - direction: 0 or 1 (default: 0)
     */
    fastify.get<{
      Params: { id: string };
      Querystring: { date?: string; direction?: string };
    }>(`/transport/${prefix}/lines/:id/departures`, async (request, reply) => {
      const { id } = request.params;
      const dateParam = request.query.date;
      const directionParam = request.query.direction ?? '0';
      const language = getLanguage(request.headers['accept-language']);

      // Default to today if no date provided
      const date = dateParam
        ? parseDateInZagreb(dateParam)
        : getTodayInZagreb();
      const dateStr = formatDate(date);
      const direction = parseInt(directionParam, 10);

      // Validate direction
      if (direction !== 0 && direction !== 1) {
        return reply.status(400).send({ error: 'Direction must be 0 or 1' });
      }

      console.info(
        `[Transport] GET /transport/${prefix}/lines/${id}/departures date=${dateStr} dir=${direction}`
      );

      try {
        const line = await getLineById(id);
        if (!line || line.transport_type !== transportType) {
          return reply.status(404).send({ error: 'Line not found' });
        }

        const route = await getRouteByLineAndDirection(id, direction);
        if (!route) {
          return reply.status(404).send({ error: 'Route not found' });
        }

        const stops = await getStopsForRoute(route.id);
        const { departures, dayType, isHoliday: holiday } =
          await getDeparturesForRouteAndDate(route.id, dateStr);

        const departureResponses: DepartureResponse[] = departures.map((dep) => {
          // Build stop times - ONLY include stops where vessel STOPS
          // null times are SKIPPED entirely (not rendered)
          const stopTimes: DepartureStopTime[] = [];
          for (let i = 0; i < dep.stop_times.length; i++) {
            const time = dep.stop_times[i];
            if (time !== null && stops[i]) {
              stopTimes.push({
                stop_name: language === 'en' ? stops[i].name_en : stops[i].name_hr,
                arrival_time: time,
              });
            }
          }

          // Calculate duration from first to last rendered stop
          let durationMinutes: number | null = null;
          if (stopTimes.length >= 2) {
            const firstTime = stopTimes[0].arrival_time;
            const lastTime = stopTimes[stopTimes.length - 1].arrival_time;
            const [fh, fm] = firstTime.split(':').map(Number);
            const [lh, lm] = lastTime.split(':').map(Number);
            durationMinutes = lh * 60 + lm - (fh * 60 + fm);
            if (durationMinutes < 0) durationMinutes += 24 * 60; // Midnight crossing
          }

          // Destination is the last rendered stop
          const destination =
            stopTimes.length > 0
              ? stopTimes[stopTimes.length - 1].stop_name
              : '';

          return {
            id: dep.id,
            departure_time: dep.departure_time,
            destination,
            duration_minutes: durationMinutes ?? route.typical_duration_minutes,
            notes: language === 'en' ? dep.notes_en : dep.notes_hr,
            stop_times: stopTimes,
          };
        });

        const response: DeparturesListResponse = {
          line_id: line.id,
          line_name: language === 'en' ? line.name_en : line.name_hr,
          route_id: route.id,
          direction: route.direction,
          direction_label:
            language === 'en'
              ? route.direction_label_en
              : route.direction_label_hr,
          date: dateStr,
          day_type: dayType,
          is_holiday: holiday,
          departures: departureResponses,
        };

        return reply.status(200).send(response);
      } catch (error) {
        console.error(`[Transport] Error fetching departures for line ${id}:`, error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    });

    /**
     * GET /transport/{type}/today
     * Get today's departures aggregated across all lines
     *
     * Query params:
     * - date: YYYY-MM-DD (default: today)
     */
    fastify.get<{ Querystring: { date?: string } }>(
      `/transport/${prefix}/today`,
      async (request, reply) => {
        const language = getLanguage(request.headers['accept-language']);
        const dateParam = request.query.date;

        const date = dateParam
          ? parseDateInZagreb(dateParam)
          : getTodayInZagreb();
        const dateStr = formatDate(date);

        console.info(`[Transport] GET /transport/${prefix}/today date=${dateStr}`);

        try {
          const { departures, dayType, isHoliday: holiday } =
            await getTodaysDepartures(transportType, dateStr);

          const response: TodaysDeparturesResponse = {
            date: dateStr,
            day_type: dayType,
            is_holiday: holiday,
            departures: departures.map((dep) => ({
              departure_time: dep.departure_time,
              line_id: dep.line_id,
              line_name:
                language === 'en' ? dep.line_name_en : dep.line_name_hr,
              route_id: dep.route_id,
              direction_label:
                language === 'en'
                  ? dep.direction_label_en
                  : dep.direction_label_hr,
              destination:
                language === 'en' ? dep.destination_en : dep.destination_hr,
            })),
          };

          return reply.status(200).send(response);
        } catch (error) {
          console.error(`[Transport] Error fetching today's departures:`, error);
          return reply.status(500).send({ error: 'Internal server error' });
        }
      }
    );

    /**
     * GET /transport/{type}/lines/:id/contacts
     * Get contacts for a specific line
     */
    fastify.get<{ Params: { id: string } }>(
      `/transport/${prefix}/lines/:id/contacts`,
      async (request, reply) => {
        const { id } = request.params;
        const language = getLanguage(request.headers['accept-language']);

        console.info(`[Transport] GET /transport/${prefix}/lines/${id}/contacts`);

        try {
          const line = await getLineById(id);
          if (!line || line.transport_type !== transportType) {
            return reply.status(404).send({ error: 'Line not found' });
          }

          const contacts = await getContactsForLine(id);

          const response: LineContactsResponse = {
            line_id: line.id,
            line_name: language === 'en' ? line.name_en : line.name_hr,
            contacts: contacts.map((c) => ({
              operator: language === 'en' ? c.operator_en : c.operator_hr,
              phone: c.phone,
              email: c.email,
              website: c.website,
            })),
          };

          return reply.status(200).send(response);
        } catch (error) {
          console.error(`[Transport] Error fetching contacts for line ${id}:`, error);
          return reply.status(500).send({ error: 'Internal server error' });
        }
      }
    );
  };
}

// Export route handlers for both transport types
export const roadTransportRoutes = createTransportRoutes('road');
export const seaTransportRoutes = createTransportRoutes('sea');
