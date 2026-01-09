/**
 * Admin Inbox Types
 *
 * Types for inbox message management in admin panel.
 *
 * Phase 2 Banner Rules:
 * - Banners require "hitno" + exactly one context tag
 * - active_from AND active_to required for hitno messages
 */

/**
 * Fixed tag taxonomy (Phase 2)
 *
 * DEPRECATED: cestovni_promet, pomorski_promet (normalized to 'promet')
 * ACTIVE: hitno, promet, kultura, opcenito, vis, komiza
 */
export const INBOX_TAGS = [
  'cestovni_promet', // DEPRECATED
  'pomorski_promet', // DEPRECATED
  'promet', // unified transport (new)
  'kultura',
  'opcenito',
  'hitno',
  'komiza',
  'vis',
] as const;

export type InboxTag = (typeof INBOX_TAGS)[number];

/**
 * Tags that should be shown in admin UI for NEW messages
 * (excludes deprecated tags)
 */
export const ACTIVE_INBOX_TAGS: readonly InboxTag[] = [
  'hitno',
  'promet',
  'kultura',
  'opcenito',
  'vis',
  'komiza',
];

/**
 * Tag labels for display (HR-only for admin)
 */
export const TAG_LABELS: Record<InboxTag, string> = {
  cestovni_promet: 'Cestovni promet (zastarjelo)',
  pomorski_promet: 'Pomorski promet (zastarjelo)',
  promet: 'Promet',
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

/**
 * Deprecated transport tags (kept for backward compatibility)
 */
export const DEPRECATED_TAGS: readonly InboxTag[] = ['cestovni_promet', 'pomorski_promet'];

/**
 * Context tags that can be paired with 'hitno' for banners
 */
export const BANNER_CONTEXT_TAGS: readonly InboxTag[] = ['promet', 'kultura', 'opcenito', 'vis', 'komiza'];

/**
 * Check if message has the hitno (urgent) tag
 */
export function isHitno(tags: InboxTag[]): boolean {
  return tags.includes('hitno');
}

/**
 * Validate hitno message rules:
 * - hitno requires exactly one context tag
 * - hitno requires active_from AND active_to
 */
export function validateHitnoRules(
  tags: InboxTag[],
  activeFrom: string | null,
  activeTo: string | null
): { valid: boolean; error?: string } {
  if (!tags.includes('hitno')) {
    return { valid: true };
  }

  // hitno requires exactly one context tag
  const contextTags = tags.filter(t => BANNER_CONTEXT_TAGS.includes(t));
  if (contextTags.length === 0) {
    return {
      valid: false,
      error: 'Hitno poruke moraju imati točno jednu kontekst oznaku (promet, kultura, opcenito, vis ili komiza).',
    };
  }
  if (contextTags.length > 1) {
    return {
      valid: false,
      error: 'Hitno poruke mogu imati samo jednu kontekst oznaku.',
    };
  }

  // hitno requires both active_from and active_to
  if (!activeFrom || !activeTo) {
    return {
      valid: false,
      error: 'Hitno poruke moraju imati definirani aktivni period (Od i Do datumi su obavezni).',
    };
  }

  return { valid: true };
}

/**
 * Check if a tag is deprecated
 */
export function isDeprecatedTag(tag: InboxTag): boolean {
  return DEPRECATED_TAGS.includes(tag);
}
