/**
 * Device Routes
 *
 * Phase 7: Public endpoints for device push token management.
 *
 * Routes:
 * - POST /device/push-token - Register/update push token
 * - PATCH /device/push-opt-in - Update push opt-in preference
 * - GET /device/push-status - Get current push registration status
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  upsertDevicePushToken,
  updatePushOptIn,
  getDevicePushToken,
  getLatestPushLog,
  maskPushToken,
} from '../repositories/push.js';
import {
  isValidExpoPushToken,
  isValidPlatform,
  isValidLocale,
  type DevicePlatform,
  type DeviceLocale,
} from '../types/push.js';

/**
 * Request body for push token registration
 */
interface PushTokenBody {
  expoPushToken: string;
  platform: string;
}

/**
 * Request body for opt-in update
 */
interface OptInBody {
  optIn: boolean;
}

/**
 * Extract device ID from header
 */
function getDeviceId(request: FastifyRequest): string | null {
  return request.headers['x-device-id'] as string | null;
}

/**
 * Extract locale from Accept-Language header
 * Defaults to 'hr' if not specified or invalid
 */
function getLocaleFromHeader(request: FastifyRequest): DeviceLocale {
  const acceptLanguage = request.headers['accept-language'];
  if (typeof acceptLanguage === 'string') {
    const lang = acceptLanguage.toLowerCase().split(',')[0].split('-')[0];
    if (isValidLocale(lang)) {
      return lang;
    }
  }
  return 'hr'; // Default to Croatian
}

export async function deviceRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /device/push-token
   * Register or update device push token
   *
   * Headers:
   * - X-Device-ID: string (required)
   * - Accept-Language: string (for locale detection)
   *
   * Body:
   * - expoPushToken: string (required, Expo format)
   * - platform: 'ios' | 'android' (required)
   */
  fastify.post<{ Body: PushTokenBody }>(
    '/device/push-token',
    async (request: FastifyRequest<{ Body: PushTokenBody }>, reply: FastifyReply) => {
      const deviceId = getDeviceId(request);
      if (!deviceId) {
        return reply.status(400).send({
          error: 'Missing X-Device-ID header',
        });
      }

      const { expoPushToken, platform } = request.body;

      // Validate token format
      if (!expoPushToken || !isValidExpoPushToken(expoPushToken)) {
        return reply.status(400).send({
          error: 'Invalid Expo push token format. Expected ExponentPushToken[xxx]',
        });
      }

      // Validate platform
      if (!platform || !isValidPlatform(platform)) {
        return reply.status(400).send({
          error: 'Invalid platform. Must be "ios" or "android"',
        });
      }

      const locale = getLocaleFromHeader(request);

      console.info('[Device] POST /device/push-token', {
        device_id: deviceId,
        platform,
        locale,
        token_prefix: expoPushToken.slice(0, 30) + '...',
      });

      try {
        const token = await upsertDevicePushToken(
          deviceId,
          expoPushToken,
          platform as DevicePlatform,
          locale
        );

        return reply.status(200).send({
          device_id: token.device_id,
          platform: token.platform,
          locale: token.locale,
          push_opt_in: token.push_opt_in,
          registered_at: token.created_at.toISOString(),
        });
      } catch (error) {
        console.error('[Device] Error registering push token:', error);
        return reply.status(500).send({
          error: 'Failed to register push token',
        });
      }
    }
  );

  /**
   * PATCH /device/push-opt-in
   * Update push notification opt-in preference
   *
   * Headers:
   * - X-Device-ID: string (required)
   *
   * Body:
   * - optIn: boolean (required)
   */
  fastify.patch<{ Body: OptInBody }>(
    '/device/push-opt-in',
    async (request: FastifyRequest<{ Body: OptInBody }>, reply: FastifyReply) => {
      const deviceId = getDeviceId(request);
      if (!deviceId) {
        return reply.status(400).send({
          error: 'Missing X-Device-ID header',
        });
      }

      const { optIn } = request.body;
      if (typeof optIn !== 'boolean') {
        return reply.status(400).send({
          error: 'Invalid optIn value. Must be boolean',
        });
      }

      console.info('[Device] PATCH /device/push-opt-in', {
        device_id: deviceId,
        opt_in: optIn,
      });

      try {
        const token = await updatePushOptIn(deviceId, optIn);

        if (!token) {
          return reply.status(404).send({
            error: 'Device not registered. Register push token first.',
          });
        }

        return reply.status(200).send({
          device_id: token.device_id,
          push_opt_in: token.push_opt_in,
          updated_at: token.updated_at.toISOString(),
        });
      } catch (error) {
        console.error('[Device] Error updating opt-in:', error);
        return reply.status(500).send({
          error: 'Failed to update opt-in preference',
        });
      }
    }
  );

  /**
   * GET /device/push-status
   * Get current push registration status for device
   *
   * Headers:
   * - X-Device-ID: string (required)
   */
  fastify.get(
    '/device/push-status',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const deviceId = getDeviceId(request);
      if (!deviceId) {
        return reply.status(400).send({
          error: 'Missing X-Device-ID header',
        });
      }

      console.info('[Device] GET /device/push-status', { device_id: deviceId });

      try {
        const token = await getDevicePushToken(deviceId);

        if (!token) {
          return reply.status(200).send({
            registered: false,
            push_opt_in: null,
          });
        }

        return reply.status(200).send({
          registered: true,
          platform: token.platform,
          locale: token.locale,
          push_opt_in: token.push_opt_in,
          registered_at: token.created_at.toISOString(),
        });
      } catch (error) {
        console.error('[Device] Error getting push status:', error);
        return reply.status(500).send({
          error: 'Failed to get push status',
        });
      }
    }
  );

  /**
   * GET /device/push-debug
   * Get detailed debug info for device push registration (READ ONLY)
   * Token is masked for security.
   *
   * Headers:
   * - X-Device-ID: string (required)
   *
   * Response includes:
   * - Device registration info (masked token)
   * - Last global push info (if any push has been sent)
   */
  fastify.get(
    '/device/push-debug',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const deviceId = getDeviceId(request);
      if (!deviceId) {
        return reply.status(400).send({
          error: 'Missing X-Device-ID header',
        });
      }

      console.info('[Device] GET /device/push-debug', { device_id: deviceId });

      try {
        const token = await getDevicePushToken(deviceId);
        const latestPushLog = await getLatestPushLog();

        if (!token) {
          return reply.status(200).send({
            registered: false,
            device_id: deviceId,
            message: 'Device not registered for push notifications',
            last_global_push: latestPushLog ? {
              inbox_message_id: latestPushLog.inbox_message_id,
              sent_at: latestPushLog.sent_at.toISOString(),
              target_count: latestPushLog.target_count,
              success_count: latestPushLog.success_count,
              failure_count: latestPushLog.failure_count,
              provider: latestPushLog.provider,
            } : null,
          });
        }

        return reply.status(200).send({
          registered: true,
          device_id: token.device_id,
          platform: token.platform,
          locale: token.locale,
          push_opt_in: token.push_opt_in,
          expo_push_token_masked: maskPushToken(token.expo_push_token),
          registered_at: token.created_at.toISOString(),
          updated_at: token.updated_at.toISOString(),
          // Global last push (we don't track per-device push history in MVP)
          last_global_push: latestPushLog ? {
            inbox_message_id: latestPushLog.inbox_message_id,
            sent_at: latestPushLog.sent_at.toISOString(),
            target_count: latestPushLog.target_count,
            success_count: latestPushLog.success_count,
            failure_count: latestPushLog.failure_count,
            provider: latestPushLog.provider,
          } : null,
        });
      } catch (error) {
        console.error('[Device] Error getting push debug:', error);
        return reply.status(500).send({
          error: 'Failed to get push debug info',
        });
      }
    }
  );
}

export default deviceRoutes;
