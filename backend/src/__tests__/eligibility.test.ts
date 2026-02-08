/**
 * Eligibility Logic Tests (Phase 2)
 *
 * Tests for server-side eligibility filtering logic.
 *
 * Phase 2 Banner Rules:
 * - ONLY messages with "hitno" + context tag can be banners
 * - "hitno" alone is INVALID
 * - active_from AND active_to BOTH required
 * - Screen contexts: home, events, transport
 * - Cap: max 3 banners per screen
 * - Order: active_from DESC, created_at DESC
 */

import { describe, it, expect } from 'vitest';
import {
  isMessageEligible,
  isBannerEligible,
  isWithinActiveWindow,
  isValidBannerTagCombination,
  filterBannerEligibleMessages,
  isBannerForScreen,
  filterBannersByScreen,
  getBannersForScreen,
  BANNER_CAP,
} from '../lib/eligibility.js';
import { normalizeTags } from '../types/inbox.js';
import type { InboxMessage, UserContext, InboxTag } from '../types/inbox.js';

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
    // Package 2: Draft/Publish fields
    published_at: new Date(),
    published_by: null,
    // Phase 7: Push notification fields
    is_locked: false,
    pushed_at: null,
    pushed_by: null,
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

// Helper to create valid banner message
function createBannerMessage(
  contextTag: InboxTag,
  overrides: Partial<InboxMessage> = {}
): InboxMessage {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return createMessage({
    tags: ['hitno', contextTag],
    active_from: yesterday,
    active_to: tomorrow,
    ...overrides,
  });
}

describe('normalizeTags', () => {
  it('should normalize cestovni_promet to promet', () => {
    const tags: InboxTag[] = ['cestovni_promet'];
    expect(normalizeTags(tags)).toEqual(['promet']);
  });

  it('should normalize pomorski_promet to promet', () => {
    const tags: InboxTag[] = ['pomorski_promet'];
    expect(normalizeTags(tags)).toEqual(['promet']);
  });

  it('should normalize hitno + cestovni_promet to hitno + promet', () => {
    const tags: InboxTag[] = ['hitno', 'cestovni_promet'];
    expect(normalizeTags(tags)).toEqual(['hitno', 'promet']);
  });

  it('should NOT duplicate promet if both transport tags present', () => {
    const tags: InboxTag[] = ['cestovni_promet', 'pomorski_promet'];
    expect(normalizeTags(tags)).toEqual(['promet']);
  });

  it('should leave non-transport tags unchanged', () => {
    const tags: InboxTag[] = ['hitno', 'kultura'];
    expect(normalizeTags(tags)).toEqual(['hitno', 'kultura']);
  });

  it('should not modify promet if already present', () => {
    const tags: InboxTag[] = ['hitno', 'promet'];
    expect(normalizeTags(tags)).toEqual(['hitno', 'promet']);
  });
});

describe('isValidBannerTagCombination (Phase 2)', () => {
  it('should reject message without hitno', () => {
    expect(isValidBannerTagCombination(['opcenito'])).toBe(false);
    expect(isValidBannerTagCombination(['promet'])).toBe(false);
    expect(isValidBannerTagCombination(['kultura'])).toBe(false);
  });

  it('should reject hitno alone (no context tag)', () => {
    expect(isValidBannerTagCombination(['hitno'])).toBe(false);
  });

  it('should accept hitno + promet', () => {
    expect(isValidBannerTagCombination(['hitno', 'promet'])).toBe(true);
  });

  it('should accept hitno + kultura', () => {
    expect(isValidBannerTagCombination(['hitno', 'kultura'])).toBe(true);
  });

  it('should accept hitno + opcenito', () => {
    expect(isValidBannerTagCombination(['hitno', 'opcenito'])).toBe(true);
  });

  it('should accept hitno + vis', () => {
    expect(isValidBannerTagCombination(['hitno', 'vis'])).toBe(true);
  });

  it('should accept hitno + komiza', () => {
    expect(isValidBannerTagCombination(['hitno', 'komiza'])).toBe(true);
  });

  it('should reject more than 2 tags', () => {
    expect(isValidBannerTagCombination(['hitno', 'promet', 'kultura'])).toBe(false);
  });
});

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

  it('should allow hitno + municipal to matching local', () => {
    const message = createMessage({ tags: ['hitno', 'vis'] });
    const context = createContext({ userMode: 'local', municipality: 'vis' });
    expect(isMessageEligible(message, context)).toBe(true);
  });

  it('should deny hitno + municipal to visitor', () => {
    const message = createMessage({ tags: ['hitno', 'vis'] });
    const context = createContext({ userMode: 'visitor' });
    expect(isMessageEligible(message, context)).toBe(false);
  });

  it('should allow promet messages to everyone', () => {
    const message = createMessage({ tags: ['promet'] });
    const visitor = createContext({ userMode: 'visitor' });
    const local = createContext({ userMode: 'local', municipality: 'vis' });
    expect(isMessageEligible(message, visitor)).toBe(true);
    expect(isMessageEligible(message, local)).toBe(true);
  });

  it('should handle deprecated transport tags (backward compatibility)', () => {
    const roadMessage = createMessage({ tags: ['cestovni_promet'] });
    const seaMessage = createMessage({ tags: ['pomorski_promet'] });
    const context = createContext({ userMode: 'visitor' });
    expect(isMessageEligible(roadMessage, context)).toBe(true);
    expect(isMessageEligible(seaMessage, context)).toBe(true);
  });
});

describe('isWithinActiveWindow (Phase 2)', () => {
  it('should return false if no active window', () => {
    const message = createMessage({ active_from: null, active_to: null });
    expect(isWithinActiveWindow(message)).toBe(false);
  });

  it('should return false if only active_from is set (Phase 2: both required)', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const message = createMessage({ active_from: yesterday, active_to: null });
    expect(isWithinActiveWindow(message, now)).toBe(false);
  });

  it('should return false if only active_to is set (Phase 2: both required)', () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const message = createMessage({ active_from: null, active_to: tomorrow });
    expect(isWithinActiveWindow(message, now)).toBe(false);
  });

  it('should return true if within window (both boundaries set)', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const message = createMessage({ active_from: yesterday, active_to: tomorrow });
    expect(isWithinActiveWindow(message, now)).toBe(true);
  });

  it('should return false if before window starts', () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const message = createMessage({ active_from: tomorrow, active_to: nextWeek });
    expect(isWithinActiveWindow(message, now)).toBe(false);
  });

  it('should return false if after window ends', () => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const message = createMessage({ active_from: lastWeek, active_to: yesterday });
    expect(isWithinActiveWindow(message, now)).toBe(false);
  });

  it('should be inclusive at boundaries', () => {
    const now = new Date();
    const fromTime = new Date(now);
    const toTime = new Date(now);
    const message = createMessage({ active_from: fromTime, active_to: toTime });
    expect(isWithinActiveWindow(message, now)).toBe(true);
  });
});

describe('isBannerEligible (Phase 2)', () => {
  it('should reject message without hitno tag', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const message = createMessage({
      tags: ['opcenito'],
      active_from: yesterday,
      active_to: tomorrow,
    });
    const context = createContext();
    expect(isBannerEligible(message, context, now)).toBe(false);
  });

  it('should reject hitno alone (no context tag)', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const message = createMessage({
      tags: ['hitno'],
      active_from: yesterday,
      active_to: tomorrow,
    });
    const context = createContext();
    expect(isBannerEligible(message, context, now)).toBe(false);
  });

  it('should require both active_from AND active_to', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Only active_from
    const noTo = createMessage({
      tags: ['hitno', 'promet'],
      active_from: yesterday,
      active_to: null,
    });
    expect(isBannerEligible(noTo, createContext(), now)).toBe(false);

    // Only active_to
    const noFrom = createMessage({
      tags: ['hitno', 'promet'],
      active_from: null,
      active_to: tomorrow,
    });
    expect(isBannerEligible(noFrom, createContext(), now)).toBe(false);

    // Both set
    const both = createMessage({
      tags: ['hitno', 'promet'],
      active_from: yesterday,
      active_to: tomorrow,
    });
    expect(isBannerEligible(both, createContext(), now)).toBe(true);
  });

  it('should accept valid banner: hitno + promet with active window', () => {
    const now = new Date();
    const message = createBannerMessage('promet');
    expect(isBannerEligible(message, createContext(), now)).toBe(true);
  });

  it('should accept valid banner: hitno + kultura with active window', () => {
    const now = new Date();
    const message = createBannerMessage('kultura');
    expect(isBannerEligible(message, createContext(), now)).toBe(true);
  });

  it('should apply municipal filtering for hitno + vis', () => {
    const now = new Date();
    const message = createBannerMessage('vis');

    const visitor = createContext({ userMode: 'visitor' });
    const visLocal = createContext({ userMode: 'local', municipality: 'vis' });
    const komizaLocal = createContext({ userMode: 'local', municipality: 'komiza' });

    expect(isBannerEligible(message, visitor, now)).toBe(false);
    expect(isBannerEligible(message, visLocal, now)).toBe(true);
    expect(isBannerEligible(message, komizaLocal, now)).toBe(false);
  });

  it('should handle backward compatibility: hitno + cestovni_promet', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const message = createMessage({
      tags: ['hitno', 'cestovni_promet'],
      active_from: yesterday,
      active_to: tomorrow,
    });
    expect(isBannerEligible(message, createContext(), now)).toBe(true);
  });

  it('should handle backward compatibility: hitno + pomorski_promet', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const message = createMessage({
      tags: ['hitno', 'pomorski_promet'],
      active_from: yesterday,
      active_to: tomorrow,
    });
    expect(isBannerEligible(message, createContext(), now)).toBe(true);
  });
});

describe('isBannerForScreen (Phase 2)', () => {
  describe('home screen', () => {
    it('should show hitno + promet on home', () => {
      const message = createBannerMessage('promet');
      expect(isBannerForScreen(message, 'home')).toBe(true);
    });

    it('should show hitno + kultura on home', () => {
      const message = createBannerMessage('kultura');
      expect(isBannerForScreen(message, 'home')).toBe(true);
    });

    it('should show hitno + opcenito on home', () => {
      const message = createBannerMessage('opcenito');
      expect(isBannerForScreen(message, 'home')).toBe(true);
    });

    it('should show hitno + vis on home', () => {
      const message = createBannerMessage('vis');
      expect(isBannerForScreen(message, 'home')).toBe(true);
    });

    it('should show hitno + komiza on home', () => {
      const message = createBannerMessage('komiza');
      expect(isBannerForScreen(message, 'home')).toBe(true);
    });

    it('should NOT show message without hitno on home', () => {
      const message = createMessage({ tags: ['opcenito'] });
      expect(isBannerForScreen(message, 'home')).toBe(false);
    });
  });

  describe('events screen', () => {
    it('should show hitno + kultura on events', () => {
      const message = createBannerMessage('kultura');
      expect(isBannerForScreen(message, 'events')).toBe(true);
    });

    it('should NOT show hitno + promet on events', () => {
      const message = createBannerMessage('promet');
      expect(isBannerForScreen(message, 'events')).toBe(false);
    });

    it('should NOT show hitno + opcenito on events', () => {
      const message = createBannerMessage('opcenito');
      expect(isBannerForScreen(message, 'events')).toBe(false);
    });

    it('should NOT show hitno + vis on events', () => {
      const message = createBannerMessage('vis');
      expect(isBannerForScreen(message, 'events')).toBe(false);
    });
  });

  describe('transport screen', () => {
    it('should show hitno + promet on transport', () => {
      const message = createBannerMessage('promet');
      expect(isBannerForScreen(message, 'transport')).toBe(true);
    });

    it('should NOT show hitno + kultura on transport', () => {
      const message = createBannerMessage('kultura');
      expect(isBannerForScreen(message, 'transport')).toBe(false);
    });

    it('should NOT show hitno + opcenito on transport', () => {
      const message = createBannerMessage('opcenito');
      expect(isBannerForScreen(message, 'transport')).toBe(false);
    });

    it('should handle backward compatibility: cestovni_promet on transport', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const message = createMessage({
        tags: ['hitno', 'cestovni_promet'],
        active_from: yesterday,
        active_to: tomorrow,
      });
      expect(isBannerForScreen(message, 'transport')).toBe(true);
    });

    it('should handle backward compatibility: pomorski_promet on transport', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const message = createMessage({
        tags: ['hitno', 'pomorski_promet'],
        active_from: yesterday,
        active_to: tomorrow,
      });
      expect(isBannerForScreen(message, 'transport')).toBe(true);
    });
  });
});

describe('filterBannerEligibleMessages (Phase 2)', () => {
  it('should only return messages with valid hitno + context tag', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    // Explicit created_at to ensure deterministic sort order (active_from DESC, created_at DESC)
    const createdNewer = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
    const createdOlder = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

    const messages = [
      createMessage({ id: '1', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow, created_at: createdNewer }),
      createMessage({ id: '2', tags: ['opcenito'], active_from: yesterday, active_to: tomorrow }), // No hitno
      createMessage({ id: '3', tags: ['hitno'], active_from: yesterday, active_to: tomorrow }), // No context
      createMessage({ id: '4', tags: ['hitno', 'kultura'], active_from: yesterday, active_to: tomorrow, created_at: createdOlder }),
    ];

    // Order: active_from DESC (same), then created_at DESC → '1' (newer) before '4' (older)
    const result = filterBannerEligibleMessages(messages, createContext(), now);
    expect(result.map(m => m.id)).toEqual(['1', '4']);
  });

  it('should sort by active_from DESC, then created_at DESC', () => {
    const now = new Date();
    const day1 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const day2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const day3 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const messages = [
      createMessage({ id: 'old', tags: ['hitno', 'promet'], active_from: day1, active_to: tomorrow, created_at: day1 }),
      createMessage({ id: 'new', tags: ['hitno', 'promet'], active_from: day3, active_to: tomorrow, created_at: day3 }),
      createMessage({ id: 'mid', tags: ['hitno', 'promet'], active_from: day2, active_to: tomorrow, created_at: day2 }),
    ];

    const result = filterBannerEligibleMessages(messages, createContext(), now);
    expect(result.map(m => m.id)).toEqual(['new', 'mid', 'old']);
  });

  it('should use created_at as tiebreaker when active_from is same', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const olderCreated = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const messages = [
      createMessage({ id: 'older', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow, created_at: olderCreated }),
      createMessage({ id: 'newer', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow, created_at: yesterday }),
    ];

    const result = filterBannerEligibleMessages(messages, createContext(), now);
    expect(result.map(m => m.id)).toEqual(['newer', 'older']);
  });
});

describe('filterBannersByScreen (Phase 2)', () => {
  it('should apply cap of 3 banners', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const messages = [
      createMessage({ id: '1', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow }),
      createMessage({ id: '2', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow }),
      createMessage({ id: '3', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow }),
      createMessage({ id: '4', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow }),
      createMessage({ id: '5', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow }),
    ];

    const result = filterBannersByScreen(messages, 'home');
    expect(result.length).toBe(BANNER_CAP);
    expect(result.map(m => m.id)).toEqual(['1', '2', '3']);
  });

  it('should filter by screen before applying cap', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const messages = [
      createMessage({ id: '1', tags: ['hitno', 'kultura'], active_from: yesterday, active_to: tomorrow }),
      createMessage({ id: '2', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow }),
      createMessage({ id: '3', tags: ['hitno', 'kultura'], active_from: yesterday, active_to: tomorrow }),
      createMessage({ id: '4', tags: ['hitno', 'kultura'], active_from: yesterday, active_to: tomorrow }),
    ];

    // Events screen only shows kultura
    const eventsResult = filterBannersByScreen(messages, 'events');
    expect(eventsResult.map(m => m.id)).toEqual(['1', '3', '4']);

    // Transport screen only shows promet
    const transportResult = filterBannersByScreen(messages, 'transport');
    expect(transportResult.map(m => m.id)).toEqual(['2']);
  });
});

describe('getBannersForScreen (Phase 2)', () => {
  it('should return capped, sorted, filtered banners for screen', () => {
    const now = new Date();
    const day1 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const day2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const day3 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const messages = [
      createMessage({ id: 'promet-old', tags: ['hitno', 'promet'], active_from: day1, active_to: tomorrow }),
      createMessage({ id: 'kultura-1', tags: ['hitno', 'kultura'], active_from: day2, active_to: tomorrow }),
      createMessage({ id: 'promet-new', tags: ['hitno', 'promet'], active_from: day3, active_to: tomorrow }),
      createMessage({ id: 'promet-mid', tags: ['hitno', 'promet'], active_from: day2, active_to: tomorrow }),
      createMessage({ id: 'opcenito', tags: ['hitno', 'opcenito'], active_from: day1, active_to: tomorrow }),
      createMessage({ id: 'no-hitno', tags: ['promet'], active_from: day1, active_to: tomorrow }),
    ];

    // Transport: only promet, sorted by active_from DESC, capped at 3
    const transportResult = getBannersForScreen(messages, createContext(), 'transport', now);
    expect(transportResult.map(m => m.id)).toEqual(['promet-new', 'promet-mid', 'promet-old']);

    // Events: only kultura
    const eventsResult = getBannersForScreen(messages, createContext(), 'events', now);
    expect(eventsResult.map(m => m.id)).toEqual(['kultura-1']);

    // Home: all banner types, capped at 3
    const homeResult = getBannersForScreen(messages, createContext(), 'home', now);
    expect(homeResult.length).toBe(BANNER_CAP);
    // Should be sorted by active_from DESC: promet-new (day3), kultura-1 (day2), promet-mid (day2)
    expect(homeResult[0].id).toBe('promet-new');
  });

  it('should respect municipal filtering', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const messages = [
      createMessage({ id: 'vis-banner', tags: ['hitno', 'vis'], active_from: yesterday, active_to: tomorrow }),
      createMessage({ id: 'general-banner', tags: ['hitno', 'opcenito'], active_from: yesterday, active_to: tomorrow }),
    ];

    const visitor = createContext({ userMode: 'visitor' });
    const visLocal = createContext({ userMode: 'local', municipality: 'vis' });

    // Visitor only sees general
    const visitorResult = getBannersForScreen(messages, visitor, 'home', now);
    expect(visitorResult.map(m => m.id)).toEqual(['general-banner']);

    // Vis local sees both
    const localResult = getBannersForScreen(messages, visLocal, 'home', now);
    expect(localResult.map(m => m.id)).toEqual(['vis-banner', 'general-banner']);
  });
});

describe('BANNER_CAP constant', () => {
  it('should be 3', () => {
    expect(BANNER_CAP).toBe(3);
  });
});
