/**
 * Inbox Repository
 *
 * Database access layer for inbox messages.
 * Handles CRUD operations and queries.
 */

import { query } from '../lib/database.js';
import type { InboxMessage, InboxTag } from '../types/inbox.js';

interface InboxMessageRow {
  id: string;
  title_hr: string;
  title_en: string | null;
  body_hr: string;
  body_en: string | null;
  tags: InboxTag[];
  active_from: Date | null;
  active_to: Date | null;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  deleted_at: Date | null;
  // Phase 7: Push notification fields
  is_locked: boolean;
  pushed_at: Date | null;
  pushed_by: string | null;
}

/**
 * Get paginated list of inbox messages (excludes soft-deleted)
 * Ordered by created_at descending (newest first)
 *
 * NOTE: This is for PUBLIC endpoints. Soft-deleted messages are excluded.
 */
export async function getInboxMessages(
  page: number = 1,
  pageSize: number = 20
): Promise<{ messages: InboxMessage[]; total: number }> {
  const offset = (page - 1) * pageSize;

  // Get total count (excluding soft-deleted)
  const countResult = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM inbox_messages WHERE deleted_at IS NULL'
  );
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

  // Get paginated messages (excluding soft-deleted)
  const result = await query<InboxMessageRow>(
    `SELECT id, title_hr, title_en, body_hr, body_en, tags::text[] AS tags,
            active_from, active_to, created_at, updated_at, created_by, deleted_at,
            is_locked, pushed_at, pushed_by
     FROM inbox_messages
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  );

  return {
    messages: result.rows.map(rowToInboxMessage),
    total,
  };
}

/**
 * Get a single inbox message by ID (excludes soft-deleted)
 *
 * NOTE: This is for PUBLIC endpoints. Soft-deleted messages return null (404).
 */
export async function getInboxMessageById(
  id: string
): Promise<InboxMessage | null> {
  const result = await query<InboxMessageRow>(
    `SELECT id, title_hr, title_en, body_hr, body_en, tags::text[] AS tags,
            active_from, active_to, created_at, updated_at, created_by, deleted_at,
            is_locked, pushed_at, pushed_by
     FROM inbox_messages
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToInboxMessage(result.rows[0]);
}

/**
 * Get a single inbox message by ID (admin view, includes soft-deleted)
 *
 * NOTE: This is for ADMIN endpoints only.
 */
export async function getInboxMessageByIdAdmin(
  id: string
): Promise<InboxMessage | null> {
  const result = await query<InboxMessageRow>(
    `SELECT id, title_hr, title_en, body_hr, body_en, tags::text[] AS tags,
            active_from, active_to, created_at, updated_at, created_by, deleted_at,
            is_locked, pushed_at, pushed_by
     FROM inbox_messages
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToInboxMessage(result.rows[0]);
}

/**
 * Get all messages that could potentially be banners (excludes soft-deleted)
 * (have an active window defined)
 *
 * NOTE: This is for PUBLIC endpoints. Soft-deleted messages are excluded.
 */
export async function getPotentialBannerMessages(): Promise<InboxMessage[]> {
  const result = await query<InboxMessageRow>(
    `SELECT id, title_hr, title_en, body_hr, body_en, tags::text[] AS tags,
            active_from, active_to, created_at, updated_at, created_by, deleted_at,
            is_locked, pushed_at, pushed_by
     FROM inbox_messages
     WHERE (active_from IS NOT NULL OR active_to IS NOT NULL)
       AND deleted_at IS NULL
     ORDER BY created_at DESC`
  );

  return result.rows.map(rowToInboxMessage);
}

/**
 * Create a new inbox message
 */
export async function createInboxMessage(
  message: Omit<InboxMessage, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'is_locked' | 'pushed_at' | 'pushed_by'>
): Promise<InboxMessage> {
  const result = await query<InboxMessageRow>(
    `INSERT INTO inbox_messages
       (title_hr, title_en, body_hr, body_en, tags, active_from, active_to, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, title_hr, title_en, body_hr, body_en, tags::text[] AS tags,
               active_from, active_to, created_at, updated_at, created_by, deleted_at,
               is_locked, pushed_at, pushed_by`,
    [
      message.title_hr,
      message.title_en,
      message.body_hr,
      message.body_en,
      message.tags,
      message.active_from,
      message.active_to,
      message.created_by,
    ]
  );

  return rowToInboxMessage(result.rows[0]);
}

/**
 * Update an existing inbox message (excludes soft-deleted and locked)
 *
 * NOTE: Soft-deleted messages cannot be updated via this function.
 * NOTE: Locked messages cannot be updated (returns null).
 */
export async function updateInboxMessage(
  id: string,
  updates: Partial<Omit<InboxMessage, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'is_locked' | 'pushed_at' | 'pushed_by'>>
): Promise<InboxMessage | null> {
  // Build dynamic update query
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.title_hr !== undefined) {
    fields.push(`title_hr = $${paramIndex++}`);
    values.push(updates.title_hr);
  }
  if (updates.title_en !== undefined) {
    fields.push(`title_en = $${paramIndex++}`);
    values.push(updates.title_en);
  }
  if (updates.body_hr !== undefined) {
    fields.push(`body_hr = $${paramIndex++}`);
    values.push(updates.body_hr);
  }
  if (updates.body_en !== undefined) {
    fields.push(`body_en = $${paramIndex++}`);
    values.push(updates.body_en);
  }
  if (updates.tags !== undefined) {
    fields.push(`tags = $${paramIndex++}`);
    values.push(updates.tags);
  }
  if (updates.active_from !== undefined) {
    fields.push(`active_from = $${paramIndex++}`);
    values.push(updates.active_from);
  }
  if (updates.active_to !== undefined) {
    fields.push(`active_to = $${paramIndex++}`);
    values.push(updates.active_to);
  }

  if (fields.length === 0) {
    return getInboxMessageById(id);
  }

  values.push(id);
  const result = await query<InboxMessageRow>(
    `UPDATE inbox_messages
     SET ${fields.join(', ')}
     WHERE id = $${paramIndex} AND deleted_at IS NULL AND is_locked = false
     RETURNING id, title_hr, title_en, body_hr, body_en, tags::text[] AS tags,
               active_from, active_to, created_at, updated_at, created_by, deleted_at,
               is_locked, pushed_at, pushed_by`,
    values
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToInboxMessage(result.rows[0]);
}

/**
 * Soft delete an inbox message
 *
 * NOTE: Hard delete is NOT allowed. This sets deleted_at = now().
 * Returns the soft-deleted message for logging purposes.
 * Soft delete is allowed even for locked messages (for auditability).
 */
export async function softDeleteInboxMessage(id: string): Promise<InboxMessage | null> {
  const result = await query<InboxMessageRow>(
    `UPDATE inbox_messages
     SET deleted_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id, title_hr, title_en, body_hr, body_en, tags::text[] AS tags,
               active_from, active_to, created_at, updated_at, created_by, deleted_at,
               is_locked, pushed_at, pushed_by`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToInboxMessage(result.rows[0]);
}

/**
 * Get paginated list of inbox messages (admin view)
 *
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @param archived - Filter by archived status:
 *   - true: only archived (deleted_at IS NOT NULL)
 *   - false: only active (deleted_at IS NULL)
 *   - undefined: all messages
 */
export async function getInboxMessagesAdmin(
  page: number = 1,
  pageSize: number = 20,
  archived?: boolean
): Promise<{ messages: InboxMessage[]; total: number }> {
  const offset = (page - 1) * pageSize;

  // Build WHERE clause based on archived filter
  let whereClause = '';
  if (archived === true) {
    whereClause = 'WHERE deleted_at IS NOT NULL';
  } else if (archived === false) {
    whereClause = 'WHERE deleted_at IS NULL';
  }
  // If undefined, no WHERE clause (returns all)

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM inbox_messages ${whereClause}`
  );
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

  // Get paginated messages
  const result = await query<InboxMessageRow>(
    `SELECT id, title_hr, title_en, body_hr, body_en, tags::text[] AS tags,
            active_from, active_to, created_at, updated_at, created_by, deleted_at,
            is_locked, pushed_at, pushed_by
     FROM inbox_messages
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  );

  return {
    messages: result.rows.map(rowToInboxMessage),
    total,
  };
}

/**
 * Restore a soft-deleted inbox message
 */
export async function restoreInboxMessage(id: string): Promise<InboxMessage | null> {
  const result = await query<InboxMessageRow>(
    `UPDATE inbox_messages
     SET deleted_at = NULL
     WHERE id = $1 AND deleted_at IS NOT NULL
     RETURNING id, title_hr, title_en, body_hr, body_en, tags::text[] AS tags,
               active_from, active_to, created_at, updated_at, created_by, deleted_at,
               is_locked, pushed_at, pushed_by`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToInboxMessage(result.rows[0]);
}

/**
 * Mark a message as locked after push sent (Phase 7)
 */
export async function markMessageAsLocked(
  id: string,
  adminId: string | null
): Promise<InboxMessage | null> {
  const result = await query<InboxMessageRow>(
    `UPDATE inbox_messages
     SET is_locked = true, pushed_at = NOW(), pushed_by = $2
     WHERE id = $1 AND is_locked = false AND deleted_at IS NULL
     RETURNING id, title_hr, title_en, body_hr, body_en, tags::text[] AS tags,
               active_from, active_to, created_at, updated_at, created_by, deleted_at,
               is_locked, pushed_at, pushed_by`,
    [id, adminId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToInboxMessage(result.rows[0]);
}

/**
 * Check if a message is locked
 */
export async function isMessageLocked(id: string): Promise<boolean> {
  const message = await getInboxMessageByIdAdmin(id);
  return message?.is_locked ?? false;
}

/**
 * Convert database row to InboxMessage type
 */
function rowToInboxMessage(row: InboxMessageRow): InboxMessage {
  return {
    id: row.id,
    title_hr: row.title_hr,
    title_en: row.title_en,
    body_hr: row.body_hr,
    body_en: row.body_en,
    tags: row.tags,
    active_from: row.active_from,
    active_to: row.active_to,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by,
    deleted_at: row.deleted_at,
    is_locked: row.is_locked ?? false,
    pushed_at: row.pushed_at,
    pushed_by: row.pushed_by,
  };
}
