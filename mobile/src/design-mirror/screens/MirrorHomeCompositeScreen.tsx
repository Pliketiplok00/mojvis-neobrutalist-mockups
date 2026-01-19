/**
 * Mirror Home Composite Screen (Design Mirror)
 *
 * Mirrors HomeScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Banner list (urgent + regular)
 * 2. Hero section (welcome message)
 * 3. Quick access grid (2x2 category tiles)
 * 4. Upcoming events section (ticket-style cards)
 * 5. Feedback CTA panel
 *
 * Rules:
 * - NO useNavigation import
 * - NO API calls or context
 * - All actions are NO-OP or toggle local state
 * - Skin tokens only
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';
import { Card } from '../../ui/Card';
import { H1, H2, Body, Label, Meta, ButtonText } from '../../ui/Text';
import {
  homeFixtures,
  homeCategories,
  homeLabels,
  formatEventDate,
  type HomeFixture,
  type HomeBanner,
  type HomeEvent,
  type HomeCategory,
} from '../fixtures/home';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Mirror Home Composite Screen
 * Uses homeFixtures for visual state with in-screen fixture switcher
 */
export function MirrorHomeCompositeScreen(): React.JSX.Element {
  // Fixture switcher state
  const [fixtureIndex, setFixtureIndex] = useState(0);
  const currentFixture = homeFixtures[fixtureIndex];

  // NO-OP handlers - mirror screens don't navigate
  const handleBannerPress = (_banner: HomeBanner): void => {
    // Does not navigate - visual only
  };

  const handleCategoryPress = (_category: HomeCategory): void => {
    // Does not navigate - visual only
  };

  const handleEventPress = (_event: HomeEvent): void => {
    // Does not navigate - visual only
  };

  const handleViewAllEvents = (): void => {
    // Does not navigate - visual only
  };

  const handleFeedbackPress = (): void => {
    // Does not navigate - visual only
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header with fixture switcher */}
      <View style={styles.mirrorHeader}>
        <H2 style={styles.mirrorHeaderTitle}>Home Composite Mirror</H2>
        <Meta style={styles.mirrorHeaderMeta}>
          Fixture: {currentFixture.name}
        </Meta>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.fixtureSwitcher}
        >
          {homeFixtures.map((fixture, index) => (
            <TouchableOpacity
              key={fixture.id}
              style={[
                styles.fixtureButton,
                index === fixtureIndex && styles.fixtureButtonActive,
              ]}
              onPress={() => setFixtureIndex(index)}
            >
              <Meta
                style={[
                  styles.fixtureButtonText,
                  index === fixtureIndex && styles.fixtureButtonTextActive,
                ]}
              >
                {fixture.name}
              </Meta>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Meta style={styles.fixtureDescription}>
          {currentFixture.description}
        </Meta>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner Section */}
        {currentFixture.banners.length > 0 && (
          <View style={styles.bannerSection}>
            {currentFixture.banners.map((banner) => (
              <BannerItem
                key={banner.id}
                banner={banner}
                onPress={() => handleBannerPress(banner)}
              />
            ))}
          </View>
        )}

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <H1 style={styles.heroTitle}>{currentFixture.heroTitleHr}</H1>
          <Body style={styles.heroSubtitle}>
            {currentFixture.heroSubtitleHr}
          </Body>
        </View>

        {/* Quick Access Grid */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>{homeLabels.sections.categoriesHr}</H2>
          <View style={styles.categoryGrid}>
            {homeCategories.map((category) => (
              <CategoryTile
                key={category.key}
                category={category}
                onPress={() => handleCategoryPress(category)}
              />
            ))}
          </View>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <H2 style={styles.sectionTitle}>{homeLabels.sections.eventsHr}</H2>
            {currentFixture.events.length > 0 && (
              <TouchableOpacity onPress={handleViewAllEvents}>
                <Label style={styles.viewAllLink}>
                  {homeLabels.events.viewAllHr}
                </Label>
              </TouchableOpacity>
            )}
          </View>

          {currentFixture.events.length > 0 ? (
            <View style={styles.eventsContainer}>
              {currentFixture.events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => handleEventPress(event)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyEventsPlaceholder}>
              <Icon name="calendar" size="lg" colorToken="textDisabled" />
              <Body style={styles.emptyEventsText}>
                {homeLabels.events.placeholderHr}
              </Body>
            </View>
          )}
        </View>

        {/* Feedback CTA Panel */}
        <View style={styles.feedbackSection}>
          <TouchableOpacity
            style={styles.feedbackCard}
            onPress={handleFeedbackPress}
            activeOpacity={0.8}
          >
            <View style={styles.feedbackIconContainer}>
              <Icon name="message-circle" size="lg" colorToken="primaryText" />
            </View>
            <View style={styles.feedbackContent}>
              <ButtonText style={styles.feedbackTitle}>
                {homeLabels.feedback.titleHr}
              </ButtonText>
              <Body style={styles.feedbackSubtitle}>
                {homeLabels.feedback.subtitleHr}
              </Body>
            </View>
            <Icon name="chevron-right" size="md" colorToken="primaryText" />
          </TouchableOpacity>
        </View>

        {/* Footer spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// Sub-components
// ============================================================

interface BannerItemProps {
  banner: HomeBanner;
  onPress: () => void;
}

function BannerItem({ banner, onPress }: BannerItemProps): React.JSX.Element {
  const isUrgent = banner.is_urgent;

  return (
    <TouchableOpacity
      style={[styles.banner, isUrgent && styles.bannerUrgent]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.bannerIconContainer}>
        <Icon
          name={isUrgent ? 'alert-triangle' : 'info'}
          size="sm"
          colorToken={isUrgent ? 'urgentText' : 'textPrimary'}
        />
      </View>
      <Body
        style={[styles.bannerText, isUrgent && styles.bannerTextUrgent]}
        numberOfLines={2}
      >
        {banner.title}
      </Body>
      <Icon
        name="chevron-right"
        size="sm"
        colorToken={isUrgent ? 'urgentText' : 'textMuted'}
      />
    </TouchableOpacity>
  );
}

interface CategoryTileProps {
  category: HomeCategory;
  onPress: () => void;
}

function CategoryTile({
  category,
  onPress,
}: CategoryTileProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.categoryTile, { backgroundColor: category.backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon name={category.icon} size="lg" color={category.textColor} />
      <Label style={[styles.categoryLabel, { color: category.textColor }]}>
        {category.labelHr}
      </Label>
    </TouchableOpacity>
  );
}

interface EventCardProps {
  event: HomeEvent;
  onPress: () => void;
}

function EventCard({ event, onPress }: EventCardProps): React.JSX.Element {
  const { day, month } = formatEventDate(event.start_datetime);

  return (
    <Card variant="default" onPress={onPress} style={styles.eventCard}>
      <View style={styles.eventDateBadge}>
        <H2 style={styles.eventDay}>{day}</H2>
        <Meta style={styles.eventMonth}>{month}</Meta>
      </View>
      <View style={styles.eventContent}>
        <Label style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Label>
        {event.location && (
          <View style={styles.eventLocationRow}>
            <Icon name="map-pin" size="sm" colorToken="textMuted" />
            <Meta style={styles.eventLocation}>{event.location}</Meta>
          </View>
        )}
      </View>
      <Icon name="chevron-right" size="md" colorToken="chevron" />
    </Card>
  );
}

// ============================================================
// Styles
// ============================================================

const TILE_GAP = skin.spacing.md;
const TILE_WIDTH = (SCREEN_WIDTH - skin.spacing.lg * 2 - TILE_GAP) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: skin.colors.background,
  },
  mirrorHeader: {
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
    backgroundColor: skin.colors.backgroundTertiary,
  },
  mirrorHeaderTitle: {
    marginBottom: skin.spacing.xs,
  },
  mirrorHeaderMeta: {
    color: skin.colors.textMuted,
  },
  fixtureSwitcher: {
    marginTop: skin.spacing.md,
    marginBottom: skin.spacing.sm,
  },
  fixtureButton: {
    paddingHorizontal: skin.spacing.md,
    paddingVertical: skin.spacing.sm,
    marginRight: skin.spacing.sm,
    backgroundColor: skin.colors.backgroundSecondary,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusSmall,
  },
  fixtureButtonActive: {
    backgroundColor: skin.colors.primary,
    borderColor: skin.colors.primary,
  },
  fixtureButtonText: {
    color: skin.colors.textMuted,
  },
  fixtureButtonTextActive: {
    color: skin.colors.primaryText,
  },
  fixtureDescription: {
    fontStyle: 'italic',
    color: skin.colors.textDisabled,
  },
  content: {
    flex: 1,
  },

  // Banner Section
  bannerSection: {
    gap: skin.spacing.sm,
    padding: skin.spacing.lg,
    paddingBottom: 0,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.spacing.md,
    backgroundColor: skin.colors.backgroundSecondary,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusSmall,
  },
  bannerUrgent: {
    backgroundColor: skin.colors.urgent,
    borderColor: skin.colors.urgent,
  },
  bannerIconContainer: {
    marginRight: skin.spacing.sm,
  },
  bannerText: {
    flex: 1,
    marginRight: skin.spacing.sm,
  },
  bannerTextUrgent: {
    color: skin.colors.urgentText,
  },

  // Hero Section
  heroSection: {
    backgroundColor: skin.colors.primary,
    padding: skin.spacing.xxl,
    marginTop: skin.spacing.lg,
    marginHorizontal: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    ...skin.shadows.card,
  },
  heroTitle: {
    color: skin.colors.primaryText,
    marginBottom: skin.spacing.sm,
  },
  heroSubtitle: {
    color: skin.colors.primaryTextMuted,
  },

  // Section
  section: {
    padding: skin.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: skin.spacing.lg,
  },
  sectionTitle: {
    marginBottom: skin.spacing.lg,
  },
  viewAllLink: {
    color: skin.colors.primary,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
  },
  categoryTile: {
    width: TILE_WIDTH,
    aspectRatio: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    gap: skin.spacing.sm,
    ...skin.shadows.card,
  },
  categoryLabel: {
    textAlign: 'center',
  },

  // Events
  eventsContainer: {
    gap: skin.spacing.md,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.spacing.md,
  },
  eventDateBadge: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: skin.colors.primary,
    borderRadius: skin.borders.radiusSmall,
    paddingVertical: skin.spacing.sm,
    marginRight: skin.spacing.md,
  },
  eventDay: {
    color: skin.colors.primaryText,
    marginBottom: -skin.spacing.xs,
  },
  eventMonth: {
    color: skin.colors.primaryTextMuted,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    marginBottom: skin.spacing.xs,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.xs,
  },
  eventLocation: {
    color: skin.colors.textMuted,
  },
  emptyEventsPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: skin.spacing.xxl,
    backgroundColor: skin.colors.backgroundSecondary,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: skin.borders.radiusCard,
    gap: skin.spacing.md,
  },
  emptyEventsText: {
    color: skin.colors.textDisabled,
  },

  // Feedback CTA
  feedbackSection: {
    paddingHorizontal: skin.spacing.lg,
    paddingBottom: skin.spacing.lg,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.spacing.lg,
    backgroundColor: skin.colors.primary,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    ...skin.shadows.card,
  },
  feedbackIconContainer: {
    marginRight: skin.spacing.md,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    color: skin.colors.primaryText,
    marginBottom: skin.spacing.xs,
  },
  feedbackSubtitle: {
    color: skin.colors.primaryTextMuted,
  },

  // Footer
  footer: {
    height: skin.spacing.xxl,
  },
});

export default MirrorHomeCompositeScreen;
