/**
 * Event Types (Admin)
 *
 * Types for events in the admin panel.
 * Phase 2: Events & Reminders
 *
 * Rules (per spec):
 * - HR and EN both REQUIRED for events
 * - Events are live on save
 * - No draft workflow
 */

/**
 * Event as received from admin API
 */
export interface AdminEvent {
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
  created_at: string;
  updated_at: string;
}

/**
 * Event input for create/update
 */
export interface AdminEventInput {
  title_hr: string;
  title_en: string;
  description_hr?: string | null;
  description_en?: string | null;
  start_datetime: string;
  end_datetime?: string | null;
  location_hr?: string | null;
  location_en?: string | null;
  is_all_day?: boolean;
}

/**
 * Paginated event list response
 */
export interface AdminEventListResponse {
  events: AdminEvent[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}
