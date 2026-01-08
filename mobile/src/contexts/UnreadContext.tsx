/**
 * Unread State Context
 *
 * Local-only tracking of read/unread inbox messages.
 * Per spec: "Read/unread state (recommended: local-only for MVP)"
 *
 * This context:
 * - Tracks which message IDs have been read
 * - Persists to AsyncStorage (TODO)
 * - Provides unread count for badge display
 * - Clears unread on message open
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

interface UnreadContextValue {
  /**
   * Set of message IDs that have been read
   */
  readMessageIds: Set<string>;

  /**
   * Mark a message as read
   */
  markAsRead: (messageId: string) => void;

  /**
   * Mark multiple messages as read
   */
  markAllAsRead: (messageIds: string[]) => void;

  /**
   * Check if a message is unread
   */
  isUnread: (messageId: string) => boolean;

  /**
   * Get count of unread messages from a list
   */
  getUnreadCount: (messageIds: string[]) => number;

  /**
   * Register new messages (for tracking unread state)
   */
  registerMessages: (messageIds: string[]) => void;

  /**
   * Total known unread count
   */
  unreadCount: number;
}

const UnreadContext = createContext<UnreadContextValue | null>(null);

interface UnreadProviderProps {
  children: ReactNode;
}

export function UnreadProvider({ children }: UnreadProviderProps): React.JSX.Element {
  // Set of message IDs that have been READ
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(new Set());

  // Set of ALL known message IDs (for counting unread)
  const [knownMessageIds, setKnownMessageIds] = useState<Set<string>>(new Set());

  // TODO: Load from AsyncStorage on mount
  // TODO: Save to AsyncStorage on changes

  const markAsRead = useCallback((messageId: string) => {
    setReadMessageIds((prev) => {
      const next = new Set(prev);
      next.add(messageId);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback((messageIds: string[]) => {
    setReadMessageIds((prev) => {
      const next = new Set(prev);
      messageIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const isUnread = useCallback(
    (messageId: string) => {
      return knownMessageIds.has(messageId) && !readMessageIds.has(messageId);
    },
    [knownMessageIds, readMessageIds]
  );

  const getUnreadCount = useCallback(
    (messageIds: string[]) => {
      return messageIds.filter((id) => !readMessageIds.has(id)).length;
    },
    [readMessageIds]
  );

  const registerMessages = useCallback((messageIds: string[]) => {
    setKnownMessageIds((prev) => {
      const next = new Set(prev);
      messageIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const unreadCount = useMemo(() => {
    let count = 0;
    knownMessageIds.forEach((id) => {
      if (!readMessageIds.has(id)) {
        count++;
      }
    });
    return count;
  }, [knownMessageIds, readMessageIds]);

  const value: UnreadContextValue = useMemo(
    () => ({
      readMessageIds,
      markAsRead,
      markAllAsRead,
      isUnread,
      getUnreadCount,
      registerMessages,
      unreadCount,
    }),
    [readMessageIds, markAsRead, markAllAsRead, isUnread, getUnreadCount, registerMessages, unreadCount]
  );

  return (
    <UnreadContext.Provider value={value}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread(): UnreadContextValue {
  const context = useContext(UnreadContext);
  if (!context) {
    throw new Error('useUnread must be used within an UnreadProvider');
  }
  return context;
}

export default UnreadContext;
