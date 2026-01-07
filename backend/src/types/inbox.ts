/**
 * Inbox Types
 *
 * Core types for the Inbox messaging system.
 * Inbox is the SINGLE source of truth for all user-facing communication.
 *
 * Rules (per spec):
 * - Max 2 tags per message
 * - Tags from fixed taxonomy only
 * - Banners are derived from Inbox messages (no separate notice entity)
 * - active_from/active_to define banner eligibility window
 */

/**
 * Fixed tag taxonomy (FINAL per spec)
 * Do NOT add new tags without updating documentation.
 */
export const INBOX_TAGS = [
  'cestovni_promet', // road transport
  'pomorski_promet', // sea transport
  'kultura', // culture
  'opcenito', // general
  'hitno', // emergency/urgent
  'komiza', // municipal - Komiža
  'vis', // municipal - Vis
] as const;

export type InboxTag = (typeof INBOX_TAGS)[number];

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
 */
export function validateTags(tags: string[]): tags is InboxTag[] {
  if (!Array.isArray(tags)) return false;
  if (tags.length > 2) return false;
  return tags.every((tag) => INBOX_TAGS.includes(tag as InboxTag));
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
