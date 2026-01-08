/**
 * Inbox List Screen
 *
 * Main inbox screen with tabs:
 * - Primljeno (Received): Shows inbox messages
 * - Poslano (Sent): Shows user-submitted feedback (Phase 5) and Click & Fix (Phase 6)
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
import { inboxApi, feedbackApi, clickFixApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { SentItemResponse } from '../../types/feedback';
import type { ClickFixSentItemResponse } from '../../types/click-fix';
import type { MainStackParamList } from '../../navigation/types';

// Combined sent item type
interface CombinedSentItem {
  id: string;
  type: 'feedback' | 'click_fix';
  subject: string;
  status: string;
  status_label: string;
  photo_count?: number;
  created_at: string;
}

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Tab options
type TabType = 'received' | 'sent';

// Status colors
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  zaprimljeno: { bg: '#E3F2FD', text: '#1565C0' },
  u_razmatranju: { bg: '#FFF3E0', text: '#E65100' },
  prihvaceno: { bg: '#E8F5E9', text: '#2E7D32' },
  odbijeno: { bg: '#FFEBEE', text: '#C62828' },
};

export function InboxListScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { isUnread, markAsRead, registerMessages } = useUnread();

  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [sentItems, setSentItems] = useState<CombinedSentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentLoading, setSentLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentError, setSentError] = useState<string | null>(null);

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

  const fetchSentItems = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setSentLoading(true);
    }
    setSentError(null);

    try {
      // Fetch both feedback and click_fix items in parallel
      const [feedbackResponse, clickFixResponse] = await Promise.all([
        feedbackApi.getSentItems(),
        clickFixApi.getSentItems(),
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
      setSentError('Greška pri učitavanju poslanih poruka.');
    } finally {
      setSentLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (activeTab === 'sent') {
      void fetchSentItems();
    }
  }, [activeTab, fetchSentItems]);

  const handleMessagePress = (message: InboxMessage): void => {
    markAsRead(message.id);
    navigation.navigate('InboxDetail', { messageId: message.id });
  };

  const handleSentItemPress = (item: CombinedSentItem): void => {
    if (item.type === 'click_fix') {
      navigation.navigate('ClickFixDetail', { clickFixId: item.id });
    } else {
      navigation.navigate('FeedbackDetail', { feedbackId: item.id });
    }
  };

  const handleNewFeedback = (): void => {
    navigation.navigate('FeedbackForm');
  };

  const handleNewClickFix = (): void => {
    navigation.navigate('ClickFixForm');
  };

  const handleRefresh = (): void => {
    if (activeTab === 'received') {
      void fetchMessages(true);
    } else {
      void fetchSentItems(true);
    }
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

  const renderSentItem = ({ item }: { item: CombinedSentItem }): React.JSX.Element => {
    const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.zaprimljeno;
    const isClickFix = item.type === 'click_fix';

    return (
      <TouchableOpacity
        style={styles.messageItem}
        onPress={() => handleSentItemPress(item)}
        accessibilityLabel={item.subject}
        accessibilityHint="Dodirnite za otvaranje poruke"
      >
        <View style={styles.messageContent}>
          {/* Type and Status badges */}
          <View style={styles.badgeRow}>
            {isClickFix && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>PRIJAVA</Text>
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {item.status_label}
              </Text>
            </View>
          </View>

          {/* Subject */}
          <Text style={styles.messageTitle} numberOfLines={1}>
            {item.subject}
          </Text>

          {/* Photo count for Click & Fix */}
          {isClickFix && item.photo_count !== undefined && item.photo_count > 0 && (
            <Text style={styles.photoCount}>{item.photo_count} slika</Text>
          )}

          {/* Date */}
          <Text style={styles.messageDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>

        {/* Navigation chevron */}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderSentEmptyState = (): React.JSX.Element => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📤</Text>
      <Text style={styles.emptyTitle}>Nema poslanih poruka</Text>
      <Text style={styles.emptySubtitle}>
        Pošaljite prvu poruku putem gumba ispod
      </Text>
    </View>
  );

  const renderSentErrorState = (): React.JSX.Element => (
    <View style={styles.errorState}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>{sentError}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryText}>Pokušaj ponovo</Text>
      </TouchableOpacity>
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
        <View style={styles.sentContainer}>
          {sentLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#000000" />
              <Text style={styles.loadingText}>Učitavanje...</Text>
            </View>
          ) : sentError ? (
            renderSentErrorState()
          ) : (
            <FlatList
              data={sentItems}
              keyExtractor={(item) => item.id}
              renderItem={renderSentItem}
              ListEmptyComponent={renderSentEmptyState}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              contentContainerStyle={sentItems.length === 0 ? styles.listEmpty : undefined}
            />
          )}

          {/* New submission buttons */}
          <View style={styles.newFeedbackContainer}>
            <TouchableOpacity
              style={styles.newFeedbackButton}
              onPress={handleNewFeedback}
              activeOpacity={0.7}
            >
              <Text style={styles.newFeedbackButtonText}>Nova poruka</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.newClickFixButton}
              onPress={handleNewClickFix}
              activeOpacity={0.7}
            >
              <Text style={styles.newClickFixButtonText}>Prijavi problem</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  sentContainer: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  newFeedbackContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  newFeedbackButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  newFeedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  newClickFixButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  newClickFixButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  photoCount: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
});

export default InboxListScreen;
