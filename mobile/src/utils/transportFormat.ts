/**
 * Transport Formatting Utilities
 *
 * Shared formatters for transport screens.
 * Single source of truth for line title display.
 */

/**
 * Format line title using structured origin/destination data
 * Format: "<line_number>: <origin>-<destination>"
 * E.g., "602: Vis-Split"
 *
 * @param lineNumber - Public line number (e.g., "602", "659")
 * @param origin - First stop name (localized)
 * @param destination - Last stop name (localized)
 */
export function formatLineTitle(
  lineNumber: string | null,
  origin: string,
  destination: string
): string {
  const prefix = lineNumber ?? '';
  return `${prefix}: ${origin}-${destination}`;
}

/**
 * Format duration in minutes to human readable string
 * E.g., 90 → "1h 30min", 45 → "45 min", 120 → "2h"
 *
 * @param minutes - Duration in minutes
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}
