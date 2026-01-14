#!/usr/bin/env npx tsx
/**
 * Purge Inbox Development Script
 *
 * DELETES ALL inbox messages and related data (feedback, click-fix).
 * This is a DESTRUCTIVE operation intended for development only.
 *
 * SAFETY GUARDS:
 * - Only runs if NODE_ENV=development (or unset, defaults to development)
 * - Explicitly refuses to run if NODE_ENV=production
 * - Requires confirmation via --confirm flag
 *
 * Usage:
 *   pnpm --dir backend purge:inbox --confirm
 *   npx tsx scripts/purge-inbox-dev.ts --confirm
 */

import { Pool } from 'pg';

// ============================================================
// Safety Guards
// ============================================================

const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'production') {
  console.error('');
  console.error('=' .repeat(60));
  console.error('  BLOCKED: Cannot run purge in production!');
  console.error('=' .repeat(60));
  console.error('');
  console.error('This script is only allowed in development environment.');
  console.error('Current NODE_ENV:', NODE_ENV);
  console.error('');
  process.exit(1);
}

if (NODE_ENV !== 'development' && NODE_ENV !== 'test') {
  console.error('');
  console.error('=' .repeat(60));
  console.error('  WARNING: Unknown NODE_ENV');
  console.error('=' .repeat(60));
  console.error('');
  console.error('Expected NODE_ENV to be "development" or "test".');
  console.error('Current NODE_ENV:', NODE_ENV);
  console.error('');
  console.error('Set NODE_ENV=development to proceed.');
  process.exit(1);
}

// Require --confirm flag
const hasConfirm = process.argv.includes('--confirm');
if (!hasConfirm) {
  console.error('');
  console.error('=' .repeat(60));
  console.error('  SAFETY: Confirmation required');
  console.error('=' .repeat(60));
  console.error('');
  console.error('This will DELETE ALL inbox messages, feedback, and click-fix data.');
  console.error('');
  console.error('To proceed, run with --confirm flag:');
  console.error('  pnpm --dir backend purge:inbox --confirm');
  console.error('');
  process.exit(1);
}

// ============================================================
// Database Connection
// ============================================================

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'mojvis',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// ============================================================
// Purge Logic
// ============================================================

interface DeleteResult {
  table: string;
  deleted: number;
}

async function purgeInbox(): Promise<void> {
  console.log('');
  console.log('=' .repeat(60));
  console.log('  PURGE INBOX - Development Only');
  console.log('=' .repeat(60));
  console.log('');
  console.log('Environment:', NODE_ENV);
  console.log('Database:', process.env.DB_NAME || 'mojvis');
  console.log('');

  const client = await pool.connect();
  const results: DeleteResult[] = [];

  try {
    await client.query('BEGIN');

    // Delete in order respecting foreign key constraints
    // Note: Using DELETE instead of TRUNCATE to get row counts

    // 1. Feedback replies (references feedback)
    console.log('[1/8] Deleting feedback_replies...');
    const feedbackReplies = await client.query('DELETE FROM feedback_replies RETURNING id');
    results.push({ table: 'feedback_replies', deleted: feedbackReplies.rowCount ?? 0 });
    console.log(`      Deleted: ${feedbackReplies.rowCount ?? 0} rows`);

    // 2. Feedback rate limits
    console.log('[2/8] Deleting feedback_rate_limits...');
    const feedbackLimits = await client.query('DELETE FROM feedback_rate_limits RETURNING device_id');
    results.push({ table: 'feedback_rate_limits', deleted: feedbackLimits.rowCount ?? 0 });
    console.log(`      Deleted: ${feedbackLimits.rowCount ?? 0} rows`);

    // 3. Feedback (references inbox_messages)
    console.log('[3/8] Deleting feedback...');
    const feedback = await client.query('DELETE FROM feedback RETURNING id');
    results.push({ table: 'feedback', deleted: feedback.rowCount ?? 0 });
    console.log(`      Deleted: ${feedback.rowCount ?? 0} rows`);

    // 4. Click-fix replies (references click_fix)
    console.log('[4/8] Deleting click_fix_replies...');
    const clickFixReplies = await client.query('DELETE FROM click_fix_replies RETURNING id');
    results.push({ table: 'click_fix_replies', deleted: clickFixReplies.rowCount ?? 0 });
    console.log(`      Deleted: ${clickFixReplies.rowCount ?? 0} rows`);

    // 5. Click-fix photos (references click_fix)
    console.log('[5/8] Deleting click_fix_photos...');
    const clickFixPhotos = await client.query('DELETE FROM click_fix_photos RETURNING id');
    results.push({ table: 'click_fix_photos', deleted: clickFixPhotos.rowCount ?? 0 });
    console.log(`      Deleted: ${clickFixPhotos.rowCount ?? 0} rows`);

    // 6. Click-fix rate limits
    console.log('[6/8] Deleting click_fix_rate_limits...');
    const clickFixLimits = await client.query('DELETE FROM click_fix_rate_limits RETURNING device_id');
    results.push({ table: 'click_fix_rate_limits', deleted: clickFixLimits.rowCount ?? 0 });
    console.log(`      Deleted: ${clickFixLimits.rowCount ?? 0} rows`);

    // 7. Click-fix (references inbox_messages)
    console.log('[7/8] Deleting click_fix...');
    const clickFix = await client.query('DELETE FROM click_fix RETURNING id');
    results.push({ table: 'click_fix', deleted: clickFix.rowCount ?? 0 });
    console.log(`      Deleted: ${clickFix.rowCount ?? 0} rows`);

    // 8. Inbox messages (main table)
    console.log('[8/8] Deleting inbox_messages...');
    const inbox = await client.query('DELETE FROM inbox_messages RETURNING id');
    results.push({ table: 'inbox_messages', deleted: inbox.rowCount ?? 0 });
    console.log(`      Deleted: ${inbox.rowCount ?? 0} rows`);

    await client.query('COMMIT');

    // Summary
    console.log('');
    console.log('=' .repeat(60));
    console.log('  PURGE COMPLETE');
    console.log('=' .repeat(60));
    console.log('');
    console.log('Summary:');
    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
    for (const r of results) {
      console.log(`  ${r.table.padEnd(25)} ${r.deleted} rows`);
    }
    console.log('  ' + '-'.repeat(35));
    console.log(`  ${'TOTAL'.padEnd(25)} ${totalDeleted} rows`);
    console.log('');
    console.log('Inbox is now empty. Marina can create fresh messages.');
    console.log('');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('');
    console.error('ERROR: Purge failed, transaction rolled back.');
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run
purgeInbox().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
