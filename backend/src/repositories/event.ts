/**
 * Event Repository
 *
 * Database access layer for events.
 * Handles CRUD operations and queries.
 */

import { query } from '../lib/database.js';
import type { Event, ReminderSubscription } from '../types/event.js';

interface EventRow {
  id: string;
  title_hr: string;
  title_en: string;
  description_hr: string | null;
  description_en: string | null;
  start_datetime: Date;
  end_datetime: Date | null;
  location_hr: string | null;
  location_en: string | null;
  organizer_hr: string;
  organizer_en: string;
  is_all_day: boolean;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

interface SubscriptionRow {
  id: string;
  device_id: string;
  event_id: string;
  created_at: Date;
}

/**
 * Get paginated list of events
 * Ordered by start_datetime ascending (earliest first)
 */
export async function getEvents(
  page: number = 1,
  pageSize: number = 20
): Promise<{ events: Event[]; total: number }> {
  const offset = (page - 1) * pageSize;

  const countResult = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM events'
  );
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

  const result = await query<EventRow>(
    `SELECT id, title_hr, title_en, description_hr, description_en,
            start_datetime, end_datetime, location_hr, location_en,
            organizer_hr, organizer_en, is_all_day, image_url, created_at, updated_at
     FROM events
     ORDER BY start_datetime ASC
     LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  );

  return {
    events: result.rows.map(rowToEvent),
    total,
  };
}

/**
 * Get events for a specific date (Europe/Zagreb timezone)
 */
export async function getEventsByDate(
  date: string // YYYY-MM-DD format
): Promise<Event[]> {
  const result = await query<EventRow>(
    `SELECT id, title_hr, title_en, description_hr, description_en,
            start_datetime, end_datetime, location_hr, location_en,
            organizer_hr, organizer_en, is_all_day, image_url, created_at, updated_at
     FROM events
     WHERE DATE(start_datetime AT TIME ZONE 'Europe/Zagreb') = $1
     ORDER BY start_datetime ASC`,
    [date]
  );

  return result.rows.map(rowToEvent);
}

/**
 * Get a single event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const result = await query<EventRow>(
    `SELECT id, title_hr, title_en, description_hr, description_en,
            start_datetime, end_datetime, location_hr, location_en,
            organizer_hr, organizer_en, is_all_day, image_url, created_at, updated_at
     FROM events
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToEvent(result.rows[0]);
}

/**
 * Create a new event
 */
export async function createEvent(
  event: Omit<Event, 'id' | 'created_at' | 'updated_at'>
): Promise<Event> {
  const result = await query<EventRow>(
    `INSERT INTO events
       (title_hr, title_en, description_hr, description_en,
        start_datetime, end_datetime, location_hr, location_en,
        organizer_hr, organizer_en, is_all_day, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id, title_hr, title_en, description_hr, description_en,
               start_datetime, end_datetime, location_hr, location_en,
               organizer_hr, organizer_en, is_all_day, image_url, created_at, updated_at`,
    [
      event.title_hr,
      event.title_en,
      event.description_hr,
      event.description_en,
      event.start_datetime,
      event.end_datetime,
      event.location_hr,
      event.location_en,
      event.organizer_hr,
      event.organizer_en,
      event.is_all_day,
      event.image_url,
    ]
  );

  return rowToEvent(result.rows[0]);
}

/**
 * Update an existing event
 */
export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>
): Promise<Event | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.title_hr !== undefined) {
    fields.push(`title_hr = $${paramIndex++}`);
    values.push(updates.title_hr);
  }
  if (updates.title_en !== undefined) {
    fields.push(`title_en = $${paramIndex++}`);
    values.push(updates.title_en);
  }
  if (updates.description_hr !== undefined) {
    fields.push(`description_hr = $${paramIndex++}`);
    values.push(updates.description_hr);
  }
  if (updates.description_en !== undefined) {
    fields.push(`description_en = $${paramIndex++}`);
    values.push(updates.description_en);
  }
  if (updates.start_datetime !== undefined) {
    fields.push(`start_datetime = $${paramIndex++}`);
    values.push(updates.start_datetime);
  }
  if (updates.end_datetime !== undefined) {
    fields.push(`end_datetime = $${paramIndex++}`);
    values.push(updates.end_datetime);
  }
  if (updates.location_hr !== undefined) {
    fields.push(`location_hr = $${paramIndex++}`);
    values.push(updates.location_hr);
  }
  if (updates.location_en !== undefined) {
    fields.push(`location_en = $${paramIndex++}`);
    values.push(updates.location_en);
  }
  if (updates.is_all_day !== undefined) {
    fields.push(`is_all_day = $${paramIndex++}`);
    values.push(updates.is_all_day);
  }
  if (updates.organizer_hr !== undefined) {
    fields.push(`organizer_hr = $${paramIndex++}`);
    values.push(updates.organizer_hr);
  }
  if (updates.organizer_en !== undefined) {
    fields.push(`organizer_en = $${paramIndex++}`);
    values.push(updates.organizer_en);
  }
  if (updates.image_url !== undefined) {
    fields.push(`image_url = $${paramIndex++}`);
    values.push(updates.image_url);
  }

  if (fields.length === 0) {
    return getEventById(id);
  }

  values.push(id);
  const result = await query<EventRow>(
    `UPDATE events
     SET ${fields.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, title_hr, title_en, description_hr, description_en,
               start_datetime, end_datetime, location_hr, location_en,
               organizer_hr, organizer_en, is_all_day, image_url, created_at, updated_at`,
    values
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToEvent(result.rows[0]);
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM events WHERE id = $1',
    [id]
  );

  return (result.rowCount ?? 0) > 0;
}

/**
 * Get dates with events for a given month (Europe/Zagreb timezone)
 * Returns array of date strings in YYYY-MM-DD format
 */
export async function getEventDatesForMonth(
  year: number,
  month: number // 1-12
): Promise<string[]> {
  const result = await query<{ event_date: string }>(
    `SELECT DISTINCT DATE(start_datetime AT TIME ZONE 'Europe/Zagreb')::TEXT as event_date
     FROM events
     WHERE EXTRACT(YEAR FROM start_datetime AT TIME ZONE 'Europe/Zagreb') = $1
       AND EXTRACT(MONTH FROM start_datetime AT TIME ZONE 'Europe/Zagreb') = $2
     ORDER BY event_date`,
    [year, month]
  );

  return result.rows.map(row => row.event_date);
}

// ============================================================
// Reminder Subscriptions
// ============================================================

/**
 * Subscribe a device to event reminders
 */
export async function subscribeToReminder(
  deviceId: string,
  eventId: string
): Promise<ReminderSubscription> {
  const result = await query<SubscriptionRow>(
    `INSERT INTO reminder_subscriptions (device_id, event_id)
     VALUES ($1, $2)
     ON CONFLICT (device_id, event_id) DO UPDATE SET device_id = EXCLUDED.device_id
     RETURNING id, device_id, event_id, created_at`,
    [deviceId, eventId]
  );

  return rowToSubscription(result.rows[0]);
}

/**
 * Unsubscribe a device from event reminders
 */
export async function unsubscribeFromReminder(
  deviceId: string,
  eventId: string
): Promise<boolean> {
  const result = await query(
    'DELETE FROM reminder_subscriptions WHERE device_id = $1 AND event_id = $2',
    [deviceId, eventId]
  );

  return (result.rowCount ?? 0) > 0;
}

/**
 * Check if a device is subscribed to an event
 */
export async function isSubscribed(
  deviceId: string,
  eventId: string
): Promise<boolean> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM reminder_subscriptions
     WHERE device_id = $1 AND event_id = $2`,
    [deviceId, eventId]
  );

  return parseInt(result.rows[0]?.count ?? '0', 10) > 0;
}

/**
 * Get all subscriptions for events on a specific date
 * Used by reminder generation job
 */
export async function getSubscriptionsForDate(
  date: string // YYYY-MM-DD format
): Promise<Array<{ device_id: string; event: Event }>> {
  const result = await query<SubscriptionRow & EventRow>(
    `SELECT rs.id, rs.device_id, rs.event_id, rs.created_at,
            e.id as event_id, e.title_hr, e.title_en,
            e.description_hr, e.description_en,
            e.start_datetime, e.end_datetime,
            e.location_hr, e.location_en, e.organizer_hr, e.organizer_en,
            e.is_all_day, e.image_url,
            e.created_at as event_created_at, e.updated_at as event_updated_at
     FROM reminder_subscriptions rs
     JOIN events e ON rs.event_id = e.id
     WHERE DATE(e.start_datetime AT TIME ZONE 'Europe/Zagreb') = $1`,
    [date]
  );

  return result.rows.map(row => ({
    device_id: row.device_id,
    event: {
      id: row.event_id,
      title_hr: row.title_hr,
      title_en: row.title_en,
      description_hr: row.description_hr,
      description_en: row.description_en,
      start_datetime: row.start_datetime,
      end_datetime: row.end_datetime,
      location_hr: row.location_hr,
      location_en: row.location_en,
      organizer_hr: row.organizer_hr,
      organizer_en: row.organizer_en,
      is_all_day: row.is_all_day,
      image_url: row.image_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  }));
}

/**
 * Convert database row to Event type
 */
function rowToEvent(row: EventRow): Event {
  return {
    id: row.id,
    title_hr: row.title_hr,
    title_en: row.title_en,
    description_hr: row.description_hr,
    description_en: row.description_en,
    start_datetime: row.start_datetime,
    end_datetime: row.end_datetime,
    location_hr: row.location_hr,
    location_en: row.location_en,
    organizer_hr: row.organizer_hr,
    organizer_en: row.organizer_en,
    is_all_day: row.is_all_day,
    image_url: row.image_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Convert database row to ReminderSubscription type
 */
function rowToSubscription(row: SubscriptionRow): ReminderSubscription {
  return {
    id: row.id,
    device_id: row.device_id,
    event_id: row.event_id,
    created_at: row.created_at,
  };
}
