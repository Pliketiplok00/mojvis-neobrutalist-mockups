/**
 * TodayDeparturesSection Component
 *
 * Today's departures section for transport overview screens.
 * Shared between SeaTransportScreen and RoadTransportScreen.
 *
 * Structure:
 * - Section label
 * - Empty state OR stacked set with shadow
 * - Each row: colored time block + direction + optional subtype badge
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { H2, Label } from '../../../ui/Text';
import { Badge } from '../../../ui/Badge';
import { skin } from '../../../ui/skin';
import type { TodayDepartureItem } from '../../../types/transport';

const { colors, spacing, components } = skin;
const listTokens = components.transport.list;

interface TodayDeparturesSectionProps {
  /** Today's departures data */
  departures: TodayDepartureItem[];
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
 * Stacked list of today's departures with neobrut shadow styling
 */
export function TodayDeparturesSection({
  departures,
  sectionLabel,
  emptyText,
  timeBlockBackground,
  onDeparturePress,
}: TodayDeparturesSectionProps): React.JSX.Element {
  const visibleDepartures = departures.slice(0, 10);

  return (
    <View style={styles.section}>
      <Label style={styles.sectionLabel}>{sectionLabel}</Label>
      {departures.length === 0 ? (
        <View style={styles.emptyState}>
          <Label>{emptyText}</Label>
        </View>
      ) : (
        <View style={styles.todaySetWrapper}>
          {/* Shadow layer */}
          <View style={styles.todaySetShadow} />
          {/* Main container */}
          <View style={styles.todaySet}>
            {visibleDepartures.map((dep, index) => (
              <Pressable
                key={`${dep.line_id}-${dep.departure_time}-${index}`}
                style={({ pressed }) => [
                  styles.todayRow,
                  index > 0 && styles.todayRowWithDivider,
                  pressed && styles.todayRowPressed,
                ]}
                onPress={() => onDeparturePress(dep.line_id)}
              >
                {/* Time block - colored like LineDetail */}
                <View style={[styles.todayTimeBlock, { backgroundColor: timeBlockBackground }]}>
                  <H2 style={styles.todayTime}>
                    {formatTime(dep.departure_time)}
                  </H2>
                </View>
                {/* Info - direction only, line name hidden per spec */}
                <View style={styles.todayInfo}>
                  <Label style={styles.todayLineName} numberOfLines={1}>
                    {dep.direction_label}
                  </Label>
                </View>
                {/* Subtype badge - cast needed until TodayDepartureItem type updated */}
                {(dep as unknown as { subtype?: string }).subtype && (
                  <Badge variant="transport" size="compact" style={styles.todaySubtypeBadge}>
                    {(dep as unknown as { subtype: string }).subtype}
                  </Badge>
                )}
              </Pressable>
            ))}
          </View>
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
  todaySetWrapper: {
    position: 'relative',
  },
  todaySetShadow: {
    position: 'absolute',
    top: listTokens.todaySetShadowOffsetY,
    left: listTokens.todaySetShadowOffsetX,
    right: -listTokens.todaySetShadowOffsetX,
    bottom: -listTokens.todaySetShadowOffsetY,
    backgroundColor: listTokens.todaySetShadowColor,
  },
  todaySet: {
    backgroundColor: listTokens.todaySetBackground,
    borderWidth: listTokens.todaySetBorderWidth,
    borderColor: listTokens.todaySetBorderColor,
    borderRadius: listTokens.todaySetRadius,
    overflow: 'hidden',
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: listTokens.todayRowBackground,
  },
  todayRowWithDivider: {
    borderTopWidth: listTokens.todayRowDividerWidth,
    borderTopColor: listTokens.todayRowDividerColor,
  },
  todayRowPressed: {
    transform: [
      { translateX: listTokens.todayRowPressedOffsetX },
      { translateY: listTokens.todayRowPressedOffsetY },
    ],
  },
  todayTimeBlock: {
    width: listTokens.todayTimeBlockWidth,
    borderRightWidth: listTokens.todayTimeBlockBorderWidth,
    borderRightColor: listTokens.todayTimeBlockBorderColor,
    paddingVertical: listTokens.todayTimeBlockPadding,
    paddingHorizontal: listTokens.todayTimeBlockPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayTime: {
    color: listTokens.todayTimeBlockTextColor,
  },
  todayInfo: {
    flex: 1,
    paddingVertical: listTokens.todayRowPadding,
    paddingHorizontal: spacing.md,
  },
  todayLineName: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  todaySubtypeBadge: {
    alignSelf: 'center',
    marginRight: spacing.md,
  },
});
