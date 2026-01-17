/**
 * Departure Item Component
 *
 * Displays a single departure with expandable stop times.
 * V1 Poster Style with colored time block and offset shadow.
 *
 * Collapsed state:
 * - Colored time block (left) + destination/duration (right) + chevron
 *
 * Expanded state:
 * - Vertical timeline with stop times
 * - (+1 dan) indicator for overnight arrivals
 * - Only shows stops where vessel STOPS (no null times)
 *
 * Skin-pure: Uses skin tokens and Icon primitive (no hardcoded hex).
 */

import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import type { DepartureResponse } from '../types/transport';
import type { TransportType } from '../types/transport';
import { skin } from '../ui/skin';
import { Icon } from '../ui/Icon';
import { H2, Label, Body, Meta } from '../ui/Text';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DepartureItemProps {
  departure: DepartureResponse;
  transportType: TransportType;
}

const { colors, spacing, borders, components } = skin;
const lineDetail = components.transport.lineDetail;

/**
 * Parse time string (HH:MM or HH:MM:SS) to minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
  const parts = time.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

/**
 * Check if arrival crosses midnight relative to departure
 * Returns true if arrival time is earlier than departure time (next day)
 */
function isNextDay(departureTime: string, arrivalTime: string): boolean {
  const depMinutes = parseTimeToMinutes(departureTime);
  const arrMinutes = parseTimeToMinutes(arrivalTime);
  return arrMinutes < depMinutes;
}

/**
 * Format time for display (strip seconds if present)
 */
function formatTime(time: string): string {
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
}

export function DepartureItem({ departure, transportType }: DepartureItemProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const hasStopTimes = departure.stop_times.length > 0;
  const departureTimeFormatted = formatTime(departure.departure_time);

  // Get transport-type-specific colors
  const timeBlockBackground = transportType === 'sea'
    ? lineDetail.timeBlockBackgroundSea
    : lineDetail.timeBlockBackgroundRoad;

  return (
    <View style={styles.wrapper}>
      {/* Offset Shadow Layer */}
      <View style={styles.shadowLayer} />

      {/* Main Card */}
      <Pressable
        style={({ pressed }) => [
          styles.container,
          hasStopTimes && pressed && styles.containerPressed,
        ]}
        onPress={hasStopTimes ? toggleExpanded : undefined}
      >
        {/* Header Row */}
        <View style={styles.header}>
          {/* Time Block */}
          <View style={[styles.timeBlock, { backgroundColor: timeBlockBackground }]}>
            <H2 style={styles.departureTime}>
              {departureTimeFormatted}
              {departure.marker ? ` ${departure.marker}` : ''}
            </H2>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Label style={styles.destination} numberOfLines={1}>
              {departure.destination}
            </Label>
            <View style={styles.metaRow}>
              {departure.duration_minutes && (
                <Meta style={styles.duration}>
                  {formatDuration(departure.duration_minutes)}
                </Meta>
              )}
              {hasStopTimes && departure.stop_times.length > 2 && (
                <Meta style={styles.stopsCount}>
                  {departure.stop_times.length} stanica
                </Meta>
              )}
            </View>
          </View>

          {/* Expand Chevron */}
          {hasStopTimes && (
            <View style={styles.expandIconContainer}>
              <Icon
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size="md"
                colorToken="textPrimary"
              />
            </View>
          )}
        </View>

        {/* Notes Badge */}
        {departure.notes && (
          <View style={styles.notesBadge}>
            <Meta style={styles.notesText}>{departure.notes}</Meta>
          </View>
        )}

        {/* Expanded Timeline */}
        {expanded && hasStopTimes && (
          <View style={styles.timeline}>
            {departure.stop_times.map((stop, index) => {
              const isFirst = index === 0;
              const isLast = index === departure.stop_times.length - 1;
              const arrivalTimeFormatted = formatTime(stop.arrival_time);
              const showNextDay = !isFirst && isNextDay(departure.departure_time, stop.arrival_time);

              return (
                <View key={`${stop.stop_name}-${index}`} style={styles.timelineItem}>
                  {/* Timeline Indicator (dot + line) */}
                  <View style={styles.timelineIndicator}>
                    <View
                      style={[
                        styles.timelineDot,
                        (isFirst || isLast) && styles.timelineDotEndpoint,
                      ]}
                    />
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  {/* Stop Info */}
                  <View style={styles.stopInfo}>
                    <View style={styles.stopTimeContainer}>
                      <Label style={styles.stopTime}>{arrivalTimeFormatted}</Label>
                      {showNextDay && (
                        <Meta style={styles.nextDayIndicator}>(+1 dan)</Meta>
                      )}
                    </View>
                    <Body style={styles.stopName} numberOfLines={1}>
                      {stop.stop_name}
                    </Body>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: lineDetail.shadowOffsetY,
    left: lineDetail.shadowOffsetX,
    right: -lineDetail.shadowOffsetX,
    bottom: -lineDetail.shadowOffsetY,
    backgroundColor: lineDetail.shadowColor,
  },
  container: {
    backgroundColor: lineDetail.departureRowBackground,
    borderWidth: lineDetail.departureRowBorderWidth,
    borderColor: lineDetail.departureRowBorderColor,
    borderRadius: lineDetail.departureRowRadius,
    overflow: 'hidden',
  },
  containerPressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  departureTime: {
    color: lineDetail.timeBlockTextColor,
  },
  infoSection: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: lineDetail.departureRowPadding,
  },
  destination: {
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  duration: {
    color: colors.textSecondary,
  },
  stopsCount: {
    color: colors.textSecondary,
  },
  expandIconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesBadge: {
    backgroundColor: lineDetail.notesBadgeBackground,
    paddingHorizontal: lineDetail.notesBadgePadding,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  notesText: {
    color: colors.textPrimary,
  },

  // Timeline (expanded)
  timeline: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: borders.widthThin,
    borderTopColor: colors.borderLight,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 40,
    paddingTop: spacing.md,
  },
  timelineIndicator: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: lineDetail.timelineDotSize,
    height: lineDetail.timelineDotSize,
    borderRadius: lineDetail.timelineDotSize / 2,
    backgroundColor: lineDetail.timelineDotColor,
  },
  timelineDotEndpoint: {
    width: lineDetail.timelineDotSizeEndpoint,
    height: lineDetail.timelineDotSizeEndpoint,
    borderRadius: lineDetail.timelineDotSizeEndpoint / 2,
    backgroundColor: lineDetail.timelineDotEndpointColor,
  },
  timelineLine: {
    width: lineDetail.timelineLineWidth,
    flex: 1,
    backgroundColor: lineDetail.timelineLineColor,
    marginTop: spacing.xs,
  },
  stopInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: spacing.sm,
  },
  stopTimeContainer: {
    width: lineDetail.timelineStopTimeWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stopTime: {
    color: colors.textPrimary,
  },
  nextDayIndicator: {
    color: colors.warningText,
    backgroundColor: colors.warningBackground,
    paddingHorizontal: spacing.xs,
  },
  stopName: {
    flex: 1,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});

export default DepartureItem;
