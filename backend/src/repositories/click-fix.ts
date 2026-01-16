/**
 * Click & Fix Repository
 *
 * Database access layer for Click & Fix issue reports.
 * Handles CRUD operations, rate limiting, photo management, and Inbox integration.
 *
 * Phase 6: Anonymous issue reporting with location + photos.
 */

import { query } from '../lib/database.js';
import type { Municipality, UserMode } from '../types/inbox.js';
import type { FeedbackStatus, FeedbackLanguage } from '../types/feedback.js';
import type {
  ClickFix,
  ClickFixPhoto,
  ClickFixReply,
  Location,
} from '../types/click-fix.js';
import { CLICK_FIX_RATE_LIMIT } from '../types/click-fix.js';

// ============================================================
// Database Row Types
// ============================================================

interface ClickFixRow {
  id: string;
  device_id: string;
  user_mode: UserMode;
  municipality: Municipality;
  language: FeedbackLanguage;
  subject: string;
  description: string;
  location_lat: number;
  location_lng: number;
  status: FeedbackStatus;
  sent_inbox_message_id: string | null;
  created_at: Date;
  updated_at: Date;
}

interface ClickFixPhotoRow {
  id: string;
  click_fix_id: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  display_order: number;
  created_at: Date;
}

interface ClickFixReplyRow {
  id: string;
  click_fix_id: string;
  admin_actor: string | null;
  body: string;
  inbox_message_id: string | null;
  created_at: Date;
}

interface ClickFixWithCountsRow extends ClickFixRow {
  photo_count: string;
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
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLICK_FIX_RATE_LIMIT.TIMEZONE,
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
    `SELECT submission_count FROM click_fix_rate_limits
     WHERE device_id = $1 AND submission_date = $2`,
    [deviceId, today]
  );

  if (result.rows.length === 0) {
    return { allowed: true, remaining: CLICK_FIX_RATE_LIMIT.MAX_PER_DAY };
  }

  const count = result.rows[0].submission_count;
  const remaining = Math.max(0, CLICK_FIX_RATE_LIMIT.MAX_PER_DAY - count);
  return { allowed: count < CLICK_FIX_RATE_LIMIT.MAX_PER_DAY, remaining };
}

/**
 * Increment rate limit counter for device
 */
async function incrementRateLimit(deviceId: string): Promise<void> {
  const today = getZagrebDateString();

  await query(
    `INSERT INTO click_fix_rate_limits (device_id, submission_date, submission_count)
     VALUES ($1, $2, 1)
     ON CONFLICT (device_id, submission_date)
     DO UPDATE SET submission_count = click_fix_rate_limits.submission_count + 1`,
    [deviceId, today]
  );
}

// ============================================================
// Click & Fix CRUD
// ============================================================

export interface CreateClickFixInput {
  deviceId: string;
  userMode: UserMode;
  municipality: Municipality;
  language: FeedbackLanguage;
  subject: string;
  description: string;
  location: Location;
}

export interface PhotoInput {
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  displayOrder: number;
}

/**
 * Create a new Click & Fix submission with photos
 * Also creates the Sent inbox message and increments rate limit
 */
export async function createClickFix(
  input: CreateClickFixInput,
  photos: PhotoInput[] = []
): Promise<ClickFix> {
  const {
    deviceId,
    userMode,
    municipality,
    language,
    subject,
    description,
    location,
  } = input;

  // Create the Sent inbox message first
  const inboxResult = await query<{ id: string }>(
    `INSERT INTO inbox_messages
       (title_hr, title_en, body_hr, body_en, tags, device_id, source_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      subject, // title_hr = subject
      language === 'en' ? subject : null,
      description, // body_hr = description
      language === 'en' ? description : null,
      [], // No tags for sent items
      deviceId,
      'click_fix_sent',
    ]
  );
  const sentInboxMessageId = inboxResult.rows[0].id;

  // Create the click_fix record
  const clickFixResult = await query<ClickFixRow>(
    `INSERT INTO click_fix
       (device_id, user_mode, municipality, language, subject, description,
        location_lat, location_lng, sent_inbox_message_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      deviceId,
      userMode,
      municipality,
      language,
      subject,
      description,
      location.lat,
      location.lng,
      sentInboxMessageId,
    ]
  );

  const clickFixId = clickFixResult.rows[0].id;

  // Update inbox message with click_fix_id reference
  await query(
    `UPDATE inbox_messages SET click_fix_id = $1 WHERE id = $2`,
    [clickFixId, sentInboxMessageId]
  );

  // Insert photos
  for (const photo of photos) {
    await query(
      `INSERT INTO click_fix_photos
         (click_fix_id, file_path, file_name, mime_type, file_size, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        clickFixId,
        photo.filePath,
        photo.fileName,
        photo.mimeType,
        photo.fileSize,
        photo.displayOrder,
      ]
    );
  }

  // Increment rate limit
  await incrementRateLimit(deviceId);

  return rowToClickFix(clickFixResult.rows[0]);
}

/**
 * Get Click & Fix by ID (for device owner)
 * Returns null if not found or device doesn't match
 */
export async function getClickFixByIdForDevice(
  clickFixId: string,
  deviceId: string
): Promise<ClickFix | null> {
  const result = await query<ClickFixRow>(
    `SELECT * FROM click_fix WHERE id = $1 AND device_id = $2`,
    [clickFixId, deviceId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToClickFix(result.rows[0]);
}

/**
 * Get Click & Fix by ID (admin, no device check)
 */
export async function getClickFixByIdAdmin(
  clickFixId: string
): Promise<ClickFix | null> {
  const result = await query<ClickFixRow>(
    `SELECT * FROM click_fix WHERE id = $1`,
    [clickFixId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToClickFix(result.rows[0]);
}

/**
 * Get photos for a Click & Fix
 */
export async function getClickFixPhotos(
  clickFixId: string
): Promise<ClickFixPhoto[]> {
  const result = await query<ClickFixPhotoRow>(
    `SELECT * FROM click_fix_photos
     WHERE click_fix_id = $1
     ORDER BY display_order ASC`,
    [clickFixId]
  );

  return result.rows.map(rowToClickFixPhoto);
}

/**
 * Get replies for a Click & Fix
 */
export async function getClickFixReplies(
  clickFixId: string
): Promise<ClickFixReply[]> {
  const result = await query<ClickFixReplyRow>(
    `SELECT * FROM click_fix_replies
     WHERE click_fix_id = $1
     ORDER BY created_at ASC`,
    [clickFixId]
  );

  return result.rows.map(rowToClickFixReply);
}

/**
 * Update Click & Fix status (admin only)
 * Creates an inbox notification for the device owner
 */
export async function updateClickFixStatus(
  clickFixId: string,
  status: FeedbackStatus,
  _adminActor: string | null = null
): Promise<ClickFix | null> {
  // Get the click_fix first to know device_id and language
  const existing = await query<ClickFixRow>(
    `SELECT * FROM click_fix WHERE id = $1`,
    [clickFixId]
  );

  if (existing.rows.length === 0) {
    return null;
  }

  const clickFix = existing.rows[0];

  // Update status
  const result = await query<ClickFixRow>(
    `UPDATE click_fix SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, clickFixId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  // Create inbox notification for status change
  const titleHr = 'Status prijave promijenjen';
  const titleEn = 'Report status changed';
  const bodyHr = `Vaša prijava "${clickFix.subject}" je ažurirana.`;
  const bodyEn = `Your report "${clickFix.subject}" has been updated.`;

  await query(
    `INSERT INTO inbox_messages
       (title_hr, title_en, body_hr, body_en, tags, device_id, source_type, click_fix_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      titleHr,
      clickFix.language === 'en' ? titleEn : null,
      bodyHr,
      clickFix.language === 'en' ? bodyEn : null,
      [],
      clickFix.device_id,
      'click_fix_status',
      clickFixId,
    ]
  );

  return rowToClickFix(result.rows[0]);
}

/**
 * Create a reply to Click & Fix (admin only)
 * Also creates an inbox message for the device
 */
export async function createClickFixReply(
  clickFixId: string,
  body: string,
  adminActor: string | null
): Promise<ClickFixReply> {
  // Get the click_fix to know device_id and language
  const clickFixResult = await query<ClickFixRow>(
    `SELECT * FROM click_fix WHERE id = $1`,
    [clickFixId]
  );

  if (clickFixResult.rows.length === 0) {
    throw new Error('Click & Fix not found');
  }

  const clickFix = clickFixResult.rows[0];

  // Create inbox message for the device
  const titleHr = 'Odgovor na vašu prijavu';
  const titleEn = 'Reply to your report';

  const inboxResult = await query<{ id: string }>(
    `INSERT INTO inbox_messages
       (title_hr, title_en, body_hr, body_en, tags, device_id, source_type, click_fix_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      titleHr,
      clickFix.language === 'en' ? titleEn : null,
      body,
      clickFix.language === 'en' ? body : null,
      [],
      clickFix.device_id,
      'click_fix_reply',
      clickFixId,
    ]
  );

  const inboxMessageId = inboxResult.rows[0].id;

  // Create the reply record
  const replyResult = await query<ClickFixReplyRow>(
    `INSERT INTO click_fix_replies (click_fix_id, admin_actor, body, inbox_message_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [clickFixId, adminActor, body, inboxMessageId]
  );

  // Update inbox message with click_fix_reply_id
  await query(
    `UPDATE inbox_messages SET click_fix_reply_id = $1 WHERE id = $2`,
    [replyResult.rows[0].id, inboxMessageId]
  );

  // Update click_fix's updated_at
  await query(
    `UPDATE click_fix SET updated_at = NOW() WHERE id = $1`,
    [clickFixId]
  );

  return rowToClickFixReply(replyResult.rows[0]);
}

// ============================================================
// Admin Queries
// ============================================================

/**
 * Get paginated Click & Fix list for admin
 *
 * NOTE: All admins see ALL Click&Fix submissions regardless of municipality.
 * Municipality filtering was removed to enable global moderation visibility.
 * The adminMunicipality parameter is kept for API compatibility but ignored.
 */
export async function getClickFixListAdmin(
  page: number = 1,
  pageSize: number = 20,
  _adminMunicipality: Municipality = null
): Promise<{
  items: (ClickFix & { photo_count: number; reply_count: number })[];
  total: number;
}> {
  const offset = (page - 1) * pageSize;

  // Get total count (no municipality filtering - admins see all)
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM click_fix`
  );
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

  // Get paginated items with counts (no municipality filtering - admins see all)
  const result = await query<ClickFixWithCountsRow>(
    `SELECT cf.*,
            (SELECT COUNT(*) FROM click_fix_photos WHERE click_fix_id = cf.id) as photo_count,
            (SELECT COUNT(*) FROM click_fix_replies WHERE click_fix_id = cf.id) as reply_count
     FROM click_fix cf
     ORDER BY cf.created_at DESC
     LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  );

  return {
    items: result.rows.map((row) => ({
      ...rowToClickFix(row),
      photo_count: parseInt(row.photo_count, 10),
      reply_count: parseInt(row.reply_count, 10),
    })),
    total,
  };
}

// ============================================================
// Inbox Integration: Sent Items
// ============================================================

/**
 * Get sent Click & Fix items for a device
 */
export async function getSentClickFixForDevice(
  deviceId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{
  items: (ClickFix & { photo_count: number })[];
  total: number;
}> {
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM click_fix WHERE device_id = $1`,
    [deviceId]
  );
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

  // Get paginated items with photo count
  const result = await query<ClickFixRow & { photo_count: string }>(
    `SELECT cf.*,
            (SELECT COUNT(*) FROM click_fix_photos WHERE click_fix_id = cf.id) as photo_count
     FROM click_fix cf
     WHERE cf.device_id = $1
     ORDER BY cf.created_at DESC
     LIMIT $2 OFFSET $3`,
    [deviceId, pageSize, offset]
  );

  return {
    items: result.rows.map((row) => ({
      ...rowToClickFix(row),
      photo_count: parseInt(row.photo_count, 10),
    })),
    total,
  };
}

// ============================================================
// Helpers
// ============================================================

function rowToClickFix(row: ClickFixRow): ClickFix {
  return {
    id: row.id,
    device_id: row.device_id,
    user_mode: row.user_mode,
    municipality: row.municipality,
    language: row.language,
    subject: row.subject,
    description: row.description,
    location_lat: row.location_lat,
    location_lng: row.location_lng,
    status: row.status,
    sent_inbox_message_id: row.sent_inbox_message_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToClickFixPhoto(row: ClickFixPhotoRow): ClickFixPhoto {
  return {
    id: row.id,
    click_fix_id: row.click_fix_id,
    file_path: row.file_path,
    file_name: row.file_name,
    mime_type: row.mime_type,
    file_size: row.file_size,
    display_order: row.display_order,
    created_at: row.created_at,
  };
}

function rowToClickFixReply(row: ClickFixReplyRow): ClickFixReply {
  return {
    id: row.id,
    click_fix_id: row.click_fix_id,
    admin_actor: row.admin_actor,
    body: row.body,
    inbox_message_id: row.inbox_message_id,
    created_at: row.created_at,
  };
}
