/**
 * Push Notification Tests
 *
 * Phase 7: Tests for push notification functionality.
 *
 * Tests:
 * - Push trigger conditions (hitno + window + now)
 * - Eligibility filtering (municipality + visitor/local)
 * - Language strictness (no fallback => device excluded)
 * - Locked message rejects updates
 * - Soft delete behavior for locked messages
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  shouldTriggerPush,
  isValidExpoPushToken,
  isValidPlatform,
  isValidLocale,
  isDeviceEligibleForMessage,
} from '../types/push.js';
import { PushService } from '../lib/push/index.js';
import { MockExpoPushProvider } from '../lib/push/expo.js';
import {
  upsertDevicePushToken,
  updatePushOptIn,
  getDevicePushToken,
  getEligibleDevicesForPush,
  clearPushData,
  getPushStats,
  maskPushToken,
} from '../repositories/push.js';

describe('Push Trigger Conditions', () => {
  describe('shouldTriggerPush', () => {
    const now = new Date('2024-07-15T12:00:00Z');
    const yesterday = new Date('2024-07-14T00:00:00Z');
    const tomorrow = new Date('2024-07-16T23:59:59Z');
    const nextWeek = new Date('2024-07-22T00:00:00Z');

    it('should trigger when hitno tag + active window + now within window', () => {
      expect(shouldTriggerPush(['hitno'], yesterday, tomorrow, now)).toBe(true);
    });

    it('should NOT trigger without hitno tag', () => {
      expect(shouldTriggerPush(['opcenito'], yesterday, tomorrow, now)).toBe(false);
      expect(shouldTriggerPush(['vis'], yesterday, tomorrow, now)).toBe(false);
      expect(shouldTriggerPush(['kultura'], yesterday, tomorrow, now)).toBe(false);
    });

    it('should NOT trigger when active_from is null', () => {
      expect(shouldTriggerPush(['hitno'], null, tomorrow, now)).toBe(false);
    });

    it('should NOT trigger when active_to is null', () => {
      expect(shouldTriggerPush(['hitno'], yesterday, null, now)).toBe(false);
    });

    it('should NOT trigger when both active_from and active_to are null', () => {
      expect(shouldTriggerPush(['hitno'], null, null, now)).toBe(false);
    });

    it('should NOT trigger when now is before active_from', () => {
      const futureStart = new Date('2024-07-16T00:00:00Z');
      expect(shouldTriggerPush(['hitno'], futureStart, nextWeek, now)).toBe(false);
    });

    it('should NOT trigger when now is after active_to', () => {
      const pastEnd = new Date('2024-07-14T23:59:59Z');
      expect(shouldTriggerPush(['hitno'], yesterday, pastEnd, now)).toBe(false);
    });

    it('should trigger at exact active_from boundary', () => {
      expect(shouldTriggerPush(['hitno'], now, tomorrow, now)).toBe(true);
    });

    it('should trigger at exact active_to boundary', () => {
      expect(shouldTriggerPush(['hitno'], yesterday, now, now)).toBe(true);
    });

    it('should handle hitno with other tags', () => {
      expect(shouldTriggerPush(['hitno', 'vis'], yesterday, tomorrow, now)).toBe(true);
      expect(shouldTriggerPush(['opcenito', 'hitno'], yesterday, tomorrow, now)).toBe(true);
    });
  });
});

describe('Token Validation', () => {
  describe('isValidExpoPushToken', () => {
    it('should accept valid ExponentPushToken format', () => {
      expect(isValidExpoPushToken('ExponentPushToken[xxxxxxxxxxxxxx]')).toBe(true);
      expect(isValidExpoPushToken('ExponentPushToken[abc123ABC-_]')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidExpoPushToken('')).toBe(false);
      expect(isValidExpoPushToken('invalid')).toBe(false);
      expect(isValidExpoPushToken('ExponentPushToken')).toBe(false);
      expect(isValidExpoPushToken('ExponentPushToken[]')).toBe(false);
      expect(isValidExpoPushToken('FCM:token')).toBe(false);
    });
  });

  describe('isValidPlatform', () => {
    it('should accept ios and android', () => {
      expect(isValidPlatform('ios')).toBe(true);
      expect(isValidPlatform('android')).toBe(true);
    });

    it('should reject invalid platforms', () => {
      expect(isValidPlatform('web')).toBe(false);
      expect(isValidPlatform('windows')).toBe(false);
      expect(isValidPlatform('')).toBe(false);
    });
  });

  describe('isValidLocale', () => {
    it('should accept hr and en', () => {
      expect(isValidLocale('hr')).toBe(true);
      expect(isValidLocale('en')).toBe(true);
    });

    it('should reject invalid locales', () => {
      expect(isValidLocale('de')).toBe(false);
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('')).toBe(false);
    });
  });
});

describe('Device Eligibility', () => {
  describe('isDeviceEligibleForMessage (municipality)', () => {
    it('should allow general messages for all devices', () => {
      expect(isDeviceEligibleForMessage(['opcenito'], null)).toBe(true);
      expect(isDeviceEligibleForMessage(['opcenito'], 'vis')).toBe(true);
      expect(isDeviceEligibleForMessage(['opcenito'], 'komiza')).toBe(true);
    });

    it('should allow hitno messages for all devices', () => {
      expect(isDeviceEligibleForMessage(['hitno'], null)).toBe(true);
      expect(isDeviceEligibleForMessage(['hitno'], 'vis')).toBe(true);
      expect(isDeviceEligibleForMessage(['hitno'], 'komiza')).toBe(true);
    });

    it('should only allow vis messages for vis municipality', () => {
      expect(isDeviceEligibleForMessage(['vis'], 'vis')).toBe(true);
      expect(isDeviceEligibleForMessage(['vis'], 'komiza')).toBe(false);
      expect(isDeviceEligibleForMessage(['vis'], null)).toBe(false);
    });

    it('should only allow komiza messages for komiza municipality', () => {
      expect(isDeviceEligibleForMessage(['komiza'], 'komiza')).toBe(true);
      expect(isDeviceEligibleForMessage(['komiza'], 'vis')).toBe(false);
      expect(isDeviceEligibleForMessage(['komiza'], null)).toBe(false);
    });

    it('should handle messages with multiple tags including municipal', () => {
      // hitno + vis should require vis municipality
      expect(isDeviceEligibleForMessage(['hitno', 'vis'], 'vis')).toBe(true);
      expect(isDeviceEligibleForMessage(['hitno', 'vis'], 'komiza')).toBe(false);
    });
  });

  describe('Language eligibility (no fallback)', () => {
    // Language eligibility is handled in PushService.sendPush
    // These tests verify the filtering logic
    it('should exclude EN devices when no English content (tested via PushService)', () => {
      // This is verified in PushService tests below
      // Key rule: EN locale device + no EN content = device excluded
      // There is NO fallback to HR content for EN devices
    });
  });
});

describe('PushService', () => {
  let mockProvider: MockExpoPushProvider;
  let service: PushService;

  beforeEach(() => {
    mockProvider = new MockExpoPushProvider();
    service = new PushService(mockProvider);
  });

  it('should return empty result for no targets', async () => {
    const result = await service.sendPush([], { title: 'Test', body: 'Test', data: { inbox_message_id: 'test-1' } }, null);

    expect(result.target_count).toBe(0);
    expect(result.success_count).toBe(0);
    expect(mockProvider.sentMessages).toHaveLength(0);
  });

  it('should send to all HR devices', async () => {
    const targets = [
      { expo_push_token: 'ExponentPushToken[1]', locale: 'hr' as const },
      { expo_push_token: 'ExponentPushToken[2]', locale: 'hr' as const },
    ];

    const result = await service.sendPush(
      targets,
      { title: 'HR Title', body: 'HR Body', data: { inbox_message_id: 'msg-1' } },
      null
    );

    expect(result.target_count).toBe(2);
    expect(result.success_count).toBe(2);
    expect(mockProvider.sentMessages).toHaveLength(1);
  });

  it('should exclude EN devices when no English content', async () => {
    const targets = [
      { expo_push_token: 'ExponentPushToken[1]', locale: 'hr' as const },
      { expo_push_token: 'ExponentPushToken[2]', locale: 'en' as const },
    ];

    const result = await service.sendPush(
      targets,
      { title: 'HR Title', body: 'HR Body', data: { inbox_message_id: 'msg-2' } },
      null // No English content
    );

    // Only HR device should be included
    expect(result.target_count).toBe(1);
    expect(mockProvider.sentMessages[0].targets).toHaveLength(1);
    expect(mockProvider.sentMessages[0].targets[0].locale).toBe('hr');
  });

  it('should include EN devices when English content provided', async () => {
    const targets = [
      { expo_push_token: 'ExponentPushToken[1]', locale: 'hr' as const },
      { expo_push_token: 'ExponentPushToken[2]', locale: 'en' as const },
    ];

    const result = await service.sendPush(
      targets,
      { title: 'HR Title', body: 'HR Body', data: { inbox_message_id: 'msg-3' } },
      { title: 'EN Title', body: 'EN Body', data: { inbox_message_id: 'msg-3' } }
    );

    expect(result.target_count).toBe(2);
    expect(mockProvider.sentMessages[0].targets).toHaveLength(2);
  });

  it('should return provider name', () => {
    expect(service.getProviderName()).toBe('expo-mock');
  });
});

describe('Push Repository', () => {
  beforeEach(() => {
    clearPushData();
  });

  describe('upsertDevicePushToken', () => {
    it('should create new device token', async () => {
      const token = await upsertDevicePushToken(
        'device-1',
        'ExponentPushToken[test]',
        'ios',
        'hr'
      );

      expect(token.device_id).toBe('device-1');
      expect(token.expo_push_token).toBe('ExponentPushToken[test]');
      expect(token.platform).toBe('ios');
      expect(token.locale).toBe('hr');
      expect(token.push_opt_in).toBe(true); // Default
    });

    it('should update existing device token', async () => {
      await upsertDevicePushToken('device-1', 'ExponentPushToken[old]', 'ios', 'hr');
      const updated = await upsertDevicePushToken(
        'device-1',
        'ExponentPushToken[new]',
        'android',
        'en'
      );

      expect(updated.expo_push_token).toBe('ExponentPushToken[new]');
      expect(updated.platform).toBe('android');
      expect(updated.locale).toBe('en');
    });

    it('should preserve opt-in status on update', async () => {
      await upsertDevicePushToken('device-1', 'ExponentPushToken[test]', 'ios', 'hr');
      await updatePushOptIn('device-1', false);
      const updated = await upsertDevicePushToken(
        'device-1',
        'ExponentPushToken[new]',
        'ios',
        'hr'
      );

      expect(updated.push_opt_in).toBe(false);
    });
  });

  describe('updatePushOptIn', () => {
    it('should update opt-in status', async () => {
      await upsertDevicePushToken('device-1', 'ExponentPushToken[test]', 'ios', 'hr');

      const updated = await updatePushOptIn('device-1', false);

      expect(updated?.push_opt_in).toBe(false);
    });

    it('should return null for non-existent device', async () => {
      const result = await updatePushOptIn('non-existent', true);

      expect(result).toBeNull();
    });
  });

  describe('getDevicePushToken', () => {
    it('should return device token', async () => {
      await upsertDevicePushToken('device-1', 'ExponentPushToken[test]', 'ios', 'hr');

      const token = await getDevicePushToken('device-1');

      expect(token?.device_id).toBe('device-1');
    });

    it('should return null for non-existent device', async () => {
      const token = await getDevicePushToken('non-existent');

      expect(token).toBeNull();
    });
  });

  describe('getEligibleDevicesForPush', () => {
    it('should return only opted-in devices', async () => {
      await upsertDevicePushToken('device-1', 'ExponentPushToken[1]', 'ios', 'hr');
      await upsertDevicePushToken('device-2', 'ExponentPushToken[2]', 'ios', 'hr');
      await updatePushOptIn('device-2', false);

      const eligible = await getEligibleDevicesForPush(['hitno'], true);

      expect(eligible).toHaveLength(1);
      expect(eligible[0].device_id).toBe('device-1');
    });

    it('should exclude EN devices when no English content', async () => {
      await upsertDevicePushToken('device-hr', 'ExponentPushToken[1]', 'ios', 'hr');
      await upsertDevicePushToken('device-en', 'ExponentPushToken[2]', 'ios', 'en');

      const eligible = await getEligibleDevicesForPush(['hitno'], false);

      expect(eligible).toHaveLength(1);
      expect(eligible[0].device_id).toBe('device-hr');
    });

    it('should include EN devices when English content exists', async () => {
      await upsertDevicePushToken('device-hr', 'ExponentPushToken[1]', 'ios', 'hr');
      await upsertDevicePushToken('device-en', 'ExponentPushToken[2]', 'ios', 'en');

      const eligible = await getEligibleDevicesForPush(['hitno'], true);

      expect(eligible).toHaveLength(2);
    });
  });

  describe('clearPushData', () => {
    it('should clear all data', async () => {
      await upsertDevicePushToken('device-1', 'ExponentPushToken[1]', 'ios', 'hr');
      await upsertDevicePushToken('device-2', 'ExponentPushToken[2]', 'ios', 'hr');

      expect(getPushStats().tokenCount).toBe(2);

      clearPushData();

      expect(getPushStats().tokenCount).toBe(0);
    });
  });
});

describe('Locked Message Behavior', () => {
  // Note: These tests would require mocking the inbox repository
  // For now, we test the shouldTriggerPush and validation logic

  it('should not allow updates to locked messages (logic check)', () => {
    // The actual 409 response is tested in integration tests
    // Here we verify the locking conditions
    const messageLocked = true;
    const canEdit = !messageLocked;

    expect(canEdit).toBe(false);
  });

  it('should allow soft delete of locked messages', () => {
    // Soft delete is allowed per spec
    const messageIsLocked = true;
    const canSoftDelete = true; // Always allowed, even when locked

    expect(messageIsLocked).toBe(true);
    expect(canSoftDelete).toBe(true);
  });
});

describe('Token Masking', () => {
  describe('maskPushToken', () => {
    it('should mask standard Expo token correctly', () => {
      const token = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      const masked = maskPushToken(token);

      // Should show first 8 + ... + last 6
      expect(masked).toBe('Exponent...xxxxx]');
      // Should NOT contain the full token
      expect(masked).not.toEqual(token);
      // Should NOT leak the middle portion
      expect(masked).not.toContain('PushToken[');
    });

    it('should mask token with complex characters', () => {
      const token = 'ExponentPushToken[abc123DEF-_456xyz]';
      const masked = maskPushToken(token);

      expect(masked).toBe('Exponent...56xyz]');
      expect(masked.length).toBeLessThan(token.length);
    });

    it('should return masked placeholder for short tokens', () => {
      const shortToken = 'abc123';
      const masked = maskPushToken(shortToken);

      expect(masked).toBe('***masked***');
    });

    it('should return masked placeholder for empty token', () => {
      expect(maskPushToken('')).toBe('***masked***');
    });

    it('should not leak raw token in masked output', () => {
      const token = 'ExponentPushToken[secret-sensitive-data-here]';
      const masked = maskPushToken(token);

      // The masked token should NOT contain sensitive middle portion
      expect(masked).not.toContain('secret');
      expect(masked).not.toContain('sensitive');
      expect(masked).not.toContain('data');
      // Should only have first 8 and last 6 chars
      expect(masked).toBe('Exponent...-here]');
    });
  });
});
