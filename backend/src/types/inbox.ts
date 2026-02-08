/**
 * Inbox Types
 *
 * Core types for the Inbox messaging system.
 * Inbox is the SINGLE source of truth for all user-facing communication.
 *
 * Rules (per spec - Phase 2):
 * - Max 2 tags per message
 * - Tags from fixed taxonomy only
 * - Banners require "hitno" tag + exactly one context tag
 * - active_from AND active_to BOTH required for hitno messages
 * - Banner placement determined by context tag
 */

/**
 * Fixed tag taxonomy (Phase 2)
 *
 * DEPRECATED TAGS (backward compatible, normalized to 'promet'):
 * - 'cestovni_promet' → normalized to 'promet'
 * - 'pomorski_promet' → normalized to 'promet'
 *
 * ACTIVE TAGS:
 * - 'hitno'   - emergency/urgent (required for banners)
 * - 'promet'  - unified transport (road + sea)
 * - 'kultura' - culture/events
 * - 'opcenito' - general
 * - 'vis'     - municipal - Vis
 * - 'komiza'  - municipal - Komiža
 */
export const INBOX_TAGS = [
  'cestovni_promet', // DEPRECATED: normalized to 'promet'
  'pomorski_promet', // DEPRECATED: normalized to 'promet'
  'promet', // unified transport (new)
  'kultura', // culture
  'opcenito', // general
  'hitno', // emergency/urgent
  'komiza', // municipal - Komiža
  'vis', // municipal - Vis
] as const;

export type InboxTag = (typeof INBOX_TAGS)[number];

/**
 * Deprecated transport tags that get normalized to 'promet'
 */
export const DEPRECATED_TRANSPORT_TAGS: readonly InboxTag[] = ['cestovni_promet', 'pomorski_promet'];

/**
 * Canonical tags allowed for NEW admin-created messages.
 * Excludes deprecated tags which are rejected on create/update.
 */
export const CANONICAL_INBOX_TAGS: readonly string[] = ['promet', 'kultura', 'opcenito', 'hitno', 'komiza', 'vis'];

/**
 * Context tags that can be paired with 'hitno' for banners
 */
export const BANNER_CONTEXT_TAGS: readonly InboxTag[] = ['promet', 'kultura', 'opcenito', 'vis', 'komiza'];

/**
 * Normalize tags: convert deprecated transport tags to 'promet'
 * Used at runtime for eligibility checks (does not mutate DB)
 */
export function normalizeTags(tags: InboxTag[]): InboxTag[] {
  const normalized: InboxTag[] = [];
  let hasPromet = false;

  for (const tag of tags) {
    if (DEPRECATED_TRANSPORT_TAGS.includes(tag)) {
      if (!hasPromet) {
        normalized.push('promet');
        hasPromet = true;
      }
      // Skip duplicate transport tags
    } else if (tag === 'promet') {
      if (!hasPromet) {
        normalized.push('promet');
        hasPromet = true;
      }
    } else {
      normalized.push(tag);
    }
  }

  return normalized;
}

/**
 * User mode for eligibility filtering
 */
export type UserMode = 'visitor' | 'local';

/**
 * Municipality for eligibility filtering
 */
export type Municipality = 'vis' | 'komiza' | null;

/**
 * User context for eligibility decisions
 * Passed via headers or query params
 */
export interface UserContext {
  deviceId: string;
  userMode: UserMode;
  municipality: Municipality;
}

/**
 * Inbox message as stored in database
 *
 * Soft delete policy:
 * - Hard delete is NOT allowed
 * - deleted_at timestamp indicates soft-deleted state
 * - Public endpoints MUST exclude messages where deleted_at IS NOT NULL
 *
 * Push notification policy (Phase 7):
 * - is_locked = true after push sent (no edits allowed)
 * - pushed_at = timestamp when push was sent
 * - pushed_by = admin who triggered the push
 */
export interface InboxMessage {
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
  created_by: string | null; // admin user ID
  deleted_at: Date | null; // soft delete timestamp (NULL = active)
  // Phase 7: Push notification fields
  is_locked: boolean; // TRUE if pushed (no edits allowed)
  pushed_at: Date | null; // When push was sent
  pushed_by: string | null; // Admin who triggered push
}

/**
 * Inbox message for API response (localized)
 */
export interface InboxMessageResponse {
  id: string;
  title: string;
  body: string;
  tags: InboxTag[];
  active_from: string | null;
  active_to: string | null;
  created_at: string;
  is_urgent: boolean;
}

/**
 * Paginated inbox list response
 */
export interface InboxListResponse {
  messages: InboxMessageResponse[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * Admin inbox message response (includes HR/EN fields and soft delete status)
 */
export interface AdminInboxMessageResponse {
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
  deleted_at: string | null; // soft delete timestamp (NULL = active)
  is_urgent: boolean;
  // Phase 7: Push notification fields
  is_locked: boolean; // TRUE if pushed (no edits allowed)
  pushed_at: string | null; // When push was sent
  pushed_by: string | null; // Admin who triggered push
}

/**
 * Admin paginated inbox list response
 */
export interface AdminInboxListResponse {
  messages: AdminInboxMessageResponse[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * Banner response (active inbox messages eligible for banner display)
 */
export interface BannerResponse {
  banners: InboxMessageResponse[];
}

/**
 * Request params for inbox list
 */
export interface InboxListParams {
  page?: number;
  page_size?: number;
}

/**
 * Validate that tags array has max 2 tags from the taxonomy
 * @deprecated Use validateTagsCanonical for admin create/update validation
 */
export function validateTags(tags: string[]): tags is InboxTag[] {
  if (!Array.isArray(tags)) return false;
  if (tags.length > 2) return false;
  return tags.every((tag) => INBOX_TAGS.includes(tag as InboxTag));
}

/**
 * Validation result with error details
 */
export type TagValidationResult =
  | { valid: true }
  | { valid: false; error: string; code: string };

/**
 * Validate tags for admin create/update operations.
 *
 * Rules enforced:
 * - Must have at least 1 tag (TAGS_EMPTY)
 * - Must have at most 2 tags (TAGS_TOO_MANY)
 * - No duplicate tags (TAGS_DUPLICATE)
 * - Tags must be from canonical taxonomy (TAG_INVALID)
 * - Deprecated tags are rejected (TAG_DEPRECATED)
 *
 * Note: hitno rules and dual-municipal rules are validated separately.
 */
export function validateTagsCanonical(tags: string[]): TagValidationResult {
  if (!Array.isArray(tags)) {
    return { valid: false, error: 'Tags must be an array.', code: 'TAG_INVALID' };
  }

  // Min 1 tag
  if (tags.length === 0) {
    return { valid: false, error: 'At least one tag is required.', code: 'TAGS_EMPTY' };
  }

  // Max 2 tags
  if (tags.length > 2) {
    return { valid: false, error: 'Maximum 2 tags allowed.', code: 'TAGS_TOO_MANY' };
  }

  // No duplicates
  if (new Set(tags).size !== tags.length) {
    return { valid: false, error: 'Duplicate tags are not allowed.', code: 'TAGS_DUPLICATE' };
  }

  // Check each tag
  for (const tag of tags) {
    // Check for deprecated tags first (more specific error)
    if (DEPRECATED_TRANSPORT_TAGS.includes(tag as InboxTag)) {
      return {
        valid: false,
        error: `Tag '${tag}' is deprecated. Use 'promet' instead.`,
        code: 'TAG_DEPRECATED',
      };
    }

    // Check canonical taxonomy
    if (!CANONICAL_INBOX_TAGS.includes(tag)) {
      return {
        valid: false,
        error: `Tag '${tag}' is not a valid tag.`,
        code: 'TAG_INVALID',
      };
    }
  }

  return { valid: true };
}

/**
 * Check if message has the urgent/emergency tag
 */
export function isUrgent(tags: InboxTag[]): boolean {
  return tags.includes('hitno');
}

/**
 * Check if message is municipal (vis or komiza tag)
 */
export function isMunicipal(tags: InboxTag[]): boolean {
  return tags.includes('vis') || tags.includes('komiza');
}

/**
 * Get the municipality from tags (if any)
 */
export function getMunicipalityFromTags(tags: InboxTag[]): Municipality {
  if (tags.includes('vis')) return 'vis';
  if (tags.includes('komiza')) return 'komiza';
  return null;
}

/**
 * Validate hitno message rules (Phase 3):
 * - hitno requires exactly one context tag
 * - hitno requires active_from AND active_to
 *
 * Returns { valid: true } or { valid: false, error: string, code: string }
 */
export function validateHitnoRules(
  tags: InboxTag[],
  activeFrom: Date | null,
  activeTo: Date | null
): { valid: true } | { valid: false; error: string; code: string } {
  if (!tags.includes('hitno')) {
    return { valid: true };
  }

  // hitno requires exactly one context tag
  const contextTags = tags.filter(t => BANNER_CONTEXT_TAGS.includes(t));
  if (contextTags.length === 0) {
    return {
      valid: false,
      error: 'Hitno messages require exactly one context tag (promet, kultura, opcenito, vis, or komiza).',
      code: 'HITNO_MISSING_CONTEXT',
    };
  }
  if (contextTags.length > 1) {
    return {
      valid: false,
      error: 'Hitno messages can only have one context tag.',
      code: 'HITNO_MULTIPLE_CONTEXT',
    };
  }

  // hitno requires both active_from and active_to
  if (!activeFrom || !activeTo) {
    return {
      valid: false,
      error: 'Hitno messages require both active_from and active_to dates.',
      code: 'HITNO_MISSING_DATES',
    };
  }

  return { valid: true };
}

/**
 * Validate that tags do not contain BOTH municipal tags (vis and komiza).
 * A message can only belong to one municipality at a time.
 *
 * Returns { valid: true } or { valid: false, error: string, code: string }
 */
export function validateDualMunicipalTags(
  tags: InboxTag[]
): { valid: true } | { valid: false; error: string; code: string } {
  const hasVis = tags.includes('vis');
  const hasKomiza = tags.includes('komiza');

  if (hasVis && hasKomiza) {
    return {
      valid: false,
      error: 'Poruka ne smije imati obje općinske oznake (vis i komiza).',
      code: 'DUAL_MUNICIPAL_TAGS',
    };
  }

  return { valid: true };
}
