/**
 * Feedback Types
 *
 * Phase 5: User feedback with Inbox integration.
 *
 * Key concepts:
 * - Anonymous feedback (device-based, no contact fields)
 * - Inbox is the single source of truth
 * - User submissions appear in Inbox → Sent
 * - Admin replies appear as Inbox messages to the same device
 * - Rate limit: 3 per device per day (Europe/Zagreb timezone)
 * - Status: zaprimljeno → u_razmatranju → prihvaceno/odbijeno
 */

import type { Municipality, UserMode } from './inbox.js';

// ============================================================
// Enums
// ============================================================

/**
 * Feedback status (exact values per spec)
 */
export type FeedbackStatus =
  | 'zaprimljeno'    // received (set automatically on creation)
  | 'u_razmatranju'  // in review (admin can set)
  | 'prihvaceno'     // accepted (admin can set)
  | 'odbijeno';      // rejected (admin can set)

export const FEEDBACK_STATUSES: readonly FeedbackStatus[] = [
  'zaprimljeno',
  'u_razmatranju',
  'prihvaceno',
  'odbijeno',
] as const;

/**
 * Feedback language (matches app language at submission time)
 */
export type FeedbackLanguage = 'hr' | 'en';

// ============================================================
// Database Entities
// ============================================================

/**
 * Feedback record as stored in database
 */
export interface Feedback {
  id: string;
  device_id: string;
  user_mode: UserMode;
  municipality: Municipality;
  language: FeedbackLanguage;
  subject: string;
  body: string;
  status: FeedbackStatus;
  sent_inbox_message_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Feedback reply record as stored in database
 */
export interface FeedbackReply {
  id: string;
  feedback_id: string;
  admin_actor: string | null;
  body: string;
  inbox_message_id: string | null;
  created_at: Date;
}

/**
 * Rate limit record for tracking daily submissions
 */
export interface FeedbackRateLimit {
  device_id: string;
  submission_date: Date;
  submission_count: number;
}

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

/**
 * Request body for admin status update
 */
export interface UpdateFeedbackStatusRequest {
  status: FeedbackStatus;
}

/**
 * Request body for admin reply
 */
export interface CreateFeedbackReplyRequest {
  body: string;
}

// ============================================================
// API Response Types
// ============================================================

/**
 * Status label for display (localized)
 */
export const STATUS_LABELS: Record<FeedbackLanguage, Record<FeedbackStatus, string>> = {
  hr: {
    zaprimljeno: 'Zaprimljeno',
    u_razmatranju: 'U razmatranju',
    prihvaceno: 'Prihvaćeno',
    odbijeno: 'Odbijeno',
  },
  en: {
    zaprimljeno: 'Received',
    u_razmatranju: 'Under Review',
    prihvaceno: 'Accepted',
    odbijeno: 'Rejected',
  },
};

/**
 * Reply response for API
 */
export interface FeedbackReplyResponse {
  id: string;
  body: string;
  created_at: string;
}

/**
 * Feedback detail response for user (public API)
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
 * Feedback submit response
 */
export interface FeedbackSubmitResponse {
  id: string;
  message: string;
}

/**
 * Feedback list item for admin
 */
export interface AdminFeedbackListItem {
  id: string;
  device_id: string;
  user_mode: UserMode;
  municipality: Municipality;
  language: FeedbackLanguage;
  subject: string;
  status: FeedbackStatus;
  status_label: string;
  reply_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Feedback detail response for admin
 */
export interface AdminFeedbackDetailResponse {
  id: string;
  device_id: string;
  user_mode: UserMode;
  municipality: Municipality;
  language: FeedbackLanguage;
  subject: string;
  body: string;
  status: FeedbackStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
  replies: FeedbackReplyResponse[];
}

/**
 * Admin feedback list response
 */
export interface AdminFeedbackListResponse {
  feedback: AdminFeedbackListItem[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ============================================================
// Rate Limit
// ============================================================

/**
 * Rate limit configuration
 */
export const RATE_LIMIT = {
  MAX_PER_DAY: 3,
  TIMEZONE: 'Europe/Zagreb',
} as const;

/**
 * Rate limit error messages (bilingual)
 */
export const RATE_LIMIT_ERROR = {
  hr: 'Dnevni limit poslan. Možete poslati najviše 3 poruke dnevno. Pokušajte ponovo sutra.',
  en: 'Daily limit reached. You can send a maximum of 3 messages per day. Please try again tomorrow.',
} as const;

// ============================================================
// Validation
// ============================================================

/**
 * Validation limits
 * TODO: Confirm these limits in spec
 */
export const VALIDATION_LIMITS = {
  SUBJECT_MAX_LENGTH: 120,
  BODY_MAX_LENGTH: 4000,
} as const;

/**
 * Check if a feedback status is valid
 */
export function isValidFeedbackStatus(status: string): status is FeedbackStatus {
  return FEEDBACK_STATUSES.includes(status as FeedbackStatus);
}

/**
 * Check if a language is valid
 */
export function isValidFeedbackLanguage(lang: string): lang is FeedbackLanguage {
  return lang === 'hr' || lang === 'en';
}

/**
 * Validate feedback submission
 */
export function validateFeedbackSubmission(
  subject: string,
  body: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!subject || subject.trim().length === 0) {
    errors.push('Subject is required');
  } else if (subject.length > VALIDATION_LIMITS.SUBJECT_MAX_LENGTH) {
    errors.push(`Subject must be ${VALIDATION_LIMITS.SUBJECT_MAX_LENGTH} characters or less`);
  }

  if (!body || body.trim().length === 0) {
    errors.push('Message is required');
  } else if (body.length > VALIDATION_LIMITS.BODY_MAX_LENGTH) {
    errors.push(`Message must be ${VALIDATION_LIMITS.BODY_MAX_LENGTH} characters or less`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get status label in specified language
 */
export function getStatusLabel(status: FeedbackStatus, language: FeedbackLanguage): string {
  return STATUS_LABELS[language][status];
}
