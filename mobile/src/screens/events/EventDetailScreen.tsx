/**
 * Event Detail Screen
 *
 * Full event information with reminder toggle.
 *
 * Per spec:
 * - Child screen (back button, not hamburger)
 * - Shows event details
 * - Reminder toggle (subscribe/unsubscribe)
 * - Share functionality (OS share sheet)
 *
 * Design:
 * - Yellow title slab (poster-style)
 * - Info tiles with square icon boxes (Clock, MapPin, User)
 * - Neobrut dual-layer shadows on CTAs
 *
 * Skin-pure: Uses skin tokens, Text primitives, and Icon (no hardcoded hex, no text glyphs).
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Share,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { useTranslations } from '../../i18n';
import { useEventDetail } from '../../hooks/useEventDetail';
import type { MainStackParamList } from '../../navigation/types';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { H1, Body, Meta, ButtonText } from '../../ui/Text';
import { LoadingState, ErrorState } from '../../ui/States';
import { InfoTile } from './components/InfoTile';
import { formatDateLocaleFull, formatTime } from '../../utils/dateFormat';

type Props = NativeStackScreenProps<MainStackParamList, 'EventDetail'>;

export function EventDetailScreen({ route }: Props): React.JSX.Element {
  const { eventId } = route.params;
  const { t, language } = useTranslations();

  const {
    event,
    loading,
    error,
    subscribed,
    subscribing,
    toggleReminder,
  } = useEventDetail({ eventId });

  // Handle share
  const handleShare = async () => {
    if (!event) return;

    try {
      await Share.share({
        title: event.title,
        message: `${event.title}\n${formatDateLocaleFull(event.start_datetime, language)}${
          event.location ? `\n${event.location}` : ''
        }`,
      });
    } catch (err) {
      console.error('[EventDetail] Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <ErrorState message={error || t('eventDetail.notFound')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />

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
        <View style={styles.header}>
          <H1 style={styles.title}>{event.title}</H1>
        </View>

        {/* Info Tiles */}
        <View style={styles.infoTilesContainer}>
          {/* Date & Time Tile */}
          <InfoTile
            icon="clock"
            value={formatDateLocaleFull(event.start_datetime, language)}
            secondaryValue={
              event.is_all_day
                ? t('events.allDay')
                : `${formatTime(event.start_datetime, language)}${
                    event.end_datetime ? ` - ${formatTime(event.end_datetime, language)}` : ''
                  }`
            }
          />

          {/* Location Tile */}
          {event.location && (
            <InfoTile
              icon="map-pin"
              value={event.location}
            />
          )}

          {/* Organizer Tile */}
          <InfoTile
            icon="user"
            value={event.organizer}
          />
        </View>

        {/* Description */}
        {event.description && (
          <View style={styles.descriptionSection}>
            <Meta style={styles.descriptionLabel}>{t('eventDetail.description')}</Meta>
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
              <ButtonText style={styles.reminderLabel}>{t('eventDetail.reminder.set')}</ButtonText>
              <Meta style={styles.reminderHint}>
                {t('eventDetail.reminder.active')}
              </Meta>
            </View>
            <Switch
              value={subscribed}
              onValueChange={toggleReminder}
              disabled={subscribing}
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
            {t('eventDetail.share')}
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
  scrollView: {
    flex: 1,
  },

  // V1 Poster: Hero image (optional, skin-token driven)
  heroImage: {
    width: '100%',
    aspectRatio: skin.components.events.detail.heroImageAspectRatio,
    borderBottomWidth: skin.components.events.detail.heroImageBorderWidth,
    borderBottomColor: skin.components.events.detail.heroImageBorderColor,
  },

  // V1 Poster: Title header (yellow slab with heavy bottom rule)
  header: {
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

export default EventDetailScreen;
