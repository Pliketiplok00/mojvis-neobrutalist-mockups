/**
 * PostgreSQL Database Connection
 *
 * Provides connection pool and basic query interface.
 * Connection is env-based, no schema defined yet (Phase 0).
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from '../config/env.js';

let pool: Pool | null = null;

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
    const result = await client.query('SELECT NOW() as now');
    console.info(`[DB] Connection successful. Server time: ${String(result.rows[0]?.now)}`);
    client.release();
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    throw error;
  }
}

/**
 * Get the connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
}

/**
 * Execute a query
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
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
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
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
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT 1 as health');
    return result.rows.length === 1;
  } catch {
    return false;
  }
}
