/**
 * useEventDetail Hook
 *
 * Fetches event details and manages subscription state.
 * Extracted from EventDetailScreen.
 *
 * Features:
 * - Event data fetching
 * - Subscription status tracking
 * - Toggle reminder functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { eventsApi } from '../services/api';
import { useTranslations } from '../i18n';
import type { Event } from '../types/event';

interface UseEventDetailOptions {
  eventId: string;
}

interface UseEventDetailReturn {
  /** Event data */
  event: Event | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Whether user is subscribed to this event */
  subscribed: boolean;
  /** Whether subscription toggle is in progress */
  subscribing: boolean;
  /** Toggle reminder subscription */
  toggleReminder: (value: boolean) => Promise<void>;
}

/**
 * Hook for fetching event detail and managing subscription
 */
export function useEventDetail({ eventId }: UseEventDetailOptions): UseEventDetailReturn {
  const { t, language } = useTranslations();

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
      const eventData = await eventsApi.getEvent(eventId, language);
      setEvent(eventData);
    } catch (err) {
      console.error('[EventDetail] Error fetching event:', err);
      setError(t('eventDetail.error'));
    } finally {
      setLoading(false);
    }
  }, [eventId, language, t]);

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
  const toggleReminder = useCallback(async (value: boolean) => {
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
  }, [eventId, t]);

  return {
    event,
    loading,
    error,
    subscribed,
    subscribing,
    toggleReminder,
  };
}
