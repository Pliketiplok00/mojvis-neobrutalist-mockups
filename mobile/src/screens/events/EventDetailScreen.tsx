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
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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
import { eventsApi } from '../../services/api';
import type { Event } from '../../types/event';
import type { MainStackParamList } from '../../navigation/types';

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
      setError('Greska pri ucitavanju dogadaja');
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
      Alert.alert('Greska', 'Nije moguce promijeniti podsjetnik');
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
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Dogadaj nije pronaden'}</Text>
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
          <Text style={styles.title}>{event.title}</Text>
        </View>

        {/* Date & Time */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Datum i vrijeme</Text>
          <Text style={styles.infoValue}>{formatDate(event.start_datetime)}</Text>
          {event.is_all_day ? (
            <Text style={styles.infoValueSecondary}>Cijeli dan</Text>
          ) : (
            <Text style={styles.infoValueSecondary}>
              {formatTime(event.start_datetime)}
              {event.end_datetime && ` - ${formatTime(event.end_datetime)}`}
            </Text>
          )}
        </View>

        {/* Location */}
        {event.location && (
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Lokacija</Text>
            <Text style={styles.infoValue}>{event.location}</Text>
          </View>
        )}

        {/* Description */}
        {event.description && (
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Opis</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}

        {/* Reminder Toggle */}
        <View style={styles.reminderSection}>
          <View style={styles.reminderInfo}>
            <Text style={styles.reminderLabel}>Podsjeti me</Text>
            <Text style={styles.reminderHint}>
              Primit cete podsjetnik na dan dogadaja
            </Text>
          </View>
          <Switch
            value={subscribed}
            onValueChange={handleToggleReminder}
            disabled={subscribing}
            trackColor={{ false: '#E0E0E0', true: '#000000' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Podijeli dogadaj</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
  },

  // Header
  header: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },

  // Info sections
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
    textTransform: 'capitalize',
  },
  infoValueSecondary: {
    fontSize: 14,
    color: '#333333',
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },

  // Reminder section
  reminderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    margin: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  reminderHint: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },

  // Share button
  shareButton: {
    backgroundColor: '#000000',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EventDetailScreen;
