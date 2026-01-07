/**
 * Inbox Types
 *
 * Types for inbox messages and banners in the mobile app.
 */

/**
 * Tag types from fixed taxonomy
 */
export type InboxTag =
  | 'cestovni_promet'
  | 'pomorski_promet'
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
