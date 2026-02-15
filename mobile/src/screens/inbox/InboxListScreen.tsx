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
  ScrollView,
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
  Badge,
  Label,
  Body,
  Meta,
  ButtonText,
  Icon,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../ui';
import type { IconName } from '../../ui/Icon';
import { STATUS_COLORS } from '../../ui/utils/statusColors';
import { formatDateShort } from '../../utils/dateFormat';
import type { InboxTag } from '../../types/inbox';
import { MessageListItem } from './components/MessageListItem';

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

  const renderSentItem = ({ item }: { item: CombinedSentItem }): React.JSX.Element => {
    const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.zaprimljeno;
    const isClickFix = item.type === 'click_fix';
    const iconName: IconName = isClickFix ? 'camera' : 'send';
    const iconBackground = isClickFix
      ? skin.colors.orange
      : skin.colors.lavender;

    return (
      <View style={styles.messageItemWrapper}>
        <Pressable onPress={() => handleSentItemPress(item)}>
          {({ pressed }) => (
            <>
              {/* Dual-layer shadow - hidden when pressed */}
              {!pressed && <View style={styles.messageItemShadow} />}
              <View style={styles.messageItem}>
                {/* Left icon slab */}
                <View style={[styles.iconSlab, { backgroundColor: iconBackground }]}>
                  <Icon name={iconName} size="md" colorToken="textPrimary" />
                </View>

                {/* Content block */}
                <View style={styles.messageContent}>
                  {/* Subject - ALL CAPS */}
                  <ButtonText style={styles.messageTitle} numberOfLines={1}>
                    {item.subject}
                  </ButtonText>

                  {/* Status badge row */}
                  <View style={styles.badgeRow}>
                    {isClickFix && (
                      <Badge variant="type" style={styles.badgeMargin}>
                        {t('inbox.badges.report')}
                      </Badge>
                    )}
                    <Badge backgroundColor={statusColor.bg} textColor={statusColor.text}>
                      {item.status_label}
                    </Badge>
                  </View>

                  {/* Photo count for Click & Fix */}
                  {isClickFix && item.photo_count !== undefined && item.photo_count > 0 && (
                    <Meta style={styles.photoCount}>
                      {item.photo_count} {t('inbox.photoCount')}
                    </Meta>
                  )}

                  {/* Date */}
                  <Meta>{formatDateShort(item.created_at)}</Meta>
                </View>

                {/* Right section: chevron */}
                <View style={styles.messageRight}>
                  <View style={styles.chevronBox}>
                    <Icon name="chevron-right" size="sm" colorToken="chevron" />
                  </View>
                </View>
              </View>
            </>
          )}
        </Pressable>
      </View>
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
        <View style={styles.tagFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagFilterScrollContent}
          >
            {availableTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              // Per-tag background and text colors (always applied)
              const tagBackground = inboxTokens.tagFilter.chipBackgrounds[tag];
              const tagTextColor = inboxTokens.tagFilter.chipTextColors[tag];
              return (
                <View key={tag} style={styles.tagChipWrapper}>
                  {/* Neobrut shadow layer - only visible when selected */}
                  {isActive && <View style={styles.tagChipShadow} />}
                  <Pressable
                    style={[
                      styles.tagChip,
                      { backgroundColor: tagBackground },
                      isActive && styles.tagChipSelected,
                    ]}
                    onPress={() => toggleTag(tag)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Label style={[styles.tagChipText, { color: tagTextColor }]}>
                      {t(`inbox.tags.${tag}`)}
                    </Label>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </View>
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

  // Tag filter bar
  tagFilterContainer: {
    backgroundColor: inboxTokens.tagFilter.containerBackground,
    paddingVertical: inboxTokens.tagFilter.containerPadding,
    borderBottomWidth: skin.borders.widthThin,
    borderBottomColor: skin.colors.border,
  },
  tagFilterScrollContent: {
    paddingLeft: inboxTokens.tagFilter.containerPadding,
    // Right padding: container padding + shadow offset to prevent clipping
    paddingRight: inboxTokens.tagFilter.containerPadding + inboxTokens.tagFilter.chipShadowOffset,
    // Bottom padding for shadow visibility (derived from shadow offset)
    paddingBottom: inboxTokens.tagFilter.chipShadowOffset,
    gap: inboxTokens.tagFilter.chipGap,
  },
  // Chip wrapper for shadow positioning
  tagChipWrapper: {
    position: 'relative',
  },
  // Neobrut shadow layer (visible only when selected)
  tagChipShadow: {
    position: 'absolute',
    top: inboxTokens.tagFilter.chipShadowOffset,
    left: inboxTokens.tagFilter.chipShadowOffset,
    right: -inboxTokens.tagFilter.chipShadowOffset,
    bottom: -inboxTokens.tagFilter.chipShadowOffset,
    backgroundColor: inboxTokens.tagFilter.chipShadowColor,
    borderRadius: inboxTokens.tagFilter.chipBorderRadius,
  },
  // Chip base style (category background applied via inline style)
  tagChip: {
    paddingHorizontal: inboxTokens.tagFilter.chipPaddingHorizontal,
    paddingVertical: inboxTokens.tagFilter.chipPaddingVertical,
    borderWidth: inboxTokens.tagFilter.chipBorderWidthDefault,
    borderColor: inboxTokens.tagFilter.chipBorderColor,
    borderRadius: inboxTokens.tagFilter.chipBorderRadius,
  },
  // Selected chip: thicker outline
  tagChipSelected: {
    borderWidth: inboxTokens.tagFilter.chipBorderWidthSelected,
  },
  // Chip text (color applied via inline style for per-tag legibility)
  tagChipText: {
    textTransform: 'uppercase',
  },

  // List content container (spacing from filter bar)
  listContentContainer: {
    paddingTop: inboxTokens.tagFilter.listTopPadding,
  },

  listEmpty: {
    flexGrow: 1,
  },

  // Message item poster card
  messageItemWrapper: {
    position: 'relative',
    marginBottom: inboxTokens.listItem.marginBottom,
    marginHorizontal: inboxTokens.listItem.marginHorizontal,
  },
  messageItemShadow: {
    position: 'absolute',
    top: inboxTokens.listItem.shadowOffsetY,
    left: inboxTokens.listItem.shadowOffsetX,
    right: -inboxTokens.listItem.shadowOffsetX,
    bottom: -inboxTokens.listItem.shadowOffsetY,
    backgroundColor: inboxTokens.listItem.shadowColor,
    borderRadius: inboxTokens.listItem.borderRadius,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: inboxTokens.listItem.background,
    borderWidth: inboxTokens.listItem.borderWidth,
    borderColor: inboxTokens.listItem.borderColor,
    borderRadius: inboxTokens.listItem.borderRadius,
    padding: inboxTokens.listItem.padding,
  },

  // Single icon slab
  iconSlab: {
    width: inboxTokens.listItem.iconSlabSize,
    height: inboxTokens.listItem.iconSlabSize,
    borderWidth: inboxTokens.listItem.iconSlabBorderWidth,
    borderColor: inboxTokens.listItem.iconSlabBorderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content block
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    marginBottom: inboxTokens.listItem.titleMarginBottom,
    textTransform: 'uppercase',
  },

  // Right section
  messageRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: skin.spacing.sm,
  },

  // Chevron box (unboxed per design guardrails)
  chevronBox: {
    width: inboxTokens.listItem.chevronBoxSize,
    height: inboxTokens.listItem.chevronBoxSize,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge row for sent items
  badgeRow: {
    flexDirection: 'row',
    gap: skin.spacing.sm,
    marginBottom: skin.spacing.xs,
  },
  badgeMargin: {
    marginRight: skin.spacing.xs,
  },

  sentContainer: {
    flex: 1,
  },
  photoCount: {
    marginBottom: skin.spacing.xs,
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
