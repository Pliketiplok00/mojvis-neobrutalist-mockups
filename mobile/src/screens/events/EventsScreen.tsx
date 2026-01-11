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

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isSelected && styles.calendarDaySelected,
            isToday && styles.calendarDayToday,
          ]}
          onPress={() => onSelectDate(date)}
        >
          <Label
            style={[
              styles.calendarDayText,
              isSelected && styles.calendarDayTextSelected,
            ]}
          >
            {day}
          </Label>
          {hasEvents && <View style={styles.eventDot} />}
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={styles.calendar}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={prevMonth} style={styles.calendarNav}>
          <Icon name="chevron-left" size="md" colorToken="textPrimary" />
        </TouchableOpacity>
        <H2 style={styles.calendarTitle}>
          {monthNames[month]} {year}
        </H2>
        <TouchableOpacity onPress={nextMonth} style={styles.calendarNav}>
          <Icon name="chevron-right" size="md" colorToken="textPrimary" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarDayNames}>
        {dayNames.map((name) => (
          <Meta key={name} style={styles.calendarDayName}>
            {name}
          </Meta>
        ))}
      </View>

      <View style={styles.calendarGrid}>{renderDays()}</View>
    </View>
  );
}

/**
 * Event list item
 */
function EventItem({ event, allDayText }: { event: Event; allDayText: string }): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  return (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
    >
      <View style={styles.eventTime}>
        <Label style={styles.eventTimeText}>
          {formatEventTime(event.start_datetime, event.is_all_day, allDayText)}
        </Label>
      </View>
      <View style={styles.eventContent}>
        <ButtonText style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </ButtonText>
        {event.location && (
          <Meta style={styles.eventLocation} numberOfLines={1}>
            {event.location}
          </Meta>
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
        {/* Banners */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <BannerList banners={banners} />
          </View>
        )}

        {/* Section title */}
        <View style={styles.section}>
          <H1 style={styles.sectionTitle}>{t('events.title')}</H1>
        </View>

        {/* Calendar */}
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          eventDates={eventDates}
          monthNames={monthNames}
          dayNames={dayNames}
        />

        {/* Selected day events */}
        <View style={styles.section}>
          <ButtonText style={styles.selectedDateTitle}>
            {selectedDate.toLocaleDateString('hr-HR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </ButtonText>

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
    paddingHorizontal: skin.spacing.lg,
    paddingTop: skin.spacing.lg,
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
  selectedDateTitle: {
    marginBottom: skin.spacing.lg,
    textTransform: 'capitalize',
  },

  // Calendar styles
  calendar: {
    backgroundColor: skin.colors.backgroundSecondary,
    margin: skin.spacing.lg,
    padding: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: skin.spacing.lg,
  },
  calendarNav: {
    padding: skin.spacing.sm,
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
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDayToday: {
    backgroundColor: skin.colors.borderLight,
    borderRadius: skin.borders.radiusPill,
  },
  calendarDaySelected: {
    backgroundColor: skin.colors.textPrimary,
    borderRadius: skin.borders.radiusPill,
  },
  calendarDayText: {
    color: skin.colors.textPrimary,
  },
  calendarDayTextSelected: {
    color: skin.colors.background,
  },
  eventDot: {
    position: 'absolute',
    bottom: skin.spacing.xs,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: skin.colors.urgent,
  },

  // Event list styles
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: skin.colors.background,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusCard,
    padding: skin.spacing.md,
    marginBottom: skin.spacing.md,
  },
  eventTime: {
    width: 60,
    marginRight: skin.spacing.md,
  },
  eventTimeText: {
    color: skin.colors.textPrimary,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    marginBottom: skin.spacing.xs,
  },
  eventLocation: {
    // Inherited from Meta primitive
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
