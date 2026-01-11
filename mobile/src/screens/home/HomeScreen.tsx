/**
 * Home Screen (HOME_01)
 *
 * Main landing screen after onboarding.
 * V1 Poster Layout - Neobrutalist Mediterranean style.
 *
 * Sections (per spec):
 * 1. Active Notifications (banner if active)
 * 2. Hero Block (full-width primary slab)
 * 3. Quick Access Grid (2x2 colored tiles with icons)
 * 4. Upcoming Events (ticket-style cards)
 * 5. Feedback CTA (full-width green panel)
 *
 * REFACTORED: Now uses UI primitives from src/ui/
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BannerList } from '../../components/Banner';
import { useMenu } from '../../contexts/MenuContext';
import { useUserContext } from '../../hooks/useUserContext';
import { useTranslations } from '../../i18n';
import { inboxApi, eventsApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { Event } from '../../types/event';
import type { MainStackParamList } from '../../navigation/types';

// UI Primitives
import {
  skin,
  Header,
  H1,
  H2,
  Body,
  Label,
  Meta,
  Icon,
  IconBox,
} from '../../ui';
import type { IconName } from '../../ui/Icon';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Category configuration with icons and colors per V1 design system
const CATEGORIES: Array<{
  key: string;
  icon: IconName;
  backgroundColor: string;
  textColor: string;
  route: keyof MainStackParamList;
}> = [
  {
    key: 'events',
    icon: 'calendar',
    backgroundColor: skin.colors.primary,
    textColor: 'white',
    route: 'Events',
  },
  {
    key: 'transport',
    icon: 'ship',
    backgroundColor: skin.colors.successAccent,
    textColor: 'white',
    route: 'TransportHub',
  },
  {
    key: 'info',
    icon: 'info',
    backgroundColor: skin.colors.warningAccent,
    textColor: skin.colors.textPrimary,
    route: 'StaticPage',
  },
  {
    key: 'contacts',
    icon: 'phone',
    backgroundColor: skin.colors.urgent,
    textColor: 'white',
    route: 'StaticPage',
  },
];

export function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { openMenu } = useMenu();
  const { t } = useTranslations();
  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const userContext = useUserContext();

  const fetchBanners = useCallback(async () => {
    try {
      // Pass 'home' screen context for banner filtering
      const response = await inboxApi.getActiveBanners(userContext, 'home');
      setBanners(response.banners);
    } catch (err) {
      console.error('[Home] Error fetching banners:', err);
      // Silently fail - banners are optional
    }
  }, [userContext]);

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      // Fetch events (backend returns all events sorted by date)
      const response = await eventsApi.getEvents(1, 20);
      // Filter to only show events from today onwards
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const upcoming = response.events.filter(event => {
        const eventDate = new Date(event.start_datetime);
        return eventDate >= now;
      });
      // Limit to first 3 upcoming events
      setUpcomingEvents(upcoming.slice(0, 3));
    } catch (err) {
      console.error('[Home] Error fetching upcoming events:', err);
      // Silently fail - events are optional
    }
  }, []);

  useEffect(() => {
    void fetchBanners();
    void fetchUpcomingEvents();
  }, [fetchBanners, fetchUpcomingEvents]);

  const handleMenuPress = (): void => {
    openMenu();
  };

  const handleCategoryPress = (category: typeof CATEGORIES[0]): void => {
    if (category.route === 'StaticPage') {
      // Navigate to static page with slug
      navigation.navigate('StaticPage', { slug: category.key });
    } else if (category.route === 'Events') {
      navigation.navigate('Events');
    } else if (category.route === 'TransportHub') {
      navigation.navigate('TransportHub');
    }
  };

  const handleFeedbackPress = (): void => {
    navigation.navigate('FeedbackForm');
  };

  const handleEventsPress = (): void => {
    navigation.navigate('Events');
  };

  const handleEventPress = (eventId: string): void => {
    navigation.navigate('EventDetail', { eventId });
  };

  // Format event date for display (day + month abbreviation)
  const formatEventDate = (isoString: string): { day: string; month: string } => {
    const date = new Date(isoString);
    const day = date.getDate().toString();
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    return { day, month };
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header type="root" onMenuPress={handleMenuPress} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section 1: Active Notifications */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <BannerList banners={banners} />
          </View>
        )}

        {/* Section 2: Hero Block - Full-width primary slab */}
        <View style={styles.heroSection}>
          <H1 style={styles.heroTitle}>{t('home.greeting').toUpperCase()}</H1>
          <Body style={styles.heroSubtitle}>{t('home.subtitle')}</Body>
        </View>

        {/* Section 3: Quick Access Grid (2x2) */}
        <View style={styles.gridSection}>
          <H2 style={styles.sectionLabel}>{t('home.categories').toUpperCase()}</H2>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={styles.categoryTileWrapper}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.8}
              >
                {/* Shadow layer for neobrut offset effect */}
                <View style={styles.categoryTileShadow} />
                {/* Main tile */}
                <View
                  style={[
                    styles.categoryTile,
                    { backgroundColor: category.backgroundColor },
                  ]}
                >
                  <IconBox size="lg" style={styles.categoryIconBox}>
                    <Icon
                      name={category.icon}
                      size="lg"
                      color={category.textColor}
                      stroke="strong"
                    />
                  </IconBox>
                  <Label style={[styles.categoryLabel, { color: category.textColor }]}>
                    {t(`home.categoryLabels.${category.key}`).toUpperCase()}
                  </Label>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 4: Upcoming Events (ticket-style) */}
        <View style={styles.eventsSection}>
          <H2 style={styles.sectionLabel}>{t('home.upcomingEvents').toUpperCase()}</H2>
          {upcomingEvents.length > 0 ? (
            // Show actual upcoming events
            upcomingEvents.map((event, index) => {
              const { day, month } = formatEventDate(event.start_datetime);
              const isFirst = index === 0;
              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCardWrapper}
                  onPress={() => handleEventPress(event.id)}
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
                        {event.location ?? t('home.viewAllEvents')}
                      </Meta>
                    </View>
                    {/* Arrow */}
                    <View style={styles.eventArrow}>
                      <Icon name="chevron-right" size="md" colorToken="textPrimary" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            // Fallback placeholder when no events
            <TouchableOpacity
              style={styles.eventCardWrapper}
              onPress={handleEventsPress}
              activeOpacity={0.8}
            >
              <View style={[styles.eventCardShadow, styles.eventCardShadowFirst]} />
              <View style={[styles.eventCard, styles.eventCardFirst]}>
                <View style={styles.dateBadge}>
                  <Label style={styles.dateBadgeDay}>--</Label>
                  <Meta style={styles.dateBadgeMonth}>---</Meta>
                </View>
                <View style={styles.eventContent}>
                  <Label style={styles.eventTitle}>{t('home.eventsPlaceholder')}</Label>
                  <Meta style={styles.eventLocation}>{t('home.viewAllEvents')}</Meta>
                </View>
                <View style={styles.eventArrow}>
                  <Icon name="chevron-right" size="md" colorToken="textPrimary" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Section 5: Feedback CTA Panel */}
        <TouchableOpacity
          style={styles.ctaWrapper}
          onPress={handleFeedbackPress}
          activeOpacity={0.8}
        >
          {/* Shadow layer */}
          <View style={styles.ctaShadow} />
          {/* CTA Panel */}
          <View style={styles.ctaPanel}>
            {/* Icon box */}
            <View style={styles.ctaIconBox}>
              <Icon name="message-circle" size="lg" color="white" stroke="strong" />
            </View>
            {/* Text */}
            <View style={styles.ctaTextContainer}>
              <Label style={styles.ctaTitle}>
                {t('home.feedback.title').toUpperCase()}
              </Label>
              <Meta style={styles.ctaSubtitle}>{t('home.feedback.subtitle')}</Meta>
            </View>
            {/* Arrow */}
            <View style={styles.ctaArrow}>
              <Icon name="chevron-right" size="md" color="white" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
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
    // V1 Poster: Fully edge-to-edge, no padding (shadow removed)
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },

  // Hero Section - Full-width primary slab
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
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // Grid Section
  gridSection: {
    paddingHorizontal: skin.spacing.lg,
    paddingTop: skin.spacing.xl,
  },
  sectionLabel: {
    color: skin.colors.textMuted,
    marginBottom: skin.spacing.md,
    letterSpacing: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryTileWrapper: {
    width: '48%',
    height: 110, // Explicit height for stable layout
    marginBottom: skin.spacing.md,
  },
  categoryTileShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '100%',
    height: '100%',
    backgroundColor: skin.colors.border,
    zIndex: 0,
  },
  categoryTile: {
    width: '100%',
    height: '100%',
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: skin.spacing.sm,
    zIndex: 1,
  },
  categoryIconBox: {
    // IconBox handles sizing
  },
  categoryLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Events Section
  eventsSection: {
    paddingHorizontal: skin.spacing.lg,
    paddingTop: skin.spacing.xl,
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
    color: 'white',
    fontWeight: '700',
    fontSize: skin.typography.fontSize.xl,
    lineHeight: skin.typography.fontSize.xl,
  },
  dateBadgeMonth: {
    color: 'rgba(255, 255, 255, 0.85)',
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

  // CTA Panel
  ctaWrapper: {
    marginHorizontal: skin.spacing.lg,
    marginTop: skin.spacing.xl,
    position: 'relative',
  },
  ctaShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: skin.colors.border,
  },
  ctaPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: skin.colors.successAccent,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    padding: skin.spacing.lg,
    gap: skin.spacing.md,
  },
  ctaIconBox: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: skin.borders.widthThin,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    color: 'white',
    fontWeight: '700',
  },
  ctaSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: skin.spacing.xs,
  },
  ctaArrow: {
    // Icon handles sizing
  },

  bottomSpacer: {
    height: skin.spacing.xxxl,
  },
});

export default HomeScreen;
