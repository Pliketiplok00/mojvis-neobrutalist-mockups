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

import React, { useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUnread } from '../../contexts/UnreadContext';
import { useUserContext } from '../../hooks/useUserContext';
import { useInboxMessages } from '../../hooks/useInboxMessages';
import { useSentItems, CombinedSentItem } from '../../hooks/useSentItems';
import { useTranslations } from '../../i18n';
import type { InboxMessage } from '../../types/inbox';
import type { MainStackParamList } from '../../navigation/types';

// UI Primitives
import {
  skin,
  Header,
  Button,
  Label,
  Icon,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../ui';
import type { InboxTag } from '../../types/inbox';
import { MessageListItem } from './components/MessageListItem';
import { SentListItem } from './components/SentListItem';
import { TagFilterBar } from './components/TagFilterBar';

// Inbox component tokens
const { inbox: inboxTokens } = skin.components;

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Tab options
type TabType = 'received' | 'sent';

export function InboxListScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslations();
  const { isUnread, markAsRead } = useUnread();
  const userContext = useUserContext();

  // Inbox messages hook (handles fetch, filter, tags)
  const {
    filteredMessages,
    loading,
    error,
    refreshing,
    selectedTags,
    availableTags,
    refresh: refreshMessages,
    toggleTag,
    clearTags,
  } = useInboxMessages();

  const [activeTab, setActiveTab] = useState<TabType>('received');

  // Sent items hook (only fetches when on sent tab)
  const {
    sentItems,
    loading: sentLoading,
    error: sentError,
    refreshing: sentRefreshing,
    refresh: refreshSent,
  } = useSentItems({ enabled: activeTab === 'sent' });

  // Reset filter when switching tabs
  const handleTabChange = (tab: TabType): void => {
    setActiveTab(tab);
    clearTags();
  };

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
      refreshMessages();
    } else {
      refreshSent();
    }
  };

  const renderMessage = ({ item }: { item: InboxMessage }): React.JSX.Element => (
    <MessageListItem
      message={item}
      isUnread={isUnread(item.id)}
      onPress={() => handleMessagePress(item)}
    />
  );

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

  const renderSentItem = ({ item }: { item: CombinedSentItem }): React.JSX.Element => (
    <SentListItem
      item={item}
      onPress={() => handleSentItemPress(item)}
      t={t}
    />
  );

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

      {/* Poster-style Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => handleTabChange('received')}
        >
          <Icon
            name="inbox"
            size="sm"
            colorToken={activeTab === 'received' ? 'primaryText' : 'textPrimary'}
          />
          <Label
            style={[
              styles.tabText,
              activeTab === 'received' && styles.tabTextActive,
            ]}
          >
            {t('inbox.tabs.received')}
          </Label>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => handleTabChange('sent')}
        >
          <Icon
            name="send"
            size="sm"
            colorToken={activeTab === 'sent' ? 'primaryText' : 'textPrimary'}
          />
          <Label
            style={[
              styles.tabText,
              activeTab === 'sent' && styles.tabTextActive,
            ]}
          >
            {t('inbox.tabs.sent')}
          </Label>
        </Pressable>
      </View>

      {/* Tag Filter Bar - only visible on received tab */}
      {activeTab === 'received' && (
        <TagFilterBar
          availableTags={availableTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          t={t}
        />
      )}

      {/* Content */}
      {activeTab === 'received' ? (
        loading ? (
          <LoadingState message={t('common.loading')} />
        ) : error ? (
          renderErrorState()
        ) : (
          <FlatList
            data={filteredMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            contentContainerStyle={[
              filteredMessages.length === 0 ? styles.listEmpty : undefined,
              styles.listContentContainer,
            ]}
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
                <RefreshControl refreshing={sentRefreshing} onRefresh={handleRefresh} />
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

  // Poster-style tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: inboxTokens.tabs.borderBottomWidth,
    borderBottomColor: inboxTokens.tabs.borderBottomColor,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: inboxTokens.tabs.iconGap,
    paddingVertical: inboxTokens.tabs.tabPadding,
    backgroundColor: inboxTokens.tabs.inactiveBackground,
    borderWidth: inboxTokens.tabs.inactiveBorderWidth,
    borderColor: inboxTokens.tabs.inactiveBorderColor,
    borderBottomWidth: 0,
  },
  tabActive: {
    backgroundColor: inboxTokens.tabs.activeBackground,
    borderWidth: inboxTokens.tabs.activeBorderWidth,
    borderColor: inboxTokens.tabs.activeBorderColor,
    borderBottomWidth: 0,
  },
  tabText: {
    color: inboxTokens.tabs.inactiveTextColor,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: inboxTokens.tabs.activeTextColor,
  },

  // List content container (spacing from filter bar)
  listContentContainer: {
    paddingTop: skin.spacing.sm,
  },

  listEmpty: {
    flexGrow: 1,
  },

  sentContainer: {
    flex: 1,
  },
  newFeedbackContainer: {
    padding: skin.spacing.lg,
    borderTopWidth: skin.borders.widthCard,
    borderTopColor: skin.colors.border,
    backgroundColor: skin.colors.background,
  },
  primaryButton: {
    marginBottom: skin.spacing.sm,
  },
});

export default InboxListScreen;
