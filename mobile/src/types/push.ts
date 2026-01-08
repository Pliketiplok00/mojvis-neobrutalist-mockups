/**
 * Push Notification Types
 *
 * Phase 7: Types for push notification management.
 */

/**
 * Push registration response from backend
 */
export interface PushRegistrationResponse {
  device_id: string;
  platform: 'ios' | 'android';
  locale: 'hr' | 'en';
  push_opt_in: boolean;
  registered_at: string;
}

/**
 * Push opt-in update response
 */
export interface PushOptInResponse {
  device_id: string;
  push_opt_in: boolean;
  updated_at: string;
}

/**
 * Push status response
 */
export interface PushStatusResponse {
  registered: boolean;
  platform?: 'ios' | 'android';
  locale?: 'hr' | 'en';
  push_opt_in?: boolean | null;
  registered_at?: string;
}

/**
 * Push notification payload (from Expo)
 */
export interface PushNotificationPayload {
  inbox_message_id?: string;
  type?: 'hitno';
}
