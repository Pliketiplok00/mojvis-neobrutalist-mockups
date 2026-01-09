/**
 * Eligibility Logic (Phase 2)
 *
 * Server-side logic for determining which Inbox messages
 * are visible to which users and eligible for banners.
 *
 * BANNER RULES (Phase 2):
 * - ONLY messages with "hitno" tag can be banners
 * - "hitno" must be paired with exactly one context tag
 * - "hitno" alone is INVALID
 * - active_from AND active_to are BOTH REQUIRED for hitno messages
 * - Banner visible when: active_from <= now <= active_to (inclusive)
 * - Time comparisons use UTC
 *
 * BANNER PLACEMENT BY CONTEXT TAG:
 * - hitno + kultura → home, events
 * - hitno + promet → home, transport
 * - hitno + opcenito → home only
 * - hitno + vis → home only (with municipality check)
 * - hitno + komiza → home only (with municipality check)
 *
 * CAP & ORDERING:
 * - Max 3 banners per screen
 * - Order: active_from DESC, then created_at DESC
 */

import type {
  InboxMessage,
  UserContext,
  InboxTag,
} from '../types/inbox.js';
import {
  isMunicipal,
  getMunicipalityFromTags,
  normalizeTags,
  BANNER_CONTEXT_TAGS,
} from '../types/inbox.js';

/**
 * Screen context for banner filtering (Phase 2)
 */
export type ScreenContext = 'home' | 'events' | 'transport';

/**
 * Maximum banners per screen
 */
export const BANNER_CAP = 3;

/**
 * Get current time in UTC
 * This ensures consistent time handling regardless of server timezone
 */
export function getUtcNow(): Date {
  return new Date();
}

/**
 * Check if a message is eligible for a given user context
 * (for general inbox viewing, not banners)
 *
 * @param message - The inbox message to check
 * @param context - User context (mode, municipality)
 * @returns true if the user should see this message
 */
export function isMessageEligible(
  message: InboxMessage,
  context: UserContext
): boolean {
  // Normalize tags for comparison (handles deprecated transport tags)
  const tags = normalizeTags(message.tags);

  // Municipal messages require matching municipality
  if (isMunicipal(tags)) {
    // Visitors don't see municipal messages
    if (context.userMode === 'visitor') {
      logEligibilityDecision(message.id, context, false, 'visitor cannot see municipal');
      return false;
    }

    // Locals must match municipality
    const messageMunicipality = getMunicipalityFromTags(tags);
    if (context.municipality !== messageMunicipality) {
      logEligibilityDecision(message.id, context, false, `municipality mismatch: ${messageMunicipality} vs ${context.municipality}`);
      return false;
    }
  }

  logEligibilityDecision(message.id, context, true, 'eligible');
  return true;
}

/**
 * Validate banner tag combination (Phase 2)
 *
 * Rules:
 * - Must have "hitno" tag
 * - Must have exactly one context tag (promet, kultura, opcenito, vis, komiza)
 * - "hitno" alone is INVALID
 *
 * @param tags - Normalized tags array
 * @returns true if valid banner tag combination
 */
export function isValidBannerTagCombination(tags: InboxTag[]): boolean {
  // Must have hitno
  if (!tags.includes('hitno')) {
    return false;
  }

  // Must have exactly one context tag
  const contextTags = tags.filter(tag => BANNER_CONTEXT_TAGS.includes(tag));
  if (contextTags.length !== 1) {
    return false;
  }

  // Must have exactly 2 tags total (hitno + context)
  if (tags.length !== 2) {
    return false;
  }

  return true;
}

/**
 * Check if message has valid active window for banners (Phase 2)
 *
 * Rules:
 * - BOTH active_from AND active_to must be set
 * - Banner visible when: active_from <= now <= active_to (inclusive)
 *
 * @param message - The inbox message to check
 * @param now - Current UTC timestamp
 * @returns true if within valid active window
 */
export function isWithinActiveWindow(
  message: InboxMessage,
  now: Date = getUtcNow()
): boolean {
  const { active_from, active_to } = message;

  // Phase 2: BOTH boundaries required for hitno/banner messages
  if (active_from === null || active_to === null) {
    return false;
  }

  // Inclusive boundaries: active_from <= now <= active_to
  const nowMs = now.getTime();
  const fromMs = active_from.getTime();
  const toMs = active_to.getTime();

  return nowMs >= fromMs && nowMs <= toMs;
}

/**
 * Check if a message is eligible to appear as a banner (Phase 2)
 *
 * Requirements:
 * 1. Valid banner tag combination (hitno + context tag)
 * 2. Within active window (both boundaries required)
 * 3. User eligibility (municipal filtering)
 *
 * @param message - The inbox message to check
 * @param context - User context (mode, municipality)
 * @param now - Current UTC timestamp
 * @returns true if the message should appear as a banner
 */
export function isBannerEligible(
  message: InboxMessage,
  context: UserContext,
  now: Date = getUtcNow()
): boolean {
  // Normalize tags (handles deprecated transport tags)
  const normalizedTags = normalizeTags(message.tags);

  // Must have valid banner tag combination
  if (!isValidBannerTagCombination(normalizedTags)) {
    logEligibilityDecision(message.id, context, false, 'invalid banner tag combination');
    return false;
  }

  // Must be within active window
  if (!isWithinActiveWindow(message, now)) {
    logEligibilityDecision(message.id, context, false, 'outside active window');
    return false;
  }

  // Check user eligibility (municipal filtering)
  if (!isMessageEligible(message, context)) {
    return false;
  }

  logEligibilityDecision(message.id, context, true, 'banner eligible');
  return true;
}

/**
 * Get the context tag from a banner message (Phase 2)
 *
 * @param message - The inbox message
 * @returns The context tag or null if not a valid banner
 */
export function getBannerContextTag(message: InboxMessage): InboxTag | null {
  const normalizedTags = normalizeTags(message.tags);

  if (!normalizedTags.includes('hitno')) {
    return null;
  }

  const contextTag = normalizedTags.find(tag => BANNER_CONTEXT_TAGS.includes(tag));
  return contextTag ?? null;
}

/**
 * Check if a banner should appear on a specific screen (Phase 2)
 *
 * Placement rules:
 * - hitno + kultura → home, events
 * - hitno + promet → home, transport
 * - hitno + opcenito → home only
 * - hitno + vis → home only
 * - hitno + komiza → home only
 *
 * @param message - The inbox message to check
 * @param screenContext - The screen where banner would appear
 * @returns true if banner should appear on this screen
 */
export function isBannerForScreen(
  message: InboxMessage,
  screenContext: ScreenContext
): boolean {
  const contextTag = getBannerContextTag(message);

  if (!contextTag) {
    return false;
  }

  switch (screenContext) {
    case 'home':
      // Home shows ALL banner types
      return ['promet', 'kultura', 'opcenito', 'vis', 'komiza'].includes(contextTag);

    case 'events':
      // Events shows ONLY kultura
      return contextTag === 'kultura';

    case 'transport':
      // Transport shows ONLY promet
      return contextTag === 'promet';

    default:
      return false;
  }
}

/**
 * Filter messages by eligibility for a user context
 *
 * @param messages - Array of inbox messages
 * @param context - User context
 * @returns Filtered array of eligible messages
 */
export function filterEligibleMessages(
  messages: InboxMessage[],
  context: UserContext
): InboxMessage[] {
  return messages.filter((message) => isMessageEligible(message, context));
}

/**
 * Filter and sort banner-eligible messages (Phase 2)
 *
 * Applies:
 * - Banner eligibility check
 * - Ordering: active_from DESC, then created_at DESC
 * - NO cap applied here (cap applied per-screen)
 *
 * @param messages - Array of inbox messages
 * @param context - User context
 * @param now - Current UTC timestamp
 * @returns Filtered and sorted array of banner-eligible messages
 */
export function filterBannerEligibleMessages(
  messages: InboxMessage[],
  context: UserContext,
  now: Date = getUtcNow()
): InboxMessage[] {
  const eligible = messages.filter((message) => isBannerEligible(message, context, now));

  // Sort by active_from DESC, then created_at DESC
  eligible.sort((a, b) => {
    // active_from DESC (newer urgency first)
    const aFrom = a.active_from?.getTime() ?? 0;
    const bFrom = b.active_from?.getTime() ?? 0;
    if (bFrom !== aFrom) {
      return bFrom - aFrom;
    }

    // created_at DESC (fallback)
    const aCreated = a.created_at.getTime();
    const bCreated = b.created_at.getTime();
    return bCreated - aCreated;
  });

  return eligible;
}

/**
 * Filter banner-eligible messages by screen context (Phase 2)
 *
 * Applies:
 * - Screen-specific filtering
 * - Cap of 3 banners per screen
 *
 * @param messages - Array of already banner-eligible messages (sorted)
 * @param screenContext - The screen where banners would appear
 * @returns Filtered and capped array for the specific screen
 */
export function filterBannersByScreen(
  messages: InboxMessage[],
  screenContext: ScreenContext
): InboxMessage[] {
  const filtered = messages.filter((message) => isBannerForScreen(message, screenContext));

  // Apply cap
  return filtered.slice(0, BANNER_CAP);
}

/**
 * Get banners for a specific screen (Phase 2 convenience function)
 *
 * Combines all filtering, sorting, and capping in one call.
 *
 * @param messages - Array of inbox messages
 * @param context - User context
 * @param screenContext - The screen where banners would appear
 * @param now - Current UTC timestamp
 * @returns Final array of banners for the screen (max 3, sorted)
 */
export function getBannersForScreen(
  messages: InboxMessage[],
  context: UserContext,
  screenContext: ScreenContext,
  now: Date = getUtcNow()
): InboxMessage[] {
  const eligible = filterBannerEligibleMessages(messages, context, now);
  return filterBannersByScreen(eligible, screenContext);
}

/**
 * Log eligibility decision for debugging
 * Only logs in development
 */
function logEligibilityDecision(
  messageId: string,
  context: UserContext,
  eligible: boolean,
  reason: string
): void {
  if (process.env['NODE_ENV'] === 'development') {
    console.info(
      `[Eligibility] message=${messageId} user=${context.deviceId} mode=${context.userMode} municipality=${context.municipality} eligible=${eligible} reason=${reason}`
    );
  }
}
