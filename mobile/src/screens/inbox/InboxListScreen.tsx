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
 *
 * REFACTORED: Now uses UI primitives from src/ui/
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUnread } from '../../contexts/UnreadContext';
import { useUserContext } from '../../hooks/useUserContext';
import { useTranslations } from '../../i18n';
import { inboxApi, feedbackApi, clickFixApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { SentItemResponse } from '../../types/feedback';
import type { ClickFixSentItemResponse } from '../../types/click-fix';
import type { MainStackParamList } from '../../navigation/types';

// UI Primitives
import {
  skin,
  Header,
  Button,
  Badge,
  ListRow,
  H2,
  Label,
  Body,
  Meta,
  Icon,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../ui';
import { STATUS_COLORS } from '../../ui/utils/statusColors';
import { formatDateShort } from '../../utils/dateFormat';

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

export function InboxListScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslations();
  const { isUnread, markAsRead, registerMessages } = useUnread();

  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [sentItems, setSentItems] = useState<CombinedSentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentLoading, setSentLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentError, setSentError] = useState<string | null>(null);
  const userContext = useUserContext();

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
  }, [registerMessages, userContext]);

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
      setSentError(t('inbox.error.loadingSent'));
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
      <ListRow
        onPress={() => handleMessagePress(item)}
        highlighted={unread}
        rightAccessory={
          <>
            {unread && <View style={styles.unreadDot} />}
            <Icon name="chevron-right" size="sm" colorToken="chevron" />
          </>
        }
      >
        {/* Urgent indicator */}
        {item.is_urgent && (
          <Badge variant="urgent" style={styles.badgeMargin}>{t('inbox.badges.urgent')}</Badge>
        )}

        {/* Title */}
        <Body
          style={unread ? [styles.messageTitle, styles.messageTitleUnread] : styles.messageTitle}
          numberOfLines={1}
        >
          {item.title}
        </Body>

        {/* Preview of body */}
        <Body color={skin.colors.textMuted} numberOfLines={2} style={styles.messagePreview}>
          {item.body}
        </Body>

        {/* Date */}
        <Meta>{formatDateShort(item.created_at)}</Meta>
      </ListRow>
    );
  };

  const renderEmptyState = (): React.JSX.Element => (
    <EmptyState
      icon="inbox"
      title={t('inbox.empty.title')}
      subtitle={activeTab === 'received' ? t('inbox.empty.received') : t('inbox.empty.sent')}
    />
  );

  const renderErrorState = (): React.JSX.Element => (
    <ErrorState
      message={error || t('inbox.error.loading')}
      onRetry={handleRefresh}
      retryLabel={t('common.retry')}
    />
  );

  const renderSentItem = ({ item }: { item: CombinedSentItem }): React.JSX.Element => {
    const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.zaprimljeno;
    const isClickFix = item.type === 'click_fix';

    return (
      <ListRow onPress={() => handleSentItemPress(item)}>
        {/* Type and Status badges */}
        <View style={styles.badgeRow}>
          {isClickFix && (
            <Badge variant="type" style={styles.badgeMargin}>{t('inbox.badges.report')}</Badge>
          )}
          <Badge
            backgroundColor={statusColor.bg}
            textColor={statusColor.text}
          >
            {item.status_label}
          </Badge>
        </View>

        {/* Subject */}
        <Body style={styles.messageTitle} numberOfLines={1}>
          {item.subject}
        </Body>

        {/* Photo count for Click & Fix */}
        {isClickFix && item.photo_count !== undefined && item.photo_count > 0 && (
          <Meta style={styles.photoCount}>{item.photo_count} {t('inbox.photoCount')}</Meta>
        )}

        {/* Date */}
        <Meta>{formatDateShort(item.created_at)}</Meta>
      </ListRow>
    );
  };

  const renderSentEmptyState = (): React.JSX.Element => (
    <EmptyState
      icon="send"
      title={t('inbox.empty.title')}
      subtitle={t('inbox.empty.sentHint')}
    />
  );

  const renderSentErrorState = (): React.JSX.Element => (
    <ErrorState
      message={sentError || t('inbox.error.loadingSent')}
      onRetry={handleRefresh}
      retryLabel={t('common.retry')}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header type="inbox" />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}
        >
          <Label
            style={[
              styles.tabText,
              activeTab === 'received' && styles.tabTextActive,
            ]}
          >
            {t('inbox.tabs.received')}
          </Label>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
        >
          <Label
            style={[
              styles.tabText,
              activeTab === 'sent' && styles.tabTextActive,
            ]}
          >
            {t('inbox.tabs.sent')}
          </Label>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'received' ? (
        loading ? (
          <LoadingState message={t('common.loading')} />
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
            <LoadingState message={t('common.loading')} />
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
            <Button onPress={handleNewFeedback} style={styles.primaryButton}>
              {t('inbox.actions.newMessage')}
            </Button>
            <Button variant="secondary" onPress={handleNewClickFix}>
              {t('inbox.actions.reportProblem')}
            </Button>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: skin.colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: skin.borders.widthThin,
    borderBottomColor: skin.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: skin.components.tab.paddingVertical,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: skin.components.tab.borderBottomWidth,
    borderBottomColor: skin.components.tab.borderBottomColor,
  },
  tabText: {
    color: skin.components.tab.inactiveColor,
  },
  tabTextActive: {
    color: skin.components.tab.activeColor,
  },
  listEmpty: {
    flexGrow: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: skin.spacing.sm,
    marginBottom: skin.spacing.xs,
  },
  badgeMargin: {
    marginBottom: skin.spacing.xs,
  },
  messageTitle: {
    marginBottom: skin.spacing.xs,
  },
  messageTitleUnread: {
    color: skin.colors.textPrimary,
  },
  messagePreview: {
    marginBottom: skin.spacing.xs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: skin.colors.unreadIndicator,
    marginRight: skin.spacing.sm,
  },
  sentContainer: {
    flex: 1,
  },
  photoCount: {
    marginBottom: skin.spacing.xs,
  },
  newFeedbackContainer: {
    padding: skin.spacing.lg,
    borderTopWidth: skin.borders.widthThin,
    borderTopColor: skin.colors.border,
    backgroundColor: skin.colors.background,
  },
  primaryButton: {
    marginBottom: skin.spacing.sm,
  },
});

export default InboxListScreen;
