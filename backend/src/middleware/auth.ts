/**
 * Authentication Middleware
 *
 * Protects admin routes by validating session cookie.
 * Phase 1b: Cookie-session based authentication.
 *
 * SECURITY INVARIANTS:
 * - Cookie: httpOnly, SameSite=Lax (NOT Strict), Secure in production
 * - Domain: EMPTY for localhost (host-only cookie), ".mojvis.hr" for production
 * - Identity derived ONLY from validated session, NEVER from headers
 * - X-Admin-Role, X-Admin-Municipality, X-Admin-User headers are NOT trusted
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { validateSession, SessionData } from '../services/auth.js';
import { env } from '../config/env.js';

// ============================================================
// Types
// ============================================================

// Extend FastifyRequest to include admin session
declare module 'fastify' {
  interface FastifyRequest {
    adminSession?: SessionData;
  }
}

// ============================================================
// Cookie Helpers
// ============================================================

/**
 * Set session cookie on reply
 *
 * Cookie attributes:
 * - HttpOnly: true (prevents XSS access)
 * - SameSite: Lax (NOT Strict - for subdomain compatibility)
 * - Secure: true in production (HTTPS only)
 * - Domain: EMPTY for localhost (host-only), ".mojvis.hr" for production
 * - Path: /
 * - MaxAge: based on ADMIN_SESSION_TTL_HOURS
 */
export function setSessionCookie(reply: FastifyReply, sessionToken: string): void {
  const maxAgeSeconds = env.ADMIN_SESSION_TTL_HOURS * 60 * 60;

  // Build cookie parts
  const parts: string[] = [
    `${env.ADMIN_COOKIE_NAME}=${sessionToken}`,
    'HttpOnly',
    'SameSite=Lax', // NOT Strict - Lax is correct for cross-subdomain
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
  ];

  // Secure flag: only in production (HTTPS)
  if (env.ADMIN_COOKIE_SECURE) {
    parts.push('Secure');
  }

  // Domain: ONLY set if configured (empty = host-only cookie for localhost)
  // Do NOT set Domain=localhost - leave it empty for host-only behavior
  if (env.ADMIN_COOKIE_DOMAIN) {
    parts.push(`Domain=${env.ADMIN_COOKIE_DOMAIN}`);
  }

  reply.header('Set-Cookie', parts.join('; '));
}

/**
 * Clear session cookie on reply
 */
export function clearSessionCookie(reply: FastifyReply): void {
  const parts: string[] = [
    `${env.ADMIN_COOKIE_NAME}=`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0', // Expire immediately
  ];

  // Match domain setting from setSessionCookie
  if (env.ADMIN_COOKIE_DOMAIN) {
    parts.push(`Domain=${env.ADMIN_COOKIE_DOMAIN}`);
  }

  reply.header('Set-Cookie', parts.join('; '));
}

/**
 * Extract session token from cookie header
 */
function getSessionToken(request: FastifyRequest): string | null {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  // Parse cookie header to find our session cookie
  const cookieName = env.ADMIN_COOKIE_NAME;
  const cookies = cookieHeader.split(';').map((c) => c.trim());

  for (const cookie of cookies) {
    if (cookie.startsWith(`${cookieName}=`)) {
      return cookie.slice(cookieName.length + 1);
    }
  }

  return null;
}

// ============================================================
// Middleware
// ============================================================

/**
 * Require admin authentication
 *
 * Validates session cookie and attaches admin session to request.
 * Returns 401 if not authenticated or session invalid/expired.
 *
 * SECURITY: Identity is derived ONLY from validated session.
 * X-Admin-* headers are completely ignored.
 */
export async function requireAdminAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const sessionToken = getSessionToken(request);

  if (!sessionToken) {
    return reply.status(401).send({
      error: 'Authentication required',
      code: 'UNAUTHENTICATED',
    });
  }

  const session = await validateSession(sessionToken);

  if (!session) {
    // Clear invalid/expired cookie
    clearSessionCookie(reply);
    return reply.status(401).send({
      error: 'Session expired or invalid',
      code: 'SESSION_INVALID',
    });
  }

  // Attach session to request for use in route handlers
  request.adminSession = session;
}

/**
 * Check if request path should skip auth
 * Only /admin/auth/* endpoints are exempt
 */
function shouldSkipAuth(url: string): boolean {
  // Auth endpoints don't require authentication
  if (url.startsWith('/admin/auth/')) {
    return true;
  }

  return false;
}

/**
 * Admin auth hook for Fastify
 *
 * Register this as a preHandler hook on admin routes.
 * Skips auth for /admin/auth/* endpoints.
 */
export async function adminAuthHook(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Only apply to /admin/* routes
  if (!request.url.startsWith('/admin/')) {
    return;
  }

  // Skip auth for /admin/auth/* endpoints
  if (shouldSkipAuth(request.url)) {
    return;
  }

  // Require authentication for all other admin routes
  await requireAdminAuth(request, reply);
}

// ============================================================
// Helper for getting admin context in routes
// ============================================================

/**
 * Get admin session from request
 *
 * USAGE: Only call this in routes that are protected by adminAuthHook.
 * The middleware guarantees adminSession is set before the route handler runs.
 *
 * If called without middleware protection, throws Error (programmer bug).
 * This is NOT a user-facing error - the middleware returns 401 cleanly.
 * This throw catches misconfigured routes during development.
 */
export function getAdminSession(request: FastifyRequest): SessionData {
  if (!request.adminSession) {
    // This is a programmer error, not a user error.
    // If this throws, the route is missing auth middleware.
    throw new Error(
      'getAdminSession called without adminSession - ensure route is protected by adminAuthHook'
    );
  }
  return request.adminSession;
}

/**
 * Get admin municipality from session
 *
 * Convenience helper for routes that need to filter by municipality.
 * NEVER reads from X-Admin-Municipality header.
 */
export function getAdminMunicipality(request: FastifyRequest): 'vis' | 'komiza' {
  return getAdminSession(request).municipality;
}

/**
 * Get admin ID from session
 *
 * Convenience helper for audit logging.
 * NEVER reads from X-Admin-User or X-Admin-Id headers.
 */
export function getAdminId(request: FastifyRequest): string {
  return getAdminSession(request).adminId;
}

/**
 * Get admin notice municipality scope from session
 *
 * Phase 3: Returns which municipal notices this admin can create/edit.
 * - null: cannot edit any municipal notices ('vis' or 'komiza' tagged)
 * - 'vis': can edit 'vis' notices only
 * - 'komiza': can edit 'komiza' notices only
 *
 * Non-municipal inbox messages are always editable by all admins.
 */
export function getAdminNoticeMunicipalityScope(request: FastifyRequest): 'vis' | 'komiza' | null {
  return getAdminSession(request).noticeMunicipalityScope;
}

// ============================================================
// Municipal Notice Authorization Guard (Phase 3)
// ============================================================

/**
 * Result of municipal notice authorization check
 */
export interface MunicipalNoticeAuthResult {
  allowed: boolean;
  reason?: string;
  code?: string;
}

/**
 * Check if admin can create/edit a municipal notice with given tags
 *
 * Phase 3 rules:
 * - If admin is breakglass, ALWAYS ALLOW (true breakglass bypasses all restrictions)
 * - If message is NOT a municipal notice (no 'vis' or 'komiza' tag), ALLOW
 * - If message IS a municipal notice:
 *   - If admin has noticeMunicipalityScope = null, DENY
 *   - If admin has noticeMunicipalityScope = 'vis' and notice is 'komiza', DENY
 *   - If admin has noticeMunicipalityScope = 'komiza' and notice is 'vis', DENY
 *   - Otherwise, ALLOW
 *
 * @param adminScope - Admin's notice_municipality_scope from session
 * @param messageTags - Tags of the inbox message being created/edited
 * @param isBreakglass - Whether admin is a breakglass account (bypasses restrictions)
 * @returns Authorization result with allowed flag and optional reason
 */
export function checkMunicipalNoticeAuth(
  adminScope: 'vis' | 'komiza' | null,
  messageTags: string[],
  isBreakglass: boolean = false
): MunicipalNoticeAuthResult {
  // True breakglass bypasses all municipal notice restrictions
  if (isBreakglass) {
    return { allowed: true };
  }

  // Determine if message is a municipal notice
  const hasVis = messageTags.includes('vis');
  const hasKomiza = messageTags.includes('komiza');
  const isMunicipalNotice = hasVis || hasKomiza;

  // Non-municipal messages are always editable by all admins
  if (!isMunicipalNotice) {
    return { allowed: true };
  }

  // Municipal notice: check admin scope
  if (adminScope === null) {
    return {
      allowed: false,
      reason: 'Nemate ovlasti za uređivanje općinskih obavijesti.',
      code: 'NO_MUNICIPAL_NOTICE_SCOPE',
    };
  }

  // Check specific municipality match
  const noticeMunicipality = hasVis ? 'vis' : 'komiza';

  if (adminScope !== noticeMunicipality) {
    const municipalityName = noticeMunicipality === 'vis' ? 'Vis' : 'Komiža';
    return {
      allowed: false,
      reason: `Nemate ovlasti za uređivanje obavijesti za općinu ${municipalityName}.`,
      code: 'MUNICIPALITY_SCOPE_MISMATCH',
    };
  }

  return { allowed: true };
}

/**
 * Check municipal notice authorization from request
 *
 * Convenience wrapper that extracts admin scope and breakglass status from request.
 */
export function checkMunicipalNoticeAuthFromRequest(
  request: FastifyRequest,
  messageTags: string[]
): MunicipalNoticeAuthResult {
  const session = getAdminSession(request);
  return checkMunicipalNoticeAuth(
    session.noticeMunicipalityScope,
    messageTags,
    session.isBreakglass
  );
}
