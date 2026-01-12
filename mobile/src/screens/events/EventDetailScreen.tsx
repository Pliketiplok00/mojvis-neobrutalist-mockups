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
 * Skin-pure: Uses skin tokens, Text primitives, and Icon (no hardcoded hex, no text glyphs).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { useTranslations } from '../../i18n';
import { eventsApi } from '../../services/api';
import type { Event } from '../../types/event';
import type { MainStackParamList } from '../../navigation/types';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { H1, H2, Label, Body, Meta, ButtonText } from '../../ui/Text';
import { LoadingState, ErrorState } from '../../ui/States';
import { formatDateLocaleFull, formatTimeHrHR } from '../../utils/dateFormat';

type Props = NativeStackScreenProps<MainStackParamList, 'EventDetail'>;

export function EventDetailScreen({ route }: Props): React.JSX.Element {
  const { eventId } = route.params;
  const { t } = useTranslations();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // Fetch event details
  const fetchEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventData = await eventsApi.getEvent(eventId);
      setEvent(eventData);
    } catch (err) {
      console.error('[EventDetail] Error fetching event:', err);
      setError(t('eventDetail.error'));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Fetch subscription status
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const status = await eventsApi.getSubscriptionStatus(eventId);
      setSubscribed(status.subscribed);
    } catch (err) {
      console.error('[EventDetail] Error fetching subscription status:', err);
    }
  }, [eventId]);

  useEffect(() => {
    void fetchEvent();
    void fetchSubscriptionStatus();
  }, [fetchEvent, fetchSubscriptionStatus]);

  // Handle reminder toggle
  const handleToggleReminder = async (value: boolean) => {
    setSubscribing(true);
    try {
      if (value) {
        await eventsApi.subscribe(eventId);
        setSubscribed(true);
      } else {
        await eventsApi.unsubscribe(eventId);
        setSubscribed(false);
      }
    } catch (err) {
      console.error('[EventDetail] Error toggling reminder:', err);
      Alert.alert(t('common.error'), t('eventDetail.error'));
    } finally {
      setSubscribing(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!event) return;

    try {
      await Share.share({
        title: event.title,
        message: `${event.title}\n${formatDateLocaleFull(event.start_datetime)}${
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
        {/* Event Title */}
        <View style={styles.header}>
          <H1 style={styles.title}>{event.title}</H1>
        </View>

        {/* Date & Time */}
        <View style={styles.infoSection}>
          <Meta style={styles.infoLabel}>{t('eventDetail.time')}</Meta>
          <Body style={styles.infoValue}>{formatDateLocaleFull(event.start_datetime)}</Body>
          {event.is_all_day ? (
            <Label style={styles.infoValueSecondary}>{t('events.allDay')}</Label>
          ) : (
            <Label style={styles.infoValueSecondary}>
              {formatTimeHrHR(event.start_datetime)}
              {event.end_datetime && ` - ${formatTimeHrHR(event.end_datetime)}`}
            </Label>
          )}
        </View>

        {/* Location */}
        {event.location && (
          <View style={styles.infoSection}>
            <Meta style={styles.infoLabel}>{t('eventDetail.location')}</Meta>
            <Body style={styles.infoValue}>{event.location}</Body>
          </View>
        )}

        {/* Description */}
        {event.description && (
          <View style={styles.infoSection}>
            <Meta style={styles.infoLabel}>{t('eventDetail.description')}</Meta>
            <Body style={styles.description}>{event.description}</Body>
          </View>
        )}

        {/* Reminder Toggle */}
        <View style={styles.reminderSection}>
          <View style={styles.reminderInfo}>
            <ButtonText style={styles.reminderLabel}>{t('eventDetail.reminder.set')}</ButtonText>
            <Meta style={styles.reminderHint}>
              {t('eventDetail.reminder.active')}
            </Meta>
          </View>
          <Switch
            value={subscribed}
            onValueChange={handleToggleReminder}
            disabled={subscribing}
            trackColor={{ false: skin.colors.borderLight, true: skin.colors.textPrimary }}
            thumbColor={skin.colors.background}
          />
        </View>

        {/* Share Button */}
        <Button variant="secondary" onPress={handleShare} style={styles.shareButton}>
          {t('eventDetail.share')}
        </Button>
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

  // V1 Poster: Title header (poster band with heavy bottom rule)
  header: {
    padding: skin.components.events.detail.titlePadding,
    borderBottomWidth: skin.components.events.detail.titleBorderWidth,
    borderBottomColor: skin.components.events.detail.titleBorderColor,
  },
  title: {
    // Inherited from H1 primitive
  },

  // V1 Poster: Info sections with stronger separators
  infoSection: {
    padding: skin.components.events.detail.infoSectionPadding,
    borderBottomWidth: skin.components.events.detail.infoSectionDividerWidth,
    borderBottomColor: skin.components.events.detail.infoSectionDividerColor,
  },
  infoLabel: {
    textTransform: 'uppercase',
    marginBottom: skin.components.events.detail.infoLabelMarginBottom,
  },
  infoValue: {
    textTransform: 'capitalize',
    color: skin.colors.textPrimary,
  },
  infoValueSecondary: {
    marginTop: skin.components.events.detail.secondaryValueMarginTop,
    color: skin.colors.textSecondary,
  },
  description: {
    lineHeight: skin.components.events.detail.descriptionLineHeight,
  },

  // V1 Poster: Reminder CTA card (strong border, clean background, sharp corners)
  reminderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.components.events.detail.reminderCardPadding,
    backgroundColor: skin.components.events.detail.reminderCardBackground,
    margin: skin.spacing.lg,
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

  // Share button
  shareButton: {
    margin: skin.spacing.lg,
  },
});

export default EventDetailScreen;
