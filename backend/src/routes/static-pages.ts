/**
 * Static Pages Public Routes
 *
 * Public endpoints for fetching published static pages.
 * Phase 3: Static Content Pages
 *
 * Routes:
 * - GET /pages - List all published pages (for menu)
 * - GET /pages/:slug - Get published page by slug
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getPublishedPages,
  getPublishedPageBySlug,
} from '../repositories/static-page.js';
// NOTE: InboxMessage injection removed from static pages (2026-01-09)
// InboxMessage placement restricted to: Home, Events, Transport screens only
import type {
  StaticPagePublicResponse,
  StaticPageListResponse,
  PageHeader,
  ContentBlock,
  TextBlockContent,
  HighlightBlockContent,
  CardListBlockContent,
  MediaBlockContent,
  MapBlockContent,
  ContactBlockContent,
  LinkListBlockContent,
} from '../types/static-page.js';

/**
 * Get language from Accept-Language header
 */
function getLanguage(request: FastifyRequest): 'hr' | 'en' {
  const acceptLang = request.headers['accept-language'] || 'hr';
  return acceptLang.toLowerCase().startsWith('en') ? 'en' : 'hr';
}

/**
 * Localize header content
 */
function localizeHeader(
  header: PageHeader,
  lang: 'hr' | 'en'
): StaticPagePublicResponse['header'] {
  const base = {
    type: header.type,
    title: lang === 'en' ? header.title_en : header.title_hr,
    subtitle: lang === 'en' ? header.subtitle_en : header.subtitle_hr,
  };

  if (header.type === 'simple') {
    return {
      ...base,
      icon: header.icon,
    };
  }

  return {
    ...base,
    images: header.images,
  };
}

/**
 * Localize block content based on type
 */
function localizeBlockContent(
  block: ContentBlock,
  lang: 'hr' | 'en'
): Record<string, unknown> {
  switch (block.type) {
    case 'text': {
      const content = block.content as TextBlockContent;
      return {
        title: lang === 'en' ? content.title_en : content.title_hr,
        body: lang === 'en' ? content.body_en : content.body_hr,
      };
    }

    case 'highlight': {
      const content = block.content as HighlightBlockContent;
      return {
        title: lang === 'en' ? content.title_en : content.title_hr,
        body: lang === 'en' ? content.body_en : content.body_hr,
        icon: content.icon,
        variant: content.variant,
      };
    }

    case 'card_list': {
      const content = block.content as CardListBlockContent;
      return {
        cards: content.cards.map((card) => ({
          id: card.id,
          image_url: card.image_url,
          title: lang === 'en' ? card.title_en : card.title_hr,
          description: lang === 'en' ? card.description_en : card.description_hr,
          meta: lang === 'en' ? card.meta_en : card.meta_hr,
          link_type: card.link_type,
          link_target: card.link_target,
        })),
      };
    }

    case 'media': {
      const content = block.content as MediaBlockContent;
      return {
        images: content.images,
        caption: lang === 'en' ? content.caption_en : content.caption_hr,
      };
    }

    case 'map': {
      const content = block.content as MapBlockContent;
      return {
        pins: content.pins.map((pin) => ({
          id: pin.id,
          latitude: pin.latitude,
          longitude: pin.longitude,
          title: lang === 'en' ? pin.title_en : pin.title_hr,
          description: lang === 'en' ? pin.description_en : pin.description_hr,
        })),
      };
    }

    case 'contact': {
      const content = block.content as ContactBlockContent;
      return {
        contacts: content.contacts.map((contact) => ({
          id: contact.id,
          icon: contact.icon,
          name: lang === 'en' ? contact.name_en : contact.name_hr,
          address: lang === 'en' ? contact.address_en : contact.address_hr,
          phones: contact.phones,
          email: contact.email,
          working_hours: lang === 'en' ? contact.working_hours_en : contact.working_hours_hr,
          note: lang === 'en' ? contact.note_en : contact.note_hr,
        })),
      };
    }

    case 'link_list': {
      const content = block.content as LinkListBlockContent;
      return {
        links: content.links.map((link) => ({
          id: link.id,
          title: lang === 'en' ? link.title_en : link.title_hr,
          link_type: link.link_type,
          link_target: link.link_target,
        })),
      };
    }

    case 'notice':
      // Notice blocks are injected at runtime
      return {};

    default:
      return {};
  }
}

export async function staticPageRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /pages
   * List all published pages (for menu)
   */
  fastify.get('/pages', async (request: FastifyRequest, reply: FastifyReply) => {
    const lang = getLanguage(request);

    try {
      const pages = await getPublishedPages();

      const response: StaticPageListResponse = {
        pages: pages.map((page) => ({
          id: page.id,
          slug: page.slug,
          title:
            lang === 'en'
              ? page.published_header?.title_en || ''
              : page.published_header?.title_hr || '',
        })),
      };

      return reply.send(response);
    } catch (error) {
      request.log.error(error, '[StaticPages] Error fetching pages');
      return reply.status(500).send({ error: true, message: 'Internal server error' });
    }
  });

  /**
   * GET /pages/:slug
   * Get published page by slug with optional notice injection
   */
  fastify.get(
    '/pages/:slug',
    async (
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) => {
      const { slug } = request.params;
      const lang = getLanguage(request);

      try {
        const page = await getPublishedPageBySlug(slug);

        if (!page || !page.published_header || !page.published_blocks) {
          return reply.status(404).send({
            error: true,
            message: 'Page not found',
          });
        }

        // Localize blocks
        // NOTE: Static pages do NOT show InboxMessages (per product owner confirmation 2026-01-09)
        // InboxMessage placement is restricted to: Home, Events, Transport screens only
        const localizedBlocks = page.published_blocks
          .filter((b) => b.type !== 'notice') // Filter out notice blocks (not used on static pages)
          .map((block) => ({
            id: block.id,
            type: block.type,
            content: localizeBlockContent(block, lang),
          }));

        const response: StaticPagePublicResponse = {
          id: page.id,
          slug: page.slug,
          header: localizeHeader(page.published_header, lang),
          blocks: localizedBlocks,
        };

        return reply.send(response);
      } catch (error) {
        request.log.error(error, '[StaticPages] Error fetching page');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );
}
