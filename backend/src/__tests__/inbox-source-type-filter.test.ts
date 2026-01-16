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
 *
 * These tests use mocks (no real database connection required).
 * Pattern copied from: admin-global-visibility.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock inbox message data for different source types
const mockAdminMessage = {
  id: 'msg-admin',
  title_hr: 'Admin Broadcast',
  title_en: null,
  body_hr: 'Body text',
  body_en: null,
  tags: [],
  active_from: null,
  active_to: null,
  created_at: new Date('2026-01-15T10:00:00Z'),
  updated_at: new Date('2026-01-15T10:00:00Z'),
  created_by: null,
  deleted_at: null,
  is_locked: false,
  pushed_at: null,
  pushed_by: null,
};

const mockNullSourceMessage = {
  ...mockAdminMessage,
  id: 'msg-null',
  title_hr: 'Null Source Message',
};

// Mock the database module BEFORE importing repository functions
vi.mock('../lib/database.js', () => ({
  query: vi.fn(),
  isMockMode: () => true,
}));

// Import after mocking
import { query } from '../lib/database.js';
import { getInboxMessages, getInboxMessagesAdmin } from '../repositories/inbox.js';

const mockedQuery = vi.mocked(query);

describe('Inbox Source Type Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInboxMessages (public endpoint)', () => {
    it('should include messages with NULL source_type', async () => {
      // Mock: first call is COUNT, second is SELECT
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: [mockNullSourceMessage],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        });

      const { messages } = await getInboxMessages(1, 100);
      const found = messages.find((m) => m.id === 'msg-null');

      expect(found).toBeDefined();
    });

    it('should include messages with source_type = "admin"', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: [mockAdminMessage],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        });

      const { messages } = await getInboxMessages(1, 100);
      const found = messages.find((m) => m.id === 'msg-admin');

      expect(found).toBeDefined();
    });

    it('should NOT include system-generated source types in SQL query', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '0' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: [],
          command: 'SELECT',
          rowCount: 0,
          oid: 0,
          fields: [],
        });

      await getInboxMessages(1, 100);

      // Verify the query excludes system-generated source types
      const countQuery = mockedQuery.mock.calls[0][0];
      const countParams = mockedQuery.mock.calls[0][1] as string[];

      // The query should use NOT IN clause for source_type exclusion
      expect(countQuery.toLowerCase()).toContain('source_type');
      expect(countQuery.toLowerCase()).toContain('not in');

      // The params should include the excluded source types
      expect(countParams).toContain('click_fix_sent');
      expect(countParams).toContain('click_fix_status');
      expect(countParams).toContain('click_fix_reply');
      expect(countParams).toContain('feedback_sent');
      expect(countParams).toContain('feedback_reply');
    });
  });

  describe('getInboxMessagesAdmin (admin endpoint)', () => {
    it('should include messages with NULL source_type', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: [mockNullSourceMessage],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        });

      const { messages } = await getInboxMessagesAdmin(1, 100, false);
      const found = messages.find((m) => m.id === 'msg-null');

      expect(found).toBeDefined();
    });

    it('should include messages with source_type = "admin"', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: [mockAdminMessage],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        });

      const { messages } = await getInboxMessagesAdmin(1, 100, false);
      const found = messages.find((m) => m.id === 'msg-admin');

      expect(found).toBeDefined();
    });

    it('should NOT include system-generated source types in SQL query (admin)', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '0' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: [],
          command: 'SELECT',
          rowCount: 0,
          oid: 0,
          fields: [],
        });

      await getInboxMessagesAdmin(1, 100, false);

      // Verify the query excludes system-generated source types
      const countQuery = mockedQuery.mock.calls[0][0];
      const countParams = mockedQuery.mock.calls[0][1] as string[];

      // The query should use NOT IN clause for source_type exclusion
      expect(countQuery.toLowerCase()).toContain('source_type');
      expect(countQuery.toLowerCase()).toContain('not in');

      // The params should include the excluded source types
      expect(countParams).toContain('click_fix_sent');
      expect(countParams).toContain('click_fix_status');
      expect(countParams).toContain('click_fix_reply');
      expect(countParams).toContain('feedback_sent');
      expect(countParams).toContain('feedback_reply');
    });
  });

  describe('Regression: Click&Fix sent confirmation must NOT appear in public inbox', () => {
    it('should filter out Click&Fix confirmation from public inbox via SQL query', async () => {
      // The repository should include source_type exclusion in the query
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '0' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: [],
          command: 'SELECT',
          rowCount: 0,
          oid: 0,
          fields: [],
        });

      await getInboxMessages(1, 100);

      // Verify query structure filters out click_fix_sent
      const countQuery = mockedQuery.mock.calls[0][0];
      const countParams = mockedQuery.mock.calls[0][1] as string[];

      // Source type exclusion should be in the query
      expect(countQuery.toLowerCase()).toContain('source_type');
      expect(countParams).toContain('click_fix_sent');
    });
  });

  describe('Source type exclusion list verification', () => {
    /**
     * These tests verify that the repository queries correctly exclude
     * all system-generated source types. This is done by checking the
     * SQL query structure and parameters.
     */

    const EXPECTED_EXCLUDED_TYPES = [
      'click_fix_sent',
      'click_fix_status',
      'click_fix_reply',
      'feedback_sent',
      'feedback_reply',
    ];

    it('should exclude all expected source types from public inbox', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '0' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: [],
          command: 'SELECT',
          rowCount: 0,
          oid: 0,
          fields: [],
        });

      await getInboxMessages(1, 100);

      const countParams = mockedQuery.mock.calls[0][1] as string[];

      for (const sourceType of EXPECTED_EXCLUDED_TYPES) {
        expect(countParams).toContain(sourceType);
      }
    });

    it('should exclude all expected source types from admin inbox', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '0' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: [],
          command: 'SELECT',
          rowCount: 0,
          oid: 0,
          fields: [],
        });

      await getInboxMessagesAdmin(1, 100, false);

      const countParams = mockedQuery.mock.calls[0][1] as string[];

      for (const sourceType of EXPECTED_EXCLUDED_TYPES) {
        expect(countParams).toContain(sourceType);
      }
    });
  });
});
