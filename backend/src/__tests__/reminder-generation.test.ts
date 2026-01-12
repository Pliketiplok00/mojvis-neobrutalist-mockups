/**
 * Reminder Generation Job Tests
 *
 * Tests for the reminder generation job.
 * Note: These tests use mocked database responses.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateReminders } from '../jobs/reminder-generation.js';

// Mock the repositories
vi.mock('../repositories/event.js', () => ({
  getSubscriptionsForDate: vi.fn(),
}));

vi.mock('../repositories/inbox.js', () => ({
  createInboxMessage: vi.fn(),
}));

import { getSubscriptionsForDate } from '../repositories/event.js';
import { createInboxMessage } from '../repositories/inbox.js';

const mockedGetSubscriptionsForDate = vi.mocked(getSubscriptionsForDate);
const mockedCreateInboxMessage = vi.mocked(createInboxMessage);

function createMockEvent(overrides = {}) {
  return {
    id: 'event-1',
    title_hr: 'Koncert u Komiži',
    title_en: 'Concert in Komiža',
    description_hr: 'Opis koncerta',
    description_en: 'Concert description',
    start_datetime: new Date('2024-07-15T19:00:00+02:00'),
    end_datetime: new Date('2024-07-15T22:00:00+02:00'),
    location_hr: 'Trg u Komiži',
    location_en: 'Komiža Square',
    is_all_day: false,
    image_url: null,
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-15T10:00:00Z'),
    ...overrides,
  };
}

describe('Reminder Generation Job', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate no reminders when no subscriptions exist', async () => {
    mockedGetSubscriptionsForDate.mockResolvedValueOnce([]);

    const count = await generateReminders('2024-07-15');

    expect(count).toBe(0);
    expect(mockedCreateInboxMessage).not.toHaveBeenCalled();
  });

  it('should generate one reminder per subscription', async () => {
    mockedGetSubscriptionsForDate.mockResolvedValueOnce([
      { device_id: 'device-1', event: createMockEvent() },
      { device_id: 'device-2', event: createMockEvent() },
    ]);

    mockedCreateInboxMessage.mockResolvedValue({
      id: 'msg-1',
      title_hr: 'Podsjetnik',
      title_en: 'Reminder',
      body_hr: 'Body',
      body_en: 'Body',
      tags: ['kultura'],
      active_from: null,
      active_to: null,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: null,
      deleted_at: null,
      is_locked: false,
      pushed_at: null,
      pushed_by: null,
    });

    const count = await generateReminders('2024-07-15');

    expect(count).toBe(2);
    expect(mockedCreateInboxMessage).toHaveBeenCalledTimes(2);
  });

  it('should create inbox message with correct HR title format', async () => {
    mockedGetSubscriptionsForDate.mockResolvedValueOnce([
      { device_id: 'device-1', event: createMockEvent() },
    ]);

    mockedCreateInboxMessage.mockResolvedValue({
      id: 'msg-1',
      title_hr: 'Podsjetnik: Koncert u Komiži',
      title_en: 'Reminder: Concert in Komiža',
      body_hr: 'Body',
      body_en: 'Body',
      tags: ['kultura'],
      active_from: null,
      active_to: null,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: null,
      deleted_at: null,
      is_locked: false,
      pushed_at: null,
      pushed_by: null,
    });

    await generateReminders('2024-07-15');

    expect(mockedCreateInboxMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        title_hr: 'Podsjetnik: Koncert u Komiži',
        title_en: 'Reminder: Concert in Komiža',
        tags: ['kultura'],
      })
    );
  });

  it('should include location in body when provided', async () => {
    mockedGetSubscriptionsForDate.mockResolvedValueOnce([
      {
        device_id: 'device-1',
        event: createMockEvent({
          location_hr: 'Trg u Komiži',
          location_en: 'Komiža Square',
        }),
      },
    ]);

    mockedCreateInboxMessage.mockResolvedValue({
      id: 'msg-1',
      title_hr: 'Podsjetnik',
      title_en: 'Reminder',
      body_hr: 'Body',
      body_en: 'Body',
      tags: ['kultura'],
      active_from: null,
      active_to: null,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: null,
      deleted_at: null,
      is_locked: false,
      pushed_at: null,
      pushed_by: null,
    });

    await generateReminders('2024-07-15');

    expect(mockedCreateInboxMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        body_hr: expect.stringContaining('Lokacija: Trg u Komiži'),
        body_en: expect.stringContaining('Location: Komiža Square'),
      })
    );
  });

  it('should handle all-day events correctly', async () => {
    mockedGetSubscriptionsForDate.mockResolvedValueOnce([
      {
        device_id: 'device-1',
        event: createMockEvent({ is_all_day: true }),
      },
    ]);

    mockedCreateInboxMessage.mockResolvedValue({
      id: 'msg-1',
      title_hr: 'Podsjetnik',
      title_en: 'Reminder',
      body_hr: 'Danas Cijeli dan',
      body_en: 'Today All day',
      tags: ['kultura'],
      active_from: null,
      active_to: null,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: null,
      deleted_at: null,
      is_locked: false,
      pushed_at: null,
      pushed_by: null,
    });

    await generateReminders('2024-07-15');

    expect(mockedCreateInboxMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        body_hr: expect.stringContaining('Cijeli dan'),
        body_en: expect.stringContaining('All day'),
      })
    );
  });

  it('should continue processing even if one reminder fails', async () => {
    mockedGetSubscriptionsForDate.mockResolvedValueOnce([
      { device_id: 'device-1', event: createMockEvent({ id: 'event-1' }) },
      { device_id: 'device-2', event: createMockEvent({ id: 'event-2' }) },
      { device_id: 'device-3', event: createMockEvent({ id: 'event-3' }) },
    ]);

    mockedCreateInboxMessage
      .mockRejectedValueOnce(new Error('DB error'))
      .mockResolvedValueOnce({
        id: 'msg-2',
        title_hr: 'Podsjetnik',
        title_en: 'Reminder',
        body_hr: 'Body',
        body_en: 'Body',
        tags: ['kultura'],
        active_from: null,
        active_to: null,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: null,
        deleted_at: null,
        is_locked: false,
        pushed_at: null,
        pushed_by: null,
      })
      .mockResolvedValueOnce({
        id: 'msg-3',
        title_hr: 'Podsjetnik',
        title_en: 'Reminder',
        body_hr: 'Body',
        body_en: 'Body',
        tags: ['kultura'],
        active_from: null,
        active_to: null,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: null,
        deleted_at: null,
        is_locked: false,
        pushed_at: null,
        pushed_by: null,
      });

    const count = await generateReminders('2024-07-15');

    // Should have processed 2 successfully even though 1 failed
    expect(count).toBe(2);
    expect(mockedCreateInboxMessage).toHaveBeenCalledTimes(3);
  });

  it('should track event source in created_by field', async () => {
    mockedGetSubscriptionsForDate.mockResolvedValueOnce([
      { device_id: 'device-1', event: createMockEvent({ id: 'event-xyz' }) },
    ]);

    mockedCreateInboxMessage.mockResolvedValue({
      id: 'msg-1',
      title_hr: 'Podsjetnik',
      title_en: 'Reminder',
      body_hr: 'Body',
      body_en: 'Body',
      tags: ['kultura'],
      active_from: null,
      active_to: null,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'reminder:event-xyz',
      deleted_at: null,
      is_locked: false,
      pushed_at: null,
      pushed_by: null,
    });

    await generateReminders('2024-07-15');

    expect(mockedCreateInboxMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        created_by: 'reminder:event-xyz',
      })
    );
  });
});
