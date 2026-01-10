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
  Body,
  Meta,
} from '../../ui';

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

// Status colors - maps to skin badge variants
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  zaprimljeno: { bg: skin.colors.infoBackground, text: skin.colors.infoText },
  u_razmatranju: { bg: skin.colors.pendingBackground, text: skin.colors.pendingText },
  prihvaceno: { bg: skin.colors.successBackground, text: skin.colors.successText },
  odbijeno: { bg: skin.colors.errorBackground, text: skin.colors.errorText },
};

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
            <Text style={styles.chevron}>{'>'}</Text>
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
        <Meta>{formatDate(item.created_at)}</Meta>
      </ListRow>
    );
  };

  const renderEmptyState = (): React.JSX.Element => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📭</Text>
      <H2 style={styles.emptyTitle}>{t('inbox.empty.title')}</H2>
      <Body color={skin.colors.textMuted} style={styles.emptySubtitle}>
        {activeTab === 'received'
          ? t('inbox.empty.received')
          : t('inbox.empty.sent')}
      </Body>
    </View>
  );

  const renderErrorState = (): React.JSX.Element => (
    <View style={styles.errorState}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Body style={styles.errorTitle}>{error}</Body>
      <Button onPress={handleRefresh}>{t('common.retry')}</Button>
    </View>
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
        <Meta>{formatDate(item.created_at)}</Meta>
      </ListRow>
    );
  };

  const renderSentEmptyState = (): React.JSX.Element => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📤</Text>
      <H2 style={styles.emptyTitle}>{t('inbox.empty.title')}</H2>
      <Body color={skin.colors.textMuted} style={styles.emptySubtitle}>
        {t('inbox.empty.sentHint')}
      </Body>
    </View>
  );

  const renderSentErrorState = (): React.JSX.Element => (
    <View style={styles.errorState}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Body style={styles.errorTitle}>{sentError}</Body>
      <Button onPress={handleRefresh}>{t('common.retry')}</Button>
    </View>
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
          <Text
            style={[
              styles.tabText,
              activeTab === 'received' && styles.tabTextActive,
            ]}
          >
            {t('inbox.tabs.received')}
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
            {t('inbox.tabs.sent')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'received' ? (
        loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={skin.colors.textPrimary} />
            <Meta style={styles.loadingText}>{t('common.loading')}</Meta>
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
              <ActivityIndicator size="large" color={skin.colors.textPrimary} />
              <Meta style={styles.loadingText}>{t('common.loading')}</Meta>
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
    fontSize: skin.components.tab.fontSize,
    color: skin.components.tab.inactiveColor,
  },
  tabTextActive: {
    color: skin.components.tab.activeColor,
    fontWeight: skin.components.tab.activeWeight,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: skin.spacing.md,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.xxl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: skin.spacing.lg,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: skin.spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: skin.spacing.lg,
  },
  emptyTitle: {
    marginBottom: skin.spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  listEmpty: {
    flexGrow: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: skin.spacing.xs,
  },
  badgeMargin: {
    marginBottom: skin.spacing.xs,
  },
  messageTitle: {
    marginBottom: skin.spacing.xs,
  },
  messageTitleUnread: {
    fontWeight: skin.typography.fontWeight.semiBold,
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
  chevron: {
    fontSize: skin.components.listRow.chevronSize,
    color: skin.components.listRow.chevronColor,
    marginLeft: skin.spacing.sm,
  },
  sentContainer: {
    flex: 1,
  },
  photoCount: {
    marginBottom: 2,
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
