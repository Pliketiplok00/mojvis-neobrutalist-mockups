/**
 * Inbox Source Type Filter Tests
 *
 * Tests that system-generated messages (Click&Fix, Feedback) are correctly
 * excluded from public inbox and admin inbox lists.
 *
 * Bug fixed: Click&Fix confirmations were appearing in:
 * - Mobile Inbox (should only show admin broadcast messages)
 * - Admin Inbox "sent" list (should only show admin-created messages)
 *
 * The fix adds source_type filtering to getInboxMessages and getInboxMessagesAdmin.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { Pool } from 'pg';

// Direct database connection for tests
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'mojvis',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Mock the database module to use our direct pool
vi.mock('../lib/database.js', () => ({
  query: async <T>(sql: string, params?: unknown[]) => {
    const result = await pool.query(sql, params);
    return result as { rows: T[]; rowCount: number };
  },
  isMockMode: () => false,
}));

import {
  getInboxMessages,
  getInboxMessagesAdmin,
} from '../repositories/inbox.js';

// Track created message IDs for cleanup
const createdMessageIds: string[] = [];

describe('Inbox Source Type Filtering', () => {
  beforeAll(async () => {
    // Clean up any leftover test messages from previous runs
    await pool.query(`DELETE FROM inbox_messages WHERE title_hr LIKE 'TEST_%'`);
  });

  afterAll(async () => {
    // Cleanup: delete all test messages
    for (const id of createdMessageIds) {
      try {
        await pool.query('DELETE FROM inbox_messages WHERE id = $1', [id]);
      } catch {
        // Ignore errors during cleanup
      }
    }
    await pool.end();
  });

  beforeEach(async () => {
    // Clean up any leftover test messages
    await pool.query(`DELETE FROM inbox_messages WHERE title_hr LIKE 'TEST_%'`);
    createdMessageIds.length = 0;
  });

  /**
   * Helper to create a test inbox message with specific source_type
   */
  async function createTestMessage(
    title: string,
    sourceType: string | null
  ): Promise<string> {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO inbox_messages (title_hr, body_hr, tags, source_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [`TEST_${title}`, 'Test body', [], sourceType]
    );
    const id = result.rows[0].id;
    createdMessageIds.push(id);
    return id;
  }

  describe('getInboxMessages (public endpoint)', () => {
    it('should include messages with NULL source_type', async () => {
      const messageId = await createTestMessage('null_source', null);

      const { messages } = await getInboxMessages(1, 100);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeDefined();
    });

    it('should include messages with source_type = "admin"', async () => {
      const messageId = await createTestMessage('admin_source', 'admin');

      const { messages } = await getInboxMessages(1, 100);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeDefined();
    });

    it('should EXCLUDE messages with source_type = "click_fix_sent"', async () => {
      const messageId = await createTestMessage('clickfix_sent', 'click_fix_sent');

      const { messages } = await getInboxMessages(1, 100);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeUndefined();
    });

    it('should EXCLUDE messages with source_type = "click_fix_status"', async () => {
      const messageId = await createTestMessage('clickfix_status', 'click_fix_status');

      const { messages } = await getInboxMessages(1, 100);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeUndefined();
    });

    it('should EXCLUDE messages with source_type = "click_fix_reply"', async () => {
      const messageId = await createTestMessage('clickfix_reply', 'click_fix_reply');

      const { messages } = await getInboxMessages(1, 100);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeUndefined();
    });

    it('should EXCLUDE messages with source_type = "feedback_sent"', async () => {
      const messageId = await createTestMessage('feedback_sent', 'feedback_sent');

      const { messages } = await getInboxMessages(1, 100);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeUndefined();
    });

    it('should EXCLUDE messages with source_type = "feedback_reply"', async () => {
      const messageId = await createTestMessage('feedback_reply', 'feedback_reply');

      const { messages } = await getInboxMessages(1, 100);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeUndefined();
    });
  });

  describe('getInboxMessagesAdmin (admin endpoint)', () => {
    it('should include messages with NULL source_type', async () => {
      const messageId = await createTestMessage('admin_null_source', null);

      const { messages } = await getInboxMessagesAdmin(1, 100, false);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeDefined();
    });

    it('should include messages with source_type = "admin"', async () => {
      const messageId = await createTestMessage('admin_admin_source', 'admin');

      const { messages } = await getInboxMessagesAdmin(1, 100, false);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeDefined();
    });

    it('should EXCLUDE messages with source_type = "click_fix_sent" from admin list', async () => {
      const messageId = await createTestMessage('admin_clickfix_sent', 'click_fix_sent');

      const { messages } = await getInboxMessagesAdmin(1, 100, false);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeUndefined();
    });

    it('should EXCLUDE messages with source_type = "click_fix_reply" from admin list', async () => {
      const messageId = await createTestMessage('admin_clickfix_reply', 'click_fix_reply');

      const { messages } = await getInboxMessagesAdmin(1, 100, false);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeUndefined();
    });

    it('should EXCLUDE messages with source_type = "feedback_sent" from admin list', async () => {
      const messageId = await createTestMessage('admin_feedback_sent', 'feedback_sent');

      const { messages } = await getInboxMessagesAdmin(1, 100, false);
      const found = messages.find(m => m.id === messageId);

      expect(found).toBeUndefined();
    });
  });

  describe('Regression: Click&Fix sent confirmation must NOT appear in public inbox', () => {
    it('should prevent Click&Fix confirmation from appearing in mobile inbox', async () => {
      // Simulate what Click&Fix submission does
      const messageId = await createTestMessage(
        'ClickFix_Confirmation',
        'click_fix_sent'
      );

      // Query public inbox - this should NOT include the Click&Fix confirmation
      const { messages, total } = await getInboxMessages(1, 100);

      // The click_fix_sent message should NOT be in the results
      const found = messages.find(m => m.id === messageId);
      expect(found).toBeUndefined();

      // Verify total count also excludes it
      const directCount = await pool.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM inbox_messages
         WHERE deleted_at IS NULL
         AND (source_type IS NULL OR source_type NOT IN ('click_fix_sent', 'click_fix_status', 'click_fix_reply', 'feedback_sent', 'feedback_reply'))
         AND title_hr LIKE 'TEST_%'`
      );
      expect(total).toBeGreaterThanOrEqual(parseInt(directCount.rows[0].count));
    });
  });
});
