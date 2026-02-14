/**
 * useLineDetail Hook
 *
 * Fetches and manages line detail data and banners.
 * Extracted from LineDetailScreen for cleaner separation.
 */

import { useState, useEffect, useCallback } from 'react';
import { inboxApi, transportApi } from '../services/api';
import { useUserContext } from './useUserContext';
import type { InboxMessage } from '../types/inbox';
import type { TransportType, LineDetailResponse } from '../types/transport';

interface UseLineDetailOptions {
  lineId: string;
  transportType: TransportType;
  language: 'hr' | 'en';
}

interface UseLineDetailReturn {
  lineDetailData: LineDetailResponse | null;
  banners: InboxMessage[];
  loading: boolean;
  error: boolean;
  refreshing: boolean;
  refresh: () => void;
}

/**
 * Hook for fetching and managing line detail data
 *
 * @param options.lineId - Line ID to fetch
 * @param options.transportType - 'road' or 'sea'
 * @param options.language - 'hr' or 'en'
 */
export function useLineDetail({
  lineId,
  transportType,
  language,
}: UseLineDetailOptions): UseLineDetailReturn {
  const userContext = useUserContext();

  const [lineDetailData, setLineDetailData] = useState<LineDetailResponse | null>(null);
  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLineDetail = useCallback(async () => {
    setError(false);
    try {
      const [detail, bannersRes] = await Promise.all([
        transportApi.getLine(transportType, lineId, language),
        inboxApi.getActiveBanners(userContext, 'transport'),
      ]);
      setLineDetailData(detail);
      setBanners(bannersRes.banners);
    } catch (err) {
      console.error('[useLineDetail] Error fetching line:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lineId, transportType, userContext, language]);

  useEffect(() => {
    void fetchLineDetail();
  }, [fetchLineDetail]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    void fetchLineDetail();
  }, [fetchLineDetail]);

  return {
    lineDetailData,
    banners,
    loading,
    error,
    refreshing,
    refresh,
  };
}
