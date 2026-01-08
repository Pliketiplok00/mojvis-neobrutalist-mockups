/**
 * Click & Fix Types
 *
 * Phase 6: Anonymous issue reporting with location + photos.
 *
 * Key concepts:
 * - Anonymous issue reporting (device-based, no user accounts)
 * - Required location (lat/lng only)
 * - Optional photos (0-3 images)
 * - Inbox integration: submissions in Sent, replies as Inbox messages
 * - Rate limit: 3 per device per day (Europe/Zagreb timezone)
 * - Status: zaprimljeno → u_razmatranju → prihvaceno/odbijeno
 */

import type { Municipality, UserMode } from './inbox.js';
import type { FeedbackStatus, FeedbackLanguage } from './feedback.js';

// Re-export shared types
export type { FeedbackStatus as ClickFixStatus, FeedbackLanguage as ClickFixLanguage };
export {
  FEEDBACK_STATUSES as CLICK_FIX_STATUSES,
  STATUS_LABELS as CLICK_FIX_STATUS_LABELS,
  isValidFeedbackStatus as isValidClickFixStatus,
  isValidFeedbackLanguage as isValidClickFixLanguage,
  getStatusLabel as getClickFixStatusLabel,
} from './feedback.js';

// ============================================================
// Database Entities
// ============================================================

/**
 * Location coordinates (lat/lng only - no address strings)
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Click & Fix record as stored in database
 */
export interface ClickFix {
  id: string;
  device_id: string;
  user_mode: UserMode;
  municipality: Municipality;
  language: FeedbackLanguage;
  subject: string;
  description: string;
  location_lat: number;
  location_lng: number;
  status: FeedbackStatus;
  sent_inbox_message_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Click & Fix photo record as stored in database
 */
export interface ClickFixPhoto {
  id: string;
  click_fix_id: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  display_order: number;
  created_at: Date;
}

/**
 * Click & Fix reply record as stored in database
 */
export interface ClickFixReply {
  id: string;
  click_fix_id: string;
  admin_actor: string | null;
  body: string;
  inbox_message_id: string | null;
  created_at: Date;
}

/**
 * Rate limit record for tracking daily submissions
 */
export interface ClickFixRateLimit {
  device_id: string;
  submission_date: Date;
  submission_count: number;
}

// ============================================================
// API Request Types
// ============================================================

/**
 * Request body for submitting click & fix (form fields only - photos via multipart)
 */
export interface SubmitClickFixRequest {
  subject: string;
  description: string;
  location: Location;
}

/**
 * Request body for admin status update
 */
export interface UpdateClickFixStatusRequest {
  status: FeedbackStatus;
}

/**
 * Request body for admin reply
 */
export interface CreateClickFixReplyRequest {
  body: string;
}

// ============================================================
// API Response Types
// ============================================================

/**
 * Photo response for API
 */
export interface ClickFixPhotoResponse {
  id: string;
  url: string; // Relative URL to access the photo
  file_name: string;
  mime_type: string;
  file_size: number;
  display_order: number;
}

/**
 * Reply response for API
 */
export interface ClickFixReplyResponse {
  id: string;
  body: string;
  created_at: string;
}

/**
 * Click & Fix detail response for user (public API)
 */
export interface ClickFixDetailResponse {
  id: string;
  subject: string;
  description: string;
  location: Location;
  status: FeedbackStatus;
  status_label: string;
  language: FeedbackLanguage;
  created_at: string;
  updated_at: string;
  photos: ClickFixPhotoResponse[];
  replies: ClickFixReplyResponse[];
}

/**
 * Click & Fix submit response
 */
export interface ClickFixSubmitResponse {
  id: string;
  message: string;
}

/**
 * Click & Fix list item for Sent tab (includes type label)
 */
export interface ClickFixSentListItem {
  id: string;
  type: 'click_fix';
  subject: string;
  status: FeedbackStatus;
  status_label: string;
  photo_count: number;
  created_at: string;
}

/**
 * Admin Click & Fix list item
 */
export interface AdminClickFixListItem {
  id: string;
  device_id: string;
  user_mode: UserMode;
  municipality: Municipality;
  language: FeedbackLanguage;
  subject: string;
  status: FeedbackStatus;
  status_label: string;
  photo_count: number;
  reply_count: number;
  location: Location;
  created_at: string;
  updated_at: string;
}

/**
 * Admin Click & Fix detail response
 */
export interface AdminClickFixDetailResponse {
  id: string;
  device_id: string;
  user_mode: UserMode;
  municipality: Municipality;
  language: FeedbackLanguage;
  subject: string;
  description: string;
  location: Location;
  status: FeedbackStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
  photos: ClickFixPhotoResponse[];
  replies: ClickFixReplyResponse[];
}

/**
 * Admin Click & Fix list response
 */
export interface AdminClickFixListResponse {
  items: AdminClickFixListItem[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ============================================================
// Rate Limit
// ============================================================

/**
 * Rate limit configuration (same as Feedback)
 */
export const CLICK_FIX_RATE_LIMIT = {
  MAX_PER_DAY: 3,
  TIMEZONE: 'Europe/Zagreb',
} as const;

/**
 * Rate limit error messages (bilingual)
 */
export const CLICK_FIX_RATE_LIMIT_ERROR = {
  hr: 'Dnevni limit poslan. Možete poslati najviše 3 prijave dnevno. Pokušajte ponovo sutra.',
  en: 'Daily limit reached. You can send a maximum of 3 reports per day. Please try again tomorrow.',
} as const;

// ============================================================
// Validation
// ============================================================

/**
 * Validation limits
 */
export const CLICK_FIX_VALIDATION = {
  SUBJECT_MAX_LENGTH: 120,
  DESCRIPTION_MAX_LENGTH: 4000,
  MAX_PHOTOS: 3,
  MAX_PHOTO_SIZE_BYTES: 5 * 1024 * 1024, // 5MB max per photo
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

/**
 * Validate Click & Fix submission
 */
export function validateClickFixSubmission(
  subject: string,
  description: string,
  location: Location | null | undefined
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Subject validation
  if (!subject || subject.trim().length === 0) {
    errors.push('Subject is required');
  } else if (subject.length > CLICK_FIX_VALIDATION.SUBJECT_MAX_LENGTH) {
    errors.push(`Subject must be ${CLICK_FIX_VALIDATION.SUBJECT_MAX_LENGTH} characters or less`);
  }

  // Description validation
  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  } else if (description.length > CLICK_FIX_VALIDATION.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Description must be ${CLICK_FIX_VALIDATION.DESCRIPTION_MAX_LENGTH} characters or less`);
  }

  // Location validation (REQUIRED)
  if (!location) {
    errors.push('Location is required');
  } else {
    if (typeof location.lat !== 'number' || isNaN(location.lat)) {
      errors.push('Location latitude is invalid');
    } else if (location.lat < -90 || location.lat > 90) {
      errors.push('Location latitude must be between -90 and 90');
    }

    if (typeof location.lng !== 'number' || isNaN(location.lng)) {
      errors.push('Location longitude is invalid');
    } else if (location.lng < -180 || location.lng > 180) {
      errors.push('Location longitude must be between -180 and 180');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate photo file
 */
export function validatePhoto(
  mimeType: string,
  fileSize: number
): { valid: boolean; error?: string } {
  if (!CLICK_FIX_VALIDATION.ALLOWED_MIME_TYPES.includes(mimeType as typeof CLICK_FIX_VALIDATION.ALLOWED_MIME_TYPES[number])) {
    return {
      valid: false,
      error: `Invalid image type. Allowed: ${CLICK_FIX_VALIDATION.ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  if (fileSize > CLICK_FIX_VALIDATION.MAX_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image too large. Maximum size: ${CLICK_FIX_VALIDATION.MAX_PHOTO_SIZE_BYTES / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}
