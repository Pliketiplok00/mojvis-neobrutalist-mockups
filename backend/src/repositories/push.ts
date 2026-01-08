/**
 * Push Notifications Repository
 *
 * Phase 7: Database operations for push tokens and logs.
 *
 * NOTE: Uses in-memory mock storage for MVP.
 * Replace with actual PostgreSQL queries when database is configured.
 */

import type {
  DevicePushToken,
  PushNotificationLog,
  DevicePlatform,
  DeviceLocale,
  PushSendResult,
} from '../types/push.js';
import { getMunicipalityFromTags } from '../types/inbox.js';

// In-memory storage (mock database)
const deviceTokens = new Map<string, DevicePushToken>();
const pushLogs: PushNotificationLog[] = [];

/**
 * Register or update a device push token
 */
export async function upsertDevicePushToken(
  deviceId: string,
  expoPushToken: string,
  platform: DevicePlatform,
  locale: DeviceLocale
): Promise<DevicePushToken> {
  const existing = deviceTokens.get(deviceId);
  const now = new Date();

  const token: DevicePushToken = {
    device_id: deviceId,
    expo_push_token: expoPushToken,
    platform,
    locale,
    push_opt_in: existing?.push_opt_in ?? true, // Preserve opt-in status if exists
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };

  deviceTokens.set(deviceId, token);
  console.info('[Push] Upserted device token:', {
    device_id: deviceId,
    platform,
    locale,
    opt_in: token.push_opt_in,
  });

  return token;
}

/**
 * Update push opt-in status for a device
 */
export async function updatePushOptIn(
  deviceId: string,
  optIn: boolean
): Promise<DevicePushToken | null> {
  const existing = deviceTokens.get(deviceId);
  if (!existing) {
    return null;
  }

  existing.push_opt_in = optIn;
  existing.updated_at = new Date();
  deviceTokens.set(deviceId, existing);

  console.info('[Push] Updated opt-in:', { device_id: deviceId, opt_in: optIn });
  return existing;
}

/**
 * Get device push token by device ID
 */
export async function getDevicePushToken(
  deviceId: string
): Promise<DevicePushToken | null> {
  return deviceTokens.get(deviceId) ?? null;
}

/**
 * Get all opted-in devices for a given locale
 */
export async function getOptedInDevicesByLocale(
  locale: DeviceLocale
): Promise<DevicePushToken[]> {
  const results: DevicePushToken[] = [];
  for (const token of deviceTokens.values()) {
    if (token.push_opt_in && token.locale === locale) {
      results.push(token);
    }
  }
  return results;
}

/**
 * Get all opted-in devices (both locales)
 */
export async function getAllOptedInDevices(): Promise<DevicePushToken[]> {
  const results: DevicePushToken[] = [];
  for (const token of deviceTokens.values()) {
    if (token.push_opt_in) {
      results.push(token);
    }
  }
  return results;
}

/**
 * Get eligible devices for a push notification
 * Filters by:
 * - opt_in = true
 * - municipality eligibility (if message has municipal tag)
 *
 * NOTE: For MVP, we don't have device municipality stored.
 * This simplified version returns all opted-in devices.
 * TODO: Add device municipality to token table for proper filtering.
 */
export async function getEligibleDevicesForPush(
  messageTags: string[],
  hasEnglishContent: boolean
): Promise<DevicePushToken[]> {
  const allOptedIn = await getAllOptedInDevices();

  // Filter by language availability
  // If no English content, exclude English-locale devices
  const languageFiltered = allOptedIn.filter((device) => {
    if (device.locale === 'en' && !hasEnglishContent) {
      return false;
    }
    return true;
  });

  // For MVP, we don't filter by municipality as we don't store it on device
  // In production, add municipality to device_push_tokens and filter here
  const messageMunicipality = getMunicipalityFromTags(messageTags as any);
  if (messageMunicipality) {
    console.info('[Push] Message has municipality tag:', messageMunicipality);
    console.info('[Push] TODO: Filter devices by municipality when implemented');
  }

  return languageFiltered;
}

/**
 * Create a push notification log entry
 */
export async function createPushLog(
  inboxMessageId: string,
  adminId: string | null,
  result: PushSendResult,
  provider: string = 'expo'
): Promise<PushNotificationLog> {
  const log: PushNotificationLog = {
    id: crypto.randomUUID(),
    inbox_message_id: inboxMessageId,
    admin_id: adminId,
    sent_at: new Date(),
    target_count: result.target_count,
    success_count: result.success_count,
    failure_count: result.failure_count,
    provider,
    provider_response: result.provider_response,
    created_at: new Date(),
  };

  pushLogs.push(log);
  console.info('[Push] Created log:', {
    id: log.id,
    inbox_message_id: inboxMessageId,
    target_count: result.target_count,
    success_count: result.success_count,
    failure_count: result.failure_count,
  });

  return log;
}

/**
 * Get push logs for an inbox message
 */
export async function getPushLogsForMessage(
  inboxMessageId: string
): Promise<PushNotificationLog[]> {
  return pushLogs.filter((log) => log.inbox_message_id === inboxMessageId);
}

/**
 * Get recent push logs (for admin dashboard)
 */
export async function getRecentPushLogs(
  limit: number = 50
): Promise<PushNotificationLog[]> {
  return pushLogs
    .sort((a, b) => b.sent_at.getTime() - a.sent_at.getTime())
    .slice(0, limit);
}

/**
 * Clear all data (for testing)
 */
export function clearPushData(): void {
  deviceTokens.clear();
  pushLogs.length = 0;
}

/**
 * Get stats for testing
 */
export function getPushStats(): { tokenCount: number; logCount: number } {
  return {
    tokenCount: deviceTokens.size,
    logCount: pushLogs.length,
  };
}

/**
 * Get the latest push log (global - most recent across all messages)
 */
export async function getLatestPushLog(): Promise<PushNotificationLog | null> {
  if (pushLogs.length === 0) {
    return null;
  }
  return pushLogs
    .sort((a, b) => b.sent_at.getTime() - a.sent_at.getTime())[0];
}

/**
 * Mask an Expo push token for safe display
 * Shows first 8 chars + "..." + last 6 chars
 */
export function maskPushToken(token: string): string {
  if (!token || token.length < 20) {
    return '***masked***';
  }
  const prefix = token.slice(0, 8);
  const suffix = token.slice(-6);
  return `${prefix}...${suffix}`;
}
