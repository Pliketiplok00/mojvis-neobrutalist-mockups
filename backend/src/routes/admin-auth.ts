/**
 * Admin Authentication Routes
 *
 * Phase 1b: Cookie-session based authentication.
 *
 * Endpoints:
 * - POST /admin/auth/login  - Authenticate and create session
 * - POST /admin/auth/logout - Destroy session
 * - GET  /admin/auth/me     - Get current authenticated admin info
 *
 * NOTE: /admin/auth/* endpoints are exempt from auth middleware.
 * /admin/auth/me requires a valid session but is checked inline.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateAdmin, logout, validateSession } from '../services/auth.js';
import {
  setSessionCookie,
  clearSessionCookie,
} from '../middleware/auth.js';
import { env } from '../config/env.js';

// ============================================================
// Types
// ============================================================

interface LoginBody {
  username: string;
  password: string;
}

// ============================================================
// Routes
// ============================================================

// eslint-disable-next-line @typescript-eslint/require-await -- Fastify plugin contract requires async
export async function adminAuthRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /admin/auth/login
   *
   * Authenticate admin and set session cookie.
   *
   * Request: { username: string, password: string }
   * Response 200: { ok: true, admin: { id, username, municipality } }
   * Response 400: Missing fields
   * Response 401: Invalid credentials
   */
  fastify.post<{ Body: LoginBody }>(
    '/admin/auth/login',
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      const { username, password } = request.body || {};

      // Validate required fields
      if (!username || !password) {
        return reply.status(400).send({
          ok: false,
          error: 'Username and password required',
          code: 'MISSING_CREDENTIALS',
        });
      }

      // Authenticate
      const result = await authenticateAdmin(username, password);

      if (!result.success) {
        return reply.status(401).send({
          ok: false,
          error: result.error || 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Set session cookie
      setSessionCookie(reply, result.sessionToken!);

      // Log for audit (auth_method included in service logging)
      console.info('[Auth Route] Login successful', {
        admin_id: result.admin!.id,
        username: result.admin!.username,
        municipality: result.admin!.municipality,
        auth_method: result.authMethod,
        timestamp: new Date().toISOString(),
      });

      return reply.status(200).send({
        ok: true,
        admin: result.admin,
      });
    }
  );

  /**
   * POST /admin/auth/logout
   *
   * Destroy session and clear cookie.
   *
   * Response 200: { ok: true }
   */
  fastify.post(
    '/admin/auth/logout',
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Extract session token from cookie
      const cookieHeader = request.headers.cookie;
      let sessionToken: string | null = null;

      if (cookieHeader) {
        const cookieName = env.ADMIN_COOKIE_NAME;
        const cookies = cookieHeader.split(';').map((c) => c.trim());
        for (const cookie of cookies) {
          if (cookie.startsWith(`${cookieName}=`)) {
            sessionToken = cookie.slice(cookieName.length + 1);
            break;
          }
        }
      }

      // Revoke session if token exists
      if (sessionToken) {
        await logout(sessionToken);
      }

      // Always clear cookie
      clearSessionCookie(reply);

      return reply.status(200).send({
        ok: true,
      });
    }
  );

  /**
   * GET /admin/auth/me
   *
   * Get current authenticated admin info.
   * Requires valid session (checked inline since this is in /admin/auth/*).
   *
   * Response 200: { ok: true, admin: { id, username, municipality } }
   * Response 401: Not authenticated
   */
  fastify.get(
    '/admin/auth/me',
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Extract session token from cookie
      const cookieHeader = request.headers.cookie;
      let sessionToken: string | null = null;

      if (cookieHeader) {
        const cookieName = env.ADMIN_COOKIE_NAME;
        const cookies = cookieHeader.split(';').map((c) => c.trim());
        for (const cookie of cookies) {
          if (cookie.startsWith(`${cookieName}=`)) {
            sessionToken = cookie.slice(cookieName.length + 1);
            break;
          }
        }
      }

      if (!sessionToken) {
        return reply.status(401).send({
          ok: false,
          error: 'Not authenticated',
          code: 'UNAUTHENTICATED',
        });
      }

      // Validate session
      const session = await validateSession(sessionToken);

      if (!session) {
        clearSessionCookie(reply);
        return reply.status(401).send({
          ok: false,
          error: 'Session expired or invalid',
          code: 'SESSION_INVALID',
        });
      }

      return reply.status(200).send({
        ok: true,
        admin: {
          id: session.adminId,
          username: session.username,
          municipality: session.municipality,
          notice_municipality_scope: session.noticeMunicipalityScope,
          is_breakglass: session.isBreakglass,
        },
      });
    }
  );
}
