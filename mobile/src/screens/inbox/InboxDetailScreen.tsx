/**
 * Inbox Detail Screen
 *
 * Shows full content of a single inbox message.
 *
 * Rules:
 * - Header type is 'inbox' (no inbox icon shown)
 * - Uses back navigation (child screen)
 * - Marks message as read on open
 * - Shows urgent badge for hitno messages
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { GlobalHeader } from '../../components/GlobalHeader';
import { useUnread } from '../../contexts/UnreadContext';
import { useUserContext } from '../../hooks/useUserContext';
import { inboxApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { MainStackParamList } from '../../navigation/types';

type DetailRouteProp = RouteProp<MainStackParamList, 'InboxDetail'>;

export function InboxDetailScreen(): React.JSX.Element {
  const route = useRoute<DetailRouteProp>();
  const { messageId } = route.params;
  const { markAsRead } = useUnread();

  const [message, setMessage] = useState<InboxMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userContext = useUserContext();

  const fetchMessage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await inboxApi.getMessage(userContext, messageId);
      setMessage(data);
      markAsRead(messageId);
    } catch (err) {
      console.error('[Inbox] Error fetching message:', err);
      setError('Greška pri učitavanju poruke. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  }, [messageId, markAsRead, userContext]);

  useEffect(() => {
    void fetchMessage();
  }, [fetchMessage]);

  const handleRetry = (): void => {
    void fetchMessage();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <GlobalHeader type="inbox" />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !message) {
    return (
      <SafeAreaView style={styles.container}>
        <GlobalHeader type="inbox" />
        <View style={styles.errorState}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>
            {error || 'Poruka nije pronađena'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Pokušaj ponovo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader type="inbox" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Urgent badge */}
        {message.is_urgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>HITNO</Text>
          </View>
        )}

        {/* Tags - defensive: ensure tags is always an array */}
        {(() => {
          const tags = Array.isArray(message.tags) ? message.tags : [];
          const visibleTags = tags.filter((tag) => tag !== 'hitno');
          if (visibleTags.length === 0) return null;
          return (
            <View style={styles.tagsContainer}>
              {visibleTags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{formatTag(tag)}</Text>
                </View>
              ))}
            </View>
          );
        })()}

        {/* Title */}
        <Text style={styles.title}>{message.title}</Text>

        {/* Date */}
        <Text style={styles.date}>{formatDateTime(message.created_at)}</Text>

        {/* Body */}
        <Text style={styles.body}>{message.body}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Format tag for display
 */
function formatTag(tag: string): string {
  const tagLabels: Record<string, string> = {
    cestovni_promet: 'Cestovni promet',
    pomorski_promet: 'Pomorski promet',
    kultura: 'Kultura',
    opcenito: 'Općenito',
    komiza: 'Komiža',
    vis: 'Vis',
  };
  return tagLabels[tag] || tag;
}

/**
 * Format date and time for display
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  urgentBadge: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 24,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
});

export default InboxDetailScreen;
