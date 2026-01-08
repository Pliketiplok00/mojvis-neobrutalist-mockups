/**
 * Croatian Holidays Helper
 *
 * Provides holiday checking and day type determination for transport schedules.
 *
 * IMPORTANT:
 * - Holidays are HARDCODED from https://neradni-dani.com/neradni-dani-2026.php
 * - NO runtime fetching or scraping
 * - PRAZNIK has priority over weekday logic
 *
 * Day types: MON, TUE, WED, THU, FRI, SAT, SUN, PRAZNIK
 * (NO generic WEEKDAY - schedules vary by specific weekday)
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Day type enum - explicit days, no generic WEEKDAY
export type DayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN' | 'PRAZNIK';

// Holiday entry from JSON
interface HolidayEntry {
  date: string;
  name_hr: string;
  name_en: string;
}

// Holidays JSON structure
interface HolidaysData {
  country: string;
  year: number;
  timezone: string;
  holidays: HolidayEntry[];
}

// Cache for loaded holidays
let holidaysCache: Set<string> | null = null;
let holidaysDataCache: HolidaysData | null = null;

/**
 * Load holidays from static JSON file
 */
function loadHolidays(): Set<string> {
  if (holidaysCache) {
    return holidaysCache;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const holidaysPath = join(__dirname, '..', 'data', 'holidays-hr-2026.json');

  const data = readFileSync(holidaysPath, 'utf-8');
  holidaysDataCache = JSON.parse(data) as HolidaysData;

  holidaysCache = new Set(holidaysDataCache.holidays.map((h) => h.date));
  return holidaysCache;
}

/**
 * Get holidays data with names
 */
export function getHolidaysData(): HolidaysData {
  if (holidaysDataCache) {
    return holidaysDataCache;
  }

  loadHolidays();
  return holidaysDataCache!;
}

/**
 * Format date as YYYY-MM-DD string
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date string (YYYY-MM-DD) as Date object
 * Interprets the date in Europe/Zagreb timezone
 */
export function parseDateInZagreb(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date at noon to avoid DST edge cases
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Get today's date in Europe/Zagreb timezone
 */
export function getTodayInZagreb(): Date {
  const now = new Date();
  // Format in Zagreb timezone and parse back
  const zagrebDateStr = now.toLocaleDateString('en-CA', {
    timeZone: 'Europe/Zagreb',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return parseDateInZagreb(zagrebDateStr);
}

/**
 * Check if a date is a Croatian public holiday
 *
 * @param date - Date to check
 * @param _timezone - Timezone (default: Europe/Zagreb) - reserved for future use
 * @returns true if the date is a public holiday
 */
export function isHoliday(
  date: Date,
  _timezone: string = 'Europe/Zagreb'
): boolean {
  const holidays = loadHolidays();
  const dateStr = formatDateString(date);
  return holidays.has(dateStr);
}

/**
 * Get holiday info for a date if it's a holiday
 */
export function getHolidayInfo(
  date: Date
): HolidayEntry | null {
  const dateStr = formatDateString(date);
  const data = getHolidaysData();
  return data.holidays.find((h) => h.date === dateStr) ?? null;
}

/**
 * Map JavaScript day number (0-6, Sunday=0) to DayType
 */
function jsDayToDayType(jsDay: number): DayType {
  const mapping: DayType[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return mapping[jsDay];
}

/**
 * Determine the day type for a given date
 *
 * Priority:
 * 1. PRAZNIK - if the date is a Croatian public holiday
 * 2. Explicit weekday (MON, TUE, WED, THU, FRI, SAT, SUN)
 *
 * @param date - Date to check
 * @param timezone - Timezone (default: Europe/Zagreb)
 * @returns DayType (MON, TUE, WED, THU, FRI, SAT, SUN, or PRAZNIK)
 */
export function getDayType(
  date: Date,
  timezone: string = 'Europe/Zagreb'
): DayType {
  // PRAZNIK has priority
  if (isHoliday(date, timezone)) {
    return 'PRAZNIK';
  }

  // Return explicit weekday
  return jsDayToDayType(date.getDay());
}

/**
 * Get the day type for a date string (YYYY-MM-DD)
 */
export function getDayTypeFromString(dateStr: string): DayType {
  const date = parseDateInZagreb(dateStr);
  return getDayType(date);
}

/**
 * Check if two dates are the same calendar day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateString(date1) === formatDateString(date2);
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date, language: 'hr' | 'en' = 'hr'): string {
  const locale = language === 'hr' ? 'hr-HR' : 'en-US';
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Zagreb',
  });
}
