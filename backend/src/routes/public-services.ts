/**
 * Public Services Routes (Public)
 *
 * Public endpoints for public services (mobile app).
 *
 * Endpoints:
 * - GET /public-services - list all active services (localized)
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { getAllPublicServices } from '../repositories/public-service.js';
import type {
  PublicServiceResponse,
  PublicServiceAdminResponse,
  ScheduledDate,
} from '../types/public-service.js';

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
 * Check if any scheduled date was created within the last 7 days
 */
function hasNewDates(scheduledDates: ScheduledDate[]): boolean {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return scheduledDates.some((date) => {
    const createdAt = new Date(date.created_at);
    return createdAt >= sevenDaysAgo;
  });
}

/**
 * Transform PublicServiceAdminResponse to localized PublicServiceResponse
 */
function toPublicResponse(
  service: PublicServiceAdminResponse,
  language: Language
): PublicServiceResponse {
  const title = language === 'en' ? service.title_en : service.title_hr;
  const subtitle = language === 'en' ? service.subtitle_en : service.subtitle_hr;
  const note = language === 'en' ? service.note_en : service.note_hr;

  // Localize working hours descriptions
  const workingHours = service.working_hours.map((wh) => ({
    time: wh.time,
    description: language === 'en' ? wh.description_en : wh.description_hr,
  }));

  return {
    id: service.id,
    type: service.type,
    title: title ?? '',
    subtitle: subtitle ?? null,
    address: service.address,
    contacts: service.contacts,
    icon: service.icon,
    icon_bg_color: service.icon_bg_color,
    working_hours: workingHours,
    scheduled_dates: service.scheduled_dates,
    note: note ?? null,
    has_new_dates: hasNewDates(service.scheduled_dates),
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function publicServicesRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  /**
   * GET /public-services
   *
   * List all active public services (localized based on Accept-Language).
   */
  fastify.get('/public-services', async (request, reply) => {
    const language = getLanguage(request.headers['accept-language']);

    console.info(`[Public] GET /public-services lang=${language}`);

    try {
      const services = await getAllPublicServices(true); // Active only

      const response = {
        services: services.map((s) => toPublicResponse(s, language)),
        total: services.length,
      };

      return reply.status(200).send(response);
    } catch (error) {
      console.error('[Public] Error fetching public services:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
