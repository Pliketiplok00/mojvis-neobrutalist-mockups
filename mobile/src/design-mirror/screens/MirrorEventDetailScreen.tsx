/**
 * Mirror Event Detail Screen (Design Mirror)
 *
 * Mirrors EventDetailScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Hero image (optional)
 * 2. Yellow title slab header
 * 3. Info tiles (date/time, location, organizer)
 * 4. Description section
 * 5. Reminder toggle with dual-layer shadow
 * 6. Share button with dual-layer shadow
 *
 * Rules:
 * - NO useNavigation import
 * - NO useRoute import
 * - NO useTranslations hook
 * - NO API calls
 * - All actions are NO-OP
 * - Skin tokens only
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Image,
  SafeAreaView,
} from 'react-native';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { H1, H2, Label, Body, Meta, ButtonText } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import {
  eventDetailFixture,
  eventDetailMinimalFixture,
  eventsLabels,
} from '../fixtures/events';

/**
 * Format date in Croatian locale (full)
 */
function formatDateLocaleFull(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('hr-HR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time in HH:mm format
 */
function formatTimeHrHR(dateStr: string): string {
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Mirror Event Detail Screen
 * Uses eventDetailFixture for visual state
 */
export function MirrorEventDetailScreen(): React.JSX.Element {
  // Use full fixture by default, can toggle to minimal
  const [useMinimal, setUseMinimal] = useState(false);
  const event = useMinimal ? eventDetailMinimalFixture : eventDetailFixture;

  // NO-OP state for visual demonstration
  const [subscribed, setSubscribed] = useState(false);

  // NO-OP handlers - mirror screens don't perform actions
  const handleToggleReminder = (value: boolean): void => {
    setSubscribed(value);
  };

  const handleShare = (): void => {
    // Intentionally empty - mirror screens don't perform actions
  };

  const handleToggleFixture = (): void => {
    setUseMinimal(!useMinimal);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>EventDetail Mirror</H2>
        <Meta style={styles.headerMeta}>
          fixture: {useMinimal ? 'eventDetailMinimalFixture' : 'eventDetailFixture'}
        </Meta>
        <Button variant="secondary" onPress={handleToggleFixture} style={styles.toggleButton}>
          {useMinimal ? 'Show Full' : 'Show Minimal'}
        </Button>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Hero Image (optional) */}
        {event.image_url && (
          <Image
            source={{ uri: event.image_url }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}

        {/* Event Title - Yellow Slab */}
        <View style={styles.titleHeader}>
          <H1 style={styles.title}>{event.title}</H1>
        </View>

        {/* Info Tiles */}
        <View style={styles.infoTilesContainer}>
          {/* Date & Time Tile */}
          <View style={styles.infoTile}>
            <View style={styles.infoTileIconBox}>
              <Icon name="clock" size="md" colorToken="textPrimary" />
            </View>
            <View style={styles.infoTileContent}>
              <Body style={styles.infoTileValue}>{formatDateLocaleFull(event.start_datetime)}</Body>
              {event.is_all_day ? (
                <Label style={styles.infoTileSecondary}>{eventsLabels.detail.allDay}</Label>
              ) : (
                <Label style={styles.infoTileSecondary}>
                  {formatTimeHrHR(event.start_datetime)}
                  {event.end_datetime && ` - ${formatTimeHrHR(event.end_datetime)}`}
                </Label>
              )}
            </View>
          </View>

          {/* Location Tile */}
          {event.location && (
            <View style={styles.infoTile}>
              <View style={styles.infoTileIconBox}>
                <Icon name="map-pin" size="md" colorToken="textPrimary" />
              </View>
              <View style={styles.infoTileContent}>
                <Body style={styles.infoTileValue}>{event.location}</Body>
              </View>
            </View>
          )}

          {/* Organizer Tile */}
          <View style={styles.infoTile}>
            <View style={styles.infoTileIconBox}>
              <Icon name="user" size="md" colorToken="textPrimary" />
            </View>
            <View style={styles.infoTileContent}>
              <Body style={styles.infoTileValue}>{event.organizer}</Body>
            </View>
          </View>
        </View>

        {/* Description */}
        {event.description && (
          <View style={styles.descriptionSection}>
            <Meta style={styles.descriptionLabel}>{eventsLabels.detail.description.toUpperCase()}</Meta>
            <Body style={styles.description}>{event.description}</Body>
          </View>
        )}

        {/* Reminder Toggle - Dual-layer CTA */}
        <View style={styles.reminderWrapper}>
          {/* Shadow layer */}
          <View style={styles.ctaShadowLayer} />
          {/* Main card */}
          <View style={styles.reminderSection}>
            <View style={styles.reminderInfo}>
              <ButtonText style={styles.reminderLabel}>{eventsLabels.detail.reminder}</ButtonText>
              <Meta style={styles.reminderHint}>
                {subscribed ? 'Podsjetnik je aktivan' : 'Primite obavijest prije događaja'}
              </Meta>
            </View>
            <Switch
              value={subscribed}
              onValueChange={handleToggleReminder}
              trackColor={{ false: skin.colors.borderLight, true: skin.colors.textPrimary }}
              thumbColor={skin.colors.background}
            />
          </View>
        </View>

        {/* Share Button - Dual-layer CTA */}
        <View style={styles.shareWrapper}>
          {/* Shadow layer */}
          <View style={styles.ctaShadowLayerButton} />
          {/* Main button */}
          <Button variant="secondary" onPress={handleShare} style={styles.shareButton}>
            {eventsLabels.detail.share}
          </Button>
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
    marginBottom: skin.spacing.sm,
  },
  toggleButton: {
    marginTop: skin.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },

  // Hero image
  heroImage: {
    width: '100%',
    aspectRatio: skin.components.events.detail.heroImageAspectRatio,
    borderBottomWidth: skin.components.events.detail.heroImageBorderWidth,
    borderBottomColor: skin.components.events.detail.heroImageBorderColor,
  },

  // Title header (yellow slab with heavy bottom rule)
  titleHeader: {
    padding: skin.components.events.detail.titlePadding,
    borderBottomWidth: skin.components.events.detail.titleBorderWidth,
    borderBottomColor: skin.components.events.detail.titleBorderColor,
    backgroundColor: skin.components.events.detail.titleBackground,
  },
  title: {
    // Inherited from H1 primitive
  },

  // Info Tiles Container
  infoTilesContainer: {
    borderBottomWidth: skin.components.events.detail.infoSectionDividerWidth,
    borderBottomColor: skin.components.events.detail.infoSectionDividerColor,
  },

  // Info Tile Row (icon box + content)
  infoTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.components.events.detail.infoTilePadding,
    borderBottomWidth: skin.components.events.detail.infoSectionDividerWidth,
    borderBottomColor: skin.components.events.detail.infoSectionDividerColor,
    gap: skin.components.events.detail.infoTileGap,
  },
  infoTileIconBox: {
    width: skin.components.events.detail.infoTileIconBoxSize,
    height: skin.components.events.detail.infoTileIconBoxSize,
    backgroundColor: skin.components.events.detail.infoTileIconBoxBackground,
    borderWidth: skin.components.events.detail.infoTileIconBoxBorderWidth,
    borderColor: skin.components.events.detail.infoTileIconBoxBorderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTileContent: {
    flex: 1,
  },
  infoTileValue: {
    color: skin.colors.textPrimary,
  },
  infoTileSecondary: {
    marginTop: skin.components.events.detail.secondaryValueMarginTop,
    color: skin.colors.textSecondary,
  },

  // Description Section
  descriptionSection: {
    padding: skin.components.events.detail.infoSectionPadding,
    borderBottomWidth: skin.components.events.detail.infoSectionDividerWidth,
    borderBottomColor: skin.components.events.detail.infoSectionDividerColor,
  },
  descriptionLabel: {
    textTransform: 'uppercase',
    marginBottom: skin.components.events.detail.infoLabelMarginBottom,
  },
  description: {
    lineHeight: skin.components.events.detail.descriptionLineHeight,
  },

  // Reminder CTA with dual-layer shadow
  reminderWrapper: {
    margin: skin.spacing.lg,
    position: 'relative',
  },
  ctaShadowLayer: {
    position: 'absolute',
    top: skin.components.events.detail.ctaShadowOffsetY,
    left: skin.components.events.detail.ctaShadowOffsetX,
    right: -skin.components.events.detail.ctaShadowOffsetX,
    bottom: -skin.components.events.detail.ctaShadowOffsetY,
    backgroundColor: skin.components.events.detail.ctaShadowColor,
    borderRadius: skin.components.events.detail.reminderCardRadius,
  },
  reminderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.components.events.detail.reminderCardPadding,
    backgroundColor: skin.components.events.detail.reminderCardBackground,
    borderRadius: skin.components.events.detail.reminderCardRadius,
    borderWidth: skin.components.events.detail.reminderCardBorderWidth,
    borderColor: skin.components.events.detail.reminderCardBorderColor,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderLabel: {
    // Inherited from ButtonText primitive
  },
  reminderHint: {
    marginTop: skin.components.events.detail.reminderHintMarginTop,
  },

  // Share Button with dual-layer shadow
  shareWrapper: {
    marginHorizontal: skin.spacing.lg,
    marginBottom: skin.spacing.lg,
    position: 'relative',
  },
  ctaShadowLayerButton: {
    position: 'absolute',
    top: skin.components.events.detail.ctaShadowOffsetY,
    left: skin.components.events.detail.ctaShadowOffsetX,
    right: -skin.components.events.detail.ctaShadowOffsetX,
    bottom: -skin.components.events.detail.ctaShadowOffsetY,
    backgroundColor: skin.components.events.detail.ctaShadowColor,
    borderRadius: skin.borders.radiusCard,
  },
  shareButton: {
    // Button styling handled by Button component
  },
});

export default MirrorEventDetailScreen;
