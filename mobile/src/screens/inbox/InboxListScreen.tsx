/**
 * Inbox List Screen
 *
 * Main inbox screen with tabs:
 * - Primljeno (Received): Shows inbox messages
 * - Poslano (Sent): Empty placeholder per Phase 1 spec
 *
 * Rules:
 * - Header type is 'inbox' (no inbox icon shown)
 * - Messages are navigational list items
 * - Tapping opens message detail
 * - Unread state is local-only
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { useUnread } from '../../contexts/UnreadContext';
import { inboxApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Tab options
type TabType = 'received' | 'sent';

export function InboxListScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { isUnread, markAsRead, registerMessages } = useUnread();

  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Get from user context
  const userContext = { userMode: 'visitor' as const, municipality: null };

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
      setError('Greška pri učitavanju poruka. Pokušajte ponovo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [registerMessages]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const handleMessagePress = (message: InboxMessage): void => {
    markAsRead(message.id);
    navigation.navigate('InboxDetail', { messageId: message.id });
  };

  const handleRefresh = (): void => {
    void fetchMessages(true);
  };

  const renderMessage = ({ item }: { item: InboxMessage }): React.JSX.Element => {
    const unread = isUnread(item.id);

    return (
      <TouchableOpacity
        style={[styles.messageItem, unread && styles.messageItemUnread]}
        onPress={() => handleMessagePress(item)}
        accessibilityLabel={`${item.title}${unread ? ', nepročitano' : ''}`}
        accessibilityHint="Dodirnite za otvaranje poruke"
      >
        <View style={styles.messageContent}>
          {/* Urgent indicator */}
          {item.is_urgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>HITNO</Text>
            </View>
          )}

          {/* Title */}
          <Text
            style={[styles.messageTitle, unread && styles.messageTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {/* Preview of body */}
          <Text style={styles.messagePreview} numberOfLines={2}>
            {item.body}
          </Text>

          {/* Date */}
          <Text style={styles.messageDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>

        {/* Unread indicator */}
        {unread && <View style={styles.unreadDot} />}

        {/* Navigation chevron */}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = (): React.JSX.Element => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>Nema poruka</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'received'
          ? 'Vaš sandučić je prazan'
          : 'Niste poslali nijednu poruku'}
      </Text>
    </View>
  );

  const renderErrorState = (): React.JSX.Element => (
    <View style={styles.errorState}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryText}>Pokušaj ponovo</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSentPlaceholder = (): React.JSX.Element => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📤</Text>
      <Text style={styles.emptyTitle}>Poslane poruke</Text>
      <Text style={styles.emptySubtitle}>
        Ovdje će se prikazivati vaše poslane poruke
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader type="inbox" />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'received' && styles.tabTextActive,
            ]}
          >
            Primljeno
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'sent' && styles.tabTextActive,
            ]}
          >
            Poslano
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'received' ? (
        loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Učitavanje...</Text>
          </View>
        ) : error ? (
          renderErrorState()
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            contentContainerStyle={messages.length === 0 ? styles.listEmpty : undefined}
          />
        )
      ) : (
        renderSentPlaceholder()
      )}
    </SafeAreaView>
  );
}

/**
 * Format date for display
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '600',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  listEmpty: {
    flexGrow: 1,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  messageItemUnread: {
    backgroundColor: '#F8F9FA',
  },
  messageContent: {
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  messageTitleUnread: {
    fontWeight: '600',
    color: '#000000',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  messageDate: {
    fontSize: 12,
    color: '#999999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginRight: 8,
  },
  chevron: {
    fontSize: 24,
    color: '#CCCCCC',
    marginLeft: 8,
  },
});

export default InboxListScreen;
