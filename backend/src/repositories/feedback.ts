/**
 * Feedback Repository
 *
 * Database access layer for feedback and replies.
 * Handles CRUD operations, rate limiting, and Inbox integration.
 *
 * Phase 5: User feedback with Inbox integration.
 */

import { query } from '../lib/database.js';
import type { Municipality, UserMode } from '../types/inbox.js';
import type {
  Feedback,
  FeedbackReply,
  FeedbackStatus,
  FeedbackLanguage,
} from '../types/feedback.js';
import { RATE_LIMIT } from '../types/feedback.js';

// ============================================================
// Database Row Types
// ============================================================

interface FeedbackRow {
  id: string;
  device_id: string;
  user_mode: UserMode;
  municipality: Municipality;
  language: FeedbackLanguage;
  subject: string;
  body: string;
  status: FeedbackStatus;
  sent_inbox_message_id: string | null;
  created_at: Date;
  updated_at: Date;
}

interface FeedbackReplyRow {
  id: string;
  feedback_id: string;
  admin_actor: string | null;
  body: string;
  inbox_message_id: string | null;
  created_at: Date;
}

interface FeedbackWithReplyCountRow extends FeedbackRow {
  reply_count: string;
}

// ============================================================
// Rate Limiting
// ============================================================

/**
 * Get current date in Europe/Zagreb timezone as a string (YYYY-MM-DD)
 */
function getZagrebDateString(): string {
  const now = new Date();
  // Format date in Europe/Zagreb timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: RATE_LIMIT.TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
}

/**
 * Check if device has exceeded daily rate limit
 * Returns: { allowed: boolean, remaining: number }
 */
export async function checkRateLimit(
  deviceId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const today = getZagrebDateString();

  const result = await query<{ submission_count: number }>(
    `SELECT submission_count FROM feedback_rate_limits
     WHERE device_id = $1 AND submission_date = $2`,
    [deviceId, today]
  );

  if (result.rows.length === 0) {
    return { allowed: true, remaining: RATE_LIMIT.MAX_PER_DAY };
  }

  const count = result.rows[0].submission_count;
  const remaining = Math.max(0, RATE_LIMIT.MAX_PER_DAY - count);
  return { allowed: count < RATE_LIMIT.MAX_PER_DAY, remaining };
}

/**
 * Increment rate limit counter for device
 */
async function incrementRateLimit(deviceId: string): Promise<void> {
  const today = getZagrebDateString();

  await query(
    `INSERT INTO feedback_rate_limits (device_id, submission_date, submission_count)
     VALUES ($1, $2, 1)
     ON CONFLICT (device_id, submission_date)
     DO UPDATE SET submission_count = feedback_rate_limits.submission_count + 1`,
    [deviceId, today]
  );
}

// ============================================================
// Feedback CRUD
// ============================================================

/**
 * Create a new feedback submission
 * Also creates the Sent inbox message and increments rate limit
 */
export async function createFeedback(
  deviceId: string,
  userMode: UserMode,
  municipality: Municipality,
  language: FeedbackLanguage,
  subject: string,
  body: string
): Promise<Feedback> {
  // Create the Sent inbox message first
  const inboxResult = await query<{ id: string }>(
    `INSERT INTO inbox_messages
       (title_hr, title_en, body_hr, body_en, tags, device_id, source_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      subject, // title_hr = subject
      language === 'en' ? subject : null, // title_en only if submitted in EN
      body, // body_hr = body
      language === 'en' ? body : null, // body_en only if submitted in EN
      [], // No tags for sent feedback
      deviceId,
      'feedback_sent',
    ]
  );
  const sentInboxMessageId = inboxResult.rows[0].id;

  // Create the feedback record
  const feedbackResult = await query<FeedbackRow>(
    `INSERT INTO feedback
       (device_id, user_mode, municipality, language, subject, body, sent_inbox_message_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [deviceId, userMode, municipality, language, subject, body, sentInboxMessageId]
  );

  // Update inbox message with feedback_id reference
  await query(
    `UPDATE inbox_messages SET feedback_id = $1 WHERE id = $2`,
    [feedbackResult.rows[0].id, sentInboxMessageId]
  );

  // Increment rate limit
  await incrementRateLimit(deviceId);

  return rowToFeedback(feedbackResult.rows[0]);
}

/**
 * Get feedback by ID (for device owner)
 * Returns null if not found or device doesn't match
 */
export async function getFeedbackByIdForDevice(
  feedbackId: string,
  deviceId: string
): Promise<Feedback | null> {
  const result = await query<FeedbackRow>(
    `SELECT * FROM feedback WHERE id = $1 AND device_id = $2`,
    [feedbackId, deviceId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToFeedback(result.rows[0]);
}

/**
 * Get feedback by ID (admin, no device check)
 */
export async function getFeedbackByIdAdmin(
  feedbackId: string
): Promise<Feedback | null> {
  const result = await query<FeedbackRow>(
    `SELECT * FROM feedback WHERE id = $1`,
    [feedbackId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToFeedback(result.rows[0]);
}

/**
 * Get replies for a feedback
 */
export async function getFeedbackReplies(
  feedbackId: string
): Promise<FeedbackReply[]> {
  const result = await query<FeedbackReplyRow>(
    `SELECT * FROM feedback_replies
     WHERE feedback_id = $1
     ORDER BY created_at ASC`,
    [feedbackId]
  );

  return result.rows.map(rowToFeedbackReply);
}

/**
 * Update feedback status (admin only)
 */
export async function updateFeedbackStatus(
  feedbackId: string,
  status: FeedbackStatus
): Promise<Feedback | null> {
  const result = await query<FeedbackRow>(
    `UPDATE feedback SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, feedbackId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToFeedback(result.rows[0]);
}

/**
 * Create a reply to feedback (admin only)
 * Also creates an inbox message for the device
 */
export async function createFeedbackReply(
  feedbackId: string,
  body: string,
  adminActor: string | null
): Promise<FeedbackReply> {
  // Get the feedback to know device_id and language
  const feedbackResult = await query<FeedbackRow>(
    `SELECT * FROM feedback WHERE id = $1`,
    [feedbackId]
  );

  if (feedbackResult.rows.length === 0) {
    throw new Error('Feedback not found');
  }

  const feedback = feedbackResult.rows[0];

  // Create inbox message for the device
  // Title: "Odgovor na vašu poruku" (HR) / "Reply to your message" (EN)
  const titleHr = 'Odgovor na vašu poruku';
  const titleEn = 'Reply to your message';

  const inboxResult = await query<{ id: string }>(
    `INSERT INTO inbox_messages
       (title_hr, title_en, body_hr, body_en, tags, device_id, source_type, feedback_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      titleHr,
      feedback.language === 'en' ? titleEn : null,
      body, // body_hr = reply body
      feedback.language === 'en' ? body : null,
      [], // No tags
      feedback.device_id,
      'feedback_reply',
      feedbackId,
    ]
  );

  const inboxMessageId = inboxResult.rows[0].id;

  // Create the reply record
  const replyResult = await query<FeedbackReplyRow>(
    `INSERT INTO feedback_replies (feedback_id, admin_actor, body, inbox_message_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [feedbackId, adminActor, body, inboxMessageId]
  );

  // Update inbox message with feedback_reply_id
  await query(
    `UPDATE inbox_messages SET feedback_reply_id = $1 WHERE id = $2`,
    [replyResult.rows[0].id, inboxMessageId]
  );

  // Update feedback's updated_at
  await query(
    `UPDATE feedback SET updated_at = NOW() WHERE id = $1`,
    [feedbackId]
  );

  return rowToFeedbackReply(replyResult.rows[0]);
}

// ============================================================
// Admin Queries
// ============================================================

/**
 * Get paginated feedback list for admin
 *
 * NOTE: All admins see ALL Feedback submissions regardless of municipality.
 * Municipality filtering was removed to enable global moderation visibility.
 * The adminMunicipality parameter is kept for API compatibility but ignored.
 */
export async function getFeedbackListAdmin(
  page: number = 1,
  pageSize: number = 20,
  _adminMunicipality: Municipality = null
): Promise<{ feedback: (Feedback & { reply_count: number })[]; total: number }> {
  const offset = (page - 1) * pageSize;

  // Get total count (no municipality filtering - admins see all)
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM feedback`
  );
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

  // Get paginated feedback with reply count (no municipality filtering - admins see all)
  const result = await query<FeedbackWithReplyCountRow>(
    `SELECT f.*,
            (SELECT COUNT(*) FROM feedback_replies WHERE feedback_id = f.id) as reply_count
     FROM feedback f
     ORDER BY f.created_at DESC
     LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  );

  return {
    feedback: result.rows.map((row) => ({
      ...rowToFeedback(row),
      reply_count: parseInt(row.reply_count, 10),
    })),
    total,
  };
}

// ============================================================
// Inbox Integration: Sent Items
// ============================================================

/**
 * Get sent items (feedback submissions) for a device
 */
export async function getSentItemsForDevice(
  deviceId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ items: Feedback[]; total: number }> {
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM feedback WHERE device_id = $1`,
    [deviceId]
  );
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

  // Get paginated feedback
  const result = await query<FeedbackRow>(
    `SELECT * FROM feedback
     WHERE device_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [deviceId, pageSize, offset]
  );

  return {
    items: result.rows.map(rowToFeedback),
    total,
  };
}

// ============================================================
// Helpers
// ============================================================

function rowToFeedback(row: FeedbackRow): Feedback {
  return {
    id: row.id,
    device_id: row.device_id,
    user_mode: row.user_mode,
    municipality: row.municipality,
    language: row.language,
    subject: row.subject,
    body: row.body,
    status: row.status,
    sent_inbox_message_id: row.sent_inbox_message_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToFeedbackReply(row: FeedbackReplyRow): FeedbackReply {
  return {
    id: row.id,
    feedback_id: row.feedback_id,
    admin_actor: row.admin_actor,
    body: row.body,
    inbox_message_id: row.inbox_message_id,
    created_at: row.created_at,
  };
}
