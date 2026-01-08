/**
 * Click & Fix Admin Types
 *
 * Types for admin Click & Fix issue management.
 * Phase 6: Click & Fix feature.
 */

// Reuse status types from feedback (same values)
export type ClickFixStatus = 'zaprimljeno' | 'u_razmatranju' | 'prihvaceno' | 'odbijeno';

// Status labels for display
export const STATUS_LABELS: Record<ClickFixStatus, string> = {
  zaprimljeno: 'Zaprimljeno',
  u_razmatranju: 'U razmatranju',
  prihvaceno: 'Prihvaceno',
  odbijeno: 'Odbijeno',
};

// Status colors for badges
export const STATUS_COLORS: Record<ClickFixStatus, { bg: string; text: string }> = {
  zaprimljeno: { bg: '#E3F2FD', text: '#1565C0' },
  u_razmatranju: { bg: '#FFF3E0', text: '#E65100' },
  prihvaceno: { bg: '#E8F5E9', text: '#2E7D32' },
  odbijeno: { bg: '#FFEBEE', text: '#C62828' },
};

// Location coordinates
export interface Location {
  lat: number;
  lng: number;
}

// Photo attached to click fix
export interface ClickFixPhoto {
  id: string;
  url: string;
  created_at: string;
}

// Click fix reply
export interface ClickFixReply {
  id: string;
  body: string;
  created_at: string;
  admin_id: string | null;
}

// Click fix item in list
export interface ClickFixListItem {
  id: string;
  subject: string;
  status: ClickFixStatus;
  status_label: string;
  municipality: string | null;
  photo_count: number;
  created_at: string;
  reply_count: number;
}

// Click fix detail
export interface ClickFixDetail {
  id: string;
  device_id: string;
  subject: string;
  description: string;
  location: Location;
  status: ClickFixStatus;
  status_label: string;
  municipality: string | null;
  inbox_message_id: string | null;
  created_at: string;
  updated_at: string;
  photos: ClickFixPhoto[];
  replies: ClickFixReply[];
}

// Click fix list response
export interface ClickFixListResponse {
  items: ClickFixListItem[];
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
  status: ClickFixStatus;
}
