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
