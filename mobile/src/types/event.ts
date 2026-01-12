/**
 * Event Types
 *
 * Types for events in the mobile app.
 * Phase 2: Events & Reminders
 */

/**
 * Event as received from API
 */
export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  organizer: string;
  is_all_day: boolean;
  image_url: string | null;
  created_at: string;
}

/**
 * Paginated event list response
 */
export interface EventListResponse {
  events: Event[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * Event dates response (for calendar view)
 */
export interface EventDatesResponse {
  dates: string[];
}

/**
 * Subscription status response
 */
export interface SubscriptionStatusResponse {
  subscribed: boolean;
}
