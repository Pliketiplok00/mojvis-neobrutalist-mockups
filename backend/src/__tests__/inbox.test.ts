/**
 * Inbox Routes Tests
 *
 * Integration tests for inbox API endpoints.
 * Note: These tests use mocked database responses.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { inboxRoutes } from '../routes/inbox.js';

// Mock the repository module
vi.mock('../repositories/inbox.js', () => ({
  getInboxMessages: vi.fn(),
  getInboxMessageById: vi.fn(),
  getPotentialBannerMessages: vi.fn(),
}));

import {
  getInboxMessages,
  getInboxMessageById,
  getPotentialBannerMessages,
} from '../repositories/inbox.js';

const mockedGetInboxMessages = vi.mocked(getInboxMessages);
const mockedGetInboxMessageById = vi.mocked(getInboxMessageById);
const mockedGetPotentialBannerMessages = vi.mocked(getPotentialBannerMessages);

describe('Inbox Routes', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify({ logger: false });
    await fastify.register(inboxRoutes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
    vi.restoreAllMocks();
  });

  describe('GET /inbox', () => {
    it('should return paginated inbox messages', async () => {
      mockedGetInboxMessages.mockResolvedValueOnce({
        messages: [
          {
            id: 'test-1',
            title_hr: 'Naslov HR',
            title_en: 'Title EN',
            body_hr: 'Sadržaj HR',
            body_en: 'Body EN',
            tags: ['opcenito'],
            active_from: null,
            active_to: null,
            created_at: new Date('2024-01-15T10:00:00Z'),
            updated_at: new Date('2024-01-15T10:00:00Z'),
            created_by: null,
            deleted_at: null,
            is_locked: false,
            pushed_at: null,
            pushed_by: null,
          },
        ],
        total: 1,
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/inbox',
        headers: {
          'x-device-id': 'test-device',
          'x-user-mode': 'visitor',
        },
      });

      expect(response.statusCode).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = response.json();
      expect(body).toHaveProperty('messages');
      expect(body).toHaveProperty('total', 1);
      expect(body).toHaveProperty('page', 1);
      expect(body).toHaveProperty('has_more', false);
    });

    it('should filter out municipal messages for visitors', async () => {
      mockedGetInboxMessages.mockResolvedValueOnce({
        messages: [
          {
            id: 'general',
            title_hr: 'General',
            title_en: 'General',
            body_hr: 'Body',
            body_en: 'Body',
            tags: ['opcenito'],
            active_from: null,
            active_to: null,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null,
            is_locked: false,
            pushed_at: null,
            pushed_by: null,
          },
          {
            id: 'municipal',
            title_hr: 'Municipal',
            title_en: 'Municipal',
            body_hr: 'Body',
            body_en: 'Body',
            tags: ['vis'],
            active_from: null,
            active_to: null,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null,
            is_locked: false,
            pushed_at: null,
            pushed_by: null,
          },
        ],
        total: 2,
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/inbox',
        headers: {
          'x-device-id': 'test-device',
          'x-user-mode': 'visitor',
        },
      });

      expect(response.statusCode).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.messages).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.messages[0].id).toBe('general');
    });

    it('should show municipal messages to matching locals', async () => {
      mockedGetInboxMessages.mockResolvedValueOnce({
        messages: [
          {
            id: 'vis-message',
            title_hr: 'Vis Only',
            title_en: 'Vis Only',
            body_hr: 'Body',
            body_en: 'Body',
            tags: ['vis'],
            active_from: null,
            active_to: null,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null,
            is_locked: false,
            pushed_at: null,
            pushed_by: null,
          },
        ],
        total: 1,
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/inbox',
        headers: {
          'x-device-id': 'test-device',
          'x-user-mode': 'local',
          'x-municipality': 'vis',
        },
      });

      expect(response.statusCode).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.messages).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.messages[0].id).toBe('vis-message');
    });

    it('should return Croatian content by default', async () => {
      mockedGetInboxMessages.mockResolvedValueOnce({
        messages: [
          {
            id: 'test',
            title_hr: 'Hrvatski naslov',
            title_en: 'English title',
            body_hr: 'Hrvatski sadržaj',
            body_en: 'English body',
            tags: ['opcenito'],
            active_from: null,
            active_to: null,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null,
            is_locked: false,
            pushed_at: null,
            pushed_by: null,
          },
        ],
        total: 1,
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/inbox',
        headers: {
          'x-device-id': 'test-device',
          'x-user-mode': 'visitor',
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.messages[0].title).toBe('Hrvatski naslov');
    });

    it('should return English content when requested', async () => {
      mockedGetInboxMessages.mockResolvedValueOnce({
        messages: [
          {
            id: 'test',
            title_hr: 'Hrvatski naslov',
            title_en: 'English title',
            body_hr: 'Hrvatski sadržaj',
            body_en: 'English body',
            tags: ['opcenito'],
            active_from: null,
            active_to: null,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null,
            is_locked: false,
            pushed_at: null,
            pushed_by: null,
          },
        ],
        total: 1,
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/inbox',
        headers: {
          'x-device-id': 'test-device',
          'x-user-mode': 'visitor',
          'accept-language': 'en-US',
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.messages[0].title).toBe('English title');
    });
  });

  describe('GET /inbox/:id', () => {
    it('should return single message', async () => {
      mockedGetInboxMessageById.mockResolvedValueOnce({
        id: 'test-id',
        title_hr: 'Test',
        title_en: 'Test',
        body_hr: 'Body',
        body_en: 'Body',
        tags: ['opcenito'],
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

      const response = await fastify.inject({
        method: 'GET',
        url: '/inbox/test-id',
        headers: {
          'x-device-id': 'test-device',
          'x-user-mode': 'visitor',
        },
      });

      expect(response.statusCode).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = response.json();
      expect(body).toHaveProperty('id', 'test-id');
    });

    it('should return 404 for non-existent message', async () => {
      mockedGetInboxMessageById.mockResolvedValueOnce(null);

      const response = await fastify.inject({
        method: 'GET',
        url: '/inbox/non-existent',
        headers: {
          'x-device-id': 'test-device',
          'x-user-mode': 'visitor',
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for ineligible message', async () => {
      mockedGetInboxMessageById.mockResolvedValueOnce({
        id: 'municipal-id',
        title_hr: 'Municipal',
        title_en: 'Municipal',
        body_hr: 'Body',
        body_en: 'Body',
        tags: ['vis'],
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

      const response = await fastify.inject({
        method: 'GET',
        url: '/inbox/municipal-id',
        headers: {
          'x-device-id': 'test-device',
          'x-user-mode': 'visitor', // Visitor can't see municipal
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /banners/active', () => {
    it('should return active banners only', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      mockedGetPotentialBannerMessages.mockResolvedValueOnce([
        {
          id: 'active',
          title_hr: 'Active Banner',
          title_en: 'Active Banner',
          body_hr: 'Body',
          body_en: 'Body',
          tags: ['hitno'],
          active_from: yesterday,
          active_to: tomorrow,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: null,
          deleted_at: null,
          is_locked: false,
          pushed_at: null,
          pushed_by: null,
        },
      ]);

      const response = await fastify.inject({
        method: 'GET',
        url: '/banners/active',
        headers: {
          'x-device-id': 'test-device',
          'x-user-mode': 'visitor',
        },
      });

      expect(response.statusCode).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.banners).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.banners[0].id).toBe('active');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.banners[0].is_urgent).toBe(true);
    });

    it('should return empty array when no active banners', async () => {
      mockedGetPotentialBannerMessages.mockResolvedValueOnce([]);

      const response = await fastify.inject({
        method: 'GET',
        url: '/banners/active',
        headers: {
          'x-device-id': 'test-device',
          'x-user-mode': 'visitor',
        },
      });

      expect(response.statusCode).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.banners).toHaveLength(0);
    });
  });
});
