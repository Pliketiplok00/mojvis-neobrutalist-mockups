/**
 * Admin Repository
 *
 * Database access layer for admin users and sessions.
 * Phase 1b: Authentication implementation.
 *
 * SECURITY NOTE: AdminUser includes password_hash for internal use only.
 * Auth routes MUST strip password_hash before returning admin data to clients.
 * Use the auth service's sanitized response types, never return raw AdminUser.
 */

import crypto from 'crypto';
import { query } from '../lib/database.js';

// ============================================================
// Types
// ============================================================

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string; // INTERNAL ONLY - never expose in API responses
  municipality: 'vis' | 'komiza';
  is_breakglass: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AdminSession {
  id: string;
  admin_user_id: string;
  session_token_hash: string;
  created_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
  last_seen_at: Date | null;
}

export interface AdminSessionWithUser extends AdminSession {
  admin: AdminUser;
}

interface AdminUserRow {
  id: string;
  username: string;
  password_hash: string;
  municipality: 'vis' | 'komiza';
  is_breakglass: boolean;
  created_at: Date;
  updated_at: Date;
}

interface AdminSessionRow {
  id: string;
  admin_user_id: string;
  session_token_hash: string;
  created_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
  last_seen_at: Date | null;
}

interface AdminSessionWithUserRow extends AdminSessionRow {
  admin_username: string;
  admin_password_hash: string;
  admin_municipality: 'vis' | 'komiza';
  admin_is_breakglass: boolean;
  admin_created_at: Date;
  admin_updated_at: Date;
}

// ============================================================
// Helpers
// ============================================================

/**
 * Hash a session token using SHA-256
 * The raw token is sent to client, only the hash is stored in DB
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function rowToAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    username: row.username,
    password_hash: row.password_hash,
    municipality: row.municipality,
    is_breakglass: row.is_breakglass,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToAdminSession(row: AdminSessionRow): AdminSession {
  return {
    id: row.id,
    admin_user_id: row.admin_user_id,
    session_token_hash: row.session_token_hash,
    created_at: row.created_at,
    expires_at: row.expires_at,
    revoked_at: row.revoked_at,
    last_seen_at: row.last_seen_at,
  };
}

function rowToAdminSessionWithUser(row: AdminSessionWithUserRow): AdminSessionWithUser {
  return {
    id: row.id,
    admin_user_id: row.admin_user_id,
    session_token_hash: row.session_token_hash,
    created_at: row.created_at,
    expires_at: row.expires_at,
    revoked_at: row.revoked_at,
    last_seen_at: row.last_seen_at,
    admin: {
      id: row.admin_user_id,
      username: row.admin_username,
      password_hash: row.admin_password_hash,
      municipality: row.admin_municipality,
      is_breakglass: row.admin_is_breakglass,
      created_at: row.admin_created_at,
      updated_at: row.admin_updated_at,
    },
  };
}

// ============================================================
// Admin User Operations
// ============================================================

/**
 * Find admin by username
 */
export async function findAdminByUsername(username: string): Promise<AdminUser | null> {
  const result = await query<AdminUserRow>(
    `SELECT id, username, password_hash, municipality, is_breakglass, created_at, updated_at
     FROM admin_users
     WHERE username = $1`,
    [username]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToAdminUser(result.rows[0]);
}

/**
 * Find admin by ID
 */
export async function findAdminById(id: string): Promise<AdminUser | null> {
  const result = await query<AdminUserRow>(
    `SELECT id, username, password_hash, municipality, is_breakglass, created_at, updated_at
     FROM admin_users
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToAdminUser(result.rows[0]);
}

/**
 * Upsert break-glass admin
 * Creates or updates the break-glass admin user in the database
 */
export async function upsertBreakglassAdmin(data: {
  username: string;
  passwordHash: string;
  municipality: 'vis' | 'komiza';
}): Promise<AdminUser> {
  const result = await query<AdminUserRow>(
    `INSERT INTO admin_users (username, password_hash, municipality, is_breakglass)
     VALUES ($1, $2, $3, true)
     ON CONFLICT (username) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       municipality = EXCLUDED.municipality,
       is_breakglass = true,
       updated_at = NOW()
     RETURNING id, username, password_hash, municipality, is_breakglass, created_at, updated_at`,
    [data.username, data.passwordHash, data.municipality]
  );

  return rowToAdminUser(result.rows[0]);
}

// ============================================================
// Session Operations
// ============================================================

/**
 * Create a new session
 * @param rawToken - The raw session token (will be hashed before storage)
 */
export async function createSession(data: {
  adminUserId: string;
  rawToken: string;
  expiresAt: Date;
}): Promise<AdminSession> {
  const tokenHash = hashSessionToken(data.rawToken);

  const result = await query<AdminSessionRow>(
    `INSERT INTO admin_sessions (admin_user_id, session_token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, admin_user_id, session_token_hash, created_at, expires_at, revoked_at, last_seen_at`,
    [data.adminUserId, tokenHash, data.expiresAt]
  );

  return rowToAdminSession(result.rows[0]);
}

/**
 * Find session by raw token (hashes the token internally)
 * Returns session with admin user data if valid (not revoked, not expired)
 */
export async function findSessionByToken(rawToken: string): Promise<AdminSessionWithUser | null> {
  const tokenHash = hashSessionToken(rawToken);

  const result = await query<AdminSessionWithUserRow>(
    `SELECT
       s.id, s.admin_user_id, s.session_token_hash, s.created_at, s.expires_at,
       s.revoked_at, s.last_seen_at,
       u.username as admin_username, u.password_hash as admin_password_hash,
       u.municipality as admin_municipality, u.is_breakglass as admin_is_breakglass,
       u.created_at as admin_created_at, u.updated_at as admin_updated_at
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.session_token_hash = $1
       AND s.revoked_at IS NULL
       AND s.expires_at > NOW()`,
    [tokenHash]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToAdminSessionWithUser(result.rows[0]);
}

/**
 * Revoke a session (logout)
 */
export async function revokeSession(rawToken: string): Promise<boolean> {
  const tokenHash = hashSessionToken(rawToken);

  const result = await query(
    `UPDATE admin_sessions
     SET revoked_at = NOW()
     WHERE session_token_hash = $1
       AND revoked_at IS NULL`,
    [tokenHash]
  );

  return (result.rowCount ?? 0) > 0;
}

/**
 * Update last_seen_at for a session (throttled to prevent DB hammering)
 * Only updates if last_seen_at is NULL or older than 5 minutes
 */
export async function updateSessionLastSeen(rawToken: string): Promise<void> {
  const tokenHash = hashSessionToken(rawToken);

  await query(
    `UPDATE admin_sessions
     SET last_seen_at = NOW()
     WHERE session_token_hash = $1
       AND (last_seen_at IS NULL OR last_seen_at < NOW() - INTERVAL '5 minutes')`,
    [tokenHash]
  );
}

/**
 * Delete expired sessions (cleanup)
 */
export async function deleteExpiredSessions(): Promise<number> {
  const result = await query(
    `DELETE FROM admin_sessions
     WHERE expires_at < NOW()
       OR revoked_at IS NOT NULL`
  );

  return result.rowCount ?? 0;
}

/**
 * Delete all sessions for a user (force logout all devices)
 */
export async function deleteAllUserSessions(adminUserId: string): Promise<number> {
  const result = await query(
    `UPDATE admin_sessions
     SET revoked_at = NOW()
     WHERE admin_user_id = $1
       AND revoked_at IS NULL`,
    [adminUserId]
  );

  return result.rowCount ?? 0;
}
