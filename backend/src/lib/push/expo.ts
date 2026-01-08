/**
 * Expo Push Notifications Adapter
 *
 * Phase 7: Implementation of push provider for Expo.
 * Uses Expo's push notification service.
 *
 * Expo Push API: https://docs.expo.dev/push-notifications/sending-notifications/
 */

import type { PushProvider, PushContent, PushSendResult, PushTarget } from './index.js';
import { isValidExpoPushToken } from '../../types/push.js';

/**
 * Expo push message format
 */
interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

/**
 * Expo push ticket response
 */
interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

/**
 * Expo push API response
 */
interface ExpoPushResponse {
  data: ExpoPushTicket[];
}

/**
 * Expo Push Notifications adapter
 */
export class ExpoPushProvider implements PushProvider {
  readonly name = 'expo';

  private readonly apiUrl = 'https://exp.host/--/api/v2/push/send';
  private readonly batchSize = 100; // Expo recommends max 100 per request

  /**
   * Send push notifications via Expo
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

    // Build messages for each target based on locale
    const messages: ExpoPushMessage[] = targets.map((target) => {
      const content = target.locale === 'en' && contentEn ? contentEn : contentHr;
      return {
        to: target.expo_push_token,
        title: content.title,
        body: content.body,
        data: content.data,
        sound: 'default',
        priority: 'high', // Emergency messages should be high priority
        channelId: 'emergency', // Android notification channel
      };
    });

    // Send in batches
    const allTickets: ExpoPushTicket[] = [];
    const allResponses: unknown[] = [];

    for (let i = 0; i < messages.length; i += this.batchSize) {
      const batch = messages.slice(i, i + this.batchSize);
      try {
        const response = await this.sendBatch(batch);
        allTickets.push(...response.data);
        allResponses.push(response);
      } catch (error) {
        console.error('[ExpoPush] Batch send error:', error);
        // Create error tickets for failed batch
        const errorTickets: ExpoPushTicket[] = batch.map(() => ({
          status: 'error' as const,
          message: error instanceof Error ? error.message : 'Unknown error',
        }));
        allTickets.push(...errorTickets);
        allResponses.push({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    // Count successes and failures
    const successCount = allTickets.filter((t) => t.status === 'ok').length;
    const failureCount = allTickets.filter((t) => t.status === 'error').length;

    return {
      target_count: targets.length,
      success_count: successCount,
      failure_count: failureCount,
      provider_response: this.summarizeResponse(allTickets, allResponses),
    };
  }

  /**
   * Validate Expo push token format
   */
  isValidToken(token: string): boolean {
    return isValidExpoPushToken(token);
  }

  /**
   * Send a batch of messages to Expo API
   */
  private async sendBatch(messages: ExpoPushMessage[]): Promise<ExpoPushResponse> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Expo API error: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<ExpoPushResponse>;
  }

  /**
   * Summarize response for logging (truncate if too large)
   */
  private summarizeResponse(
    tickets: ExpoPushTicket[],
    rawResponses: unknown[]
  ): Record<string, unknown> {
    const errors = tickets
      .filter((t) => t.status === 'error')
      .map((t) => t.message || t.details?.error || 'Unknown error')
      .slice(0, 10); // Limit to first 10 errors

    return {
      total_tickets: tickets.length,
      success_tickets: tickets.filter((t) => t.status === 'ok').length,
      error_tickets: tickets.filter((t) => t.status === 'error').length,
      sample_errors: errors,
      batch_count: rawResponses.length,
    };
  }
}

/**
 * Create a mock Expo push provider for testing
 */
export class MockExpoPushProvider implements PushProvider {
  readonly name = 'expo-mock';
  public sentMessages: Array<{
    targets: PushTarget[];
    contentHr: PushContent;
    contentEn: PushContent | null;
  }> = [];

  async sendPush(
    targets: PushTarget[],
    contentHr: PushContent,
    contentEn: PushContent | null
  ): Promise<PushSendResult> {
    this.sentMessages.push({ targets, contentHr, contentEn });

    return {
      target_count: targets.length,
      success_count: targets.length,
      failure_count: 0,
      provider_response: { mock: true },
    };
  }

  isValidToken(token: string): boolean {
    return isValidExpoPushToken(token);
  }

  /**
   * Reset mock state for testing
   */
  reset(): void {
    this.sentMessages = [];
  }
}

/**
 * Default push provider instance
 * Use MockExpoPushProvider in tests by replacing this
 */
export const defaultPushProvider = new ExpoPushProvider();
