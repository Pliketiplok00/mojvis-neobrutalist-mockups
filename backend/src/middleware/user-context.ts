/**
 * User Context Middleware
 *
 * Extracts and validates user context from request headers.
 * Used by public API routes that need user mode and municipality.
 *
 * Headers:
 * - X-Device-ID: anonymous device identifier
 * - X-User-Mode: 'visitor' | 'local'
 * - X-Municipality: 'vis' | 'komiza' (required for local users)
 *
 * Package 4 Stage 12: Local users MUST have municipality set.
 */

import type { FastifyRequest } from 'fastify';
import type { UserContext, UserMode, Municipality } from '../types/inbox.js';

/**
 * Validation result for user context
 */
export type UserContextResult =
  | { valid: true; context: UserContext }
  | { valid: false; error: string; code: string };

/**
 * Extract and validate user context from request headers.
 *
 * Rules:
 * - Visitors do not require municipality
 * - Local users MUST have a valid municipality ('vis' or 'komiza')
 *
 * @param request - Fastify request object
 * @returns Validation result with context or error
 */
export function extractUserContext(request: FastifyRequest): UserContextResult {
  const headers = request.headers;

  const deviceId = (headers['x-device-id'] as string) || 'anonymous';
  const userModeHeader = headers['x-user-mode'] as string | undefined;
  const municipalityHeader = headers['x-municipality'] as string | undefined;

  // Default to visitor if no mode specified
  const userMode: UserMode = userModeHeader === 'local' ? 'local' : 'visitor';

  // Parse municipality
  let municipality: Municipality = null;
  if (municipalityHeader === 'vis' || municipalityHeader === 'komiza') {
    municipality = municipalityHeader;
  }

  // Package 4 Stage 12: Local users MUST have municipality
  if (userMode === 'local' && municipality === null) {
    return {
      valid: false,
      error: 'Local users must select a municipality (Vis or Komiža).',
      code: 'MUNICIPALITY_REQUIRED',
    };
  }

  return {
    valid: true,
    context: { deviceId, userMode, municipality },
  };
}

/**
 * Legacy function for backward compatibility.
 * Extracts user context without validation (for routes that don't require strict validation).
 *
 * @deprecated Use extractUserContext() for new code
 */
export function getUserContextLegacy(request: FastifyRequest): UserContext {
  const headers = request.headers;

  const deviceId = (headers['x-device-id'] as string) || 'anonymous';
  const userMode = (headers['x-user-mode'] as UserMode) || 'visitor';
  const municipalityHeader = headers['x-municipality'] as string | undefined;

  let municipality: Municipality = null;
  if (userMode === 'local' && municipalityHeader) {
    if (municipalityHeader === 'vis' || municipalityHeader === 'komiza') {
      municipality = municipalityHeader;
    }
  }

  return { deviceId, userMode, municipality };
}
