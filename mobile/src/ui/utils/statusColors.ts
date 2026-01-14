/**
 * Status Colors Mapping
 *
 * Single source of truth for status-to-color mapping used across:
 * - FeedbackDetailScreen
 * - ClickFixDetailScreen
 * - InboxListScreen (sent items)
 *
 * Phase 1 consolidation - no visual changes.
 */

import { skin } from '../skin';

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  zaprimljeno: { bg: skin.colors.infoBackground, text: skin.colors.infoText },
  u_razmatranju: { bg: skin.colors.pendingBackground, text: skin.colors.pendingText },
  prihvaceno: { bg: skin.colors.successBackground, text: skin.colors.successText },
  odbijeno: { bg: skin.colors.errorBackground, text: skin.colors.errorText },
} as const;
