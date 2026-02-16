/**
 * Public Service Types
 *
 * Types for the Public Services feature.
 *
 * Two types of services:
 * - permanent: Fixed working hours (Dom zdravlja, Banka, Pošta)
 * - periodic: Scheduled dates (Veterinar, Bilježnik, Tehnički, Zubar)
 */

/**
 * Service type discriminator
 */
export type ServiceType = 'permanent' | 'periodic';

/**
 * Contact entry
 */
export interface Contact {
  type: 'phone' | 'email';
  value: string;
}

/**
 * Working hours entry (for permanent services)
 */
export interface WorkingHours {
  time: string; // "08:00-16:00"
  description_hr: string;
  description_en: string;
}

/**
 * Scheduled date entry (for periodic services)
 */
export interface ScheduledDate {
  date: string; // "2026-02-15"
  time_from: string; // "10:00"
  time_to: string; // "14:00"
  created_at: string; // ISO timestamp - used for "NEW DATES" badge
}

/**
 * Public Service as stored in database
 */
export interface PublicService {
  id: string;
  type: ServiceType;
  title_hr: string;
  title_en: string;
  subtitle_hr: string | null;
  subtitle_en: string | null;
  address: string | null;
  contacts: Contact[];
  icon: string;
  icon_bg_color: string;
  working_hours: WorkingHours[]; // For permanent services
  scheduled_dates: ScheduledDate[]; // For periodic services
  note_hr: string | null;
  note_en: string | null;
  order_index: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Public Service database row (JSONB fields as strings)
 */
export interface PublicServiceRow {
  id: string;
  type: ServiceType;
  title_hr: string;
  title_en: string;
  subtitle_hr: string | null;
  subtitle_en: string | null;
  address: string | null;
  contacts: Contact[] | string;
  icon: string;
  icon_bg_color: string;
  working_hours: WorkingHours[] | string;
  scheduled_dates: ScheduledDate[] | string;
  note_hr: string | null;
  note_en: string | null;
  order_index: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Public Service for API response (localized)
 */
export interface PublicServiceResponse {
  id: string;
  type: ServiceType;
  title: string;
  subtitle: string | null;
  address: string | null;
  contacts: Contact[];
  icon: string;
  icon_bg_color: string;
  working_hours: Array<{
    time: string;
    description: string;
  }>;
  scheduled_dates: ScheduledDate[];
  note: string | null;
  has_new_dates: boolean; // True if any scheduled_date.created_at < 7 days ago
}

/**
 * Admin response (full data, both languages)
 */
export interface PublicServiceAdminResponse {
  id: string;
  type: ServiceType;
  title_hr: string;
  title_en: string;
  subtitle_hr: string | null;
  subtitle_en: string | null;
  address: string | null;
  contacts: Contact[];
  icon: string;
  icon_bg_color: string;
  working_hours: WorkingHours[];
  scheduled_dates: ScheduledDate[];
  note_hr: string | null;
  note_en: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a new public service
 */
export interface CreatePublicServiceInput {
  type: ServiceType;
  title_hr: string;
  title_en: string;
  subtitle_hr?: string | null;
  subtitle_en?: string | null;
  address?: string | null;
  contacts?: Contact[];
  icon: string;
  icon_bg_color: string;
  working_hours?: WorkingHours[];
  scheduled_dates?: ScheduledDate[];
  note_hr?: string | null;
  note_en?: string | null;
  order_index?: number;
}

/**
 * Input for updating an existing public service
 */
export interface UpdatePublicServiceInput {
  type?: ServiceType;
  title_hr?: string;
  title_en?: string;
  subtitle_hr?: string | null;
  subtitle_en?: string | null;
  address?: string | null;
  contacts?: Contact[];
  icon?: string;
  icon_bg_color?: string;
  working_hours?: WorkingHours[];
  scheduled_dates?: ScheduledDate[];
  note_hr?: string | null;
  note_en?: string | null;
  order_index?: number;
  is_active?: boolean;
}

/**
 * Admin list response
 */
export interface PublicServiceListResponse {
  services: PublicServiceAdminResponse[];
  total: number;
}
