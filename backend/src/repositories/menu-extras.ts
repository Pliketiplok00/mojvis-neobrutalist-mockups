/**
 * Menu Extras Repository
 *
 * Database access layer for menu extras.
 * Handles CRUD operations for server-driven menu items.
 */

import { query } from '../lib/database.js';
import type {
  MenuExtra,
  MenuExtraCreateInput,
  MenuExtraUpdateInput,
} from '../types/menu-extras.js';

// ============================================================
// Database Row Types
// ============================================================

interface MenuExtraRow {
  id: string;
  label_hr: string;
  label_en: string;
  target: string;
  display_order: number;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// Row to Entity Conversion
// ============================================================

function rowToMenuExtra(row: MenuExtraRow): MenuExtra {
  return {
    id: row.id,
    label_hr: row.label_hr,
    label_en: row.label_en,
    target: row.target,
    display_order: row.display_order,
    enabled: row.enabled,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ============================================================
// Public Queries
// ============================================================

/**
 * Get all enabled menu extras, ordered by display_order ASC, created_at ASC
 */
export async function getEnabledExtras(): Promise<MenuExtra[]> {
  const result = await query<MenuExtraRow>(
    `SELECT id, label_hr, label_en, target, display_order, enabled, created_at, updated_at
     FROM menu_extras
     WHERE enabled = true
     ORDER BY display_order ASC, created_at ASC`
  );
  return result.rows.map(rowToMenuExtra);
}

// ============================================================
// Admin Queries
// ============================================================

/**
 * Get all menu extras (for admin)
 */
export async function getAllExtras(): Promise<MenuExtra[]> {
  const result = await query<MenuExtraRow>(
    `SELECT id, label_hr, label_en, target, display_order, enabled, created_at, updated_at
     FROM menu_extras
     ORDER BY display_order ASC, created_at ASC`
  );
  return result.rows.map(rowToMenuExtra);
}

/**
 * Get single menu extra by ID
 */
export async function getExtraById(id: string): Promise<MenuExtra | null> {
  const result = await query<MenuExtraRow>(
    `SELECT id, label_hr, label_en, target, display_order, enabled, created_at, updated_at
     FROM menu_extras
     WHERE id = $1`,
    [id]
  );
  return result.rows.length > 0 ? rowToMenuExtra(result.rows[0]) : null;
}

/**
 * Create a new menu extra
 */
export async function createExtra(input: MenuExtraCreateInput): Promise<MenuExtra> {
  const result = await query<MenuExtraRow>(
    `INSERT INTO menu_extras (label_hr, label_en, target, display_order, enabled)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, label_hr, label_en, target, display_order, enabled, created_at, updated_at`,
    [
      input.label_hr,
      input.label_en,
      input.target,
      input.display_order ?? 0,
      input.enabled ?? true,
    ]
  );
  return rowToMenuExtra(result.rows[0]);
}

/**
 * Update an existing menu extra
 */
export async function updateExtra(
  id: string,
  input: MenuExtraUpdateInput
): Promise<MenuExtra | null> {
  // Build dynamic update query
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.label_hr !== undefined) {
    updates.push(`label_hr = $${paramIndex++}`);
    values.push(input.label_hr);
  }
  if (input.label_en !== undefined) {
    updates.push(`label_en = $${paramIndex++}`);
    values.push(input.label_en);
  }
  if (input.target !== undefined) {
    updates.push(`target = $${paramIndex++}`);
    values.push(input.target);
  }
  if (input.display_order !== undefined) {
    updates.push(`display_order = $${paramIndex++}`);
    values.push(input.display_order);
  }
  if (input.enabled !== undefined) {
    updates.push(`enabled = $${paramIndex++}`);
    values.push(input.enabled);
  }

  if (updates.length === 0) {
    // Nothing to update, return current
    return getExtraById(id);
  }

  // Always update updated_at
  updates.push(`updated_at = now()`);

  // Add id as last parameter
  values.push(id);

  const result = await query<MenuExtraRow>(
    `UPDATE menu_extras
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, label_hr, label_en, target, display_order, enabled, created_at, updated_at`,
    values
  );

  return result.rows.length > 0 ? rowToMenuExtra(result.rows[0]) : null;
}

/**
 * Delete a menu extra
 */
export async function deleteExtra(id: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM menu_extras WHERE id = $1`,
    [id]
  );
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Count total menu extras
 */
export async function countExtras(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM menu_extras`
  );
  return parseInt(result.rows[0].count, 10);
}
