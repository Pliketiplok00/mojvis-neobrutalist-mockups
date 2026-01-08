/**
 * Admin Inbox Types
 *
 * Types for inbox message management in admin panel.
 */

/**
 * Fixed tag taxonomy (FINAL per spec)
 * Max 2 tags per message
 */
export const INBOX_TAGS = [
  'cestovni_promet',
  'pomorski_promet',
  'kultura',
  'opcenito',
  'hitno',
  'komiza',
  'vis',
] as const;

export type InboxTag = (typeof INBOX_TAGS)[number];

/**
 * Tag labels for display (HR-only for admin)
 */
export const TAG_LABELS: Record<InboxTag, string> = {
  cestovni_promet: 'Cestovni promet',
  pomorski_promet: 'Pomorski promet',
  kultura: 'Kultura',
  opcenito: 'Općenito',
  hitno: 'Hitno (urgentno)',
  komiza: 'Komiža (općinska)',
  vis: 'Vis (općinska)',
};

/**
 * Inbox message as stored/retrieved
 *
 * Phase 7: Added push notification fields
 * - is_locked: TRUE after push sent (no edits allowed)
 * - pushed_at: When push was sent
 * - pushed_by: Admin who triggered push
 */
export interface InboxMessage {
  id: string;
  title_hr: string;
  title_en: string | null;
  body_hr: string;
  body_en: string | null;
  tags: InboxTag[];
  active_from: string | null;
  active_to: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deleted_at: string | null;
  is_urgent: boolean;
  // Phase 7: Push notification fields
  is_locked: boolean;
  pushed_at: string | null;
  pushed_by: string | null;
}

/**
 * Create/update message payload
 */
export interface InboxMessageInput {
  title_hr: string;
  title_en: string | null;
  body_hr: string;
  body_en: string | null;
  tags: InboxTag[];
  active_from: string | null;
  active_to: string | null;
}

/**
 * Paginated list response
 */
export interface InboxListResponse {
  messages: InboxMessage[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * Validate tags (max 2, from taxonomy)
 */
export function validateTags(tags: string[]): boolean {
  if (tags.length > 2) return false;
  return tags.every((tag) => INBOX_TAGS.includes(tag as InboxTag));
}

/**
 * Check if message requires EN (non-municipal)
 */
export function requiresEnglish(tags: InboxTag[]): boolean {
  // Municipal messages (vis/komiza) can be single-language
  return !tags.includes('vis') && !tags.includes('komiza');
}
