/**
 * Push Notification Types
 *
 * Phase 7: Emergency push notifications for hitno inbox messages.
 *
 * Rules (per spec):
 * - Push is ONLY for Inbox messages tagged `hitno`
 * - Backend-triggered ONLY (on admin save)
 * - Uses user's onboarding language (no fallback)
 * - Once pushed, message becomes LOCKED
 */

/**
 * Device platform
 */
export type DevicePlatform = 'ios' | 'android';

/**
 * Device locale (from onboarding)
 */
export type DeviceLocale = 'hr' | 'en';

/**
 * Device push token record
 */
export interface DevicePushToken {
  device_id: string;
  expo_push_token: string;
  platform: DevicePlatform;
  locale: DeviceLocale;
  push_opt_in: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Push notification log record
 */
export interface PushNotificationLog {
  id: string;
  inbox_message_id: string;
  admin_id: string | null;
  sent_at: Date;
  target_count: number;
  success_count: number;
  failure_count: number;
  provider: string;
  provider_response: unknown;
  created_at: Date;
}

/**
 * Input for registering/updating device push token
 */
export interface DevicePushTokenInput {
  expoPushToken: string;
  platform: DevicePlatform;
}

/**
 * Input for updating push opt-in status
 */
export interface PushOptInInput {
  optIn: boolean;
}

/**
 * Push message content (localized)
 */
export interface PushContent {
  title: string;
  body: string;
  data: {
    inbox_message_id: string;
  };
}

/**
 * Target device for push sending
 */
export interface PushTarget {
  expo_push_token: string;
  locale: DeviceLocale;
}

/**
 * Result of a push send operation
 */
export interface PushSendResult {
  target_count: number;
  success_count: number;
  failure_count: number;
  provider_response: unknown;
}

/**
 * Push eligibility context (from inbox message)
 */
export interface PushEligibilityContext {
  messageId: string;
  tags: string[];
  activeFrom: Date | null;
  activeTo: Date | null;
  titleHr: string;
  titleEn: string | null;
  bodyHr: string;
  bodyEn: string | null;
}

/**
 * Validation constants
 */
export const PUSH_VALIDATION = {
  MAX_TITLE_LENGTH: 100,
  MAX_BODY_LENGTH: 200,
  EXPO_TOKEN_PATTERN: /^ExponentPushToken\[.+\]$/,
};

/**
 * Validate Expo push token format
 */
export function isValidExpoPushToken(token: string): boolean {
  return PUSH_VALIDATION.EXPO_TOKEN_PATTERN.test(token);
}

/**
 * Validate platform value
 */
export function isValidPlatform(platform: string): platform is DevicePlatform {
  return platform === 'ios' || platform === 'android';
}

/**
 * Validate locale value
 */
export function isValidLocale(locale: string): locale is DeviceLocale {
  return locale === 'hr' || locale === 'en';
}

/**
 * Check if message should trigger push notification
 * Conditions:
 * 1. Tags include 'hitno'
 * 2. active_from and active_to are BOTH set
 * 3. Current time is within the active window
 */
export function shouldTriggerPush(
  tags: string[],
  activeFrom: Date | null,
  activeTo: Date | null,
  now: Date = new Date()
): boolean {
  // Must have hitno tag
  if (!tags.includes('hitno')) {
    return false;
  }

  // Must have both active_from and active_to set
  if (activeFrom === null || activeTo === null) {
    return false;
  }

  // Current time must be within the active window
  const nowTime = now.getTime();
  const fromTime = activeFrom.getTime();
  const toTime = activeTo.getTime();

  return nowTime >= fromTime && nowTime <= toTime;
}

/**
 * Check if device is eligible for push based on message tags
 * Uses same eligibility rules as Inbox/Banners
 */
export function isDeviceEligibleForMessage(
  messageTags: string[],
  deviceMunicipality: string | null
): boolean {
  // Check if message has municipality tag
  const hasVisMunicipality = messageTags.includes('vis');
  const hasKomizaMunicipality = messageTags.includes('komiza');
  const isMunicipalMessage = hasVisMunicipality || hasKomizaMunicipality;

  // If message is municipal, device must match
  if (isMunicipalMessage) {
    if (hasVisMunicipality && deviceMunicipality !== 'vis') {
      return false;
    }
    if (hasKomizaMunicipality && deviceMunicipality !== 'komiza') {
      return false;
    }
  }

  // Non-municipal messages are visible to all
  return true;
}
