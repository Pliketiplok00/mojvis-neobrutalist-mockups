/**
 * Inbox Types
 *
 * Types for inbox messages and banners in the mobile app.
 *
 * Phase 2 Banner Rules:
 * - Banners require "hitno" + exactly one context tag
 * - Screen context determines banner placement
 */

/**
 * Tag types from fixed taxonomy (Phase 2)
 *
 * DEPRECATED: cestovni_promet, pomorski_promet (normalized to 'promet' server-side)
 */
export type InboxTag =
  | 'cestovni_promet' // DEPRECATED
  | 'pomorski_promet' // DEPRECATED
  | 'promet' // unified transport (new)
  | 'kultura'
  | 'opcenito'
  | 'hitno'
  | 'komiza'
  | 'vis';

/**
 * Inbox message as received from API
 */
export interface InboxMessage {
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
  messages: InboxMessage[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * Banner response
 */
export interface BannerResponse {
  banners: InboxMessage[];
}

/**
 * User mode for context
 */
export type UserMode = 'visitor' | 'local';

/**
 * Municipality for context
 */
export type Municipality = 'vis' | 'komiza' | null;

/**
 * Screen context for banner filtering (Phase 2)
 *
 * Banner placement rules:
 * - home: hitno + opcenito, hitno + promet, hitno + vis/komiza
 * - events: hitno + kultura
 * - transport: hitno + promet (unified for all transport screens)
 */
export type ScreenContext = 'home' | 'events' | 'transport';
