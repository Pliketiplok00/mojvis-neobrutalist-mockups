/**
 * useTransportOverview Hook
 *
 * Shared data fetching for SeaTransportScreen and RoadTransportScreen.
 * Fetches lines, today's departures, and banners for transport overview.
 *
 * Extracted from SeaTransportScreen and RoadTransportScreen.
 */

import { useState, useEffect, useCallback } from 'react';
import { inboxApi, transportApi } from '../services/api';
import { useUserContext } from './useUserContext';
import type { InboxMessage } from '../types/inbox';
import type { LineListItem, TodayDepartureItem, DayType } from '../types/transport';

type TransportType = 'sea' | 'road';

interface UseTransportOverviewOptions {
  transportType: TransportType;
}

interface UseTransportOverviewReturn {
  /** Active banners for transport */
  banners: InboxMessage[];
  /** Transport lines list */
  lines: LineListItem[];
  /** Today's departures */
  todaysDepartures: TodayDepartureItem[];
  /** Current day type (MON, TUE, etc.) */
  dayType: DayType | null;
  /** Whether today is a holiday */
  isHoliday: boolean;
  /** Initial loading state */
  loading: boolean;
  /** Pull-to-refresh state */
  refreshing: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Trigger refresh (for pull-to-refresh) */
  handleRefresh: () => void;
}

/**
 * Hook for fetching transport overview data
 *
 * @param options.transportType - 'sea' or 'road'
 * @returns Transport overview state and refresh handler
 */
export function useTransportOverview({
  transportType,
}: UseTransportOverviewOptions): UseTransportOverviewReturn {
  const userContext = useUserContext();

  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const [lines, setLines] = useState<LineListItem[]>([]);
  const [todaysDepartures, setTodaysDepartures] = useState<TodayDepartureItem[]>([]);
  const [dayType, setDayType] = useState<DayType | null>(null);
  const [isHoliday, setIsHoliday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [bannersRes, linesRes, todayRes] = await Promise.all([
        inboxApi.getActiveBanners(userContext, 'transport'),
        transportApi.getLines(transportType, userContext.language),
        transportApi.getTodaysDepartures(transportType, undefined, userContext.language),
      ]);

      setBanners(bannersRes.banners);
      setLines(linesRes.lines);
      setTodaysDepartures(todayRes.departures);
      setDayType(todayRes.day_type);
      setIsHoliday(todayRes.is_holiday);
    } catch (err) {
      console.error(`[${transportType}Transport] Error fetching data:`, err);
      setError('transport.error'); // Translation key
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userContext, transportType]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchData();
  }, [fetchData]);

  return {
    banners,
    lines,
    todaysDepartures,
    dayType,
    isHoliday,
    loading,
    refreshing,
    error,
    handleRefresh,
  };
}
