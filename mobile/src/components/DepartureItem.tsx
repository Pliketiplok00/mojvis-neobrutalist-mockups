/**
 * Departure Item Component
 *
 * Displays a single departure with expandable stop times.
 *
 * Collapsed state:
 * - Departure time, destination, duration
 *
 * Expanded state:
 * - Vertical timeline with stop times
 * - Only shows stops where vessel STOPS (no null times)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import type { DepartureResponse } from '../types/transport';
import { skin } from '../ui/skin';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DepartureItemProps {
  departure: DepartureResponse;
}

export function DepartureItem({ departure }: DepartureItemProps): React.JSX.Element {
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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={hasStopTimes ? toggleExpanded : undefined}
      activeOpacity={hasStopTimes ? 0.7 : 1}
    >
      {/* Header - always visible */}
      <View style={styles.header}>
        <Text style={styles.departureTime}>{departure.departure_time}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.destination} numberOfLines={1}>
            {departure.destination}
          </Text>
          {departure.duration_minutes && (
            <Text style={styles.duration}>
              {formatDuration(departure.duration_minutes)}
            </Text>
          )}
        </View>
        {hasStopTimes && (
          <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
        )}
      </View>

      {/* Notes - if present */}
      {departure.notes && (
        <Text style={styles.notes}>{departure.notes}</Text>
      )}

      {/* Expanded content - stop times timeline */}
      {expanded && hasStopTimes && (
        <View style={styles.timeline}>
          {departure.stop_times.map((stop, index) => (
            <View key={`${stop.stop_name}-${index}`} style={styles.timelineItem}>
              {/* Timeline line and dot */}
              <View style={styles.timelineIndicator}>
                <View
                  style={[
                    styles.timelineDot,
                    index === 0 && styles.timelineDotFirst,
                    index === departure.stop_times.length - 1 && styles.timelineDotLast,
                  ]}
                />
                {index < departure.stop_times.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              {/* Stop info */}
              <View style={styles.stopInfo}>
                <Text style={styles.stopTime}>{stop.arrival_time}</Text>
                <Text style={styles.stopName} numberOfLines={1}>
                  {stop.stop_name}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: skin.colors.backgroundTertiary,
    borderWidth: 2,
    borderColor: skin.colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  departureTime: {
    fontSize: 20,
    fontWeight: '700',
    color: skin.colors.textPrimary,
    width: 70,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  destination: {
    fontSize: 14,
    fontWeight: '500',
    color: skin.colors.textPrimary,
  },
  duration: {
    fontSize: 12,
    color: skin.colors.textMuted,
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: skin.colors.textPrimary,
    width: 24,
    textAlign: 'center',
  },
  notes: {
    fontSize: 12,
    color: skin.colors.warningText,
    backgroundColor: skin.colors.warningBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  timeline: {
    marginTop: 16,
    marginLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 36,
  },
  timelineIndicator: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: skin.colors.textMuted,
  },
  timelineDotFirst: {
    backgroundColor: skin.colors.textPrimary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineDotLast: {
    backgroundColor: skin.colors.textPrimary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: skin.colors.borderLight,
    marginTop: 4,
  },
  stopInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 12,
    paddingBottom: 12,
  },
  stopTime: {
    fontSize: 14,
    fontWeight: '600',
    color: skin.colors.textPrimary,
    width: 50,
  },
  stopName: {
    flex: 1,
    fontSize: 14,
    color: skin.colors.textSecondary,
    marginLeft: 8,
  },
});

export default DepartureItem;
