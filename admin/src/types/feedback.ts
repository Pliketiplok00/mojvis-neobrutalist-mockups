/**
 * Feedback Admin Types
 *
 * Types for admin feedback management.
 */

// Feedback statuses (exact values from spec)
export type FeedbackStatus = 'zaprimljeno' | 'u_razmatranju' | 'prihvaceno' | 'odbijeno';

// Feedback language
export type FeedbackLanguage = 'hr' | 'en';

// Status labels for display
export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  zaprimljeno: 'Zaprimljeno',
  u_razmatranju: 'U razmatranju',
  prihvaceno: 'Prihvaćeno',
  odbijeno: 'Odbijeno',
};

// Status colors for badges
export const STATUS_COLORS: Record<FeedbackStatus, { bg: string; text: string }> = {
  zaprimljeno: { bg: '#E3F2FD', text: '#1565C0' },
  u_razmatranju: { bg: '#FFF3E0', text: '#E65100' },
  prihvaceno: { bg: '#E8F5E9', text: '#2E7D32' },
  odbijeno: { bg: '#FFEBEE', text: '#C62828' },
};

// Feedback reply
export interface FeedbackReply {
  id: string;
  body: string;
  created_at: string;
  admin_id: string | null;
}

// Feedback item in list
export interface FeedbackListItem {
  id: string;
  subject: string;
  status: FeedbackStatus;
  status_label: string;
  language: FeedbackLanguage;
  municipality: string | null;
  created_at: string;
  reply_count: number;
}

// Feedback detail
export interface FeedbackDetail {
  id: string;
  device_id: string;
  subject: string;
  body: string;
  status: FeedbackStatus;
  status_label: string;
  language: FeedbackLanguage;
  municipality: string | null;
  inbox_message_id: string | null;
  created_at: string;
  updated_at: string;
  replies: FeedbackReply[];
}

// Feedback list response
export interface FeedbackListResponse {
  feedback: FeedbackListItem[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// Reply input
export interface ReplyInput {
  body: string;
}

// Status update input
export interface StatusUpdateInput {
  status: FeedbackStatus;
}
