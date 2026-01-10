/**
 * Authentication Service
 *
 * Handles admin authentication, session management, and credential verification.
 * Phase 1b: Cookie-session based authentication.
 *
 * SECURITY INVARIANTS:
 * - Password hashing: bcrypt with cost factor 12
 * - Session tokens: 32 bytes random, SHA-256 hashed before DB storage
 * - Break-glass: MUST create real DB session, MUST require BREAKGLASS_MUNICIPALITY
 * - API responses: NEVER include password_hash
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '../config/env.js';
import {
  findAdminByUsername,
  createSession,
  findSessionByToken,
  revokeSession,
  upsertBreakglassAdmin,
  updateSessionLastSeen,
  deleteExpiredSessions,
} from '../repositories/admin.js';

// ============================================================
// Constants
// ============================================================

const BCRYPT_COST = 12;
const SESSION_TOKEN_BYTES = 32;

// ============================================================
// Types (sanitized for API responses)
// ============================================================

/**
 * Admin info safe for API responses (no password_hash)
 */
export interface AdminInfo {
  id: string;
  username: string;
  municipality: 'vis' | 'komiza';
  notice_municipality_scope: 'vis' | 'komiza' | null; // Phase 3: which municipal notices admin can edit
}

/**
 * Session data attached to requests
 */
export interface SessionData {
  adminId: string;
  username: string;
  municipality: 'vis' | 'komiza';
  noticeMunicipalityScope: 'vis' | 'komiza' | null; // Phase 3: which municipal notices admin can edit
  isBreakglass: boolean; // Phase 3: true breakglass bypasses municipal scope
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  sessionToken?: string;
  admin?: AdminInfo;
  error?: string;
  authMethod?: 'password' | 'break_glass';
}

// ============================================================
// Password Operations
// ============================================================

/**
 * Hash password with bcrypt (cost factor 12)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================
// Session Token Operations
// ============================================================

/**
 * Generate cryptographically secure session token
 * Returns hex string (64 characters)
 */
function generateSessionToken(): string {
  return crypto.randomBytes(SESSION_TOKEN_BYTES).toString('hex');
}

/**
 * Calculate session expiry based on TTL config
 */
function getSessionExpiry(): Date {
  const ttlMs = env.ADMIN_SESSION_TTL_HOURS * 60 * 60 * 1000;
  return new Date(Date.now() + ttlMs);
}

// ============================================================
// Authentication
// ============================================================

/**
 * Authenticate admin with username and password
 *
 * Flow:
 * 1. Try DB lookup by username
 * 2. If not found, try break-glass fallback (if configured)
 * 3. Verify password
 * 4. Create session
 * 5. Return sanitized admin info + session token
 */
export async function authenticateAdmin(
  username: string,
  password: string
): Promise<AuthResult> {
  let admin = await findAdminByUsername(username);
  let authMethod: 'password' | 'break_glass' = 'password';

  // Break-glass fallback: creates a REAL DB-backed session
  if (!admin && isBreakglassConfigured() && username === env.BREAKGLASS_USERNAME) {
    // Validate break-glass configuration
    if (!env.BREAKGLASS_MUNICIPALITY) {
      console.error('[Auth] CRITICAL: BREAKGLASS_MUNICIPALITY not configured');
      return { success: false, error: 'Break-glass not properly configured' };
    }

    if (!env.BREAKGLASS_PASSWORD) {
      console.error('[Auth] CRITICAL: BREAKGLASS_PASSWORD not configured');
      return { success: false, error: 'Break-glass not properly configured' };
    }

    // Verify break-glass password (compare raw password with stored raw password)
    // NOTE: In production, BREAKGLASS_PASSWORD should be a bcrypt hash
    // For simplicity, we support both raw comparison and bcrypt hash
    const isValidBreakglass = await verifyBreakglassPassword(password);

    if (isValidBreakglass) {
      console.warn('[Auth] CRITICAL: Break-glass admin login initiated', {
        username: env.BREAKGLASS_USERNAME,
        municipality: env.BREAKGLASS_MUNICIPALITY,
        timestamp: new Date().toISOString(),
      });

      // Hash the password for DB storage
      const passwordHash = await hashPassword(password);

      // Upsert break-glass admin into DB (creates or updates the record)
      // This ensures we have a real admin_users row to reference in sessions
      // Break-glass admin gets notice scope matching their municipality
      admin = await upsertBreakglassAdmin({
        username: env.BREAKGLASS_USERNAME,
        passwordHash,
        municipality: env.BREAKGLASS_MUNICIPALITY,
        noticeMunicipalityScope: env.BREAKGLASS_MUNICIPALITY,
      });

      authMethod = 'break_glass';
    }
  }

  if (!admin) {
    return { success: false, error: 'Invalid credentials' };
  }

  // Verify password (skip if we just created via break-glass)
  if (authMethod !== 'break_glass') {
    const isValid = await verifyPassword(password, admin.password_hash);
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' };
    }
  }

  // Create session
  const sessionToken = generateSessionToken();
  const expiresAt = getSessionExpiry();

  await createSession({
    adminUserId: admin.id,
    rawToken: sessionToken,
    expiresAt,
  });

  // Log successful authentication
  console.info('[Auth] Admin authenticated', {
    admin_id: admin.id,
    username: admin.username,
    municipality: admin.municipality,
    auth_method: authMethod,
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    sessionToken,
    admin: {
      id: admin.id,
      username: admin.username,
      municipality: admin.municipality,
      notice_municipality_scope: admin.notice_municipality_scope,
    },
    authMethod,
  };
}

/**
 * Validate session token and return session data
 * Optionally updates last_seen_at (throttled)
 */
export async function validateSession(
  sessionToken: string,
  updateLastSeen: boolean = true
): Promise<SessionData | null> {
  const session = await findSessionByToken(sessionToken);

  if (!session) {
    return null;
  }

  // Optionally update last_seen_at (throttled in repository)
  if (updateLastSeen) {
    // Fire and forget - don't await to avoid slowing down requests
    updateSessionLastSeen(sessionToken).catch((err) => {
      console.error('[Auth] Failed to update session last_seen_at:', err);
    });
  }

  return {
    adminId: session.admin.id,
    username: session.admin.username,
    municipality: session.admin.municipality,
    noticeMunicipalityScope: session.admin.notice_municipality_scope,
    isBreakglass: session.admin.is_breakglass,
  };
}

/**
 * Logout - revoke session
 */
export async function logout(sessionToken: string): Promise<boolean> {
  const revoked = await revokeSession(sessionToken);

  if (revoked) {
    console.info('[Auth] Session revoked', {
      token_prefix: sessionToken.slice(0, 8) + '...',
      timestamp: new Date().toISOString(),
    });
  }

  return revoked;
}

/**
 * Cleanup expired sessions (call periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const count = await deleteExpiredSessions();

  if (count > 0) {
    console.info('[Auth] Cleaned up expired sessions', { count });
  }

  return count;
}

// ============================================================
// Break-glass Helpers
// ============================================================

/**
 * Check if break-glass is configured
 */
function isBreakglassConfigured(): boolean {
  return !!(env.BREAKGLASS_USERNAME && env.BREAKGLASS_PASSWORD);
}

/**
 * Verify break-glass password
 * Supports both raw password comparison and bcrypt hash
 */
async function verifyBreakglassPassword(password: string): Promise<boolean> {
  if (!env.BREAKGLASS_PASSWORD) {
    return false;
  }

  // Check if BREAKGLASS_PASSWORD looks like a bcrypt hash
  if (env.BREAKGLASS_PASSWORD.startsWith('$2')) {
    return bcrypt.compare(password, env.BREAKGLASS_PASSWORD);
  }

  // Raw password comparison (for dev convenience, not recommended for prod)
  return password === env.BREAKGLASS_PASSWORD;
}
