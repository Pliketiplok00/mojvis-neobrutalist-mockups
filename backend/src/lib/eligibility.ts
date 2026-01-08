/**
 * Eligibility Logic
 *
 * Server-side logic for determining which Inbox messages
 * are visible to which users.
 *
 * Rules (per spec):
 * - Municipal messages (vis/komiza tags) only visible to matching users
 * - Visitors see general content only (no municipal)
 * - Locals see content for their municipality
 * - Active window determines banner eligibility
 * - hitno (emergency) messages are always eligible for banners
 */

import type {
  InboxMessage,
  UserContext,
  InboxTag,
} from '../types/inbox.js';
import { isMunicipal, getMunicipalityFromTags, isUrgent } from '../types/inbox.js';

/**
 * Check if a message is eligible for a given user context
 *
 * @param message - The inbox message to check
 * @param context - User context (mode, municipality)
 * @returns true if the user should see this message
 */
export function isMessageEligible(
  message: InboxMessage,
  context: UserContext
): boolean {
  const tags = message.tags;

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
 * Check if a message is eligible to appear as a banner right now
 *
 * @param message - The inbox message to check
 * @param context - User context (mode, municipality)
 * @param now - Current timestamp (for testing)
 * @returns true if the message should appear as a banner
 */
export function isBannerEligible(
  message: InboxMessage,
  context: UserContext,
  now: Date = new Date()
): boolean {
  // First check basic eligibility
  if (!isMessageEligible(message, context)) {
    return false;
  }

  // Check active window
  if (!isWithinActiveWindow(message, now)) {
    logEligibilityDecision(message.id, context, false, 'outside active window');
    return false;
  }

  logEligibilityDecision(message.id, context, true, 'banner eligible');
  return true;
}

/**
 * Check if message is within its active window
 *
 * @param message - The inbox message to check
 * @param now - Current timestamp
 * @returns true if within active window (or no window defined)
 */
export function isWithinActiveWindow(
  message: InboxMessage,
  now: Date = new Date()
): boolean {
  const { active_from, active_to } = message;

  // No active window means no banner eligibility
  // Per spec: "No active window → no banner"
  if (active_from === null && active_to === null) {
    return false;
  }

  // Check from boundary
  if (active_from !== null && now < active_from) {
    return false;
  }

  // Check to boundary
  if (active_to !== null && now > active_to) {
    return false;
  }

  return true;
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
 * Filter messages eligible for banner display
 *
 * @param messages - Array of inbox messages
 * @param context - User context
 * @param now - Current timestamp
 * @returns Filtered array of banner-eligible messages
 */
export function filterBannerEligibleMessages(
  messages: InboxMessage[],
  context: UserContext,
  now: Date = new Date()
): InboxMessage[] {
  return messages.filter((message) => isBannerEligible(message, context, now));
}

/**
 * Screen context for banner filtering
 */
export type ScreenContext = 'home' | 'transport_road' | 'transport_sea';

/**
 * Check if a message should appear as a banner on a specific screen
 *
 * Banner placement rules (per spec):
 * - Home: hitno, opcenito, vis/komiza (for matching locals)
 * - Road Transport: cestovni_promet OR hitno ONLY
 * - Sea Transport: pomorski_promet OR hitno ONLY
 *
 * @param message - The inbox message to check
 * @param screenContext - The screen where banner would appear
 * @returns true if message should appear as banner on this screen
 */
export function isBannerForScreen(
  message: InboxMessage,
  screenContext: ScreenContext
): boolean {
  const tags = message.tags;

  switch (screenContext) {
    case 'home':
      // Home shows: hitno, opcenito, vis, komiza
      // kultura is NOT shown on home per spec
      return isUrgent(tags) ||
        tags.includes('opcenito') ||
        tags.includes('vis') ||
        tags.includes('komiza');

    case 'transport_road':
      // Road transport shows ONLY: cestovni_promet OR hitno
      return tags.includes('cestovni_promet') || isUrgent(tags);

    case 'transport_sea':
      // Sea transport shows ONLY: pomorski_promet OR hitno
      return tags.includes('pomorski_promet') || isUrgent(tags);

    default:
      return false;
  }
}

/**
 * Filter banner-eligible messages by screen context
 *
 * @param messages - Array of already banner-eligible messages
 * @param screenContext - The screen where banners would appear
 * @returns Filtered array for the specific screen
 */
export function filterBannersByScreen(
  messages: InboxMessage[],
  screenContext: ScreenContext
): InboxMessage[] {
  return messages.filter((message) => isBannerForScreen(message, screenContext));
}

/**
 * Get the banner context (where banners should appear)
 * Based on message tags
 *
 * @deprecated Use isBannerForScreen instead
 */
export function getBannerContext(tags: InboxTag[]): string[] {
  const contexts: string[] = [];

  // Emergency messages appear everywhere
  if (isUrgent(tags)) {
    contexts.push('home', 'transport_road', 'transport_sea');
  }

  // Transport-specific
  if (tags.includes('cestovni_promet')) {
    contexts.push('transport_road');
  }
  if (tags.includes('pomorski_promet')) {
    contexts.push('transport_sea');
  }

  // General/cultural appear on home
  if (tags.includes('opcenito') || tags.includes('kultura')) {
    contexts.push('home');
  }

  // Municipal appear on home for matching users
  if (tags.includes('vis') || tags.includes('komiza')) {
    contexts.push('home');
  }

  // Deduplicate
  return [...new Set(contexts)];
}

/**
 * Log eligibility decision for debugging
 * Only logs at debug level
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
