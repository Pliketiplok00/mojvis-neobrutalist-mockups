/**
 * Eligibility Logic Tests
 *
 * Tests for server-side eligibility filtering logic.
 */

import { describe, it, expect } from 'vitest';
import {
  isMessageEligible,
  isBannerEligible,
  isWithinActiveWindow,
  filterEligibleMessages,
  filterBannerEligibleMessages,
} from '../lib/eligibility.js';
import type { InboxMessage, UserContext } from '../types/inbox.js';

// Helper to create test messages
function createMessage(
  overrides: Partial<InboxMessage> = {}
): InboxMessage {
  return {
    id: 'test-id',
    title_hr: 'Test Title HR',
    title_en: 'Test Title EN',
    body_hr: 'Test Body HR',
    body_en: 'Test Body EN',
    tags: [],
    active_from: null,
    active_to: null,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: null,
    deleted_at: null,
    ...overrides,
  };
}

// Helper to create user contexts
function createContext(
  overrides: Partial<UserContext> = {}
): UserContext {
  return {
    deviceId: 'test-device',
    userMode: 'visitor',
    municipality: null,
    ...overrides,
  };
}

describe('isMessageEligible', () => {
  it('should allow general messages for visitors', () => {
    const message = createMessage({ tags: ['opcenito'] });
    const context = createContext({ userMode: 'visitor' });

    expect(isMessageEligible(message, context)).toBe(true);
  });

  it('should allow general messages for locals', () => {
    const message = createMessage({ tags: ['opcenito'] });
    const context = createContext({ userMode: 'local', municipality: 'vis' });

    expect(isMessageEligible(message, context)).toBe(true);
  });

  it('should deny municipal messages to visitors', () => {
    const message = createMessage({ tags: ['vis'] });
    const context = createContext({ userMode: 'visitor' });

    expect(isMessageEligible(message, context)).toBe(false);
  });

  it('should deny municipal messages to wrong municipality', () => {
    const message = createMessage({ tags: ['vis'] });
    const context = createContext({ userMode: 'local', municipality: 'komiza' });

    expect(isMessageEligible(message, context)).toBe(false);
  });

  it('should allow municipal messages to matching municipality', () => {
    const message = createMessage({ tags: ['vis'] });
    const context = createContext({ userMode: 'local', municipality: 'vis' });

    expect(isMessageEligible(message, context)).toBe(true);
  });

  it('should allow komiza messages to komiza locals', () => {
    const message = createMessage({ tags: ['komiza'] });
    const context = createContext({ userMode: 'local', municipality: 'komiza' });

    expect(isMessageEligible(message, context)).toBe(true);
  });

  it('should allow emergency messages to everyone', () => {
    const message = createMessage({ tags: ['hitno'] });
    const visitor = createContext({ userMode: 'visitor' });
    const local = createContext({ userMode: 'local', municipality: 'vis' });

    expect(isMessageEligible(message, visitor)).toBe(true);
    expect(isMessageEligible(message, local)).toBe(true);
  });

  it('should allow transport messages to everyone', () => {
    const message = createMessage({ tags: ['cestovni_promet'] });
    const visitor = createContext({ userMode: 'visitor' });
    const local = createContext({ userMode: 'local', municipality: 'vis' });

    expect(isMessageEligible(message, visitor)).toBe(true);
    expect(isMessageEligible(message, local)).toBe(true);
  });
});

describe('isWithinActiveWindow', () => {
  it('should return false if no active window', () => {
    const message = createMessage({ active_from: null, active_to: null });

    expect(isWithinActiveWindow(message)).toBe(false);
  });

  it('should return true if within window', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const message = createMessage({
      active_from: yesterday,
      active_to: tomorrow,
    });

    expect(isWithinActiveWindow(message, now)).toBe(true);
  });

  it('should return false if before window starts', () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const message = createMessage({
      active_from: tomorrow,
      active_to: nextWeek,
    });

    expect(isWithinActiveWindow(message, now)).toBe(false);
  });

  it('should return false if after window ends', () => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const message = createMessage({
      active_from: lastWeek,
      active_to: yesterday,
    });

    expect(isWithinActiveWindow(message, now)).toBe(false);
  });

  it('should handle open-ended from (only to defined)', () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const message = createMessage({
      active_from: null,
      active_to: tomorrow,
    });

    expect(isWithinActiveWindow(message, now)).toBe(true);
  });

  it('should handle open-ended to (only from defined)', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const message = createMessage({
      active_from: yesterday,
      active_to: null,
    });

    expect(isWithinActiveWindow(message, now)).toBe(true);
  });
});

describe('isBannerEligible', () => {
  it('should require both eligibility and active window', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Eligible but no active window
    const noWindow = createMessage({ tags: ['opcenito'] });
    const context = createContext({ userMode: 'visitor' });

    expect(isBannerEligible(noWindow, context, now)).toBe(false);

    // Has active window and eligible
    const withWindow = createMessage({
      tags: ['opcenito'],
      active_from: yesterday,
      active_to: tomorrow,
    });

    expect(isBannerEligible(withWindow, context, now)).toBe(true);
  });

  it('should deny banner for ineligible message even with active window', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const message = createMessage({
      tags: ['vis'],
      active_from: yesterday,
      active_to: tomorrow,
    });

    const visitor = createContext({ userMode: 'visitor' });

    expect(isBannerEligible(message, visitor, now)).toBe(false);
  });
});

describe('filterEligibleMessages', () => {
  it('should filter out ineligible messages', () => {
    const messages = [
      createMessage({ id: '1', tags: ['opcenito'] }),
      createMessage({ id: '2', tags: ['vis'] }),
      createMessage({ id: '3', tags: ['hitno'] }),
      createMessage({ id: '4', tags: ['komiza'] }),
    ];

    const visitor = createContext({ userMode: 'visitor' });
    const visLocal = createContext({ userMode: 'local', municipality: 'vis' });

    const visitorResult = filterEligibleMessages(messages, visitor);
    expect(visitorResult.map((m) => m.id)).toEqual(['1', '3']);

    const localResult = filterEligibleMessages(messages, visLocal);
    expect(localResult.map((m) => m.id)).toEqual(['1', '2', '3']);
  });
});

describe('filterBannerEligibleMessages', () => {
  it('should only return active banner-eligible messages', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const messages = [
      createMessage({ id: '1', tags: ['opcenito'], active_from: yesterday, active_to: tomorrow }), // Active
      createMessage({ id: '2', tags: ['opcenito'], active_from: null, active_to: null }), // No window
      createMessage({ id: '3', tags: ['opcenito'], active_from: lastWeek, active_to: yesterday }), // Expired
      createMessage({ id: '4', tags: ['vis'], active_from: yesterday, active_to: tomorrow }), // Active but municipal
    ];

    const visitor = createContext({ userMode: 'visitor' });
    const result = filterBannerEligibleMessages(messages, visitor, now);

    expect(result.map((m) => m.id)).toEqual(['1']);
  });
});
