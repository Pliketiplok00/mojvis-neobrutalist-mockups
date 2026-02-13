/**
 * Mirror Events Screen (Design Mirror)
 *
 * Mirrors EventsScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Hero slab (V1 Poster)
 * 2. Calendar with month navigation and day selection
 * 3. Day header showing selected date
 * 4. Event list with dual-layer shadow cards
 * 5. Empty state
 *
 * Rules:
 * - NO useNavigation import
 * - NO useMenu hook
 * - NO useUserContext hook
 * - NO useTranslations hook
 * - NO API calls
 * - All actions are NO-OP
 * - Skin tokens only
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { skin } from '../../ui/skin';
import { H1, H2, Label, Body, Meta, ButtonText } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import type { Event } from '../../types/event';
import {
  eventListFixture,
  eventsLabels,
  monthNames,
  dayNamesShort,
} from '../fixtures/events';

/**
 * Get date string in YYYY-MM-DD format
 */
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format event time for display
 */
function formatEventTime(startDatetime: string, isAllDay: boolean, allDayText: string): string {
  if (isAllDay) {
    return allDayText;
  }
  const date = new Date(startDatetime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Simple calendar component (fixture version)
 */
function Calendar({
  selectedDate,
  onSelectDate,
  eventDates,
}: {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  eventDates: Set<string>;
}): React.JSX.Element {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay(); // 0 = Sunday

  const prevMonth = (): void => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = (): void => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const renderDays = (): React.JSX.Element[] => {
    const days: React.JSX.Element[] = [];
    const today = toDateString(new Date());
    const selected = toDateString(selectedDate);

    // Empty cells for days before first day of month
    for (let i = 0; i < startDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.calendarDayWrapper}>
          <View style={styles.calendarDayEmpty} />
        </View>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = toDateString(date);
      const isToday = dateStr === today;
      const isSelected = dateStr === selected;
      const hasEvents = eventDates.has(dateStr);

      days.push(
        <View key={day} style={styles.calendarDayWrapper}>
          {/* Offset shadow layer ONLY for selected day */}
          {isSelected && <View style={styles.calendarDayShadow} />}
          <TouchableOpacity
            style={[
              styles.calendarDay,
              hasEvents && !isSelected && !isToday && styles.calendarDayHasEvents,
              isToday && !isSelected && styles.calendarDayToday,
              isSelected && styles.calendarDaySelected,
            ]}
            onPress={() => onSelectDate(date)}
          >
            <Label
              style={[
                styles.calendarDayText,
                isSelected && styles.calendarDayTextSelected,
                isToday && !isSelected && styles.calendarDayTextToday,
              ]}
            >
              {day}
            </Label>
            {/* Blue square indicator for days with events (except when selected) */}
            {hasEvents && !isSelected && <View style={styles.eventIndicator} />}
          </TouchableOpacity>
        </View>
      );
    }

    return days;
  };

  return (
    <View style={styles.calendar}>
      {/* Month header with square nav buttons */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={prevMonth} style={styles.calendarNavButton}>
          <Icon name="chevron-left" size="md" colorToken="textPrimary" />
        </TouchableOpacity>
        <H2 style={styles.calendarTitle}>
          {monthNames[month].toUpperCase()} {year}
        </H2>
        <TouchableOpacity onPress={nextMonth} style={styles.calendarNavButton}>
          <Icon name="chevron-right" size="md" colorToken="textPrimary" />
        </TouchableOpacity>
      </View>

      {/* Day names header */}
      <View style={styles.calendarDayNames}>
        {dayNamesShort.map((name) => (
          <Label key={name} style={styles.calendarDayName}>
            {name}
          </Label>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>{renderDays()}</View>
    </View>
  );
}

/**
 * Event list item - V1 Poster style with icons and dual-layer shadow
 */
function EventItem({ event }: { event: Event }): React.JSX.Element {
  // NO-OP handler - mirror screens don't navigate
  const handlePress = (): void => {
    // Intentionally empty
  };

  return (
    <View style={styles.eventItemWrapper}>
      <Pressable onPress={handlePress}>
        {({ pressed }) => (
          <>
            {/* Offset shadow layer - hidden when pressed */}
            {!pressed && <View style={styles.eventItemShadow} />}
            <View style={styles.eventItem}>
              <View style={styles.eventContent}>
                <ButtonText style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </ButtonText>
                {/* Time row with clock icon */}
                <View style={styles.eventMetaRow}>
                  <Icon name="clock" size="sm" colorToken="textMuted" />
                  <Meta style={styles.eventMetaText} numberOfLines={1}>
                    {formatEventTime(event.start_datetime, event.is_all_day, eventsLabels.detail.allDay)}
                  </Meta>
                </View>
                {/* Location row with map-pin icon */}
                {event.location && (
                  <View style={styles.eventMetaRow}>
                    <Icon name="map-pin" size="sm" colorToken="textMuted" />
                    <Meta style={styles.eventMetaText} numberOfLines={1}>
                      {event.location}
                    </Meta>
                  </View>
                )}
              </View>
              <Icon name="chevron-right" size="sm" colorToken="chevron" />
            </View>
          </>
        )}
      </Pressable>
    </View>
  );
}

/**
 * Mirror Events Screen
 * Uses eventListFixture for visual state
 */
export function MirrorEventsScreen(): React.JSX.Element {
  // Default selected date to first event's date for visual testing
  const initialDate = new Date(eventListFixture[0]?.start_datetime || Date.now());
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Build event dates set from fixture
  const eventDates = new Set(
    eventListFixture.map((e) => toDateString(new Date(e.start_datetime)))
  );

  // Filter events for selected date
  const selectedDateStr = toDateString(selectedDate);
  const eventsForDay = eventListFixture.filter(
    (e) => toDateString(new Date(e.start_datetime)) === selectedDateStr
  );

  // Handle date selection
  const handleSelectDate = (date: Date): void => {
    setSelectedDate(date);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>Events Mirror</H2>
        <Meta style={styles.headerMeta}>fixture: eventListFixture ({eventListFixture.length} events)</Meta>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Hero Slab - V1 Poster */}
        <View style={styles.heroSection}>
          <H1 style={styles.heroTitle}>{eventsLabels.header.title.toUpperCase()}</H1>
        </View>

        {/* Calendar */}
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          eventDates={eventDates}
        />

        {/* Selected day events - heavy divider above */}
        <View style={styles.dayEventsSection}>
          <View style={styles.dayHeader}>
            <Label style={styles.selectedDateTitle}>
              {selectedDate.toLocaleDateString('hr-HR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).toUpperCase()}
            </Label>
          </View>

          {eventsForDay.length === 0 && (
            <View style={styles.emptyState}>
              <Label style={styles.emptyStateText}>
                {eventsLabels.calendar.noEvents}
              </Label>
            </View>
          )}

          {eventsForDay.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: skin.colors.background,
  },
  header: {
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
    backgroundColor: skin.colors.backgroundTertiary,
  },
  headerTitle: {
    marginBottom: skin.spacing.xs,
  },
  headerMeta: {
    color: skin.colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },

  // Hero slab matches Home exactly
  heroSection: {
    backgroundColor: skin.colors.primary,
    paddingHorizontal: skin.spacing.xl,
    paddingVertical: skin.spacing.xxl,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
  },
  heroTitle: {
    color: skin.colors.primaryText,
    marginBottom: skin.spacing.sm,
  },

  // Day events section with heavy divider above
  dayEventsSection: {
    padding: skin.spacing.lg,
    borderTopWidth: skin.borders.widthHeavy,
    borderTopColor: skin.colors.border,
  },
  dayHeader: {
    marginBottom: skin.spacing.lg,
  },
  selectedDateTitle: {
    // Inherited from Label primitive
  },

  // Calendar container
  calendar: {
    backgroundColor: skin.components.calendar.containerBackground,
    margin: skin.spacing.lg,
    padding: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: skin.spacing.lg,
  },
  calendarNavButton: {
    width: 44,
    height: 44,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    backgroundColor: skin.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: {
    // Inherited from H2 primitive
  },
  calendarDayNames: {
    flexDirection: 'row',
    marginBottom: skin.spacing.sm,
  },
  calendarDayName: {
    flex: 1,
    textAlign: 'center',
    fontWeight: skin.components.calendar.weekdayFontWeight,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: skin.components.calendar.dayTileGap,
    rowGap: skin.components.calendar.dayTileGapY,
  },
  calendarDayWrapper: {
    flexBasis: '13%',
    flexGrow: 1,
    maxWidth: '14.28%',
    aspectRatio: 1,
    minHeight: skin.sizes.calendarDayMinHeight,
    position: 'relative',
  },
  calendarDayEmpty: {
    flex: 1,
  },
  calendarDayShadow: {
    position: 'absolute',
    top: skin.components.calendar.selectedShadowOffsetY,
    left: skin.components.calendar.selectedShadowOffsetX,
    right: -skin.components.calendar.selectedShadowOffsetX,
    bottom: -skin.components.calendar.selectedShadowOffsetY,
    backgroundColor: skin.components.calendar.selectedShadowColor,
  },
  calendarDay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: skin.colors.background,
    padding: skin.components.calendar.dayTilePadding,
    overflow: 'visible',
  },
  calendarDayToday: {
    backgroundColor: skin.colors.calendarToday,
    borderWidth: skin.components.calendar.dayTileBorderWidth,
    borderColor: skin.components.calendar.dayTileBorderColor,
  },
  calendarDaySelected: {
    backgroundColor: skin.colors.calendarSelected,
    borderWidth: skin.components.calendar.dayTileBorderWidth,
    borderColor: skin.components.calendar.dayTileBorderColor,
  },
  calendarDayHasEvents: {
    backgroundColor: skin.colors.calendarHasEvents,
    borderWidth: skin.components.calendar.dayTileBorderWidth,
    borderColor: skin.components.calendar.dayTileBorderColor,
  },
  calendarDayText: {
    color: skin.components.calendar.dayNumberColor,
    fontWeight: skin.components.calendar.dayNumberFontWeight,
  },
  calendarDayTextSelected: {
    color: skin.components.calendar.selectedDayNumberColor,
  },
  calendarDayTextToday: {
    color: skin.components.calendar.dayNumberColor,
  },
  eventIndicator: {
    marginTop: skin.components.calendar.eventIndicatorMarginTop,
    width: skin.sizes.calendarEventIndicator,
    height: skin.sizes.calendarEventIndicator,
    backgroundColor: skin.colors.calendarEventIndicator,
  },

  // Event cards with thick borders and dual-layer shadow
  eventItemWrapper: {
    position: 'relative',
    marginBottom: skin.components.events.card.marginBottom,
  },
  eventItemShadow: {
    position: 'absolute',
    top: skin.components.events.card.shadowOffsetY,
    left: skin.components.events.card.shadowOffsetX,
    right: -skin.components.events.card.shadowOffsetX,
    bottom: -skin.components.events.card.shadowOffsetY,
    backgroundColor: skin.components.events.card.shadowColor,
    borderRadius: skin.components.events.card.borderRadius,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: skin.components.events.card.background,
    borderWidth: skin.components.events.card.borderWidth,
    borderColor: skin.components.events.card.borderColor,
    borderRadius: skin.components.events.card.borderRadius,
    padding: skin.components.events.card.padding,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    marginBottom: skin.spacing.sm,
    textTransform: 'uppercase',
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.sm,
    marginTop: skin.spacing.xs,
  },
  eventMetaText: {
    flex: 1,
    flexShrink: 1,
  },

  // Empty state with dotted outline
  emptyState: {
    backgroundColor: skin.components.events.emptyStateBackground,
    padding: skin.components.events.emptyStatePadding,
    borderRadius: skin.components.events.emptyStateBorderRadius,
    borderWidth: skin.components.events.emptyStateBorderWidth,
    borderColor: skin.components.events.emptyStateBorderColor,
    borderStyle: skin.components.events.emptyStateBorderStyle,
    alignItems: 'center',
  },
  emptyStateText: {
    color: skin.colors.textMuted,
  },
});

export default MirrorEventsScreen;
