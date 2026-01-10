/**
 * Click & Fix Routes (Public)
 *
 * Phase 6: Anonymous issue reporting with location + photos.
 *
 * Endpoints:
 * - POST /click-fix - submit new issue (multipart: fields + 0-3 images)
 * - GET /click-fix/:id - get issue detail (device owner only)
 * - GET /click-fix/sent - get sent items for device (Inbox → Sent tab)
 *
 * Headers:
 * - X-Device-ID: anonymous device identifier (required)
 * - X-User-Mode: 'visitor' | 'local'
 * - X-Municipality: 'vis' | 'komiza' (for locals)
 * - Accept-Language: 'hr' | 'en'
 */

import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import multipart from '@fastify/multipart';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { join, extname } from 'path';
import { pipeline } from 'stream/promises';
import { randomUUID } from 'crypto';
import type { Municipality, UserMode } from '../types/inbox.js';
import type { FeedbackLanguage } from '../types/feedback.js';
import type {
  Location,
  ClickFixDetailResponse,
  ClickFixSubmitResponse,
  ClickFixSentListItem,
  ClickFixPhotoResponse,
  ClickFixReplyResponse,
} from '../types/click-fix.js';
import {
  validateClickFixSubmission,
  validatePhoto,
  CLICK_FIX_VALIDATION,
  CLICK_FIX_RATE_LIMIT_ERROR,
  getClickFixStatusLabel,
} from '../types/click-fix.js';
import {
  checkRateLimit,
  createClickFix,
  getClickFixByIdForDevice,
  getClickFixPhotos,
  getClickFixReplies,
  getSentClickFixForDevice,
} from '../repositories/click-fix.js';
import type { PhotoInput } from '../repositories/click-fix.js';

// Uploads directory (relative to backend root)
const UPLOADS_DIR = join(process.cwd(), 'uploads', 'click-fix');

// Ensure uploads directory exists
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

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

/**
 * Generate photo URL from file path
 */
function getPhotoUrl(filePath: string): string {
  return `/uploads/click-fix/${filePath}`;
}

export async function clickFixRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  // Register multipart plugin
  await fastify.register(multipart, {
    limits: {
      fileSize: CLICK_FIX_VALIDATION.MAX_PHOTO_SIZE_BYTES,
      files: CLICK_FIX_VALIDATION.MAX_PHOTOS,
    },
  });

  /**
   * POST /click-fix
   *
   * Submit new Click & Fix issue with optional photos.
   *
   * Multipart form data:
   * - subject: string (required, max 120 chars)
   * - description: string (required, max 4000 chars)
   * - location: JSON string { lat: number, lng: number } (required)
   * - photos[]: file (optional, 0-3 images, max 5MB each)
   *
   * Rate limit: 3 per device per day (Europe/Zagreb timezone)
   */
  fastify.post<{
    Reply: ClickFixSubmitResponse | { error: string; error_hr?: string; error_en?: string };
  }>('/click-fix', async (request, reply) => {
    const context = getUserContext(request);
    const language = getLanguage(request);

    // Check for device ID
    if (!context.deviceId) {
      return reply.status(400).send({
        error: 'X-Device-ID header is required',
      });
    }

    console.info(`[ClickFix] POST /click-fix device=${context.deviceId} mode=${context.userMode} lang=${language}`);

    // Check rate limit
    const rateCheck = await checkRateLimit(context.deviceId);
    if (!rateCheck.allowed) {
      console.info(`[ClickFix] Rate limit exceeded for device=${context.deviceId}`);
      return reply.status(429).send({
        error: language === 'en' ? CLICK_FIX_RATE_LIMIT_ERROR.en : CLICK_FIX_RATE_LIMIT_ERROR.hr,
        error_hr: CLICK_FIX_RATE_LIMIT_ERROR.hr,
        error_en: CLICK_FIX_RATE_LIMIT_ERROR.en,
      });
    }

    try {
      // Parse multipart data
      const parts = request.parts();

      let subject = '';
      let description = '';
      let location: Location | null = null;
      const photos: PhotoInput[] = [];
      const photoErrors: string[] = [];

      for await (const part of parts) {
        if (part.type === 'field') {
          const fieldValue = part.value as string;

          if (part.fieldname === 'subject') {
            subject = fieldValue;
          } else if (part.fieldname === 'description') {
            description = fieldValue;
          } else if (part.fieldname === 'location') {
            try {
              location = JSON.parse(fieldValue) as Location;
            } catch {
              return reply.status(400).send({ error: 'Invalid location format. Must be JSON: { lat, lng }' });
            }
          }
        } else if (part.type === 'file') {
          // Validate photo
          const photoValidation = validatePhoto(part.mimetype, 0); // Size checked by stream

          if (!photoValidation.valid) {
            photoErrors.push(photoValidation.error || 'Invalid photo');
            // Consume the stream to avoid hanging
            for await (const _chunk of part.file) {
              // drain
            }
            continue;
          }

          if (photos.length >= CLICK_FIX_VALIDATION.MAX_PHOTOS) {
            photoErrors.push(`Maximum ${CLICK_FIX_VALIDATION.MAX_PHOTOS} photos allowed`);
            for await (const _chunk of part.file) {
              // drain
            }
            continue;
          }

          // Generate unique filename
          const ext = extname(part.filename || '.jpg');
          const uniqueFilename = `${randomUUID()}${ext}`;
          const filePath = join(UPLOADS_DIR, uniqueFilename);

          // Stream file to disk
          let fileSize = 0;
          const writeStream = createWriteStream(filePath);

          try {
            await pipeline(part.file, writeStream);
            const stats = await import('fs').then((fs) => fs.promises.stat(filePath));
            fileSize = stats.size;

            // Validate size after upload
            const sizeValidation = validatePhoto(part.mimetype, fileSize);
            if (!sizeValidation.valid) {
              // Delete the file
              await import('fs').then((fs) => fs.promises.unlink(filePath));
              photoErrors.push(sizeValidation.error || 'Photo too large');
              continue;
            }

            photos.push({
              filePath: uniqueFilename,
              fileName: part.filename || uniqueFilename,
              mimeType: part.mimetype,
              fileSize,
              displayOrder: photos.length,
            });
          } catch (uploadError) {
            console.error('[ClickFix] Error uploading photo:', uploadError);
            photoErrors.push('Failed to upload photo');
          }
        }
      }

      // Validate input
      const validation = validateClickFixSubmission(subject, description, location);

      if (!validation.valid) {
        return reply.status(400).send({
          error: validation.errors.join('. '),
        });
      }

      // Report photo errors as warnings (submission still proceeds)
      if (photoErrors.length > 0) {
        console.warn(`[ClickFix] Photo warnings: ${photoErrors.join(', ')}`);
      }

      // Create click & fix submission
      const clickFix = await createClickFix(
        {
          deviceId: context.deviceId,
          userMode: context.userMode,
          municipality: context.municipality,
          language,
          subject: subject.trim(),
          description: description.trim(),
          location: location as Location,
        },
        photos
      );

      // Success message
      const successMessage = language === 'en'
        ? 'Your report has been submitted successfully.'
        : 'Vaša prijava je uspješno poslana.';

      const response: ClickFixSubmitResponse = {
        id: clickFix.id,
        message: successMessage,
      };

      return reply.status(201).send(response);
    } catch (error) {
      console.error('[ClickFix] Error creating submission:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /click-fix/:id
   *
   * Get Click & Fix detail.
   * Only accessible by the device that submitted it.
   */
  fastify.get<{
    Params: { id: string };
    Reply: ClickFixDetailResponse | { error: string };
  }>('/click-fix/:id', async (request, reply) => {
    const { id } = request.params;
    const context = getUserContext(request);
    const language = getLanguage(request);

    if (!context.deviceId) {
      return reply.status(400).send({
        error: 'X-Device-ID header is required',
      });
    }

    console.info(`[ClickFix] GET /click-fix/${id} device=${context.deviceId}`);

    try {
      // Get click_fix (device check is done in repository)
      const clickFix = await getClickFixByIdForDevice(id, context.deviceId);

      if (!clickFix) {
        return reply.status(404).send({ error: 'Report not found' });
      }

      // Get photos and replies
      const photos = await getClickFixPhotos(id);
      const replies = await getClickFixReplies(id);

      const response: ClickFixDetailResponse = {
        id: clickFix.id,
        subject: clickFix.subject,
        description: clickFix.description,
        location: {
          lat: clickFix.location_lat,
          lng: clickFix.location_lng,
        },
        status: clickFix.status,
        status_label: getClickFixStatusLabel(clickFix.status, language),
        language: clickFix.language,
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
      console.error(`[ClickFix] Error fetching click-fix ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /click-fix/sent
   *
   * Get sent Click & Fix items for the device (for Inbox → Sent tab).
   */
  fastify.get<{
    Querystring: { page?: string; page_size?: string };
    Reply: {
      items: ClickFixSentListItem[];
      total: number;
      page: number;
      page_size: number;
      has_more: boolean;
    } | { error: string };
  }>('/click-fix/sent', async (request, reply) => {
    const context = getUserContext(request);
    const language = getLanguage(request);

    if (!context.deviceId) {
      return reply.status(400).send({
        error: 'X-Device-ID header is required',
      });
    }

    const page = Math.max(1, parseInt(request.query.page ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(request.query.page_size ?? '20', 10)));

    console.info(`[ClickFix] GET /click-fix/sent device=${context.deviceId} page=${page}`);

    try {
      const { items, total } = await getSentClickFixForDevice(context.deviceId, page, pageSize);

      return reply.status(200).send({
        items: items.map((cf): ClickFixSentListItem => ({
          id: cf.id,
          type: 'click_fix',
          subject: cf.subject,
          status: cf.status,
          status_label: getClickFixStatusLabel(cf.status, language),
          photo_count: cf.photo_count,
          created_at: cf.created_at.toISOString(),
        })),
        total,
        page,
        page_size: pageSize,
        has_more: page * pageSize < total,
      });
    } catch (error) {
      console.error('[ClickFix] Error fetching sent items:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
