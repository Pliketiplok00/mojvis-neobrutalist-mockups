/**
 * TodayDeparturesSection Component
 *
 * Today's departures section for transport overview screens.
 * Shared between SeaTransportScreen and RoadTransportScreen.
 *
 * Structure:
 * - Section label
 * - Empty state OR individual departure cards with shadows
 * - Each card: colored time block + direction + optional subtype badge
 *
 * Card style matches LineDetail's DepartureItem for visual consistency.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { H2, Label, Meta } from '../../../ui/Text';
import { Badge } from '../../../ui/Badge';
import { skin } from '../../../ui/skin';
import type { TodayDepartureItem, LineListItem } from '../../../types/transport';

const { colors, spacing, components, opacity } = skin;
const lineDetail = components.transport.lineDetail;

/**
 * Format duration in minutes to display format (e.g., "2h 20min")
 */
function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

interface TodayDeparturesSectionProps {
  /** Today's departures data */
  departures: TodayDepartureItem[];
  /** Lines data for duration fallback lookup (until API returns duration) */
  lines: LineListItem[];
  /** Section title (translated) */
  sectionLabel: string;
  /** Empty state text (translated) */
  emptyText: string;
  /** Time block background color */
  timeBlockBackground: string;
  /** Handler when departure row is pressed */
  onDeparturePress: (lineId: string) => void;
}

/**
 * Format time string (HH:MM or HH:MM:SS) to HH:MM display format
 */
function formatTime(time: string): string {
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
}

/**
 * List of today's departures with individual card styling
 * Matches LineDetail's DepartureItem visual style
 *
 * Duration lookup strategy (hybrid for backward compatibility):
 * 1. Use departure.typical_duration_minutes if present (new API)
 * 2. Fall back to lines lookup by ID or line_number (old approach)
 */
export function TodayDeparturesSection({
  departures,
  lines,
  sectionLabel,
  emptyText,
  timeBlockBackground,
  onDeparturePress,
}: TodayDeparturesSectionProps): React.JSX.Element {
  const visibleDepartures = departures.slice(0, 10);

  // Create fallback lookup maps for duration (by ID and by line_number)
  const lineDurationById = new Map<string, number | null>();
  const lineDurationByNumber = new Map<string, number | null>();
  for (const line of lines) {
    lineDurationById.set(line.id, line.typical_duration_minutes);
    if (line.line_number) {
      lineDurationByNumber.set(line.line_number, line.typical_duration_minutes);
    }
  }

  /**
   * Get duration for a departure using hybrid strategy:
   * 1. Direct from departure (new API)
   * 2. Lookup by line_id (fallback)
   * 3. Lookup by line_number (fallback)
   */
  const getDuration = (dep: TodayDepartureItem): number | null => {
    // 1. Try direct from departure (new API response)
    if (dep.typical_duration_minutes != null) {
      return dep.typical_duration_minutes;
    }
    // 2. Try lookup by line_id
    if (lineDurationById.has(dep.line_id)) {
      return lineDurationById.get(dep.line_id) ?? null;
    }
    // 3. Try lookup by line_number (in case line_id is actually a line number)
    if (lineDurationByNumber.has(dep.line_id)) {
      return lineDurationByNumber.get(dep.line_id) ?? null;
    }
    return null;
  };

  return (
    <View style={styles.section}>
      <Label style={styles.sectionLabel}>{sectionLabel}</Label>
      {departures.length === 0 ? (
        <View style={styles.emptyState}>
          <Label>{emptyText}</Label>
        </View>
      ) : (
        <View style={styles.cardList}>
          {visibleDepartures.map((dep, index) => {
            const durationText = formatDuration(getDuration(dep));

            return (
              <View
                key={`${dep.line_id}-${dep.departure_time}-${index}`}
                style={styles.cardWrapper}
              >
                {/* Shadow layer - individual per card like DepartureItem */}
                <View style={styles.cardShadow} />
                {/* Main card */}
                <Pressable
                  style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => onDeparturePress(dep.line_id)}
                >
                  {/* Time block - colored like LineDetail */}
                  <View style={[styles.timeBlock, { backgroundColor: timeBlockBackground }]}>
                    <H2 style={styles.time}>
                      {formatTime(dep.departure_time)}
                    </H2>
                  </View>
                  {/* Info - direction + duration (matches DepartureItem layout) */}
                  <View style={styles.infoSection}>
                    <Label style={styles.directionLabel} numberOfLines={1}>
                      {dep.direction_label}
                    </Label>
                    {durationText ? (
                      <Meta style={styles.durationText}>{durationText}</Meta>
                    ) : null}
                  </View>
                  {/* Subtype badge - cast needed until TodayDepartureItem type updated */}
                  {(dep as unknown as { subtype?: string }).subtype && (
                    <Badge variant="transport" size="compact" style={styles.subtypeBadge}>
                      {(dep as unknown as { subtype: string }).subtype}
                    </Badge>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  emptyState: {
    padding: spacing.xxl,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    borderWidth: skin.borders.widthThin,
    borderColor: colors.border,
  },
  // Individual cards layout (matches DepartureItem)
  cardList: {
    gap: lineDetail.departureRowGap,
  },
  cardWrapper: {
    position: 'relative',
  },
  cardShadow: {
    position: 'absolute',
    top: lineDetail.shadowOffsetY,
    left: lineDetail.shadowOffsetX,
    right: -lineDetail.shadowOffsetX,
    bottom: -lineDetail.shadowOffsetY,
    backgroundColor: lineDetail.shadowColor,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lineDetail.departureRowBackground,
    borderWidth: lineDetail.departureRowBorderWidth,
    borderColor: lineDetail.departureRowBorderColor,
    borderRadius: lineDetail.departureRowRadius,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: opacity.muted,
  },
  timeBlock: {
    width: lineDetail.timeBlockWidth,
    paddingVertical: lineDetail.timeBlockPadding,
    paddingHorizontal: lineDetail.timeBlockPadding,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: lineDetail.timeBlockBorderWidth,
    borderRightColor: lineDetail.timeBlockBorderColor,
  },
  time: {
    color: lineDetail.timeBlockTextColor,
  },
  infoSection: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg, // Increased from lineDetail.departureRowPadding for better spacing
  },
  directionLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  durationText: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  subtypeBadge: {
    alignSelf: 'center',
    marginRight: spacing.md,
  },
});
