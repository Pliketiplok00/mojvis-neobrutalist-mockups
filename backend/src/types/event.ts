/**
 * Event Types
 *
 * Core types for the Events module (Phase 2).
 *
 * Event fields per spec:
 * - id
 * - title_hr / title_en (REQUIRED)
 * - description_hr / description_en
 * - start_datetime
 * - end_datetime (optional)
 * - location_hr / location_en (optional)
 * - is_all_day (boolean)
 * - image_url (optional hero image URL)
 * - created_at / updated_at
 *
 * NOT included per spec:
 * - capacity
 * - registration
 * - ticketing
 * - categories
 * - recurrence rules
 */

/**
 * Event as stored in database
 */
export interface Event {
  id: string;
  title_hr: string;
  title_en: string;
  description_hr: string | null;
  description_en: string | null;
  start_datetime: Date;
  end_datetime: Date | null;
  location_hr: string | null;
  location_en: string | null;
  is_all_day: boolean;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Event for public API response (localized)
 */
export interface EventResponse {
  id: string;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  is_all_day: boolean;
  image_url: string | null;
  created_at: string;
}

/**
 * Paginated event list response
 */
export interface EventListResponse {
  events: EventResponse[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * Admin event response (includes HR/EN fields)
 */
export interface AdminEventResponse {
  id: string;
  title_hr: string;
  title_en: string;
  description_hr: string | null;
  description_en: string | null;
  start_datetime: string;
  end_datetime: string | null;
  location_hr: string | null;
  location_en: string | null;
  is_all_day: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Admin paginated event list response
 */
export interface AdminEventListResponse {
  events: AdminEventResponse[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * Reminder subscription as stored in database
 */
export interface ReminderSubscription {
  id: string;
  device_id: string;
  event_id: string;
  created_at: Date;
}

/**
 * Subscription status response
 */
export interface SubscriptionStatusResponse {
  subscribed: boolean;
}
