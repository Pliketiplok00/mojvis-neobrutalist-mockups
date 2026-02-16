/**
 * useInboxList Hook
 *
 * Manages state and operations for Inbox list page.
 * Extracted from InboxListPage for better separation of concerns.
 */

import { useState, useEffect, useCallback } from 'react';
import { adminInboxApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import { isMunicipalNotice, getMunicipalityFromTags } from '../../types/inbox';
import { useAuth } from '../../services/AuthContext';

type ViewMode = 'active' | 'archived';

interface UseInboxListResult {
  /** List of messages */
  messages: InboxMessage[];
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Current page number */
  page: number;
  /** Whether there are more pages */
  hasMore: boolean;
  /** Total message count */
  total: number;
  /** Current view mode */
  viewMode: ViewMode;
  /** Change view mode (resets to page 1) */
  handleViewModeChange: (mode: ViewMode) => void;
  /** Go to previous page */
  goToPreviousPage: () => void;
  /** Go to next page */
  goToNextPage: () => void;
  /** Archive a message */
  handleDelete: (id: string) => Promise<void>;
  /** Restore an archived message */
  handleRestore: (id: string) => Promise<void>;
  /** Refresh current page */
  refresh: () => void;
  /** Check if user can edit a message */
  canEditMessage: (message: InboxMessage) => boolean;
}

export function useInboxList(): UseInboxListResult {
  const { user } = useAuth();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('active');

  const fetchMessages = useCallback(async (pageNum: number, archived: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminInboxApi.getMessages(pageNum, 20, archived);
      setMessages(response.messages);
      setHasMore(response.has_more);
      setTotal(response.total);
    } catch (err) {
      console.error('[Admin] Error fetching messages:', err);
      setError('Greška pri učitavanju poruka. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages(page, viewMode === 'archived');
  }, [page, viewMode, fetchMessages]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setPage(1);
    setViewMode(mode);
  }, []);

  const goToPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const goToNextPage = useCallback(() => {
    if (hasMore) {
      setPage(page + 1);
    }
  }, [hasMore, page]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Jeste li sigurni da želite arhivirati ovu poruku?')) {
      return;
    }

    try {
      await adminInboxApi.deleteMessage(id);
      void fetchMessages(page, viewMode === 'archived');
    } catch (err) {
      console.error('[Admin] Error archiving message:', err);
      alert('Greška pri arhiviranju poruke.');
    }
  }, [page, viewMode, fetchMessages]);

  const handleRestore = useCallback(async (id: string) => {
    if (!window.confirm('Jeste li sigurni da želite vratiti ovu poruku?')) {
      return;
    }

    try {
      await adminInboxApi.restoreMessage(id);
      void fetchMessages(page, viewMode === 'archived');
    } catch (err) {
      console.error('[Admin] Error restoring message:', err);
      alert('Greška pri vraćanju poruke.');
    }
  }, [page, viewMode, fetchMessages]);

  const refresh = useCallback(() => {
    void fetchMessages(page, viewMode === 'archived');
  }, [page, viewMode, fetchMessages]);

  const canEditMessage = useCallback((message: InboxMessage): boolean => {
    if (!user) return false;

    // Breakglass admin can edit any message
    if (user.is_breakglass) return true;

    // Non-municipal messages are always editable
    if (!isMunicipalNotice(message.tags)) return true;

    // Check municipal scope
    const messageMunicipality = getMunicipalityFromTags(message.tags);
    return user.notice_municipality_scope === messageMunicipality;
  }, [user]);

  return {
    messages,
    loading,
    error,
    page,
    hasMore,
    total,
    viewMode,
    handleViewModeChange,
    goToPreviousPage,
    goToNextPage,
    handleDelete,
    handleRestore,
    refresh,
    canEditMessage,
  };
}
