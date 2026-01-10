/**
 * Admin Static Pages Routes
 *
 * Admin endpoints for static pages CMS.
 * Phase 3: Static Content Pages
 *
 * All endpoints require authentication (enforced by adminAuthHook).
 * All authenticated admins have equal privileges (no supervisor role).
 *
 * Endpoints:
 * - GET /admin/pages - List all pages
 * - GET /admin/pages/:id - Get page detail
 * - POST /admin/pages - Create new page
 * - DELETE /admin/pages/:id - Delete page
 * - PATCH /admin/pages/:id/draft - Update draft content
 * - PATCH /admin/pages/:id/blocks/:blockId - Update block content
 * - POST /admin/pages/:id/publish - Publish page
 * - POST /admin/pages/:id/unpublish - Unpublish page
 * - POST /admin/pages/:id/blocks - Add block
 * - DELETE /admin/pages/:id/blocks/:blockId - Remove block
 * - PATCH /admin/pages/:id/blocks/:blockId/structure - Update block structure
 * - PUT /admin/pages/:id/blocks/reorder - Reorder blocks
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllPages,
  getPageById,
  createPage,
  updateDraft,
  updateBlockContent,
  addBlock,
  removeBlock,
  reorderBlocks,
  updateBlockStructure,
  publishPage,
  unpublishPage,
  deletePage,
  slugExists,
} from '../repositories/static-page.js';
import {
  validateForPublish,
  isValidBlockType,
  countMapBlocks,
} from '../types/static-page.js';
import type {
  StaticPageAdminResponse,
  StaticPageAdminListResponse,
  StaticPageCreateInput,
  StaticPageDraftUpdateInput,
  AddBlockInput,
  BlockStructureUpdateInput,
  StaticPage,
} from '../types/static-page.js';
import { getAdminId } from '../middleware/auth.js';

// ============================================================
// NOTE: Supervisor role has been removed.
// All authenticated admins have equal privileges.
// Admin identity is derived from session, NOT headers.
// X-Admin-Role, X-Admin-User headers are NOT trusted.
// ============================================================

// ============================================================
// Helpers
// ============================================================

/**
 * Convert StaticPage to admin response
 */
function toAdminResponse(page: StaticPage): StaticPageAdminResponse {
  const hasUnpublishedChanges =
    !page.published_at ||
    page.draft_updated_at > page.published_at ||
    JSON.stringify(page.draft_header) !== JSON.stringify(page.published_header) ||
    JSON.stringify(page.draft_blocks) !== JSON.stringify(page.published_blocks);

  return {
    id: page.id,
    slug: page.slug,
    draft_header: page.draft_header,
    draft_blocks: page.draft_blocks,
    draft_updated_at: page.draft_updated_at.toISOString(),
    draft_updated_by: page.draft_updated_by,
    published_header: page.published_header,
    published_blocks: page.published_blocks,
    published_at: page.published_at?.toISOString() ?? null,
    published_by: page.published_by,
    has_unpublished_changes: hasUnpublishedChanges,
    created_at: page.created_at.toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/require-await -- Fastify plugin contract requires async
export async function adminStaticPageRoutes(fastify: FastifyInstance): Promise<void> {
  // ============================================================
  // Admin Routes (read + edit unlocked content)
  // ============================================================

  /**
   * GET /admin/pages
   * List all pages (admin view)
   */
  fastify.get('/admin/pages', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const pages = await getAllPages();

      const response: StaticPageAdminListResponse = {
        pages: pages.map(toAdminResponse),
        total: pages.length,
      };

      return reply.send(response);
    } catch (error) {
      _request.log.error(error, '[Admin Pages] Error fetching pages');
      return reply.status(500).send({ error: true, message: 'Internal server error' });
    }
  });

  /**
   * GET /admin/pages/:id
   * Get single page (admin view)
   */
  fastify.get(
    '/admin/pages/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;

      try {
        const page = await getPageById(id);

        if (!page) {
          return reply.status(404).send({ error: true, message: 'Page not found' });
        }

        return reply.send(toAdminResponse(page));
      } catch (error) {
        request.log.error(error, '[Admin Pages] Error fetching page');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  /**
   * PATCH /admin/pages/:id/draft
   * Update draft content (admin - header and non-locked blocks)
   */
  fastify.patch(
    '/admin/pages/:id/draft',
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: StaticPageDraftUpdateInput;
      }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const input = request.body;
      const userId = getAdminId(request);

      try {
        const existingPage = await getPageById(id);
        if (!existingPage) {
          return reply.status(404).send({ error: true, message: 'Page not found' });
        }

        // Validate blocks if provided
        if (input.blocks) {
          // Check for invalid block types
          for (const block of input.blocks) {
            if (!isValidBlockType(block.type)) {
              return reply.status(400).send({
                error: true,
                message: `Invalid block type: ${block.type as string}`,
              });
            }
            // Reject notice blocks from being edited
            if (block.type === 'notice') {
              return reply.status(400).send({
                error: true,
                message: 'Notice blocks cannot be edited',
              });
            }
          }

          // Check map block limit
          if (countMapBlocks(input.blocks) > 1) {
            return reply.status(400).send({
              error: true,
              message: 'Maximum 1 map block allowed per page',
            });
          }

          // Sanitize rich text content
          // TODO: Implement deep sanitization for all text fields
        }

        const updated = await updateDraft(id, input, userId);

        if (!updated) {
          return reply.status(500).send({ error: true, message: 'Failed to update page' });
        }

        return reply.send(toAdminResponse(updated));
      } catch (error) {
        request.log.error(error, '[Admin Pages] Error updating draft');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  /**
   * PATCH /admin/pages/:id/blocks/:blockId
   * Update single block content (admin - respects content lock)
   */
  fastify.patch(
    '/admin/pages/:id/blocks/:blockId',
    async (
      request: FastifyRequest<{
        Params: { id: string; blockId: string };
        Body: { content: Record<string, unknown> };
      }>,
      reply: FastifyReply
    ) => {
      const { id, blockId } = request.params;
      const { content } = request.body;
      const userId = getAdminId(request);

      try {
        const page = await getPageById(id);
        if (!page) {
          return reply.status(404).send({ error: true, message: 'Page not found' });
        }

        const block = page.draft_blocks.find((b) => b.id === blockId);
        if (!block) {
          return reply.status(404).send({ error: true, message: 'Block not found' });
        }

        // Check content lock
        if (block.content_locked) {
          return reply.status(403).send({
            error: true,
            message: 'Block content is locked',
          });
        }

        // Reject notice blocks
        if (block.type === 'notice') {
          return reply.status(400).send({
            error: true,
            message: 'Notice blocks cannot be edited',
          });
        }

        const updated = await updateBlockContent(id, blockId, content, userId);

        if (!updated) {
          return reply.status(500).send({ error: true, message: 'Failed to update block' });
        }

        return reply.send(toAdminResponse(updated));
      } catch (error) {
        if (error instanceof Error && error.message === 'Block content is locked') {
          return reply.status(403).send({ error: true, message: error.message });
        }
        request.log.error(error, '[Admin Pages] Error updating block');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  // ============================================================
  // Supervisor Routes (structure control + publish)
  // ============================================================

  /**
   * POST /admin/pages
   * Create new page (supervisor only)
   */
  fastify.post(
    '/admin/pages',
    async (
      request: FastifyRequest<{ Body: StaticPageCreateInput }>,
      reply: FastifyReply
    ) => {
      const input = request.body;
      const userId = getAdminId(request);

      try {
        // Validate slug format
        if (!input.slug || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(input.slug)) {
          return reply.status(400).send({
            error: true,
            message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.',
          });
        }

        // Check slug uniqueness
        if (await slugExists(input.slug)) {
          return reply.status(400).send({
            error: true,
            message: 'Slug already exists',
          });
        }

        // Validate header
        if (!input.header) {
          return reply.status(400).send({
            error: true,
            message: 'Header is required',
          });
        }

        // Validate blocks if provided
        if (input.blocks) {
          for (const block of input.blocks) {
            if (!isValidBlockType(block.type)) {
              return reply.status(400).send({
                error: true,
                message: `Invalid block type: ${block.type as string}`,
              });
            }
          }

          if (countMapBlocks(input.blocks) > 1) {
            return reply.status(400).send({
              error: true,
              message: 'Maximum 1 map block allowed per page',
            });
          }
        }

        const page = await createPage(input, userId);

        console.info('[Admin Pages] Created page', {
          page_id: page.id,
          slug: page.slug,
          created_by: userId,
          timestamp: new Date().toISOString(),
        });

        return reply.status(201).send(toAdminResponse(page));
      } catch (error) {
        request.log.error(error, '[Admin Pages] Error creating page');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  /**
   * DELETE /admin/pages/:id
   * Delete page (supervisor only)
   */
  fastify.delete(
    '/admin/pages/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const userId = getAdminId(request);

      try {
        const page = await getPageById(id);
        if (!page) {
          return reply.status(404).send({ error: true, message: 'Page not found' });
        }

        const deleted = await deletePage(id);

        if (!deleted) {
          return reply.status(500).send({ error: true, message: 'Failed to delete page' });
        }

        console.info('[Admin Pages] Deleted page', {
          page_id: id,
          slug: page.slug,
          deleted_by: userId,
          timestamp: new Date().toISOString(),
        });

        return reply.status(204).send();
      } catch (error) {
        request.log.error(error, '[Admin Pages] Error deleting page');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  /**
   * POST /admin/pages/:id/publish
   * Publish page (supervisor only)
   */
  fastify.post(
    '/admin/pages/:id/publish',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const userId = getAdminId(request);

      try {
        const page = await getPageById(id);
        if (!page) {
          return reply.status(404).send({ error: true, message: 'Page not found' });
        }

        // Validate for publish
        const validation = validateForPublish(page);
        if (!validation.valid) {
          return reply.status(400).send({
            error: true,
            message: 'Page validation failed',
            validation_errors: validation.errors,
          });
        }

        const published = await publishPage(id, userId);

        if (!published) {
          return reply.status(500).send({ error: true, message: 'Failed to publish page' });
        }

        return reply.send(toAdminResponse(published));
      } catch (error) {
        request.log.error(error, '[Admin Pages] Error publishing page');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  /**
   * POST /admin/pages/:id/unpublish
   * Unpublish page (supervisor only)
   */
  fastify.post(
    '/admin/pages/:id/unpublish',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const userId = getAdminId(request);

      try {
        const page = await getPageById(id);
        if (!page) {
          return reply.status(404).send({ error: true, message: 'Page not found' });
        }

        if (!page.published_at) {
          return reply.status(400).send({ error: true, message: 'Page is not published' });
        }

        const unpublished = await unpublishPage(id, userId);

        if (!unpublished) {
          return reply.status(500).send({ error: true, message: 'Failed to unpublish page' });
        }

        return reply.send(toAdminResponse(unpublished));
      } catch (error) {
        request.log.error(error, '[Admin Pages] Error unpublishing page');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  /**
   * POST /admin/pages/:id/blocks
   * Add block to page (supervisor only)
   */
  fastify.post(
    '/admin/pages/:id/blocks',
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: AddBlockInput;
      }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const input = request.body;
      const userId = getAdminId(request);

      try {
        const page = await getPageById(id);
        if (!page) {
          return reply.status(404).send({ error: true, message: 'Page not found' });
        }

        // Validate block type
        if (!isValidBlockType(input.type)) {
          return reply.status(400).send({
            error: true,
            message: `Invalid block type: ${input.type as string}`,
          });
        }

        // Reject notice blocks
        if (input.type === 'notice') {
          return reply.status(400).send({
            error: true,
            message: 'Notice blocks are system-controlled and cannot be added',
          });
        }

        // Check map block limit
        if (input.type === 'map' && countMapBlocks(page.draft_blocks) >= 1) {
          return reply.status(400).send({
            error: true,
            message: 'Maximum 1 map block allowed per page',
          });
        }

        const updated = await addBlock(id, input, userId);

        if (!updated) {
          return reply.status(500).send({ error: true, message: 'Failed to add block' });
        }

        return reply.status(201).send(toAdminResponse(updated));
      } catch (error) {
        request.log.error(error, '[Admin Pages] Error adding block');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  /**
   * DELETE /admin/pages/:id/blocks/:blockId
   * Remove block from page (supervisor only)
   */
  fastify.delete(
    '/admin/pages/:id/blocks/:blockId',
    async (
      request: FastifyRequest<{
        Params: { id: string; blockId: string };
      }>,
      reply: FastifyReply
    ) => {
      const { id, blockId } = request.params;
      const userId = getAdminId(request);

      try {
        const page = await getPageById(id);
        if (!page) {
          return reply.status(404).send({ error: true, message: 'Page not found' });
        }

        const block = page.draft_blocks.find((b) => b.id === blockId);
        if (!block) {
          return reply.status(404).send({ error: true, message: 'Block not found' });
        }

        // Check structure lock
        if (block.structure_locked) {
          return reply.status(403).send({
            error: true,
            message: 'Block structure is locked',
          });
        }

        const updated = await removeBlock(id, blockId, userId);

        if (!updated) {
          return reply.status(500).send({ error: true, message: 'Failed to remove block' });
        }

        return reply.send(toAdminResponse(updated));
      } catch (error) {
        request.log.error(error, '[Admin Pages] Error removing block');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  /**
   * PATCH /admin/pages/:id/blocks/:blockId/structure
   * Update block structure/locks (supervisor only)
   */
  fastify.patch(
    '/admin/pages/:id/blocks/:blockId/structure',
    async (
      request: FastifyRequest<{
        Params: { id: string; blockId: string };
        Body: Omit<BlockStructureUpdateInput, 'block_id'>;
      }>,
      reply: FastifyReply
    ) => {
      const { id, blockId } = request.params;
      const body = request.body;
      const userId = getAdminId(request);

      try {
        const page = await getPageById(id);
        if (!page) {
          return reply.status(404).send({ error: true, message: 'Page not found' });
        }

        const block = page.draft_blocks.find((b) => b.id === blockId);
        if (!block) {
          return reply.status(404).send({ error: true, message: 'Block not found' });
        }

        const input: BlockStructureUpdateInput = {
          block_id: blockId,
          ...body,
        };

        const updated = await updateBlockStructure(id, input, userId);

        if (!updated) {
          return reply.status(500).send({ error: true, message: 'Failed to update block structure' });
        }

        return reply.send(toAdminResponse(updated));
      } catch (error) {
        request.log.error(error, '[Admin Pages] Error updating block structure');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );

  /**
   * PUT /admin/pages/:id/blocks/reorder
   * Reorder blocks (supervisor only)
   */
  fastify.put(
    '/admin/pages/:id/blocks/reorder',
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { block_ids: string[] };
      }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const { block_ids } = request.body;
      const userId = getAdminId(request);

      try {
        const page = await getPageById(id);
        if (!page) {
          return reply.status(404).send({ error: true, message: 'Page not found' });
        }

        // Check that reordering doesn't violate structure locks
        for (let i = 0; i < block_ids.length; i++) {
          const blockId = block_ids[i];
          const originalBlock = page.draft_blocks.find((b) => b.id === blockId);
          if (originalBlock && originalBlock.structure_locked && originalBlock.order !== i) {
            return reply.status(403).send({
              error: true,
              message: `Cannot move block ${blockId} - structure is locked`,
            });
          }
        }

        const updated = await reorderBlocks(id, block_ids, userId);

        if (!updated) {
          return reply.status(500).send({ error: true, message: 'Failed to reorder blocks' });
        }

        return reply.send(toAdminResponse(updated));
      } catch (error) {
        request.log.error(error, '[Admin Pages] Error reordering blocks');
        return reply.status(500).send({ error: true, message: 'Internal server error' });
      }
    }
  );
}
