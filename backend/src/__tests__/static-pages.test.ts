/**
 * Static Pages Tests
 *
 * Tests for static pages CMS validation and routes.
 * Phase 3: Static Content Pages
 *
 * Required test coverage (per spec):
 * - publish blocked if EN missing
 * - publish blocked if header missing / multiple headers
 * - publish blocked if >1 map block
 * - notice injection does not allow editing
 * - permission checks: admin vs supervisor actions
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import {
  validateForPublish,
  validateBlockContent,
  isValidBlockType,
  countMapBlocks,
  type StaticPage,
  type ContentBlock,
  type PageHeader,
  type TextBlockContent,
  type MapBlockContent,
} from '../types/static-page.js';

// ============================================================
// Unit Tests for Validation Functions
// ============================================================

describe('Static Page Validation', () => {
  // Helper to create a valid page
  function createValidPage(overrides: Partial<StaticPage> = {}): StaticPage {
    const defaultHeader: PageHeader = {
      type: 'simple',
      title_hr: 'Naslov stranice',
      title_en: 'Page Title',
      subtitle_hr: null,
      subtitle_en: null,
      icon: null,
    };

    const defaultBlocks: ContentBlock[] = [
      {
        id: 'block-1',
        type: 'text',
        content: {
          title_hr: 'Tekst naslov',
          title_en: 'Text title',
          body_hr: 'Hrvatski tekst',
          body_en: 'English text',
        } as TextBlockContent,
        order: 0,
        structure_locked: false,
        content_locked: false,
      },
    ];

    return {
      id: 'page-1',
      slug: 'test-page',
      draft_header: defaultHeader,
      draft_blocks: defaultBlocks,
      draft_updated_at: new Date(),
      draft_updated_by: null,
      published_header: null,
      published_blocks: null,
      published_at: null,
      published_by: null,
      created_at: new Date(),
      created_by: null,
      ...overrides,
    };
  }

  describe('validateForPublish', () => {
    it('should pass validation for valid page', () => {
      const page = createValidPage();
      const result = validateForPublish(page);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail if header title_hr is missing', () => {
      const page = createValidPage({
        draft_header: {
          type: 'simple',
          title_hr: '', // Empty
          title_en: 'Page Title',
          subtitle_hr: null,
          subtitle_en: null,
          icon: null,
        },
      });

      const result = validateForPublish(page);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'header.title_hr')).toBe(true);
    });

    it('should fail if header title_en is missing (publish blocked if EN missing)', () => {
      const page = createValidPage({
        draft_header: {
          type: 'simple',
          title_hr: 'Naslov',
          title_en: '', // Empty
          subtitle_hr: null,
          subtitle_en: null,
          icon: null,
        },
      });

      const result = validateForPublish(page);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'header.title_en')).toBe(true);
      expect(result.errors.some((e) => e.language === 'en')).toBe(true);
    });

    it('should fail if no content blocks exist (publish blocked if body missing)', () => {
      const page = createValidPage({
        draft_blocks: [], // No blocks
      });

      const result = validateForPublish(page);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('At least one content block'))).toBe(true);
    });

    it('should fail if more than 1 map block exists', () => {
      const mapBlock1: ContentBlock = {
        id: 'map-1',
        type: 'map',
        content: {
          pins: [
            {
              id: 'pin-1',
              latitude: 43.05,
              longitude: 16.18,
              title_hr: 'Lokacija 1',
              title_en: 'Location 1',
              description_hr: null,
              description_en: null,
            },
          ],
        } as MapBlockContent,
        order: 0,
        structure_locked: false,
        content_locked: false,
      };

      const mapBlock2: ContentBlock = {
        id: 'map-2',
        type: 'map',
        content: {
          pins: [
            {
              id: 'pin-2',
              latitude: 43.06,
              longitude: 16.19,
              title_hr: 'Lokacija 2',
              title_en: 'Location 2',
              description_hr: null,
              description_en: null,
            },
          ],
        } as MapBlockContent,
        order: 1,
        structure_locked: false,
        content_locked: false,
      };

      const page = createValidPage({
        draft_blocks: [mapBlock1, mapBlock2],
      });

      const result = validateForPublish(page);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Maximum 1 map block'))).toBe(true);
    });

    it('should fail if media header has more than 5 images', () => {
      const page = createValidPage({
        draft_header: {
          type: 'media',
          title_hr: 'Naslov',
          title_en: 'Title',
          subtitle_hr: null,
          subtitle_en: null,
          images: [
            'img1.jpg',
            'img2.jpg',
            'img3.jpg',
            'img4.jpg',
            'img5.jpg',
            'img6.jpg', // 6th image - too many
          ],
        },
      });

      const result = validateForPublish(page);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('maximum 5 images'))).toBe(true);
    });

    it('should fail if media header has no images', () => {
      const page = createValidPage({
        draft_header: {
          type: 'media',
          title_hr: 'Naslov',
          title_en: 'Title',
          subtitle_hr: null,
          subtitle_en: null,
          images: [], // No images
        },
      });

      const result = validateForPublish(page);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('at least 1 image'))).toBe(true);
    });

    it('should fail if text block body_en is missing', () => {
      const page = createValidPage({
        draft_blocks: [
          {
            id: 'block-1',
            type: 'text',
            content: {
              title_hr: 'Naslov',
              title_en: 'Title',
              body_hr: 'Hrvatski tekst',
              body_en: '', // Empty EN
            } as TextBlockContent,
            order: 0,
            structure_locked: false,
            content_locked: false,
          },
        ],
      });

      const result = validateForPublish(page);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.block_id === 'block-1' && e.language === 'en')).toBe(true);
    });
  });

  describe('validateBlockContent', () => {
    it('should pass for valid text block', () => {
      const block: ContentBlock = {
        id: 'block-1',
        type: 'text',
        content: {
          title_hr: 'Naslov',
          title_en: 'Title',
          body_hr: 'Hrvatski tekst',
          body_en: 'English text',
        } as TextBlockContent,
        order: 0,
        structure_locked: false,
        content_locked: false,
      };

      const errors = validateBlockContent(block);
      expect(errors).toHaveLength(0);
    });

    it('should fail for text block without body_hr', () => {
      const block: ContentBlock = {
        id: 'block-1',
        type: 'text',
        content: {
          title_hr: null,
          title_en: null,
          body_hr: '', // Empty
          body_en: 'English text',
        } as TextBlockContent,
        order: 0,
        structure_locked: false,
        content_locked: false,
      };

      const errors = validateBlockContent(block);
      expect(errors.some((e) => e.language === 'hr')).toBe(true);
    });

    it('should not validate notice blocks (system-controlled)', () => {
      const block: ContentBlock = {
        id: 'notice-1',
        type: 'notice',
        content: {},
        order: 0,
        structure_locked: false,
        content_locked: false,
      };

      const errors = validateBlockContent(block);
      expect(errors).toHaveLength(0);
    });
  });

  describe('isValidBlockType', () => {
    it('should return true for valid block types', () => {
      expect(isValidBlockType('text')).toBe(true);
      expect(isValidBlockType('highlight')).toBe(true);
      expect(isValidBlockType('card_list')).toBe(true);
      expect(isValidBlockType('media')).toBe(true);
      expect(isValidBlockType('map')).toBe(true);
      expect(isValidBlockType('contact')).toBe(true);
      expect(isValidBlockType('link_list')).toBe(true);
      expect(isValidBlockType('notice')).toBe(true);
    });

    it('should return false for invalid block types', () => {
      expect(isValidBlockType('custom')).toBe(false);
      expect(isValidBlockType('html')).toBe(false);
      expect(isValidBlockType('script')).toBe(false);
      expect(isValidBlockType('')).toBe(false);
    });
  });

  describe('countMapBlocks', () => {
    it('should count map blocks correctly', () => {
      const blocks: ContentBlock[] = [
        { id: '1', type: 'text', content: {}, order: 0, structure_locked: false, content_locked: false },
        { id: '2', type: 'map', content: {}, order: 1, structure_locked: false, content_locked: false },
        { id: '3', type: 'text', content: {}, order: 2, structure_locked: false, content_locked: false },
      ];

      expect(countMapBlocks(blocks)).toBe(1);
    });

    it('should return 0 when no map blocks exist', () => {
      const blocks: ContentBlock[] = [
        { id: '1', type: 'text', content: {}, order: 0, structure_locked: false, content_locked: false },
        { id: '2', type: 'highlight', content: {}, order: 1, structure_locked: false, content_locked: false },
      ];

      expect(countMapBlocks(blocks)).toBe(0);
    });
  });
});

// ============================================================
// Integration Tests for Routes
// ============================================================

// Mock the repository module - must be before imports
vi.mock('../repositories/static-page.js', () => {
  return {
    getAllPages: vi.fn().mockResolvedValue([]),
    getPageById: vi.fn().mockResolvedValue(null),
    createPage: vi.fn().mockResolvedValue(null),
    updateDraft: vi.fn().mockResolvedValue(null),
    updateBlockContent: vi.fn().mockResolvedValue(null),
    addBlock: vi.fn().mockResolvedValue(null),
    removeBlock: vi.fn().mockResolvedValue(null),
    reorderBlocks: vi.fn().mockResolvedValue(null),
    updateBlockStructure: vi.fn().mockResolvedValue(null),
    publishPage: vi.fn().mockResolvedValue(null),
    unpublishPage: vi.fn().mockResolvedValue(null),
    deletePage: vi.fn().mockResolvedValue(false),
    slugExists: vi.fn().mockResolvedValue(false),
    getPublishedPages: vi.fn().mockResolvedValue([]),
    getPublishedPageBySlug: vi.fn().mockResolvedValue(null),
  };
});

import {
  getAllPages,
  getPageById,
  createPage,
  publishPage,
  addBlock,
  slugExists,
  updateBlockContent,
} from '../repositories/static-page.js';
import { adminStaticPageRoutes } from '../routes/admin-static-pages.js';

const mockedGetAllPages = vi.mocked(getAllPages);
const mockedGetPageById = vi.mocked(getPageById);
const mockedCreatePage = vi.mocked(createPage);
const mockedPublishPage = vi.mocked(publishPage);
const mockedAddBlock = vi.mocked(addBlock);
const mockedSlugExists = vi.mocked(slugExists);
const mockedUpdateBlockContent = vi.mocked(updateBlockContent);

describe('Admin Static Pages Routes', () => {
  let fastify: FastifyInstance;

  beforeEach(() => {
    // Reset mocks but keep the implementations from vi.mock factory
    // NOTE: Do NOT recreate fastify here - it's created once in beforeAll
    vi.resetAllMocks();
    // Re-apply default implementations (cast to any to handle null returns)
    mockedGetPageById.mockResolvedValue(null as unknown as StaticPage);
    mockedSlugExists.mockResolvedValue(false);
    mockedGetAllPages.mockResolvedValue([]);
    mockedCreatePage.mockResolvedValue(null as unknown as StaticPage);
    mockedPublishPage.mockResolvedValue(null as unknown as StaticPage);
    mockedAddBlock.mockResolvedValue(null as unknown as StaticPage);
    mockedUpdateBlockContent.mockResolvedValue(null as unknown as StaticPage);
  });

  function createMockPage(overrides: Partial<StaticPage> = {}): StaticPage {
    return {
      id: 'page-1',
      slug: 'test-page',
      draft_header: {
        type: 'simple',
        title_hr: 'Naslov',
        title_en: 'Title',
        subtitle_hr: null,
        subtitle_en: null,
        icon: null,
      },
      draft_blocks: [
        {
          id: 'block-1',
          type: 'text',
          content: {
            title_hr: 'Naslov',
            title_en: 'Title',
            body_hr: 'Hrvatski tekst',
            body_en: 'English text',
          },
          order: 0,
          structure_locked: false,
          content_locked: false,
        },
      ],
      draft_updated_at: new Date(),
      draft_updated_by: null,
      published_header: null,
      published_blocks: null,
      published_at: null,
      published_by: null,
      created_at: new Date(),
      created_by: null,
      ...overrides,
    };
  }

  beforeAll(async () => {
    fastify = Fastify({ logger: false });
    // Strategy A: Inject admin session via test-only preHandler hook (DB-less)
    // This MUST be registered BEFORE admin routes so it runs first
    // eslint-disable-next-line @typescript-eslint/require-await
    fastify.addHook('preHandler', async (request) => {
      // Inject test admin session for all /admin/* routes
      if (request.url.startsWith('/admin/')) {
        request.adminSession = {
          adminId: 'test-admin-id',
          username: 'testadmin',
          municipality: 'vis',
        };
      }
    });
    // Register static page routes (no auth routes needed - session injected above)
    await fastify.register(adminStaticPageRoutes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
    vi.restoreAllMocks();
  });

  // NOTE: Supervisor role tests removed - all authenticated admins have equal privileges now.
  // Auth is enforced via cookie-session (adminAuthHook), not headers.

  describe('Notice block editing prevention', () => {
    it('should reject adding notice block (system-controlled)', async () => {
      mockedGetPageById.mockResolvedValueOnce(createMockPage());

      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/pages/page-1/blocks',
        // Session injected by test hook - no cookie needed
        payload: {
          type: 'notice', // Trying to add notice block
          content: {},
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.message).toContain('system-controlled');
    });

    it('should reject editing notice block content', async () => {
      const pageWithNotice = createMockPage({
        draft_blocks: [
          {
            id: 'notice-1',
            type: 'notice',
            content: {},
            order: 0,
            structure_locked: false,
            content_locked: false,
          },
        ],
      });
      // Need to return the page twice - once for getPageById and once for block lookup
      mockedGetPageById.mockResolvedValue(pageWithNotice);

      const response = await fastify.inject({
        method: 'PATCH',
        url: '/admin/pages/page-1/blocks/notice-1',
        // Session injected by test hook - no cookie needed
        payload: {
          content: { some: 'data' },
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.message).toContain('Notice blocks cannot be edited');
    });
  });

  describe('Block type validation', () => {
    it('should reject invalid block types', async () => {
      mockedGetPageById.mockResolvedValueOnce(createMockPage());

      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/pages/page-1/blocks',
        // Session injected by test hook - no cookie needed
        payload: {
          type: 'custom_html', // Invalid type
          content: {},
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.message).toContain('Invalid block type');
    });
  });

  describe('Map block limit', () => {
    it('should reject adding second map block', async () => {
      const pageWithMap = createMockPage({
        draft_blocks: [
          {
            id: 'map-1',
            type: 'map',
            content: { pins: [] },
            order: 0,
            structure_locked: false,
            content_locked: false,
          },
        ],
      });
      mockedGetPageById.mockResolvedValue(pageWithMap);

      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/pages/page-1/blocks',
        // Session injected by test hook - no cookie needed
        payload: {
          type: 'map', // Trying to add second map
          content: { pins: [] },
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.message).toContain('Maximum 1 map block');
    });
  });

  describe('Content lock enforcement', () => {
    it('should reject editing locked block content', async () => {
      const pageWithLockedBlock = createMockPage({
        draft_blocks: [
          {
            id: 'block-1',
            type: 'text',
            content: {
              title_hr: 'Naslov',
              title_en: 'Title',
              body_hr: 'Tekst',
              body_en: 'Text',
            },
            order: 0,
            structure_locked: false,
            content_locked: true, // Locked!
          },
        ],
      });
      mockedGetPageById.mockResolvedValue(pageWithLockedBlock);

      const response = await fastify.inject({
        method: 'PATCH',
        url: '/admin/pages/page-1/blocks/block-1',
        // Session injected by test hook - no cookie needed
        payload: {
          content: {
            title_hr: 'Novi naslov',
            title_en: 'New title',
            body_hr: 'Novi tekst',
            body_en: 'New text',
          },
        },
      });

      expect(response.statusCode).toBe(403);
      const body = response.json();
      expect(body.message).toContain('locked');
    });
  });

  describe('Publish validation', () => {
    it('should reject publishing page with missing EN content', async () => {
      const pageWithMissingEN = createMockPage({
        draft_header: {
          type: 'simple',
          title_hr: 'Naslov',
          title_en: '', // Missing EN
          subtitle_hr: null,
          subtitle_en: null,
          icon: null,
        },
      });
      mockedGetPageById.mockResolvedValue(pageWithMissingEN);

      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/pages/page-1/publish',
        // Session injected by test hook - no cookie needed
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.validation_errors).toBeDefined();
      // Check that validation errors include EN language issue
      expect(body.validation_errors.some((e: { field?: string }) => e.field === 'header.title_en')).toBe(true);
    });

    it('should reject publishing page without blocks', async () => {
      const pageWithNoBlocks = createMockPage({
        draft_blocks: [],
      });
      mockedGetPageById.mockResolvedValue(pageWithNoBlocks);

      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/pages/page-1/publish',
        // Session injected by test hook - no cookie needed
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.validation_errors).toBeDefined();
    });

    it('should reject publishing page with >1 map blocks', async () => {
      const pageWithMultipleMaps = createMockPage({
        draft_blocks: [
          {
            id: 'map-1',
            type: 'map',
            content: {
              pins: [
                { id: 'p1', latitude: 43.05, longitude: 16.18, title_hr: 'A', title_en: 'A', description_hr: null, description_en: null },
              ],
            },
            order: 0,
            structure_locked: false,
            content_locked: false,
          },
          {
            id: 'map-2',
            type: 'map',
            content: {
              pins: [
                { id: 'p2', latitude: 43.06, longitude: 16.19, title_hr: 'B', title_en: 'B', description_hr: null, description_en: null },
              ],
            },
            order: 1,
            structure_locked: false,
            content_locked: false,
          },
        ],
      });
      mockedGetPageById.mockResolvedValue(pageWithMultipleMaps);

      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/pages/page-1/publish',
        // Session injected by test hook - no cookie needed
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.validation_errors.some((e: { message: string }) => e.message.includes('Maximum 1 map block'))).toBe(true);
    });

    it('should allow publishing valid page', async () => {
      const validPage = createMockPage();
      mockedGetPageById.mockResolvedValue(validPage);
      mockedPublishPage.mockResolvedValue({
        ...validPage,
        published_header: validPage.draft_header,
        published_blocks: validPage.draft_blocks,
        published_at: new Date(),
        published_by: 'supervisor-1',
      });

      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/pages/page-1/publish',
        // Session injected by test hook - no cookie needed
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.published_at).toBeDefined();
    });
  });

  describe('Slug validation', () => {
    it('should reject invalid slug format', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/pages',
        // Session injected by test hook - no cookie needed
        payload: {
          slug: 'Invalid Slug!', // Invalid format
          header: {
            type: 'simple',
            title_hr: 'Naslov',
            title_en: 'Title',
            subtitle_hr: null,
            subtitle_en: null,
            icon: null,
          },
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.message).toContain('slug');
    });

    it('should reject duplicate slug', async () => {
      mockedSlugExists.mockResolvedValueOnce(true);

      const response = await fastify.inject({
        method: 'POST',
        url: '/admin/pages',
        // Session injected by test hook - no cookie needed
        payload: {
          slug: 'existing-page',
          header: {
            type: 'simple',
            title_hr: 'Naslov',
            title_en: 'Title',
            subtitle_hr: null,
            subtitle_en: null,
            icon: null,
          },
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.message).toContain('already exists');
    });
  });
});

// ============================================================
// Regression Test: InboxMessage Placement
// ============================================================

describe('InboxMessage Placement (REGRESSION)', () => {
  /**
   * REGRESSION TEST: Static pages must NOT include InboxMessage data
   *
   * Per product owner confirmation (2026-01-09):
   * - InboxMessage is allowed ONLY on: Home, Events, Transport screens
   * - InboxMessage is FORBIDDEN on: All static pages (Flora, Fauna, Contacts, etc.)
   *
   * The backend must NOT inject notice blocks into static page responses.
   */
  it('static pages route should NOT inject InboxMessage (notice blocks)', async () => {
    // Read the static-pages.ts route file
    const fs = await import('fs');
    const path = await import('path');
    const routeFile = fs.readFileSync(
      path.join(__dirname, '../routes/static-pages.ts'),
      'utf-8'
    );

    // Verify notice injection code is NOT present
    expect(routeFile).not.toMatch(/getPotentialBannerMessages/);
    expect(routeFile).not.toMatch(/filterBannerEligibleMessages/);
    expect(routeFile).not.toMatch(/filterBannersByScreen/);
    expect(routeFile).not.toMatch(/activeNotices\s*=/);
    expect(routeFile).not.toMatch(/type:\s*['"]notice['"]/);

    // Verify the comment explaining why (for documentation)
    expect(routeFile).toMatch(/InboxMessage placement.*restricted/i);
  });
});
