/**
 * useHomeData Hook
 *
 * Fetches data for HomeScreen: banners and upcoming events.
 * Extracted from HomeScreen for cleaner separation of concerns.
 *
 * Data fetching:
 * - Banners: Active banners for 'home' screen context
 * - Events: Upcoming events (from today onwards, limited to 3)
 */

import { useState, useEffect, useCallback } from 'react';
import { inboxApi, eventsApi } from '../services/api';
import { useUserContext } from './useUserContext';
import type { InboxMessage } from '../types/inbox';
import type { Event } from '../types/event';

interface UseHomeDataReturn {
  /** Active banners for home screen */
  banners: InboxMessage[];
  /** Upcoming events (max 3) */
  upcomingEvents: Event[];
  /** Refresh data */
  refresh: () => void;
}

/**
 * Hook for fetching home screen data (banners + upcoming events)
 */
export function useHomeData(): UseHomeDataReturn {
  const userContext = useUserContext();

  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

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
      const response = await eventsApi.getEvents(1, 20, undefined, userContext.language);
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
  }, [userContext.language]);

  useEffect(() => {
    void fetchBanners();
    void fetchUpcomingEvents();
  }, [fetchBanners, fetchUpcomingEvents]);

  const refresh = useCallback(() => {
    void fetchBanners();
    void fetchUpcomingEvents();
  }, [fetchBanners, fetchUpcomingEvents]);

  return {
    banners,
    upcomingEvents,
    refresh,
  };
}
