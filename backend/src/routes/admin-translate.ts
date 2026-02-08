/**
 * Admin Translation Routes
 *
 * Server-side proxy for DeepL translation API.
 * Keeps API key secure (not exposed in browser bundle).
 *
 * Endpoints:
 * - POST /admin/translate/hr-to-en - translate Croatian text to English
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { env } from '../config/env.js';

// Max content length limits (in characters)
const MAX_TITLE_LENGTH = 500;
const MAX_BODY_LENGTH = 10000;

interface TranslateRequestBody {
  title_hr: string;
  body_hr: string;
}

interface TranslateResponse {
  title_en: string;
  body_en: string;
}

interface DeepLTranslation {
  detected_source_language: string;
  text: string;
}

interface DeepLResponse {
  translations: DeepLTranslation[];
}

/**
 * Call DeepL API to translate text
 */
async function translateWithDeepL(
  texts: string[],
  apiKey: string
): Promise<string[]> {
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: texts,
      source_lang: 'HR',
      target_lang: 'EN-GB',
      preserve_formatting: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Translate] DeepL API error:', response.status, errorText);
    throw new Error(`DeepL API error: ${response.status}`);
  }

  const data = await response.json() as DeepLResponse;
  return data.translations.map(t => t.text);
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function adminTranslateRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  /**
   * POST /admin/translate/hr-to-en
   *
   * Translate Croatian title and body to English using DeepL.
   * Requires admin authentication (handled by global hook).
   */
  fastify.post<{
    Body: TranslateRequestBody;
  }>('/admin/translate/hr-to-en', async (request, reply) => {
    // Check if DeepL is configured
    if (!env.DEEPL_API_KEY) {
      return reply.status(503).send({
        error: 'Translation service not configured',
        code: 'TRANSLATION_NOT_CONFIGURED',
      });
    }

    const { title_hr, body_hr } = request.body;

    // Validate required fields
    if (!title_hr || typeof title_hr !== 'string' || !title_hr.trim()) {
      return reply.status(400).send({
        error: 'Naslov (HR) je obavezan',
        code: 'MISSING_TITLE_HR',
      });
    }

    if (!body_hr || typeof body_hr !== 'string' || !body_hr.trim()) {
      return reply.status(400).send({
        error: 'Sadržaj (HR) je obavezan',
        code: 'MISSING_BODY_HR',
      });
    }

    // Validate length limits
    if (title_hr.length > MAX_TITLE_LENGTH) {
      return reply.status(400).send({
        error: `Naslov je predugačak (max ${MAX_TITLE_LENGTH} znakova)`,
        code: 'TITLE_TOO_LONG',
      });
    }

    if (body_hr.length > MAX_BODY_LENGTH) {
      return reply.status(400).send({
        error: `Sadržaj je predugačak (max ${MAX_BODY_LENGTH} znakova)`,
        code: 'BODY_TOO_LONG',
      });
    }

    console.info('[Translate] Translating HR → EN:', {
      titleLength: title_hr.length,
      bodyLength: body_hr.length,
    });

    try {
      const [title_en, body_en] = await translateWithDeepL(
        [title_hr.trim(), body_hr.trim()],
        env.DEEPL_API_KEY
      );

      const response: TranslateResponse = {
        title_en,
        body_en,
      };

      return reply.status(200).send(response);
    } catch (error) {
      console.error('[Translate] Translation failed:', error);
      return reply.status(500).send({
        error: 'Prijevod nije uspio. Pokušajte ponovo.',
        code: 'TRANSLATION_FAILED',
      });
    }
  });
}
