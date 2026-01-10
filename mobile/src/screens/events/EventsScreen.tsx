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
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Format date for display (DD/MM/YYYY, HH:mm)
 */
function formatDateTime(dateStr: string, isAllDay: boolean, allDayText: string): string {
  const date = new Date(dateStr);
  if (isAllDay) {
    return allDayText;
  }
  return date.toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

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
          <Text
            style={[
              styles.calendarDayText,
              isSelected && styles.calendarDayTextSelected,
            ]}
          >
            {day}
          </Text>
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
          <Text style={styles.calendarNavText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.calendarTitle}>
          {monthNames[month]} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.calendarNav}>
          <Text style={styles.calendarNavText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarDayNames}>
        {dayNames.map((name) => (
          <Text key={name} style={styles.calendarDayName}>
            {name}
          </Text>
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
        <Text style={styles.eventTimeText}>
          {formatDateTime(event.start_datetime, event.is_all_day, allDayText)}
        </Text>
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>
        {event.location && (
          <Text style={styles.eventLocation} numberOfLines={1}>
            {event.location}
          </Text>
        )}
      </View>
      <Text style={styles.eventArrow}>{'>'}</Text>
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
          <Text style={styles.sectionTitle}>{t('events.title')}</Text>
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
          <Text style={styles.selectedDateTitle}>
            {selectedDate.toLocaleDateString('hr-HR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>

          {loading && (
            <ActivityIndicator size="large" color="#000000" style={styles.loader} />
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {!loading && !error && events.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {t('events.noEvents')}
              </Text>
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
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  bannerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textTransform: 'capitalize',
  },

  // Calendar styles
  calendar: {
    backgroundColor: '#F5F5F5',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNav: {
    padding: 8,
  },
  calendarNavText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  calendarDayNames: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
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
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
  },
  calendarDaySelected: {
    backgroundColor: '#000000',
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#000000',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF0000',
  },

  // Event list styles
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  eventTime: {
    width: 60,
    marginRight: 12,
  },
  eventTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 12,
    color: '#666666',
  },
  eventArrow: {
    fontSize: 18,
    color: '#000000',
    marginLeft: 8,
  },

  // States
  loader: {
    marginTop: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyState: {
    backgroundColor: '#F5F5F5',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
  },
});

export default EventsScreen;
