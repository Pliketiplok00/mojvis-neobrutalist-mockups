/**
 * UpcomingEventsSection Component
 *
 * Displays upcoming events on Home screen with ticket-style cards.
 * Neobrut style with shadow offset effect.
 *
 * Features:
 * - Date badge with day + month
 * - Event title and location
 * - First event highlighted with different color
 * - Placeholder when no events
 *
 * Extracted from HomeScreen.
 */

import React, { memo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { H2, Label, Meta } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { skin } from '../../../ui/skin';
import type { Event } from '../../../types/event';

interface EventCardProps {
  event: Event;
  isFirst: boolean;
  onPress: (eventId: string) => void;
}

/**
 * Single event card - memoized to prevent re-renders
 */
const EventCard = memo(function EventCard({
  event,
  isFirst,
  onPress,
}: EventCardProps): React.JSX.Element {
  const { day, month } = formatEventDate(event.start_datetime);

  const handlePress = useCallback(() => {
    onPress(event.id);
  }, [onPress, event.id]);

  return (
    <TouchableOpacity
      style={styles.eventCardWrapper}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Shadow layer */}
      <View style={[styles.eventCardShadow, isFirst && styles.eventCardShadowFirst]} />
      {/* Event card */}
      <View style={[styles.eventCard, isFirst && styles.eventCardFirst]}>
        {/* Date badge */}
        <View style={styles.dateBadge}>
          <Label style={styles.dateBadgeDay}>{day}</Label>
          <Meta style={styles.dateBadgeMonth}>{month}</Meta>
        </View>
        {/* Event content */}
        <View style={styles.eventContent}>
          <Label style={styles.eventTitle} numberOfLines={1}>{event.title}</Label>
          <Meta style={styles.eventLocation} numberOfLines={1}>
            {event.location ?? ''}
          </Meta>
        </View>
        {/* Arrow */}
        <View style={styles.eventArrow}>
          <Icon name="chevron-right" size="md" colorToken="textPrimary" />
        </View>
      </View>
    </TouchableOpacity>
  );
});

interface UpcomingEventsSectionProps {
  /** Upcoming events to display */
  events: Event[];
  /** Section title (translated) */
  sectionTitle: string;
  /** Placeholder text when no events */
  placeholderText: string;
  /** "View all events" text */
  viewAllText: string;
  /** Press handler for individual event */
  onEventPress: (eventId: string) => void;
  /** Press handler for "see all" / placeholder */
  onSeeAllPress: () => void;
}

/**
 * Format event date for display (day + month abbreviation)
 */
function formatEventDate(isoString: string): { day: string; month: string } {
  const date = new Date(isoString);
  const day = date.getDate().toString();
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = monthNames[date.getMonth()];
  return { day, month };
}

/**
 * Upcoming events section with ticket-style cards
 */
export function UpcomingEventsSection({
  events,
  sectionTitle,
  placeholderText,
  viewAllText,
  onEventPress,
  onSeeAllPress,
}: UpcomingEventsSectionProps): React.JSX.Element {
  return (
    <View style={styles.eventsSection}>
      <H2 style={styles.sectionLabel}>{sectionTitle}</H2>
      {events.length > 0 ? (
        // Show actual upcoming events
        events.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            isFirst={index === 0}
            onPress={onEventPress}
          />
        ))
      ) : (
        // Fallback placeholder when no events
        <TouchableOpacity
          style={styles.eventCardWrapper}
          onPress={onSeeAllPress}
          activeOpacity={0.8}
        >
          <View style={[styles.eventCardShadow, styles.eventCardShadowFirst]} />
          <View style={[styles.eventCard, styles.eventCardFirst]}>
            <View style={styles.dateBadge}>
              <Label style={styles.dateBadgeDay}>--</Label>
              <Meta style={styles.dateBadgeMonth}>---</Meta>
            </View>
            <View style={styles.eventContent}>
              <Label style={styles.eventTitle}>{placeholderText}</Label>
              <Meta style={styles.eventLocation}>{viewAllText}</Meta>
            </View>
            <View style={styles.eventArrow}>
              <Icon name="chevron-right" size="md" colorToken="textPrimary" />
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  eventsSection: {
    paddingHorizontal: skin.spacing.lg,
    paddingTop: skin.spacing.xl,
  },
  sectionLabel: {
    color: skin.colors.textMuted,
    marginBottom: skin.spacing.md,
    letterSpacing: 1,
  },
  eventCardWrapper: {
    position: 'relative',
    marginBottom: skin.spacing.md,
  },
  eventCardShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: skin.colors.border,
  },
  eventCardShadowFirst: {
    backgroundColor: skin.colors.primary,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: skin.colors.background,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    padding: skin.spacing.md,
    gap: skin.spacing.md,
  },
  eventCardFirst: {
    backgroundColor: skin.colors.warningAccent,
  },
  dateBadge: {
    width: 48,
    height: 48,
    backgroundColor: skin.colors.primary,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadgeDay: {
    color: skin.colors.primaryText,
    fontWeight: '700',
    fontSize: skin.typography.fontSize.xl,
    lineHeight: skin.typography.fontSize.xl,
  },
  dateBadgeMonth: {
    color: skin.colors.primaryTextMuted,
    textTransform: 'uppercase',
    fontSize: skin.typography.fontSize.xs,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    color: skin.colors.textPrimary,
    fontWeight: '700',
  },
  eventLocation: {
    color: skin.colors.textMuted,
    marginTop: skin.spacing.xs,
  },
  eventArrow: {
    // Icon handles sizing
  },
});
