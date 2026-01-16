/**
 * Admin Global Visibility Tests
 *
 * Tests that Admin Click&Fix and Admin Feedback lists show ALL items
 * regardless of admin's municipality.
 *
 * Previously, admins could only see items from their own municipality.
 * This was changed to allow global moderation visibility for all admins.
 *
 * NOTE: These are integration tests that require a running PostgreSQL database.
 * They are automatically skipped in CI where PostgreSQL is not available.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { Pool } from 'pg';

// Check if PostgreSQL is available (skip in CI where DB_PATH=:memory: is set)
const isPostgresAvailable = !process.env.DB_PATH;

// Direct database connection for tests (only created if PostgreSQL is available)
const pool = isPostgresAvailable
  ? new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'mojvis',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    })
  : (null as unknown as Pool);

// Mock the database module to use our direct pool
vi.mock('../lib/database.js', () => ({
  query: async <T>(sql: string, params?: unknown[]) => {
    if (!pool) throw new Error('PostgreSQL not available');
    const result = await pool.query(sql, params);
    return result as { rows: T[]; rowCount: number };
  },
  isMockMode: () => !isPostgresAvailable,
}));

import { getClickFixListAdmin } from '../repositories/click-fix.js';
import { getFeedbackListAdmin } from '../repositories/feedback.js';

// Track created IDs for cleanup
const createdClickFixIds: string[] = [];
const createdFeedbackIds: string[] = [];

describe.skipIf(!isPostgresAvailable)('Admin Global Visibility', () => {
  beforeAll(async () => {
    // Clean up any leftover test data from previous runs
    await pool.query(`DELETE FROM click_fix WHERE subject LIKE 'TEST_GLOBAL_%'`);
    await pool.query(`DELETE FROM feedback WHERE subject LIKE 'TEST_GLOBAL_%'`);
  });

  afterAll(async () => {
    // Cleanup: delete all test data
    for (const id of createdClickFixIds) {
      try {
        await pool.query('DELETE FROM click_fix WHERE id = $1', [id]);
      } catch {
        // Ignore errors during cleanup
      }
    }
    for (const id of createdFeedbackIds) {
      try {
        await pool.query('DELETE FROM feedback WHERE id = $1', [id]);
      } catch {
        // Ignore errors during cleanup
      }
    }
    await pool.end();
  });

  beforeEach(async () => {
    // Clean up test data between tests
    await pool.query(`DELETE FROM click_fix WHERE subject LIKE 'TEST_GLOBAL_%'`);
    await pool.query(`DELETE FROM feedback WHERE subject LIKE 'TEST_GLOBAL_%'`);
    createdClickFixIds.length = 0;
    createdFeedbackIds.length = 0;
  });

  /**
   * Helper to create a test Click&Fix with specific municipality
   * NOTE: sent_inbox_message_id is nullable, so we skip inbox message creation to avoid FK issues
   */
  async function createTestClickFix(
    subject: string,
    municipality: 'vis' | 'komiza' | null
  ): Promise<string> {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO click_fix (device_id, user_mode, municipality, language, subject, description, location_lat, location_lng, sent_inbox_message_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      ['test-device-global', 'local', municipality, 'hr', `TEST_GLOBAL_${subject}`, 'Test description', 43.0614, 16.1927, null]
    );
    const id = result.rows[0].id;
    createdClickFixIds.push(id);
    return id;
  }

  /**
   * Helper to create a test Feedback with specific municipality
   * NOTE: sent_inbox_message_id is nullable, so we skip inbox message creation to avoid FK issues
   */
  async function createTestFeedback(
    subject: string,
    municipality: 'vis' | 'komiza' | null
  ): Promise<string> {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO feedback (device_id, user_mode, municipality, language, subject, body, sent_inbox_message_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      ['test-device-global', 'local', municipality, 'hr', `TEST_GLOBAL_${subject}`, 'Test body', null]
    );
    const id = result.rows[0].id;
    createdFeedbackIds.push(id);
    return id;
  }

  describe('getClickFixListAdmin (admin endpoint)', () => {
    it('should return items from ALL municipalities when admin is vis', async () => {
      // Create one item for each municipality
      const visId = await createTestClickFix('vis_item', 'vis');
      const komizaId = await createTestClickFix('komiza_item', 'komiza');

      // Query as admin_vis (municipality = 'vis')
      const { items, total } = await getClickFixListAdmin(1, 100, 'vis');

      // Should see BOTH items regardless of admin municipality
      const foundVis = items.find(item => item.id === visId);
      const foundKomiza = items.find(item => item.id === komizaId);

      expect(foundVis).toBeDefined();
      expect(foundKomiza).toBeDefined();
      expect(total).toBeGreaterThanOrEqual(2);
    });

    it('should return items from ALL municipalities when admin is komiza', async () => {
      // Create one item for each municipality
      const visId = await createTestClickFix('vis_item2', 'vis');
      const komizaId = await createTestClickFix('komiza_item2', 'komiza');

      // Query as admin_komiza (municipality = 'komiza')
      const { items, total } = await getClickFixListAdmin(1, 100, 'komiza');

      // Should see BOTH items regardless of admin municipality
      const foundVis = items.find(item => item.id === visId);
      const foundKomiza = items.find(item => item.id === komizaId);

      expect(foundVis).toBeDefined();
      expect(foundKomiza).toBeDefined();
      expect(total).toBeGreaterThanOrEqual(2);
    });

    it('should return items with NULL municipality', async () => {
      const nullId = await createTestClickFix('null_item', null);

      const { items } = await getClickFixListAdmin(1, 100, 'vis');
      const found = items.find(item => item.id === nullId);

      expect(found).toBeDefined();
    });

    it('should preserve municipality field on returned items', async () => {
      const visId = await createTestClickFix('preserve_vis', 'vis');
      const komizaId = await createTestClickFix('preserve_komiza', 'komiza');

      const { items } = await getClickFixListAdmin(1, 100, 'vis');

      const visItem = items.find(item => item.id === visId);
      const komizaItem = items.find(item => item.id === komizaId);

      // Municipality should still be present on items (not filtered, just visible)
      expect(visItem?.municipality).toBe('vis');
      expect(komizaItem?.municipality).toBe('komiza');
    });
  });

  describe('getFeedbackListAdmin (admin endpoint)', () => {
    it('should return items from ALL municipalities when admin is vis', async () => {
      // Create one item for each municipality
      const visId = await createTestFeedback('vis_feedback', 'vis');
      const komizaId = await createTestFeedback('komiza_feedback', 'komiza');

      // Query as admin_vis (municipality = 'vis')
      const { feedback, total } = await getFeedbackListAdmin(1, 100, 'vis');

      // Should see BOTH items regardless of admin municipality
      const foundVis = feedback.find(item => item.id === visId);
      const foundKomiza = feedback.find(item => item.id === komizaId);

      expect(foundVis).toBeDefined();
      expect(foundKomiza).toBeDefined();
      expect(total).toBeGreaterThanOrEqual(2);
    });

    it('should return items from ALL municipalities when admin is komiza', async () => {
      // Create one item for each municipality
      const visId = await createTestFeedback('vis_feedback2', 'vis');
      const komizaId = await createTestFeedback('komiza_feedback2', 'komiza');

      // Query as admin_komiza (municipality = 'komiza')
      const { feedback, total } = await getFeedbackListAdmin(1, 100, 'komiza');

      // Should see BOTH items regardless of admin municipality
      const foundVis = feedback.find(item => item.id === visId);
      const foundKomiza = feedback.find(item => item.id === komizaId);

      expect(foundVis).toBeDefined();
      expect(foundKomiza).toBeDefined();
      expect(total).toBeGreaterThanOrEqual(2);
    });

    it('should return items with NULL municipality', async () => {
      const nullId = await createTestFeedback('null_feedback', null);

      const { feedback } = await getFeedbackListAdmin(1, 100, 'vis');
      const found = feedback.find(item => item.id === nullId);

      expect(found).toBeDefined();
    });

    it('should preserve municipality field on returned items', async () => {
      const visId = await createTestFeedback('preserve_vis_fb', 'vis');
      const komizaId = await createTestFeedback('preserve_komiza_fb', 'komiza');

      const { feedback } = await getFeedbackListAdmin(1, 100, 'vis');

      const visItem = feedback.find(item => item.id === visId);
      const komizaItem = feedback.find(item => item.id === komizaId);

      // Municipality should still be present on items (not filtered, just visible)
      expect(visItem?.municipality).toBe('vis');
      expect(komizaItem?.municipality).toBe('komiza');
    });
  });

  describe('Regression: Both admin types see identical sets', () => {
    it('admin_vis and admin_komiza should see same Click&Fix items', async () => {
      // Create items for both municipalities
      await createTestClickFix('regression_vis', 'vis');
      await createTestClickFix('regression_komiza', 'komiza');
      await createTestClickFix('regression_null', null);

      // Query as both admin types
      const visAdminResult = await getClickFixListAdmin(1, 100, 'vis');
      const komizaAdminResult = await getClickFixListAdmin(1, 100, 'komiza');

      // Both should see the same total
      expect(visAdminResult.total).toBe(komizaAdminResult.total);

      // Both should see the same item IDs
      const visIds = visAdminResult.items.map(i => i.id).sort();
      const komizaIds = komizaAdminResult.items.map(i => i.id).sort();
      expect(visIds).toEqual(komizaIds);
    });

    it('admin_vis and admin_komiza should see same Feedback items', async () => {
      // Create items for both municipalities
      await createTestFeedback('regression_vis_fb', 'vis');
      await createTestFeedback('regression_komiza_fb', 'komiza');
      await createTestFeedback('regression_null_fb', null);

      // Query as both admin types
      const visAdminResult = await getFeedbackListAdmin(1, 100, 'vis');
      const komizaAdminResult = await getFeedbackListAdmin(1, 100, 'komiza');

      // Both should see the same total
      expect(visAdminResult.total).toBe(komizaAdminResult.total);

      // Both should see the same item IDs
      const visIds = visAdminResult.feedback.map(i => i.id).sort();
      const komizaIds = komizaAdminResult.feedback.map(i => i.id).sort();
      expect(visIds).toEqual(komizaIds);
    });
  });
});
