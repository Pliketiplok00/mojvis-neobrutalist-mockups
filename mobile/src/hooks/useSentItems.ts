/**
 * useSentItems Hook
 *
 * Manages sent items (feedback + click-fix) fetching.
 * Extracted from InboxListScreen for reusability.
 */

import { useState, useEffect, useCallback } from 'react';
import { feedbackApi, clickFixApi } from '../services/api';
import { useUserContext } from './useUserContext';
import { useTranslations } from '../i18n';
import type { SentItemResponse } from '../types/feedback';
import type { ClickFixSentItemResponse } from '../types/click-fix';

/**
 * Combined sent item type (feedback or click-fix)
 */
export interface CombinedSentItem {
  id: string;
  type: 'feedback' | 'click_fix';
  subject: string;
  status: string;
  status_label: string;
  photo_count?: number;
  created_at: string;
}

interface UseSentItemsOptions {
  /** Only fetch when enabled (default: true) */
  enabled?: boolean;
}

interface UseSentItemsReturn {
  sentItems: CombinedSentItem[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => void;
}

/**
 * Hook for fetching sent items (feedback + click-fix)
 */
export function useSentItems(options: UseSentItemsOptions = {}): UseSentItemsReturn {
  const { enabled = true } = options;
  const { t } = useTranslations();
  const userContext = useUserContext();

  const [sentItems, setSentItems] = useState<CombinedSentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSentItems = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch both feedback and click_fix items in parallel
      const [feedbackResponse, clickFixResponse] = await Promise.all([
        feedbackApi.getSentItems(1, 20, userContext.language),
        clickFixApi.getSentItems(1, 20, userContext.language),
      ]);

      // Combine and sort by date (newest first)
      const combinedItems: CombinedSentItem[] = [
        ...feedbackResponse.items.map((item: SentItemResponse): CombinedSentItem => ({
          id: item.id,
          type: 'feedback',
          subject: item.subject,
          status: item.status,
          status_label: item.status_label,
          created_at: item.created_at,
        })),
        ...clickFixResponse.items.map((item: ClickFixSentItemResponse): CombinedSentItem => ({
          id: item.id,
          type: 'click_fix',
          subject: item.subject,
          status: item.status,
          status_label: item.status_label,
          photo_count: item.photo_count,
          created_at: item.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setSentItems(combinedItems);
    } catch (err) {
      console.error('[Inbox] Error fetching sent items:', err);
      setError(t('inbox.error.loadingSent'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, userContext.language]);

  useEffect(() => {
    if (enabled) {
      void fetchSentItems();
    }
  }, [enabled, fetchSentItems]);

  const refresh = useCallback(() => {
    void fetchSentItems(true);
  }, [fetchSentItems]);

  return {
    sentItems,
    loading,
    error,
    refreshing,
    refresh,
  };
}
