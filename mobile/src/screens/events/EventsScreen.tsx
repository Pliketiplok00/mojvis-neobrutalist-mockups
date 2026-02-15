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

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { useMenu } from '../../contexts/MenuContext';
import { useEvents } from '../../hooks/useEvents';
import { useTranslations } from '../../i18n';
import { skin } from '../../ui/skin';
import { H1, Label } from '../../ui/Text';
import { formatDateLocaleFull } from '../../utils/dateFormat';
import { Calendar } from './components/Calendar';
import { EventItem } from './components/EventItem';

export function EventsScreen(): React.JSX.Element {
  const { openMenu } = useMenu();
  const { t, language } = useTranslations();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Events data hook
  const {
    events,
    eventDates,
    banners,
    loading,
    error,
    fetchEventsForDate,
    fetchEventDatesForMonth,
  } = useEvents({ selectedDate });

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

  // Handle date selection
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    void fetchEventsForDate(date);
    // Fetch event dates if month changed
    if (
      date.getMonth() !== selectedDate.getMonth() ||
      date.getFullYear() !== selectedDate.getFullYear()
    ) {
      void fetchEventDatesForMonth(date.getFullYear(), date.getMonth() + 1);
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
