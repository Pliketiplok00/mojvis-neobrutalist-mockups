/**
 * Click & Fix Types (Mobile)
 *
 * Phase 6: Anonymous issue reporting with location + photos.
 *
 * Key concepts:
 * - Anonymous reporting (device-based, no user accounts)
 * - Required location (lat/lng only)
 * - Optional photos (0-3 images)
 * - Submissions appear in Inbox → Sent tab
 * - Admin replies appear as Inbox messages
 * - Status: zaprimljeno → u_razmatranju → prihvaceno/odbijeno
 */

// ============================================================
// Enums
// ============================================================

/**
 * Click & Fix status (exact values per spec - same as Feedback)
 */
export type ClickFixStatus =
  | 'zaprimljeno'    // received
  | 'u_razmatranju'  // in review
  | 'prihvaceno'     // accepted
  | 'odbijeno';      // rejected

/**
 * Click & Fix language
 */
export type ClickFixLanguage = 'hr' | 'en';

// ============================================================
// Core Types
// ============================================================

/**
 * Location (lat/lng only - no address strings)
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Photo to upload (before sending)
 */
export interface PhotoToUpload {
  uri: string;
  fileName: string;
  mimeType: string;
}

// ============================================================
// API Request Types
// ============================================================

/**
 * Request body for submitting Click & Fix (form fields only)
 * Photos are sent via multipart form data
 */
export interface SubmitClickFixRequest {
  subject: string;
  description: string;
  location: Location;
}

// ============================================================
// API Response Types
// ============================================================

/**
 * Photo in Click & Fix detail
 */
export interface ClickFixPhotoResponse {
  id: string;
  url: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  display_order: number;
}

/**
 * Reply in Click & Fix thread
 */
export interface ClickFixReplyResponse {
  id: string;
  body: string;
  created_at: string;
}

/**
 * Click & Fix submit response
 */
export interface ClickFixSubmitResponse {
  id: string;
  message: string;
}

/**
 * Click & Fix detail response
 */
export interface ClickFixDetailResponse {
  id: string;
  subject: string;
  description: string;
  location: Location;
  status: ClickFixStatus;
  status_label: string;
  language: ClickFixLanguage;
  created_at: string;
  updated_at: string;
  photos: ClickFixPhotoResponse[];
  replies: ClickFixReplyResponse[];
}

/**
 * Click & Fix sent item in list
 */
export interface ClickFixSentItemResponse {
  id: string;
  type: 'click_fix';
  subject: string;
  status: ClickFixStatus;
  status_label: string;
  photo_count: number;
  created_at: string;
}

/**
 * Click & Fix sent items list response
 */
export interface ClickFixSentListResponse {
  items: ClickFixSentItemResponse[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * Rate limit error response
 */
export interface RateLimitErrorResponse {
  error: string;
  error_hr: string;
  error_en: string;
}

// ============================================================
// Validation
// ============================================================

/**
 * Validation limits (matching backend)
 */
export const VALIDATION_LIMITS = {
  SUBJECT_MAX_LENGTH: 120,
  DESCRIPTION_MAX_LENGTH: 4000,
  MAX_PHOTOS: 3,
  MAX_PHOTO_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

/**
 * Validate Click & Fix form
 */
export function validateClickFixForm(
  subject: string,
  description: string,
  location: Location | null
): {
  valid: boolean;
  errors: { subject?: string; description?: string; location?: string };
} {
  const errors: { subject?: string; description?: string; location?: string } = {};

  if (!subject || subject.trim().length === 0) {
    errors.subject = 'Naslov je obavezan';
  } else if (subject.length > VALIDATION_LIMITS.SUBJECT_MAX_LENGTH) {
    errors.subject = `Maksimalno ${VALIDATION_LIMITS.SUBJECT_MAX_LENGTH} znakova`;
  }

  if (!description || description.trim().length === 0) {
    errors.description = 'Opis je obavezan';
  } else if (description.length > VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH) {
    errors.description = `Maksimalno ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} znakova`;
  }

  if (!location) {
    errors.location = 'Lokacija je obavezna';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate photo before upload
 */
export function validatePhoto(
  mimeType: string,
  fileSize: number
): { valid: boolean; error?: string } {
  if (!VALIDATION_LIMITS.ALLOWED_MIME_TYPES.includes(
    mimeType as typeof VALIDATION_LIMITS.ALLOWED_MIME_TYPES[number]
  )) {
    return {
      valid: false,
      error: 'Neispravan format slike. Dozvoljeno: JPEG, PNG, WebP',
    };
  }

  if (fileSize > VALIDATION_LIMITS.MAX_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Slika prevelika. Maksimalno: ${VALIDATION_LIMITS.MAX_PHOTO_SIZE_BYTES / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}
