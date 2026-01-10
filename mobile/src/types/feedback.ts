/**
 * Feedback Types (Mobile)
 *
 * Phase 5: User feedback with Inbox integration.
 *
 * Key concepts:
 * - Anonymous feedback (device-based, no contact fields)
 * - Submissions appear in Inbox → Sent tab
 * - Admin replies appear as Inbox messages
 * - Status: zaprimljeno → u_razmatranju → prihvaceno/odbijeno
 */

// ============================================================
// Enums
// ============================================================

/**
 * Feedback status (exact values per spec)
 */
export type FeedbackStatus =
  | 'zaprimljeno'    // received
  | 'u_razmatranju'  // in review
  | 'prihvaceno'     // accepted
  | 'odbijeno';      // rejected

/**
 * Feedback language
 */
export type FeedbackLanguage = 'hr' | 'en';

// ============================================================
// API Request Types
// ============================================================

/**
 * Request body for submitting feedback
 */
export interface SubmitFeedbackRequest {
  subject: string;
  body: string;
}

// ============================================================
// API Response Types
// ============================================================

/**
 * Reply in feedback thread
 */
export interface FeedbackReplyResponse {
  id: string;
  body: string;
  created_at: string;
}

/**
 * Feedback submit response
 */
export interface FeedbackSubmitResponse {
  id: string;
  message: string;
}

/**
 * Feedback detail response
 */
export interface FeedbackDetailResponse {
  id: string;
  subject: string;
  body: string;
  status: FeedbackStatus;
  status_label: string;
  language: FeedbackLanguage;
  created_at: string;
  updated_at: string;
  replies: FeedbackReplyResponse[];
}

/**
 * Sent item in list
 */
export interface SentItemResponse {
  id: string;
  subject: string;
  status: FeedbackStatus;
  status_label: string;
  created_at: string;
}

/**
 * Sent items list response
 */
export interface SentItemsListResponse {
  items: SentItemResponse[];
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
  BODY_MAX_LENGTH: 4000,
} as const;

/**
 * Validate feedback form
 * Returns translation keys for errors - components should translate these using t()
 */
export function validateFeedbackForm(
  subject: string,
  body: string
): { valid: boolean; errors: { subject?: string; body?: string } } {
  const errors: { subject?: string; body?: string } = {};

  if (!subject || subject.trim().length === 0) {
    errors.subject = 'feedback.validation.subjectRequired';
  } else if (subject.length > VALIDATION_LIMITS.SUBJECT_MAX_LENGTH) {
    errors.subject = 'feedback.validation.subjectMaxLength';
  }

  if (!body || body.trim().length === 0) {
    errors.body = 'feedback.validation.bodyRequired';
  } else if (body.length > VALIDATION_LIMITS.BODY_MAX_LENGTH) {
    errors.body = 'feedback.validation.bodyMaxLength';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
