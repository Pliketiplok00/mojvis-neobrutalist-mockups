/**
 * Admin Auth Test Helper
 *
 * Provides utilities for testing authenticated admin routes.
 * Uses REAL cookie-session auth flow - no header trust bypass.
 *
 * Usage:
 *   const { cookie, adminId, municipality } = await loginTestAdmin(fastify);
 *   const response = await fastify.inject({
 *     method: 'GET',
 *     url: '/admin/inbox',
 *     headers: { cookie },
 *   });
 */

import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import { query } from '../../lib/database.js';
import { env } from '../../config/env.js';

const BCRYPT_COST = 12;

export interface TestAdminCredentials {
  username: string;
  password: string;
  municipality: 'vis' | 'komiza';
}

export interface TestAdminLoginResult {
  cookie: string;
  adminId: string;
  username: string;
  municipality: 'vis' | 'komiza';
}

/**
 * Default test admin credentials
 */
export const DEFAULT_TEST_ADMIN: TestAdminCredentials = {
  username: 'testadmin',
  password: 'testpassword123',
  municipality: 'vis',
};

/**
 * Check if admin_users table exists
 *
 * Returns false if migration hasn't been run yet.
 */
export async function adminTablesExist(): Promise<boolean> {
  try {
    const result = await query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'admin_users'
      ) as exists`
    );
    return result.rows[0]?.exists === true;
  } catch {
    return false;
  }
}

/**
 * Ensure test admin user exists in DB
 *
 * Creates or updates the test admin with hashed password.
 * Call this in beforeAll/beforeEach to ensure admin exists.
 */
export async function ensureTestAdminExists(
  credentials: TestAdminCredentials = DEFAULT_TEST_ADMIN
): Promise<string> {
  const passwordHash = await bcrypt.hash(credentials.password, BCRYPT_COST);

  const result = await query<{ id: string }>(
    `INSERT INTO admin_users (username, password_hash, municipality, is_breakglass)
     VALUES ($1, $2, $3, false)
     ON CONFLICT (username) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       municipality = EXCLUDED.municipality,
       updated_at = NOW()
     RETURNING id`,
    [credentials.username, passwordHash, credentials.municipality]
  );

  return result.rows[0].id;
}

/**
 * Clean up test admin sessions
 *
 * Call in afterEach/afterAll to clean up sessions.
 */
export async function cleanupTestAdminSessions(username: string = DEFAULT_TEST_ADMIN.username): Promise<void> {
  await query(
    `DELETE FROM admin_sessions
     WHERE admin_user_id IN (
       SELECT id FROM admin_users WHERE username = $1
     )`,
    [username]
  );
}

/**
 * Clean up test admin user and sessions
 *
 * Call in afterAll to fully clean up.
 */
export async function cleanupTestAdmin(username: string = DEFAULT_TEST_ADMIN.username): Promise<void> {
  await cleanupTestAdminSessions(username);
  await query(`DELETE FROM admin_users WHERE username = $1`, [username]);
}

/**
 * Extract session cookie from Set-Cookie header
 *
 * Matches env.ADMIN_COOKIE_NAME (default: mojvis_admin_session).
 */
function extractSessionCookie(setCookieHeader: string | string[] | undefined): string {
  if (!setCookieHeader) {
    throw new Error('Login response missing Set-Cookie header');
  }

  const cookieName = env.ADMIN_COOKIE_NAME || 'mojvis_admin_session';
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

  // Find the cookie that matches our session cookie name
  for (const cookieStr of cookies) {
    if (cookieStr.startsWith(`${cookieName}=`)) {
      // Extract just the name=value part (before any attributes like HttpOnly, Path, etc.)
      return cookieStr.split(';')[0];
    }
  }

  // Fallback: if no match found, use first cookie (shouldn't happen)
  throw new Error(
    `Session cookie '${cookieName}' not found in Set-Cookie header: ${JSON.stringify(setCookieHeader)}`
  );
}

/**
 * Login test admin and return cookie
 *
 * Uses the real POST /admin/auth/login endpoint.
 * Extracts Set-Cookie header and returns it for subsequent requests.
 */
export async function loginTestAdmin(
  fastify: FastifyInstance,
  credentials: TestAdminCredentials = DEFAULT_TEST_ADMIN
): Promise<TestAdminLoginResult> {
  // Check if admin tables exist (migration required)
  const tablesExist = await adminTablesExist();
  if (!tablesExist) {
    throw new Error(
      'admin_users table missing – run DB migrations in test setup. ' +
      'Execute: psql -f src/db/migrations/011_admin_auth.sql'
    );
  }

  // Ensure admin exists first
  await ensureTestAdminExists(credentials);

  // Login via real endpoint
  const response = await fastify.inject({
    method: 'POST',
    url: '/admin/auth/login',
    payload: {
      username: credentials.username,
      password: credentials.password,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(
      `Test admin login failed: ${response.statusCode} - ${response.body}`
    );
  }

  // Extract session cookie
  const cookie = extractSessionCookie(response.headers['set-cookie']);

  // Parse response body for admin info
  const body = JSON.parse(response.body);

  return {
    cookie,
    adminId: body.admin.id,
    username: body.admin.username,
    municipality: body.admin.municipality,
  };
}
