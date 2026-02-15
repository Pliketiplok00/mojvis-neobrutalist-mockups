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
  Pressable,
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
import { H1, Label, Meta, ButtonText } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { formatEventTime, formatDateISO, formatDateLocaleFull } from '../../utils/dateFormat';
import { Calendar } from './components/Calendar';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Event list item - V1 Poster style with icons and dual-layer shadow
 * Uses Pressable to avoid opacity dimming; shadow hides on press.
 */
function EventItem({ event, allDayText }: { event: Event; allDayText: string }): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { language } = useTranslations();

  return (
    <View style={styles.eventItemWrapper}>
      <Pressable
        onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      >
        {({ pressed }) => (
          <>
            {/* V1 Poster: Offset shadow layer - hidden when pressed */}
            {!pressed && <View style={styles.eventItemShadow} />}
            <View style={styles.eventItem}>
              <View style={styles.eventContent}>
                <ButtonText style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </ButtonText>
                {/* V1 Poster: Time row with clock icon */}
                <View style={styles.eventMetaRow}>
                  <Icon name="clock" size="xs" colorToken="textMuted" />
                  <Meta style={styles.eventMetaText} numberOfLines={1}>
                    {formatEventTime(event.start_datetime, event.is_all_day, allDayText, language)}
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
            </View>
          </>
        )}
      </Pressable>
    </View>
  );
}

export function EventsScreen(): React.JSX.Element {
  const { openMenu } = useMenu();
  const { t, language } = useTranslations();
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
      const dateStr = formatDateISO(date);
      const response = await eventsApi.getEvents(1, 50, dateStr, language);
      setEvents(response.events);
    } catch (err) {
      console.error('[Events] Error fetching events:', err);
      setError(t('events.error'));
    } finally {
      setLoading(false);
    }
  }, [language, t]);

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
              {formatDateLocaleFull(selectedDate.toISOString(), language).toUpperCase()}
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
    color: skin.colors.primaryText,
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

  // V1 Poster: Event cards with thick borders and dual-layer shadow
  eventItemWrapper: {
    position: 'relative',
    marginBottom: skin.components.events.card.marginBottom,
  },
  // Offset shadow layer (poster-style dual-layer effect)
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
  // V1 Poster: Empty state with dotted outline (no fill)
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

export default EventsScreen;
