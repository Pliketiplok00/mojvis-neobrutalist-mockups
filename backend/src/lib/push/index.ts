/**
 * Push Notification Interface
 *
 * Phase 7: Abstraction layer for push notification providers.
 * Currently implements Expo Push Notifications.
 * Designed to be swappable to other providers (FCM, APNs) if needed.
 */

import type { PushContent, PushSendResult, PushTarget } from '../../types/push.js';

/**
 * Push provider interface
 * Implement this interface to support different push providers
 */
export interface PushProvider {
  /**
   * Provider name for logging
   */
  readonly name: string;

  /**
   * Send push notifications to multiple devices
   * Must handle failures gracefully and never throw
   */
  sendPush(
    targets: PushTarget[],
    contentHr: PushContent,
    contentEn: PushContent | null
  ): Promise<PushSendResult>;

  /**
   * Validate a push token format
   */
  isValidToken(token: string): boolean;
}

/**
 * Push service singleton
 * Use this to send push notifications throughout the app
 */
export class PushService {
  private provider: PushProvider;

  constructor(provider: PushProvider) {
    this.provider = provider;
  }

  /**
   * Get the provider name
   */
  getProviderName(): string {
    return this.provider.name;
  }

  /**
   * Send push notifications to devices
   * Groups targets by locale and sends appropriate content
   */
  async sendPush(
    targets: PushTarget[],
    contentHr: PushContent,
    contentEn: PushContent | null
  ): Promise<PushSendResult> {
    if (targets.length === 0) {
      return {
        target_count: 0,
        success_count: 0,
        failure_count: 0,
        provider_response: { message: 'No targets' },
      };
    }

    // Filter targets by language availability
    // If English content is missing, exclude English-locale devices
    const eligibleTargets = targets.filter((target) => {
      if (target.locale === 'en' && contentEn === null) {
        return false; // No fallback - exclude device
      }
      return true;
    });

    if (eligibleTargets.length === 0) {
      return {
        target_count: 0,
        success_count: 0,
        failure_count: 0,
        provider_response: { message: 'No eligible targets after language filtering' },
      };
    }

    return this.provider.sendPush(eligibleTargets, contentHr, contentEn);
  }

  /**
   * Validate a push token
   */
  isValidToken(token: string): boolean {
    return this.provider.isValidToken(token);
  }
}

// Re-export types
export type { PushContent, PushSendResult, PushTarget };
