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
}

/**
 * Get paginated list of inbox messages
 * Ordered by created_at descending (newest first)
 */
export async function getInboxMessages(
  page: number = 1,
  pageSize: number = 20
): Promise<{ messages: InboxMessage[]; total: number }> {
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM inbox_messages'
  );
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

  // Get paginated messages
  const result = await query<InboxMessageRow>(
    `SELECT id, title_hr, title_en, body_hr, body_en, tags,
            active_from, active_to, created_at, updated_at, created_by
     FROM inbox_messages
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
 * Get a single inbox message by ID
 */
export async function getInboxMessageById(
  id: string
): Promise<InboxMessage | null> {
  const result = await query<InboxMessageRow>(
    `SELECT id, title_hr, title_en, body_hr, body_en, tags,
            active_from, active_to, created_at, updated_at, created_by
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
 * Get all messages that could potentially be banners
 * (have an active window defined)
 */
export async function getPotentialBannerMessages(): Promise<InboxMessage[]> {
  const result = await query<InboxMessageRow>(
    `SELECT id, title_hr, title_en, body_hr, body_en, tags,
            active_from, active_to, created_at, updated_at, created_by
     FROM inbox_messages
     WHERE active_from IS NOT NULL OR active_to IS NOT NULL
     ORDER BY created_at DESC`
  );

  return result.rows.map(rowToInboxMessage);
}

/**
 * Create a new inbox message
 */
export async function createInboxMessage(
  message: Omit<InboxMessage, 'id' | 'created_at' | 'updated_at'>
): Promise<InboxMessage> {
  const result = await query<InboxMessageRow>(
    `INSERT INTO inbox_messages
       (title_hr, title_en, body_hr, body_en, tags, active_from, active_to, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, title_hr, title_en, body_hr, body_en, tags,
               active_from, active_to, created_at, updated_at, created_by`,
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
 * Update an existing inbox message
 */
export async function updateInboxMessage(
  id: string,
  updates: Partial<Omit<InboxMessage, 'id' | 'created_at' | 'updated_at'>>
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
     WHERE id = $${paramIndex}
     RETURNING id, title_hr, title_en, body_hr, body_en, tags,
               active_from, active_to, created_at, updated_at, created_by`,
    values
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToInboxMessage(result.rows[0]);
}

/**
 * Delete an inbox message
 */
export async function deleteInboxMessage(id: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM inbox_messages WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
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
  };
}
