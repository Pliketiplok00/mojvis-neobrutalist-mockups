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
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
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
import { H1, H2, Label, Body, Meta, ButtonText } from '../../ui/Text';

type Props = NativeStackScreenProps<MainStackParamList, 'EventDetail'>;

/**
 * Format date for display (DD/MM/YYYY)
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('hr-HR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time for display (HH:mm)
 */
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

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
        message: `${event.title}\n${formatDate(event.start_datetime)}${
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={skin.colors.textPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.errorContainer}>
          <Label style={styles.errorText}>{error || t('eventDetail.notFound')}</Label>
        </View>
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
          <Body style={styles.infoValue}>{formatDate(event.start_datetime)}</Body>
          {event.is_all_day ? (
            <Label style={styles.infoValueSecondary}>{t('events.allDay')}</Label>
          ) : (
            <Label style={styles.infoValueSecondary}>
              {formatTime(event.start_datetime)}
              {event.end_datetime && ` - ${formatTime(event.end_datetime)}`}
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
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <ButtonText style={styles.shareButtonText}>{t('eventDetail.share')}</ButtonText>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.xxl,
  },
  errorText: {
    textAlign: 'center',
    color: skin.colors.errorText,
  },

  // Header
  header: {
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthThin,
    borderBottomColor: skin.colors.border,
  },
  title: {
    // Inherited from H1 primitive
  },

  // Info sections
  infoSection: {
    padding: skin.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: skin.colors.borderLight,
  },
  infoLabel: {
    textTransform: 'uppercase',
    marginBottom: skin.spacing.xs,
  },
  infoValue: {
    textTransform: 'capitalize',
    color: skin.colors.textPrimary,
  },
  infoValueSecondary: {
    marginTop: 2,
    color: skin.colors.textSecondary,
  },
  description: {
    lineHeight: 22,
  },

  // Reminder section
  reminderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.spacing.lg,
    backgroundColor: skin.colors.backgroundSecondary,
    margin: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderLabel: {
    // Inherited from ButtonText primitive
  },
  reminderHint: {
    marginTop: 2,
  },

  // Share button
  shareButton: {
    backgroundColor: skin.colors.textPrimary,
    margin: skin.spacing.lg,
    padding: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard,
    alignItems: 'center',
  },
  shareButtonText: {
    color: skin.colors.background,
  },
});

export default EventDetailScreen;
