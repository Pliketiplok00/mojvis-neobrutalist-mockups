/**
 * Static Page Repository
 *
 * Database operations for static pages CMS.
 * Phase 3: Static Content Pages
 *
 * Rules:
 * - Draft/publish workflow
 * - HR and EN required
 * - Validation before publish
 */

import { randomUUID } from 'crypto';
import { query } from '../lib/database.js';
import type {
  StaticPage,
  PageHeader,
  ContentBlock,
  StaticPageCreateInput,
  StaticPageDraftUpdateInput,
  AddBlockInput,
  BlockStructureUpdateInput,
} from '../types/static-page.js';

// ============================================================
// Helper Functions
// ============================================================

/**
 * Convert database row to StaticPage
 */
function rowToStaticPage(row: Record<string, unknown>): StaticPage {
  return {
    id: row.id as string,
    slug: row.slug as string,
    draft_header: row.draft_header as PageHeader,
    draft_blocks: row.draft_blocks as ContentBlock[],
    draft_updated_at: new Date(row.draft_updated_at as string),
    draft_updated_by: row.draft_updated_by as string | null,
    published_header: row.published_header as PageHeader | null,
    published_blocks: row.published_blocks as ContentBlock[] | null,
    published_at: row.published_at ? new Date(row.published_at as string) : null,
    published_by: row.published_by as string | null,
    created_at: new Date(row.created_at as string),
    created_by: row.created_by as string | null,
  };
}

// ============================================================
// Public API Operations
// ============================================================

/**
 * Get all published pages (for menu)
 */
export async function getPublishedPages(): Promise<StaticPage[]> {
  const result = await query(
    `SELECT * FROM static_pages
     WHERE published_at IS NOT NULL
     ORDER BY slug ASC`
  );
  return result.rows.map(rowToStaticPage);
}

/**
 * Get published page by slug
 * Returns null if not published or not found
 */
export async function getPublishedPageBySlug(slug: string): Promise<StaticPage | null> {
  const result = await query(
    `SELECT * FROM static_pages
     WHERE slug = $1 AND published_at IS NOT NULL`,
    [slug]
  );
  if (result.rows.length === 0) return null;
  return rowToStaticPage(result.rows[0]);
}

// ============================================================
// Admin Operations
// ============================================================

/**
 * Get all pages (admin view - includes unpublished)
 */
export async function getAllPages(): Promise<StaticPage[]> {
  const result = await query(
    `SELECT * FROM static_pages
     ORDER BY slug ASC`
  );
  return result.rows.map(rowToStaticPage);
}

/**
 * Get page by ID (admin)
 */
export async function getPageById(id: string): Promise<StaticPage | null> {
  const result = await query(
    `SELECT * FROM static_pages WHERE id = $1`,
    [id]
  );
  if (result.rows.length === 0) return null;
  return rowToStaticPage(result.rows[0]);
}

/**
 * Get page by slug (admin - includes unpublished)
 */
export async function getPageBySlug(slug: string): Promise<StaticPage | null> {
  const result = await query(
    `SELECT * FROM static_pages WHERE slug = $1`,
    [slug]
  );
  if (result.rows.length === 0) return null;
  return rowToStaticPage(result.rows[0]);
}

/**
 * Create new page (supervisor only)
 */
export async function createPage(
  input: StaticPageCreateInput,
  createdBy: string | null = null
): Promise<StaticPage> {
  const blocks = input.blocks || [];

  const result = await query(
    `INSERT INTO static_pages (
      slug,
      draft_header,
      draft_blocks,
      draft_updated_by,
      created_by
    ) VALUES ($1, $2, $3, $4, $4)
    RETURNING *`,
    [input.slug, JSON.stringify(input.header), JSON.stringify(blocks), createdBy]
  );

  return rowToStaticPage(result.rows[0]);
}

/**
 * Update draft content (admin can edit if not locked)
 */
export async function updateDraft(
  id: string,
  input: StaticPageDraftUpdateInput,
  updatedBy: string | null = null
): Promise<StaticPage | null> {
  const page = await getPageById(id);
  if (!page) return null;

  const header = input.header ?? page.draft_header;
  const blocks = input.blocks ?? page.draft_blocks;

  const result = await query(
    `UPDATE static_pages
     SET draft_header = $1,
         draft_blocks = $2,
         draft_updated_at = now(),
         draft_updated_by = $3
     WHERE id = $4
     RETURNING *`,
    [JSON.stringify(header), JSON.stringify(blocks), updatedBy, id]
  );

  if (result.rows.length === 0) return null;
  return rowToStaticPage(result.rows[0]);
}

/**
 * Update single block content (admin operation)
 * Checks content lock before allowing edit
 */
export async function updateBlockContent(
  pageId: string,
  blockId: string,
  content: Record<string, unknown>,
  updatedBy: string | null = null
): Promise<StaticPage | null> {
  const page = await getPageById(pageId);
  if (!page) return null;

  const blocks = [...page.draft_blocks];
  const blockIndex = blocks.findIndex((b) => b.id === blockId);
  if (blockIndex === -1) return null;

  // Check if content is locked
  if (blocks[blockIndex].content_locked) {
    throw new Error('Block content is locked');
  }

  blocks[blockIndex] = {
    ...blocks[blockIndex],
    content: content as ContentBlock['content'],
  };

  return updateDraft(pageId, { blocks }, updatedBy);
}

// ============================================================
// Supervisor Operations
// ============================================================

/**
 * Add new block to page (supervisor only)
 */
export async function addBlock(
  pageId: string,
  input: AddBlockInput,
  updatedBy: string | null = null
): Promise<StaticPage | null> {
  const page = await getPageById(pageId);
  if (!page) return null;

  const blocks = [...page.draft_blocks];
  const newBlock: ContentBlock = {
    id: randomUUID(),
    type: input.type,
    content: input.content,
    order: input.order ?? blocks.length,
    structure_locked: input.structure_locked ?? false,
    content_locked: input.content_locked ?? false,
  };

  // Insert at specified order
  blocks.splice(newBlock.order, 0, newBlock);

  // Reorder all blocks
  blocks.forEach((b, i) => {
    b.order = i;
  });

  return updateDraft(pageId, { blocks }, updatedBy);
}

/**
 * Remove block from page (supervisor only)
 */
export async function removeBlock(
  pageId: string,
  blockId: string,
  updatedBy: string | null = null
): Promise<StaticPage | null> {
  const page = await getPageById(pageId);
  if (!page) return null;

  const blocks = page.draft_blocks.filter((b) => b.id !== blockId);

  // Reorder remaining blocks
  blocks.forEach((b, i) => {
    b.order = i;
  });

  return updateDraft(pageId, { blocks }, updatedBy);
}

/**
 * Reorder blocks (supervisor only)
 */
export async function reorderBlocks(
  pageId: string,
  blockIds: string[],
  updatedBy: string | null = null
): Promise<StaticPage | null> {
  const page = await getPageById(pageId);
  if (!page) return null;

  const blocks = page.draft_blocks;
  const reorderedBlocks: ContentBlock[] = [];

  for (let i = 0; i < blockIds.length; i++) {
    const block = blocks.find((b) => b.id === blockIds[i]);
    if (block) {
      reorderedBlocks.push({
        ...block,
        order: i,
      });
    }
  }

  // Add any blocks not in the list at the end
  for (const block of blocks) {
    if (!blockIds.includes(block.id)) {
      reorderedBlocks.push({
        ...block,
        order: reorderedBlocks.length,
      });
    }
  }

  return updateDraft(pageId, { blocks: reorderedBlocks }, updatedBy);
}

/**
 * Update block structure (supervisor only)
 * Sets locks on a block
 */
export async function updateBlockStructure(
  pageId: string,
  input: BlockStructureUpdateInput,
  updatedBy: string | null = null
): Promise<StaticPage | null> {
  const page = await getPageById(pageId);
  if (!page) return null;

  const blocks = [...page.draft_blocks];
  const blockIndex = blocks.findIndex((b) => b.id === input.block_id);
  if (blockIndex === -1) return null;

  const block = blocks[blockIndex];
  blocks[blockIndex] = {
    ...block,
    structure_locked: input.structure_locked ?? block.structure_locked,
    content_locked: input.content_locked ?? block.content_locked,
    order: input.order ?? block.order,
  };

  return updateDraft(pageId, { blocks }, updatedBy);
}

/**
 * Publish page (supervisor only)
 * Copies draft to published
 */
export async function publishPage(
  id: string,
  publishedBy: string | null = null
): Promise<StaticPage | null> {
  const page = await getPageById(id);
  if (!page) return null;

  const result = await query(
    `UPDATE static_pages
     SET published_header = draft_header,
         published_blocks = draft_blocks,
         published_at = now(),
         published_by = $1
     WHERE id = $2
     RETURNING *`,
    [publishedBy, id]
  );

  if (result.rows.length === 0) return null;

  // Log publish event
  console.info('[StaticPage] Published page', {
    page_id: id,
    slug: page.slug,
    published_by: publishedBy,
    timestamp: new Date().toISOString(),
  });

  return rowToStaticPage(result.rows[0]);
}

/**
 * Unpublish page (supervisor only)
 * Sets published content to null
 */
export async function unpublishPage(
  id: string,
  unpublishedBy: string | null = null
): Promise<StaticPage | null> {
  const page = await getPageById(id);
  if (!page) return null;

  const result = await query(
    `UPDATE static_pages
     SET published_header = NULL,
         published_blocks = NULL,
         published_at = NULL,
         published_by = NULL
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) return null;

  // Log unpublish event
  console.info('[StaticPage] Unpublished page', {
    page_id: id,
    slug: page.slug,
    unpublished_by: unpublishedBy,
    timestamp: new Date().toISOString(),
  });

  return rowToStaticPage(result.rows[0]);
}

/**
 * Delete page (supervisor only)
 */
export async function deletePage(id: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM static_pages WHERE id = $1`,
    [id]
  );
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Check if slug exists
 */
export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  const sql = excludeId
    ? `SELECT 1 FROM static_pages WHERE slug = $1 AND id != $2`
    : `SELECT 1 FROM static_pages WHERE slug = $1`;

  const params = excludeId ? [slug, excludeId] : [slug];
  const result = await query(sql, params);
  return result.rows.length > 0;
}
