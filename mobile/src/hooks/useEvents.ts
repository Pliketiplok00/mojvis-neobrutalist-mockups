/**
 * useEvents Hook
 *
 * Manages events, event dates, and banners fetching for EventsScreen.
 * Handles loading states and automatic refetch on date/month changes.
 *
 * Extracted from EventsScreen for reusability.
 */

import { useState, useEffect, useCallback } from 'react';
import { eventsApi, inboxApi } from '../services/api';
import { useUserContext } from './useUserContext';
import { useTranslations } from '../i18n';
import { formatDateISO } from '../utils/dateFormat';
import type { Event } from '../types/event';
import type { InboxMessage } from '../types/inbox';

interface UseEventsOptions {
  /** Selected date for events list */
  selectedDate: Date;
}

interface UseEventsReturn {
  events: Event[];
  eventDates: Set<string>;
  banners: InboxMessage[];
  loading: boolean;
  error: string | null;
  /** Refetch events for a new date */
  fetchEventsForDate: (date: Date) => void;
  /** Refetch event dates for a new month */
  fetchEventDatesForMonth: (year: number, month: number) => void;
}

/**
 * Hook for fetching events, event dates, and banners
 */
export function useEvents({ selectedDate }: UseEventsOptions): UseEventsReturn {
  const { t, language } = useTranslations();
  const userContext = useUserContext();

  const [events, setEvents] = useState<Event[]>([]);
  const [eventDates, setEventDates] = useState<Set<string>>(new Set());
  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch banners for events (Phase 2: hitno + kultura)
  const fetchBanners = useCallback(async () => {
    try {
      const response = await inboxApi.getActiveBanners(userContext, 'events');
      setBanners(response.banners);
    } catch (err) {
      console.error('[Events] Error fetching banners:', err);
    }
  }, [userContext]);

  // Fetch event dates for calendar
  const fetchEventDatesForMonth = useCallback(async (year: number, month: number) => {
    try {
      const response = await eventsApi.getEventDates(year, month);
      setEventDates(new Set(response.dates));
    } catch (err) {
      console.error('[Events] Error fetching event dates:', err);
    }
  }, []);

  // Fetch events for selected date
  const fetchEventsForDate = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = formatDateISO(date);
      const response = await eventsApi.getEvents(1, 50, dateStr, language);
      setEvents(response.events);
    } catch (err) {
      console.error('[Events] Error fetching events:', err);
      setError(t('events.error'));
    } finally {
      setLoading(false);
    }
  }, [language, t]);

  // Initial load
  useEffect(() => {
    const now = new Date();
    void fetchEventDatesForMonth(now.getFullYear(), now.getMonth() + 1);
    void fetchEventsForDate(now);
    void fetchBanners();
  }, [fetchEventDatesForMonth, fetchEventsForDate, fetchBanners]);

  return {
    events,
    eventDates,
    banners,
    loading,
    error,
    fetchEventsForDate,
    fetchEventDatesForMonth,
  };
}
