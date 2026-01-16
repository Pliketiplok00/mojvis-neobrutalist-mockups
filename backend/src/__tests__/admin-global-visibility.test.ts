/**
 * Admin Global Visibility Tests
 *
 * Tests that Admin Click&Fix and Admin Feedback lists show ALL items
 * regardless of admin's municipality.
 *
 * Previously, admins could only see items from their own municipality.
 * This was changed to allow global moderation visibility for all admins.
 *
 * These tests use mocks (no real database connection required).
 * Pattern copied from: click-fix.test.ts, feedback.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data for Click&Fix items from different municipalities
const mockClickFixItems = [
  {
    id: 'cf-1',
    device_id: 'device-1',
    user_mode: 'local',
    municipality: 'vis',
    language: 'hr',
    subject: 'Issue in Vis',
    description: 'Test description',
    location_lat: 43.06,
    location_lng: 16.19,
    status: 'zaprimljeno',
    created_at: new Date('2026-01-15T10:00:00Z'),
    updated_at: new Date('2026-01-15T10:00:00Z'),
    sent_inbox_message_id: null,
    photo_count: '0',
    reply_count: '0',
  },
  {
    id: 'cf-2',
    device_id: 'device-2',
    user_mode: 'local',
    municipality: 'komiza',
    language: 'hr',
    subject: 'Issue in Komiza',
    description: 'Test description',
    location_lat: 43.04,
    location_lng: 16.09,
    status: 'zaprimljeno',
    created_at: new Date('2026-01-15T11:00:00Z'),
    updated_at: new Date('2026-01-15T11:00:00Z'),
    sent_inbox_message_id: null,
    photo_count: '1',
    reply_count: '0',
  },
  {
    id: 'cf-3',
    device_id: 'device-3',
    user_mode: 'visitor',
    municipality: null,
    language: 'en',
    subject: 'Issue from visitor',
    description: 'Test description',
    location_lat: 43.05,
    location_lng: 16.15,
    status: 'zaprimljeno',
    created_at: new Date('2026-01-15T12:00:00Z'),
    updated_at: new Date('2026-01-15T12:00:00Z'),
    sent_inbox_message_id: null,
    photo_count: '2',
    reply_count: '1',
  },
];

// Mock data for Feedback items from different municipalities
const mockFeedbackItems = [
  {
    id: 'fb-1',
    device_id: 'device-1',
    user_mode: 'local',
    municipality: 'vis',
    language: 'hr',
    subject: 'Feedback from Vis',
    body: 'Test body',
    status: 'zaprimljeno',
    created_at: new Date('2026-01-15T10:00:00Z'),
    updated_at: new Date('2026-01-15T10:00:00Z'),
    sent_inbox_message_id: null,
    reply_count: '0',
  },
  {
    id: 'fb-2',
    device_id: 'device-2',
    user_mode: 'local',
    municipality: 'komiza',
    language: 'hr',
    subject: 'Feedback from Komiza',
    body: 'Test body',
    status: 'u_razmatranju',
    created_at: new Date('2026-01-15T11:00:00Z'),
    updated_at: new Date('2026-01-15T11:00:00Z'),
    sent_inbox_message_id: null,
    reply_count: '1',
  },
];

// Mock the database module BEFORE importing repository functions
vi.mock('../lib/database.js', () => ({
  query: vi.fn(),
  isMockMode: () => true,
}));

// Import after mocking
import { query } from '../lib/database.js';
import { getClickFixListAdmin } from '../repositories/click-fix.js';
import { getFeedbackListAdmin } from '../repositories/feedback.js';

const mockedQuery = vi.mocked(query);

describe('Admin Global Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getClickFixListAdmin', () => {
    it('should return items from ALL municipalities when admin is vis', async () => {
      // Mock: first call is COUNT, second is SELECT
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '3' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: mockClickFixItems,
          command: 'SELECT',
          rowCount: 3,
          oid: 0,
          fields: [],
        });

      // Call with admin municipality 'vis'
      const result = await getClickFixListAdmin(1, 20, 'vis');

      // Should return ALL 3 items (vis, komiza, and null)
      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(3);

      // Verify we have items from different municipalities
      const municipalities = result.items.map((item) => item.municipality);
      expect(municipalities).toContain('vis');
      expect(municipalities).toContain('komiza');
      expect(municipalities).toContain(null);
    });

    it('should return items from ALL municipalities when admin is komiza', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '3' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: mockClickFixItems,
          command: 'SELECT',
          rowCount: 3,
          oid: 0,
          fields: [],
        });

      // Call with admin municipality 'komiza'
      const result = await getClickFixListAdmin(1, 20, 'komiza');

      // Should still return ALL 3 items
      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(3);
    });

    it('should NOT filter by municipality in the SQL query', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '3' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: mockClickFixItems,
          command: 'SELECT',
          rowCount: 3,
          oid: 0,
          fields: [],
        });

      await getClickFixListAdmin(1, 20, 'vis');

      // Verify the COUNT query does NOT include municipality filter
      const countQuery = mockedQuery.mock.calls[0][0];
      expect(countQuery.toLowerCase()).not.toContain('municipality =');
      expect(countQuery.toLowerCase()).not.toContain('cf.municipality');

      // Verify the SELECT query does NOT include municipality filter in main WHERE
      // Note: "where" may appear in subqueries (e.g., "WHERE click_fix_id = cf.id")
      const selectQuery = mockedQuery.mock.calls[1][0];
      expect(selectQuery.toLowerCase()).not.toContain('municipality =');
      expect(selectQuery.toLowerCase()).not.toContain('cf.municipality');
    });

    it('should preserve municipality field on returned items', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '3' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: mockClickFixItems,
          command: 'SELECT',
          rowCount: 3,
          oid: 0,
          fields: [],
        });

      const result = await getClickFixListAdmin(1, 20, 'vis');

      // Municipality should be preserved on each item
      const visItem = result.items.find((i) => i.id === 'cf-1');
      const komizaItem = result.items.find((i) => i.id === 'cf-2');
      const nullItem = result.items.find((i) => i.id === 'cf-3');

      expect(visItem?.municipality).toBe('vis');
      expect(komizaItem?.municipality).toBe('komiza');
      expect(nullItem?.municipality).toBeNull();
    });
  });

  describe('getFeedbackListAdmin', () => {
    it('should return items from ALL municipalities when admin is vis', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '2' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: mockFeedbackItems,
          command: 'SELECT',
          rowCount: 2,
          oid: 0,
          fields: [],
        });

      // Call with admin municipality 'vis'
      const result = await getFeedbackListAdmin(1, 20, 'vis');

      // Should return ALL 2 items (vis and komiza)
      expect(result.total).toBe(2);
      expect(result.feedback).toHaveLength(2);

      // Verify we have items from different municipalities
      const municipalities = result.feedback.map((item) => item.municipality);
      expect(municipalities).toContain('vis');
      expect(municipalities).toContain('komiza');
    });

    it('should return items from ALL municipalities when admin is komiza', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '2' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: mockFeedbackItems,
          command: 'SELECT',
          rowCount: 2,
          oid: 0,
          fields: [],
        });

      // Call with admin municipality 'komiza'
      const result = await getFeedbackListAdmin(1, 20, 'komiza');

      // Should still return ALL 2 items
      expect(result.total).toBe(2);
      expect(result.feedback).toHaveLength(2);
    });

    it('should NOT filter by municipality in the SQL query', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '2' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: mockFeedbackItems,
          command: 'SELECT',
          rowCount: 2,
          oid: 0,
          fields: [],
        });

      await getFeedbackListAdmin(1, 20, 'vis');

      // Verify the COUNT query does NOT include municipality filter
      const countQuery = mockedQuery.mock.calls[0][0];
      expect(countQuery.toLowerCase()).not.toContain('municipality =');
      expect(countQuery.toLowerCase()).not.toContain('f.municipality');

      // Verify the SELECT query does NOT include municipality filter in main WHERE
      // Note: "where" may appear in subqueries (e.g., "WHERE feedback_id = f.id")
      const selectQuery = mockedQuery.mock.calls[1][0];
      expect(selectQuery.toLowerCase()).not.toContain('municipality =');
      expect(selectQuery.toLowerCase()).not.toContain('f.municipality');
    });

    it('should preserve municipality field on returned items', async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ count: '2' }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        })
        .mockResolvedValueOnce({
          rows: mockFeedbackItems,
          command: 'SELECT',
          rowCount: 2,
          oid: 0,
          fields: [],
        });

      const result = await getFeedbackListAdmin(1, 20, 'vis');

      // Municipality should be preserved on each item
      const visItem = result.feedback.find((i) => i.id === 'fb-1');
      const komizaItem = result.feedback.find((i) => i.id === 'fb-2');

      expect(visItem?.municipality).toBe('vis');
      expect(komizaItem?.municipality).toBe('komiza');
    });
  });

  describe('Regression: Both admin types see identical results', () => {
    it('vis admin and komiza admin should get same Click&Fix results', async () => {
      // Setup for vis admin
      mockedQuery
        .mockResolvedValueOnce({ rows: [{ count: '3' }], command: 'SELECT', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: mockClickFixItems, command: 'SELECT', rowCount: 3, oid: 0, fields: [] });
      const visResult = await getClickFixListAdmin(1, 20, 'vis');

      // Setup for komiza admin
      mockedQuery
        .mockResolvedValueOnce({ rows: [{ count: '3' }], command: 'SELECT', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: mockClickFixItems, command: 'SELECT', rowCount: 3, oid: 0, fields: [] });
      const komizaResult = await getClickFixListAdmin(1, 20, 'komiza');

      // Both should have same total and items
      expect(visResult.total).toBe(komizaResult.total);
      expect(visResult.items.length).toBe(komizaResult.items.length);
    });

    it('vis admin and komiza admin should get same Feedback results', async () => {
      // Setup for vis admin
      mockedQuery
        .mockResolvedValueOnce({ rows: [{ count: '2' }], command: 'SELECT', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: mockFeedbackItems, command: 'SELECT', rowCount: 2, oid: 0, fields: [] });
      const visResult = await getFeedbackListAdmin(1, 20, 'vis');

      // Setup for komiza admin
      mockedQuery
        .mockResolvedValueOnce({ rows: [{ count: '2' }], command: 'SELECT', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: mockFeedbackItems, command: 'SELECT', rowCount: 2, oid: 0, fields: [] });
      const komizaResult = await getFeedbackListAdmin(1, 20, 'komiza');

      // Both should have same total and items
      expect(visResult.total).toBe(komizaResult.total);
      expect(visResult.feedback.length).toBe(komizaResult.feedback.length);
    });
  });
});
