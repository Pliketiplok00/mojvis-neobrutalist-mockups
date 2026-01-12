/**
 * Events Screen
 *
 * Calendar overview with selected-day event list.
 *
 * Per spec:
 * - Root screen (hamburger menu, not back)
 * - Calendar defaults to TODAY
 * - Days with events are visually marked
 * - Selected day shows event list below
 * - Events ordered chronologically
 *
 * V1 Poster Style:
 * - Hero slab (matches Home exactly)
 * - Sharp calendar tiles (no circles/pills)
 * - Thick borders on calendar and cards
 * - Poster-style event cards
 *
 * Skin-pure: Uses skin tokens, Text primitives, and Icon (no hardcoded hex, no text glyphs).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { useMenu } from '../../contexts/MenuContext';
import { useUserContext } from '../../hooks/useUserContext';
import { useTranslations } from '../../i18n';
import { eventsApi, inboxApi } from '../../services/api';
import type { Event } from '../../types/event';
import type { InboxMessage } from '../../types/inbox';
import type { MainStackParamList } from '../../navigation/types';
import { skin } from '../../ui/skin';
import { H1, H2, Label, Body, Meta, ButtonText } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { formatEventTime } from '../../utils/dateFormat';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Get date string in YYYY-MM-DD format
 */
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Simple calendar component
 */
function Calendar({
  selectedDate,
  onSelectDate,
  eventDates,
  monthNames,
  dayNames,
}: {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  eventDates: Set<string>;
  monthNames: string[];
  dayNames: string[];
}): React.JSX.Element {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay(); // 0 = Sunday

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const renderDays = () => {
    const days: React.JSX.Element[] = [];
    const today = toDateString(new Date());
    const selected = toDateString(selectedDate);

    // Empty cells for days before first day of month
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = toDateString(date);
      const isToday = dateStr === today;
      const isSelected = dateStr === selected;
      const hasEvents = eventDates.has(dateStr);

      // V1 Poster: State priority: selected > today > hasEvents
      // Apply styles in correct order so higher priority overrides lower
      days.push(
        <TouchableOpacity
          key={day}
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
          {/* V1 Poster: Show blue square indicator for days with events (except when selected) */}
          {hasEvents && !isSelected && <View style={styles.eventIndicator} />}
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={styles.calendar}>
      {/* V1 Poster: Month header with square nav buttons */}
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
        {dayNames.map((name) => (
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
 * Event list item - V1 Poster style with icons
 */
function EventItem({ event, allDayText }: { event: Event; allDayText: string }): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  return (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
    >
      <View style={styles.eventContent}>
        <ButtonText style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </ButtonText>
        {/* V1 Poster: Time row with clock icon */}
        <View style={styles.eventMetaRow}>
          <Icon name="clock" size="xs" colorToken="textMuted" />
          <Meta style={styles.eventMetaText} numberOfLines={1}>
            {formatEventTime(event.start_datetime, event.is_all_day, allDayText)}
          </Meta>
        </View>
        {/* V1 Poster: Location row with map-pin icon */}
        {event.location && (
          <View style={styles.eventMetaRow}>
            <Icon name="map-pin" size="xs" colorToken="textMuted" />
            <Meta style={styles.eventMetaText} numberOfLines={1}>
              {event.location}
            </Meta>
          </View>
        )}
      </View>
      <Icon name="chevron-right" size="sm" colorToken="chevron" />
    </TouchableOpacity>
  );
}

export function EventsScreen(): React.JSX.Element {
  const { openMenu } = useMenu();
  const { t } = useTranslations();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [eventDates, setEventDates] = useState<Set<string>>(new Set());
  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userContext = useUserContext();

  // Get translated month and day names
  const monthNames = [
    t('events.calendar.months.january'),
    t('events.calendar.months.february'),
    t('events.calendar.months.march'),
    t('events.calendar.months.april'),
    t('events.calendar.months.may'),
    t('events.calendar.months.june'),
    t('events.calendar.months.july'),
    t('events.calendar.months.august'),
    t('events.calendar.months.september'),
    t('events.calendar.months.october'),
    t('events.calendar.months.november'),
    t('events.calendar.months.december'),
  ];

  const dayNames = [
    t('events.calendar.days.sun'),
    t('events.calendar.days.mon'),
    t('events.calendar.days.tue'),
    t('events.calendar.days.wed'),
    t('events.calendar.days.thu'),
    t('events.calendar.days.fri'),
    t('events.calendar.days.sat'),
  ];

  const handleMenuPress = (): void => {
    openMenu();
  };

  // Fetch banners for events (Phase 2: hitno + kultura)
  const fetchBanners = useCallback(async () => {
    try {
      const response = await inboxApi.getActiveBanners(userContext, 'events');
      setBanners(response.banners);
    } catch (err) {
      console.error('[Events] Error fetching banners:', err);
    }
  }, [userContext]);

  // Fetch event dates for calendar
  const fetchEventDates = useCallback(async (year: number, month: number) => {
    try {
      const response = await eventsApi.getEventDates(year, month);
      setEventDates(new Set(response.dates));
    } catch (err) {
      console.error('[Events] Error fetching event dates:', err);
    }
  }, []);

  // Fetch events for selected date
  const fetchEvents = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = toDateString(date);
      const response = await eventsApi.getEvents(1, 50, dateStr);
      setEvents(response.events);
    } catch (err) {
      console.error('[Events] Error fetching events:', err);
      setError(t('events.error'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const now = new Date();
    void fetchEventDates(now.getFullYear(), now.getMonth() + 1);
    void fetchEvents(now);
    void fetchBanners();
  }, [fetchEventDates, fetchEvents, fetchBanners]);

  // Handle date selection
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    void fetchEvents(date);
    // Fetch event dates if month changed
    if (
      date.getMonth() !== selectedDate.getMonth() ||
      date.getFullYear() !== selectedDate.getFullYear()
    ) {
      void fetchEventDates(date.getFullYear(), date.getMonth() + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="root" onMenuPress={handleMenuPress} />

      <ScrollView style={styles.scrollView}>
        {/* Banners - V1 Poster: edge-to-edge */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <BannerList banners={banners} />
          </View>
        )}

        {/* Hero Slab - V1 Poster: matches Home exactly */}
        <View style={styles.heroSection}>
          <H1 style={styles.heroTitle}>{t('events.title').toUpperCase()}</H1>
        </View>

        {/* Calendar */}
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          eventDates={eventDates}
          monthNames={monthNames}
          dayNames={dayNames}
        />

        {/* Selected day events - V1 Poster: heavy divider above */}
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

          {loading && (
            <ActivityIndicator size="large" color={skin.colors.textPrimary} style={styles.loader} />
          )}

          {error && <Label style={styles.errorText}>{error}</Label>}

          {!loading && !error && events.length === 0 && (
            <View style={styles.emptyState}>
              <Label style={styles.emptyStateText}>
                {t('events.noEvents')}
              </Label>
            </View>
          )}

          {!loading && events.map((event) => (
            <EventItem key={event.id} event={event} allDayText={t('events.allDay')} />
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
  scrollView: {
    flex: 1,
  },
  bannerSection: {
    // V1 Poster: Banners edge-to-edge, no padding
  },

  // V1 Poster: Hero slab matches Home exactly
  heroSection: {
    backgroundColor: skin.colors.primary,
    paddingHorizontal: skin.spacing.xl,
    paddingVertical: skin.spacing.xxl,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
  },
  heroTitle: {
    color: 'white',
    marginBottom: skin.spacing.sm,
  },

  section: {
    padding: skin.spacing.lg,
  },
  sectionTitle: {
    marginBottom: skin.spacing.xs,
  },
  sectionSubtitle: {
    // Inherited from Meta primitive
  },

  // V1 Poster: Day events section with heavy divider above
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

  // V1 Poster: Calendar with thick borders and sharp corners
  calendar: {
    backgroundColor: skin.colors.backgroundSecondary,
    margin: skin.spacing.lg,
    padding: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard, // Sharp: 0
    borderWidth: skin.borders.widthCard, // Thick: 3px
    borderColor: skin.colors.border,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: skin.spacing.lg,
  },
  // V1 Poster: Square nav buttons with thick borders
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
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // V1 Poster: Add row gap to prevent vertical squashing
    rowGap: skin.spacing.xs,
  },
  // V1 Poster: Sharp calendar tiles (squares, not squashed)
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    minHeight: skin.sizes.calendarDayMinHeight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    // Ensure indicator is not clipped
    overflow: 'visible',
  },
  // V1 Poster: Yellow fill for today
  calendarDayToday: {
    backgroundColor: skin.colors.calendarToday,
  },
  // V1 Poster: Blue fill for selected
  calendarDaySelected: {
    backgroundColor: skin.colors.calendarSelected,
  },
  // V1 Poster: Green-ish fill for days with events
  calendarDayHasEvents: {
    backgroundColor: skin.colors.calendarHasEvents,
  },
  calendarDayText: {
    color: skin.colors.textPrimary,
  },
  calendarDayTextSelected: {
    color: skin.colors.background,
  },
  // V1 Poster: Ensure contrast on yellow today tile
  calendarDayTextToday: {
    color: skin.colors.textPrimary,
  },
  // V1 Poster: Blue square indicator for days with events
  eventIndicator: {
    position: 'absolute',
    bottom: skin.spacing.xs,
    width: skin.sizes.calendarEventIndicator,
    height: skin.sizes.calendarEventIndicator,
    // Sharp square (no borderRadius)
    backgroundColor: skin.colors.calendarEventIndicator,
    // Ensure visibility
    zIndex: 1,
  },

  // V1 Poster: Event cards with thick borders
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: skin.colors.background,
    borderWidth: skin.borders.widthCard, // Thick: 3px
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusCard, // Sharp: 0
    padding: skin.spacing.md,
    marginBottom: skin.spacing.md,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    marginBottom: skin.spacing.sm,
  },
  // V1 Poster: Meta row with icon + text (horizontal layout)
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.sm, // Increased gap for better readability
    marginTop: skin.spacing.xs,
  },
  eventMetaText: {
    flex: 1,
    // Ensure text doesn't push icon to new line
    flexShrink: 1,
  },

  // States
  loader: {
    marginTop: skin.spacing.xxl,
  },
  errorText: {
    textAlign: 'center',
    marginTop: skin.spacing.lg,
    color: skin.colors.errorText,
  },
  emptyState: {
    backgroundColor: skin.colors.backgroundSecondary,
    padding: skin.spacing.xxl,
    borderRadius: skin.borders.radiusCard,
    alignItems: 'center',
  },
  emptyStateText: {
    color: skin.colors.textMuted,
  },
});

export default EventsScreen;
