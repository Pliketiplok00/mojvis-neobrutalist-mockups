/**
 * useInboxMessages Hook
 *
 * Manages inbox messages fetching, filtering, and tag selection.
 * Extracted from InboxListScreen for reusability.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { inboxApi } from '../services/api';
import { useUnread } from '../contexts/UnreadContext';
import { useUserContext } from './useUserContext';
import { useTranslations } from '../i18n';
import type { InboxMessage, InboxTag } from '../types/inbox';

interface UseInboxMessagesReturn {
  messages: InboxMessage[];
  filteredMessages: InboxMessage[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  selectedTags: InboxTag[];
  availableTags: InboxTag[];
  refresh: () => void;
  toggleTag: (tag: InboxTag) => void;
  clearTags: () => void;
}

/**
 * Hook for fetching and filtering inbox messages
 */
export function useInboxMessages(): UseInboxMessagesReturn {
  const { t } = useTranslations();
  const userContext = useUserContext();
  const { registerMessages } = useUnread();

  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<InboxTag[]>([]);

  // Available tags depend on user's municipality
  const availableTags = useMemo((): InboxTag[] => {
    const baseTags: InboxTag[] = ['promet', 'kultura', 'opcenito', 'hitno'];
    if (userContext.municipality === 'vis') {
      return [...baseTags, 'vis'];
    }
    if (userContext.municipality === 'komiza') {
      return [...baseTags, 'komiza'];
    }
    return baseTags;
  }, [userContext.municipality]);

  const fetchMessages = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await inboxApi.getMessages(userContext);
      setMessages(response.messages);
      registerMessages(response.messages.map((m) => m.id));
    } catch (err) {
      console.error('[Inbox] Error fetching messages:', err);
      setError(t('inbox.error.loading'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [registerMessages, userContext, t]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const refresh = useCallback(() => {
    void fetchMessages(true);
  }, [fetchMessages]);

  const toggleTag = useCallback((tag: InboxTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const clearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  // Filter messages based on selected tags
  const filteredMessages = useMemo(() => {
    if (selectedTags.length === 0) {
      return messages;
    }
    return messages.filter((msg) =>
      msg.tags.some((tag) => selectedTags.includes(tag)) ||
      (selectedTags.includes('hitno') && msg.is_urgent)
    );
  }, [messages, selectedTags]);

  return {
    messages,
    filteredMessages,
    loading,
    error,
    refreshing,
    selectedTags,
    availableTags,
    refresh,
    toggleTag,
    clearTags,
  };
}
