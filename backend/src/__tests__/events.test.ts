/**
 * Events Routes Tests
 *
 * Integration tests for event API endpoints.
 * Note: These tests use mocked database responses.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { eventRoutes } from '../routes/events.js';

// Mock the repository module
vi.mock('../repositories/event.js', () => ({
  getEvents: vi.fn(),
  getEventsByDate: vi.fn(),
  getEventById: vi.fn(),
  getEventDatesForMonth: vi.fn(),
  subscribeToReminder: vi.fn(),
  unsubscribeFromReminder: vi.fn(),
  isSubscribed: vi.fn(),
}));

import {
  getEvents,
  getEventsByDate,
  getEventById,
  getEventDatesForMonth,
  subscribeToReminder,
  unsubscribeFromReminder,
  isSubscribed,
} from '../repositories/event.js';

const mockedGetEvents = vi.mocked(getEvents);
const mockedGetEventsByDate = vi.mocked(getEventsByDate);
const mockedGetEventById = vi.mocked(getEventById);
const mockedGetEventDatesForMonth = vi.mocked(getEventDatesForMonth);
const mockedSubscribeToReminder = vi.mocked(subscribeToReminder);
const mockedUnsubscribeFromReminder = vi.mocked(unsubscribeFromReminder);
const mockedIsSubscribed = vi.mocked(isSubscribed);

function createMockEvent(overrides = {}) {
  return {
    id: 'event-1',
    title_hr: 'Koncert u Komiži',
    title_en: 'Concert in Komiža',
    description_hr: 'Opis koncerta',
    description_en: 'Concert description',
    start_datetime: new Date('2024-07-15T19:00:00Z'),
    end_datetime: new Date('2024-07-15T22:00:00Z'),
    location_hr: 'Trg u Komiži',
    location_en: 'Komiža Square',
    organizer_hr: 'Grad Vis',
    organizer_en: 'Municipality of Vis',
    is_all_day: false,
    image_url: null,
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-15T10:00:00Z'),
    ...overrides,
  };
}

describe('Events Routes', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify({ logger: false });
    await fastify.register(eventRoutes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
    vi.restoreAllMocks();
  });

  describe('GET /events', () => {
    it('should return paginated events', async () => {
      mockedGetEvents.mockResolvedValueOnce({
        events: [createMockEvent()],
        total: 1,
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/events',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('events');
      expect(body).toHaveProperty('total', 1);
      expect(body).toHaveProperty('page', 1);
      expect(body).toHaveProperty('has_more', false);
    });

    it('should return Croatian content by default', async () => {
      mockedGetEvents.mockResolvedValueOnce({
        events: [createMockEvent()],
        total: 1,
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/events',
      });

      const body = response.json();
      expect(body.events[0].title).toBe('Koncert u Komiži');
    });

    it('should return English content when requested', async () => {
      mockedGetEvents.mockResolvedValueOnce({
        events: [createMockEvent()],
        total: 1,
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/events',
        headers: {
          'accept-language': 'en-US',
        },
      });

      const body = response.json();
      expect(body.events[0].title).toBe('Concert in Komiža');
    });

    it('should filter events by date', async () => {
      const event = createMockEvent();
      mockedGetEventsByDate.mockResolvedValueOnce([event]);

      const response = await fastify.inject({
        method: 'GET',
        url: '/events?date=2024-07-15',
      });

      expect(response.statusCode).toBe(200);
      expect(mockedGetEventsByDate).toHaveBeenCalledWith('2024-07-15');
      const body = response.json();
      expect(body.events).toHaveLength(1);
    });
  });

  describe('GET /events/dates', () => {
    it('should return dates with events for a month', async () => {
      mockedGetEventDatesForMonth.mockResolvedValueOnce([
        '2024-07-15',
        '2024-07-20',
        '2024-07-25',
      ]);

      const response = await fastify.inject({
        method: 'GET',
        url: '/events/dates?year=2024&month=7',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.dates).toEqual(['2024-07-15', '2024-07-20', '2024-07-25']);
    });

    it('should reject invalid month', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/events/dates?year=2024&month=13',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /events/:id', () => {
    it('should return single event', async () => {
      mockedGetEventById.mockResolvedValueOnce(createMockEvent());

      const response = await fastify.inject({
        method: 'GET',
        url: '/events/event-1',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('id', 'event-1');
    });

    it('should return 404 for non-existent event', async () => {
      mockedGetEventById.mockResolvedValueOnce(null);

      const response = await fastify.inject({
        method: 'GET',
        url: '/events/non-existent',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /events/:id/subscribe', () => {
    it('should subscribe to event reminder', async () => {
      mockedGetEventById.mockResolvedValueOnce(createMockEvent());
      mockedSubscribeToReminder.mockResolvedValueOnce({
        id: 'sub-1',
        device_id: 'device-123',
        event_id: 'event-1',
        created_at: new Date(),
      });

      const response = await fastify.inject({
        method: 'POST',
        url: '/events/event-1/subscribe',
        headers: {
          'x-device-id': 'device-123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toEqual({ subscribed: true });
    });

    it('should require device ID header', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/events/event-1/subscribe',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 404 for non-existent event', async () => {
      mockedGetEventById.mockResolvedValueOnce(null);

      const response = await fastify.inject({
        method: 'POST',
        url: '/events/non-existent/subscribe',
        headers: {
          'x-device-id': 'device-123',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /events/:id/subscribe', () => {
    it('should unsubscribe from event reminder', async () => {
      mockedUnsubscribeFromReminder.mockResolvedValueOnce(true);

      const response = await fastify.inject({
        method: 'DELETE',
        url: '/events/event-1/subscribe',
        headers: {
          'x-device-id': 'device-123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toEqual({ subscribed: false });
    });

    it('should require device ID header', async () => {
      const response = await fastify.inject({
        method: 'DELETE',
        url: '/events/event-1/subscribe',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /events/:id/subscription', () => {
    it('should return subscription status (subscribed)', async () => {
      mockedIsSubscribed.mockResolvedValueOnce(true);

      const response = await fastify.inject({
        method: 'GET',
        url: '/events/event-1/subscription',
        headers: {
          'x-device-id': 'device-123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toEqual({ subscribed: true });
    });

    it('should return subscription status (not subscribed)', async () => {
      mockedIsSubscribed.mockResolvedValueOnce(false);

      const response = await fastify.inject({
        method: 'GET',
        url: '/events/event-1/subscription',
        headers: {
          'x-device-id': 'device-123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toEqual({ subscribed: false });
    });

    it('should require device ID header', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/events/event-1/subscription',
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
