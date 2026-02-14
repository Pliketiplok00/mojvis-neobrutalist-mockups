/**
 * Date Formatting Utilities
 *
 * Centralized date formatting for consistent display across the app.
 *
 * Formats:
 * - Croatian datetime: D.M.YYYY. HH:mm (FeedbackDetail, ClickFixDetail)
 * - Short date: DD/MM/YYYY (InboxList)
 * - Slash datetime: DD/MM/YYYY, HH:mm (InboxDetail)
 * - Locale full: Croatian locale long format (EventDetail)
 * - Time only: HH:mm (EventDetail, EventsScreen)
 * - ISO date: YYYY-MM-DD (LineDetailScreen API)
 * - Display date: D.M.YYYY. (LineDetailScreen UI)
 *
 * Phase 1 consolidation - exact output preservation required.
 */

/**
 * Croatian datetime format: D.M.YYYY. HH:mm
 * Used by: FeedbackDetailScreen, ClickFixDetailScreen
 */
export function formatDateTimeCroatian(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year}. ${hours}:${minutes}`;
}

/**
 * Short date format: DD/MM/YYYY
 * Used by: InboxListScreen
 */
export function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Slash datetime format: DD/MM/YYYY, HH:mm
 * Used by: InboxDetailScreen
 */
export function formatDateTimeSlash(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

/**
 * Locale-aware full date format
 * Used by: EventDetailScreen
 *
 * HR: "petak, 14. veljače 2026."
 * EN: "Friday, February 14, 2026"
 */
export function formatDateLocaleFull(isoString: string, locale: 'hr' | 'en' = 'hr'): string {
  const date = new Date(isoString);
  const localeCode = locale === 'hr' ? 'hr-HR' : 'en-US';
  return date.toLocaleDateString(localeCode, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Time only format: HH:mm (24-hour for HR, 12-hour for EN)
 * Used by: EventDetailScreen
 *
 * HR: "14:30"
 * EN: "2:30 PM"
 */
export function formatTime(isoString: string, locale: 'hr' | 'en' = 'hr'): string {
  const date = new Date(isoString);
  const localeCode = locale === 'hr' ? 'hr-HR' : 'en-US';
  return date.toLocaleTimeString(localeCode, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale === 'en',
  });
}

/**
 * Event time format - conditional on all-day flag
 * Used by: EventsScreen
 *
 * HR: "14:30" or allDayText
 * EN: "2:30 PM" or allDayText
 */
export function formatEventTime(
  isoString: string,
  isAllDay: boolean,
  allDayText: string,
  locale: 'hr' | 'en' = 'hr'
): string {
  if (isAllDay) {
    return allDayText;
  }
  const date = new Date(isoString);
  const localeCode = locale === 'hr' ? 'hr-HR' : 'en-US';
  return date.toLocaleTimeString(localeCode, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale === 'en',
  });
}

/**
 * ISO date format: YYYY-MM-DD
 * Used by: LineDetailScreen (API calls)
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Display date format: D.M.YYYY.
 * Used by: LineDetailScreen (UI display)
 */
export function formatDisplayDate(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}.`;
}

/**
 * Day with full date format (locale-aware)
 * Used by: SeaTransportScreen header
 *
 * HR: "Srijeda, 11.02.2026."
 * EN: "Wednesday, 11.02.2026"
 */
export function formatDayWithDate(date: Date, locale: 'hr' | 'en'): string {
  const localeCode = locale === 'hr' ? 'hr-HR' : 'en-US';
  const dayName = date.toLocaleDateString(localeCode, { weekday: 'long' });
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  // HR uses trailing period, EN does not
  return locale === 'hr'
    ? `${dayName}, ${day}.${month}.${year}.`
    : `${dayName}, ${day}.${month}.${year}`;
}
