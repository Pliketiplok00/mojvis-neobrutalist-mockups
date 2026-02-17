/**
 * Public Service Repository
 *
 * Database access layer for public services.
 * Handles CRUD operations and queries.
 */

import { query } from '../lib/database.js';
import type {
  PublicService,
  PublicServiceRow,
  PublicServiceAdminResponse,
  CreatePublicServiceInput,
  UpdatePublicServiceInput,
  Contact,
  WorkingHours,
  ScheduledDate,
  ServiceLocation,
} from '../types/public-service.js';

/**
 * Parse JSONB field that may come as string or object
 */
function parseJsonField<T>(value: T | string): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return [] as unknown as T;
    }
  }
  return value;
}

/**
 * Convert database row to PublicService
 */
function rowToService(row: PublicServiceRow): PublicService {
  return {
    ...row,
    contacts: parseJsonField<Contact[]>(row.contacts),
    working_hours: parseJsonField<WorkingHours[]>(row.working_hours),
    scheduled_dates: parseJsonField<ScheduledDate[]>(row.scheduled_dates),
    locations: parseJsonField<ServiceLocation[]>(row.locations),
  };
}

/**
 * Convert PublicService to admin response
 */
function toAdminResponse(service: PublicService): PublicServiceAdminResponse {
  return {
    id: service.id,
    type: service.type,
    title_hr: service.title_hr,
    title_en: service.title_en,
    subtitle_hr: service.subtitle_hr,
    subtitle_en: service.subtitle_en,
    address: service.address,
    contacts: service.contacts,
    icon: service.icon,
    icon_bg_color: service.icon_bg_color,
    working_hours: service.working_hours,
    scheduled_dates: service.scheduled_dates,
    locations: service.locations,
    note_hr: service.note_hr,
    note_en: service.note_en,
    order_index: service.order_index,
    is_active: service.is_active,
    created_at: service.created_at.toISOString(),
    updated_at: service.updated_at.toISOString(),
  };
}

/**
 * Get all public services
 * @param activeOnly - If true, only return active services
 */
export async function getAllPublicServices(
  activeOnly = true
): Promise<PublicServiceAdminResponse[]> {
  const whereClause = activeOnly ? 'WHERE is_active = true' : '';

  const result = await query<PublicServiceRow>(
    `SELECT * FROM public_services ${whereClause} ORDER BY order_index ASC`
  );

  return result.rows.map((row) => toAdminResponse(rowToService(row)));
}

/**
 * Get a single public service by ID
 */
export async function getPublicServiceById(
  id: string
): Promise<PublicServiceAdminResponse | null> {
  const result = await query<PublicServiceRow>(
    'SELECT * FROM public_services WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return toAdminResponse(rowToService(result.rows[0]));
}

/**
 * Create a new public service
 */
export async function createPublicService(
  input: CreatePublicServiceInput
): Promise<PublicServiceAdminResponse> {
  const result = await query<PublicServiceRow>(
    `INSERT INTO public_services (
      type, title_hr, title_en, subtitle_hr, subtitle_en,
      address, contacts, icon, icon_bg_color,
      working_hours, scheduled_dates, note_hr, note_en, order_index
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *`,
    [
      input.type,
      input.title_hr,
      input.title_en,
      input.subtitle_hr ?? null,
      input.subtitle_en ?? null,
      input.address ?? null,
      JSON.stringify(input.contacts ?? []),
      input.icon,
      input.icon_bg_color,
      JSON.stringify(input.working_hours ?? []),
      JSON.stringify(input.scheduled_dates ?? []),
      input.note_hr ?? null,
      input.note_en ?? null,
      input.order_index ?? 0,
    ]
  );

  return toAdminResponse(rowToService(result.rows[0]));
}

/**
 * Update an existing public service
 */
export async function updatePublicService(
  id: string,
  input: UpdatePublicServiceInput
): Promise<PublicServiceAdminResponse | null> {
  // First get existing record
  const existing = await query<PublicServiceRow>(
    'SELECT * FROM public_services WHERE id = $1',
    [id]
  );

  if (existing.rows.length === 0) {
    return null;
  }

  const current = rowToService(existing.rows[0]);

  // Merge with existing data
  const updated = {
    type: input.type ?? current.type,
    title_hr: input.title_hr ?? current.title_hr,
    title_en: input.title_en ?? current.title_en,
    subtitle_hr: input.subtitle_hr !== undefined ? input.subtitle_hr : current.subtitle_hr,
    subtitle_en: input.subtitle_en !== undefined ? input.subtitle_en : current.subtitle_en,
    address: input.address !== undefined ? input.address : current.address,
    contacts: input.contacts ?? current.contacts,
    icon: input.icon ?? current.icon,
    icon_bg_color: input.icon_bg_color ?? current.icon_bg_color,
    working_hours: input.working_hours ?? current.working_hours,
    scheduled_dates: input.scheduled_dates ?? current.scheduled_dates,
    note_hr: input.note_hr !== undefined ? input.note_hr : current.note_hr,
    note_en: input.note_en !== undefined ? input.note_en : current.note_en,
    order_index: input.order_index ?? current.order_index,
    is_active: input.is_active ?? current.is_active,
  };

  const result = await query<PublicServiceRow>(
    `UPDATE public_services SET
      type = $1, title_hr = $2, title_en = $3, subtitle_hr = $4, subtitle_en = $5,
      address = $6, contacts = $7, icon = $8, icon_bg_color = $9,
      working_hours = $10, scheduled_dates = $11, note_hr = $12, note_en = $13,
      order_index = $14, is_active = $15, updated_at = NOW()
    WHERE id = $16
    RETURNING *`,
    [
      updated.type,
      updated.title_hr,
      updated.title_en,
      updated.subtitle_hr,
      updated.subtitle_en,
      updated.address,
      JSON.stringify(updated.contacts),
      updated.icon,
      updated.icon_bg_color,
      JSON.stringify(updated.working_hours),
      JSON.stringify(updated.scheduled_dates),
      updated.note_hr,
      updated.note_en,
      updated.order_index,
      updated.is_active,
      id,
    ]
  );

  return toAdminResponse(rowToService(result.rows[0]));
}

/**
 * Delete a public service (soft delete)
 */
export async function deletePublicService(id: string): Promise<boolean> {
  const result = await query(
    'UPDATE public_services SET is_active = false, updated_at = NOW() WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Reorder public services
 * @param orderedIds - Array of service IDs in desired order
 */
export async function reorderPublicServices(orderedIds: string[]): Promise<void> {
  // Use a transaction for atomicity
  for (let i = 0; i < orderedIds.length; i++) {
    await query(
      'UPDATE public_services SET order_index = $1, updated_at = NOW() WHERE id = $2',
      [i, orderedIds[i]]
    );
  }
}

/**
 * Restore a soft-deleted public service
 */
export async function restorePublicService(id: string): Promise<boolean> {
  const result = await query(
    'UPDATE public_services SET is_active = true, updated_at = NOW() WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
