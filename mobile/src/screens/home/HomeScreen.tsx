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

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BannerList } from '../../components/Banner';
import { useMenu } from '../../contexts/MenuContext';
import { useHomeData } from '../../hooks/useHomeData';
import { useTranslations } from '../../i18n';
import { CategoryGrid } from './components/CategoryGrid';
import type { CategoryItem } from './components/CategoryGrid';
import { UpcomingEventsSection } from './components/UpcomingEventsSection';
import type { MainStackParamList } from '../../navigation/types';

// UI Primitives
import {
  skin,
  Header,
  H1,
  Body,
  Label,
  Meta,
  Icon,
} from '../../ui';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Category configuration with icons and colors per V1 design system
const CATEGORIES: CategoryItem[] = [
  {
    key: 'events',
    icon: 'calendar',
    backgroundColor: skin.colors.primary,
    textColor: skin.colors.primaryText,
    route: 'Events',
  },
  {
    key: 'transport',
    icon: 'ship',
    backgroundColor: skin.colors.successAccent,
    textColor: skin.colors.primaryText,
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
    textColor: skin.colors.primaryText,
    route: 'StaticPage',
  },
];

export function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { openMenu } = useMenu();
  const { t } = useTranslations();
  const { banners, upcomingEvents } = useHomeData();

  const handleMenuPress = (): void => {
    openMenu();
  };

  const handleCategoryPress = (category: CategoryItem): void => {
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
        <CategoryGrid
          categories={CATEGORIES}
          sectionTitle={t('home.categories').toUpperCase()}
          onCategoryPress={handleCategoryPress}
          t={t}
        />

        {/* Section 4: Upcoming Events (ticket-style) */}
        <UpcomingEventsSection
          events={upcomingEvents}
          sectionTitle={t('home.upcomingEvents').toUpperCase()}
          placeholderText={t('home.eventsPlaceholder')}
          viewAllText={t('home.viewAllEvents')}
          onEventPress={handleEventPress}
          onSeeAllPress={handleEventsPress}
        />

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
              <Icon name="message-circle" size="lg" colorToken="primaryText" stroke="strong" />
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
              <Icon name="chevron-right" size="md" colorToken="primaryText" />
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
    color: skin.colors.primaryText,
    marginBottom: skin.spacing.sm,
  },
  heroSubtitle: {
    color: skin.colors.primaryTextMuted,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    color: skin.colors.primaryText,
    fontWeight: '700',
  },
  ctaSubtitle: {
    color: skin.colors.primaryTextMuted,
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
