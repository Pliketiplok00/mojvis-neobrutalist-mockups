/**
 * Environment configuration for MOJ VIS Backend
 *
 * All environment variables are loaded from .env file or system environment.
 * Required variables will cause startup failure if missing.
 */

import dotenv from 'dotenv';

// Load .env file
dotenv.config();

export interface EnvConfig {
  // Server
  PORT: number;
  HOST: string;
  NODE_ENV: 'development' | 'production' | 'test';

  // Database
  DATABASE_URL: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;

  // Mock mode (explicit opt-in only)
  DB_MOCK_MODE: boolean;

  // Push mock mode (auto-enabled in dev/test, explicit in production)
  PUSH_MOCK_MODE: boolean;

  // Admin Authentication (Phase 1b)
  ADMIN_COOKIE_NAME: string;
  ADMIN_COOKIE_DOMAIN: string; // Empty for localhost (host-only cookie), ".mojvis.hr" for prod
  ADMIN_COOKIE_SECURE: boolean;
  ADMIN_SESSION_TTL_HOURS: number;
  ADMIN_ALLOWED_ORIGIN: string; // http://localhost:5173 for dev, https://admin.mojvis.hr for prod

  // Break-glass admin (emergency recovery)
  BREAKGLASS_USERNAME: string | null;
  BREAKGLASS_PASSWORD: string | null;
  BREAKGLASS_MUNICIPALITY: 'vis' | 'komiza' | null;

  // DeepL Translation API (optional, for admin HR→EN translation)
  DEEPL_API_KEY: string | null;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvVarAsInt(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number, got: ${value}`);
  }
  return parsed;
}

export function loadEnvConfig(): EnvConfig {
  const nodeEnv = getEnvVar('NODE_ENV', 'development') as EnvConfig['NODE_ENV'];

  // In development or test, provide sensible defaults
  const useDefaults = nodeEnv === 'development' || nodeEnv === 'test';

  return {
    PORT: getEnvVarAsInt('PORT', 3000),
    HOST: getEnvVar('HOST', '0.0.0.0'),
    NODE_ENV: nodeEnv,

    // Database - construct URL from parts or use DATABASE_URL directly
    DATABASE_URL: process.env['DATABASE_URL'] ?? buildDatabaseUrl(useDefaults),
    DB_HOST: getEnvVar('DB_HOST', useDefaults ? 'localhost' : undefined),
    DB_PORT: getEnvVarAsInt('DB_PORT', 5432),
    DB_NAME: getEnvVar('DB_NAME', useDefaults ? 'mojvis_test' : undefined),
    DB_USER: getEnvVar('DB_USER', useDefaults ? 'postgres' : undefined),
    DB_PASSWORD: getEnvVar('DB_PASSWORD', useDefaults ? 'postgres' : undefined),

    // Mock mode - MUST be explicitly enabled, never default
    DB_MOCK_MODE: process.env['DB_MOCK_MODE'] === 'true',

    // Push mock mode - auto-enabled in dev/test (no real Expo calls), can override
    PUSH_MOCK_MODE: process.env['PUSH_MOCK_MODE'] === 'true' ||
      (process.env['PUSH_MOCK_MODE'] !== 'false' && (nodeEnv === 'development' || nodeEnv === 'test')),

    // Admin Authentication (Phase 1b)
    ADMIN_COOKIE_NAME: getEnvVar('ADMIN_COOKIE_NAME', 'mojvis_admin_session'),
    // Empty string = host-only cookie (correct for localhost); ".mojvis.hr" for production
    ADMIN_COOKIE_DOMAIN: process.env['ADMIN_COOKIE_DOMAIN'] ?? '',
    ADMIN_COOKIE_SECURE: process.env['ADMIN_COOKIE_SECURE'] === 'true' ||
      (process.env['ADMIN_COOKIE_SECURE'] !== 'false' && nodeEnv === 'production'),
    ADMIN_SESSION_TTL_HOURS: getEnvVarAsInt('ADMIN_SESSION_TTL_HOURS', 24),
    // CORS origin: explicit allowlist, NOT wildcard with credentials
    ADMIN_ALLOWED_ORIGIN: getEnvVar(
      'ADMIN_ALLOWED_ORIGIN',
      useDefaults ? 'http://localhost:5173' : 'https://admin.mojvis.hr'
    ),

    // Break-glass admin (emergency recovery) - all optional
    BREAKGLASS_USERNAME: process.env['BREAKGLASS_USERNAME'] ?? null,
    BREAKGLASS_PASSWORD: process.env['BREAKGLASS_PASSWORD'] ?? null,
    BREAKGLASS_MUNICIPALITY: parseBreakglassMunicipality(process.env['BREAKGLASS_MUNICIPALITY']),

    // DeepL Translation API - optional
    DEEPL_API_KEY: process.env['DEEPL_API_KEY'] ?? null,
  };
}

/**
 * Parse break-glass municipality from env var
 */
function parseBreakglassMunicipality(value: string | undefined): 'vis' | 'komiza' | null {
  if (value === 'vis' || value === 'komiza') {
    return value;
  }
  return null;
}

function buildDatabaseUrl(useDefaults: boolean): string {
  const host = getEnvVar('DB_HOST', useDefaults ? 'localhost' : undefined);
  const port = getEnvVarAsInt('DB_PORT', 5432);
  const name = getEnvVar('DB_NAME', useDefaults ? 'mojvis' : undefined);
  const user = getEnvVar('DB_USER', useDefaults ? 'postgres' : undefined);
  const password = getEnvVar('DB_PASSWORD', useDefaults ? 'postgres' : undefined);

  return `postgresql://${user}:${password}@${host}:${port}/${name}`;
}

// Export singleton config
export const env = loadEnvConfig();
