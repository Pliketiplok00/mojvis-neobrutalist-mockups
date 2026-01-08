/**
 * PostgreSQL Database Connection
 *
 * Provides connection pool and basic query interface.
 * Connection is env-based, no schema defined yet (Phase 0).
 *
 * Mock mode is ONLY enabled if DB_MOCK_MODE=true env var is set.
 * Without explicit opt-in, DB failures cause degraded mode (503 health).
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from '../config/env.js';

let pool: Pool | null = null;
let mockMode = false;
let dbConnectionFailed = false;

/**
 * Check if running in mock mode (explicit opt-in only)
 */
export function isMockMode(): boolean {
  return mockMode;
}

/**
 * Check if database connection failed (for health checks)
 */
export function isDbConnectionFailed(): boolean {
  return dbConnectionFailed;
}

/**
 * Enable mock mode - ONLY if DB_MOCK_MODE env var is true
 * Returns true if mock mode was enabled, false otherwise
 */
export function tryEnableMockMode(): boolean {
  if (env.DB_MOCK_MODE) {
    mockMode = true;
    console.info('[DB] Mock mode ENABLED via DB_MOCK_MODE=true');
    console.warn('[DB] WARNING: All data is in-memory, not persisted!');
    return true;
  }
  console.warn('[DB] Mock mode NOT enabled (DB_MOCK_MODE not set to true)');
  console.warn('[DB] Server will run in DEGRADED mode - /health returns 503');
  dbConnectionFailed = true;
  return false;
}

/**
 * Initialize database connection pool
 */
export async function initDatabase(): Promise<void> {
  if (pool) {
    console.info('[DB] Pool already initialized');
    return;
  }

  console.info('[DB] Initializing connection pool...');
  console.info(`[DB] Connecting to: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);

  pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    max: 10, // Max connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Test connection
  try {
    const client = await pool.connect();
    const result = await client.query<{ now: Date }>('SELECT NOW() as now');
    console.info(`[DB] Connection successful. Server time: ${String(result.rows[0]?.now)}`);
    client.release();
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    throw error;
  }
}

/**
 * Get the connection pool (returns null in mock mode)
 */
export function getPool(): Pool | null {
  if (mockMode) {
    return null;
  }
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
}

/**
 * Execute a query
 * In mock mode, returns empty results
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  // Mock mode: return empty results
  if (mockMode) {
    const isCount = text.toLowerCase().includes('count(*)');
    return {
      rows: isCount ? [{ count: '0' } as unknown as T] : [],
      command: '',
      rowCount: isCount ? 1 : 0,
      oid: 0,
      fields: [],
    };
  }

  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database not available');
  }

  const start = Date.now();

  try {
    const result = await currentPool.query<T>(text, params);
    const duration = Date.now() - start;

    if (env.NODE_ENV === 'development') {
      console.info(`[DB] Query executed in ${duration}ms: ${text.substring(0, 50)}...`);
    }

    return result;
  } catch (error) {
    console.error('[DB] Query error:', error);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * Throws in mock mode as transactions aren't supported
 */
export async function getClient(): Promise<PoolClient> {
  if (mockMode) {
    throw new Error('Transactions not supported in mock mode');
  }
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database not available');
  }
  return currentPool.connect();
}

/**
 * Close the connection pool
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    console.info('[DB] Closing connection pool...');
    await pool.end();
    pool = null;
    console.info('[DB] Connection pool closed');
  }
}

/**
 * Check if database is connected and responsive
 * Returns false in mock mode
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  if (mockMode) {
    return false;
  }
  try {
    const currentPool = getPool();
    if (!currentPool) {
      return false;
    }
    const result = await currentPool.query('SELECT 1 as health');
    return result.rows.length === 1;
  } catch {
    return false;
  }
}
