/**
 * Public Service Helpers
 *
 * Utility functions for processing public services data.
 * Handles badge logic based on scheduled_dates.
 */

import type { PublicService, PublicServiceScheduledDate } from '../services/api';

/**
 * Check if any scheduled date is in current or future months
 */
export function hasCurrentOrFutureScheduledDates(
  scheduledDates: PublicServiceScheduledDate[]
): boolean {
  if (!scheduledDates || scheduledDates.length === 0) return false;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return scheduledDates.some((sd) => {
    const date = new Date(sd.date);
    return (
      date.getFullYear() > currentYear ||
      (date.getFullYear() === currentYear && date.getMonth() >= currentMonth)
    );
  });
}

/**
 * Check if any scheduled date was created within the last 7 days
 */
export function hasRecentlyAddedDates(
  scheduledDates: PublicServiceScheduledDate[]
): boolean {
  if (!scheduledDates || scheduledDates.length === 0) return false;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return scheduledDates.some((sd) => {
    const createdAt = new Date(sd.created_at);
    return createdAt >= sevenDaysAgo;
  });
}

/**
 * Check if service has scheduled dates in current month
 */
export function hasCurrentMonthDates(
  scheduledDates: PublicServiceScheduledDate[]
): boolean {
  if (!scheduledDates || scheduledDates.length === 0) return false;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return scheduledDates.some((sd) => {
    const date = new Date(sd.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
}

/**
 * Get badge text for a service
 *
 * Rules:
 * - "NOVI DATUMI" if periodic service has recent (< 7 days) scheduled dates
 * - null otherwise
 */
export function getServiceBadge(service: PublicService): string | null {
  // Only periodic services can have date badges
  if (service.type !== 'periodic') return null;

  // Use API-provided flag if available
  if (service.has_new_dates) {
    return 'NOVI DATUMI';
  }

  // Fallback: check locally
  const hasFutureDates = hasCurrentOrFutureScheduledDates(service.scheduled_dates);
  const hasRecentDates = hasRecentlyAddedDates(service.scheduled_dates);

  if (hasFutureDates && hasRecentDates) {
    return 'NOVI DATUMI';
  }

  return null;
}

/**
 * Get warning message for a periodic service
 *
 * Returns warning if:
 * - Service is periodic
 * - No scheduled dates in current month
 */
export function getServiceWarning(
  service: PublicService,
  language: 'hr' | 'en'
): string | null {
  // Only periodic services show warnings
  if (service.type !== 'periodic') return null;

  // If has dates in current month, no warning
  if (hasCurrentMonthDates(service.scheduled_dates)) return null;

  // Get current month name
  const now = new Date();
  const monthName = now.toLocaleDateString(
    language === 'hr' ? 'hr-HR' : 'en-US',
    { month: 'long' }
  );

  return language === 'hr'
    ? `Ceka azuriranje za ${monthName}`
    : `Awaiting update for ${monthName}`;
}

/**
 * Format scheduled dates for display
 */
export function formatScheduledDates(
  scheduledDates: PublicServiceScheduledDate[],
  language: 'hr' | 'en'
): string {
  if (!scheduledDates || scheduledDates.length === 0) return '';

  const locale = language === 'hr' ? 'hr-HR' : 'en-US';

  return scheduledDates
    .filter((sd) => new Date(sd.date) >= new Date())
    .slice(0, 3) // Show max 3 upcoming dates
    .map((sd) => {
      const date = new Date(sd.date);
      const dateStr = date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
      });
      return `${dateStr} ${sd.time_from}-${sd.time_to}`;
    })
    .join('\n');
}
