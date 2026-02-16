/**
 * useClickFixDetail Hook
 *
 * Manages state and operations for Click & Fix detail page.
 * Extracted from ClickFixDetailPage for better separation of concerns.
 */

import { useState, useEffect, useCallback } from 'react';
import { adminClickFixApi } from '../../services/api';
import type { ClickFixDetail, ClickFixStatus } from '../../types/click-fix';

interface UseClickFixDetailResult {
  /** The click fix data */
  clickFix: ClickFixDetail | null;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Reply text input value */
  replyBody: string;
  /** Set reply text */
  setReplyBody: (value: string) => void;
  /** Submitting reply state */
  submitting: boolean;
  /** Updating status state */
  statusUpdating: boolean;
  /** Change status handler */
  handleStatusChange: (newStatus: ClickFixStatus) => Promise<void>;
  /** Submit reply handler */
  handleSubmitReply: () => Promise<void>;
  /** Refresh data */
  refresh: () => Promise<void>;
}

export function useClickFixDetail(id: string | undefined): UseClickFixDetailResult {
  const [clickFix, setClickFix] = useState<ClickFixDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchClickFix = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await adminClickFixApi.getClickFixDetail(id);
      setClickFix(data);
    } catch (err) {
      console.error('[Admin] Error fetching click fix:', err);
      setError('Greska pri ucitavanju prijave.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchClickFix();
  }, [fetchClickFix]);

  const handleStatusChange = useCallback(async (newStatus: ClickFixStatus) => {
    if (!id || !clickFix) return;

    setStatusUpdating(true);
    try {
      const updated = await adminClickFixApi.updateStatus(id, newStatus);
      setClickFix(updated);
    } catch (err) {
      console.error('[Admin] Error updating status:', err);
      alert('Greska pri promjeni statusa.');
    } finally {
      setStatusUpdating(false);
    }
  }, [id, clickFix]);

  const handleSubmitReply = useCallback(async () => {
    if (!id || !replyBody.trim()) return;

    setSubmitting(true);
    try {
      await adminClickFixApi.addReply(id, { body: replyBody.trim() });
      // Refetch to get updated click-fix with new reply
      const updated = await adminClickFixApi.getClickFixDetail(id);
      setClickFix(updated);
      setReplyBody('');
    } catch (err) {
      console.error('[Admin] Error submitting reply:', err);
      alert('Greska pri slanju odgovora.');
    } finally {
      setSubmitting(false);
    }
  }, [id, replyBody]);

  return {
    clickFix,
    loading,
    error,
    replyBody,
    setReplyBody,
    submitting,
    statusUpdating,
    handleStatusChange,
    handleSubmitReply,
    refresh: fetchClickFix,
  };
}
