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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// Inbox component tokens
const { inbox: inboxTokens } = skin.components;

/**
 * Get icon and background color for message based on tags
 *
 * Icon mapping (canonical):
 * - hitno (urgent) → shield-alert
 * - promet → traffic-cone
 * - kultura → calendar-heart
 * - opcenito → newspaper
 * - municipal (vis/komiza) → megaphone
 * - default → mail
 */
function getMessageIconConfig(tags: InboxTag[], isUrgent: boolean): { icon: IconName; background: string } {
  if (isUrgent) {
    return { icon: 'shield-alert', background: inboxTokens.listItem.iconSlabBackgroundUrgent };
  }
  if (tags.includes('promet')) {
    return { icon: 'traffic-cone', background: inboxTokens.listItem.iconSlabBackgroundTransport };
  }
  if (tags.includes('kultura')) {
    return { icon: 'calendar-heart', background: inboxTokens.listItem.iconSlabBackgroundCulture };
  }
  if (tags.includes('opcenito')) {
    return { icon: 'newspaper', background: inboxTokens.listItem.iconSlabBackgroundGeneral };
  }
  if (tags.includes('vis') || tags.includes('komiza')) {
    return { icon: 'megaphone', background: inboxTokens.listItem.iconSlabBackgroundDefault };
  }
  return { icon: 'mail', background: inboxTokens.listItem.iconSlabBackgroundDefault };
}

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
  const [selectedTags, setSelectedTags] = useState<InboxTag[]>([]);
  const userContext = useUserContext();

  // Define available filter tags based on user's municipality
  // Municipal tags are shown ONLY to users whose municipality matches
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

  // Filter messages based on selected tags (client-side)
  const filteredMessages = useMemo(() => {
    if (selectedTags.length === 0) {
      return messages;
    }
    return messages.filter((msg) =>
      msg.tags.some((tag) => selectedTags.includes(tag)) ||
      (selectedTags.includes('hitno') && msg.is_urgent)
    );
  }, [messages, selectedTags]);

  // Reset filter when switching tabs
  const handleTabChange = (tab: TabType): void => {
    setActiveTab(tab);
    setSelectedTags([]);
  };

  // Toggle tag selection
  const handleTagToggle = (tag: InboxTag): void => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

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
    const { icon, background } = getMessageIconConfig(item.tags, item.is_urgent);

    return (
      <View style={styles.messageItemWrapper}>
        <Pressable onPress={() => handleMessagePress(item)}>
          {({ pressed }) => (
            <>
              {/* Dual-layer shadow - hidden when pressed */}
              {!pressed && <View style={styles.messageItemShadow} />}
              <View style={styles.messageItem}>
                {/* Left icon slab */}
                <View style={[styles.iconSlab, { backgroundColor: background }]}>
                  <Icon
                    name={icon}
                    size="md"
                    colorToken={item.is_urgent ? 'primaryText' : 'textPrimary'}
                  />
                </View>

                {/* Content block */}
                <View style={styles.messageContent}>
                  {/* Title - ALL CAPS */}
                  <ButtonText style={styles.messageTitle} numberOfLines={1}>
                    {item.title}
                  </ButtonText>

                  {/* Preview snippet */}
                  <Body
                    color={skin.colors.textMuted}
                    numberOfLines={2}
                    style={styles.messagePreview}
                  >
                    {item.body}
                  </Body>

                  {/* Date */}
                  <Meta>{formatDateShort(item.created_at)}</Meta>
                </View>

                {/* Right section: NEW badge + chevron */}
                <View style={styles.messageRight}>
                  {unread && (
                    <View style={styles.newBadge}>
                      <Label style={styles.newBadgeText}>NEW</Label>
                    </View>
                  )}
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
              return (
                <Pressable
                  key={tag}
                  style={[
                    styles.tagChip,
                    isActive && styles.tagChipActive,
                  ]}
                  onPress={() => handleTagToggle(tag)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <Label
                    style={[
                      styles.tagChipText,
                      isActive && styles.tagChipTextActive,
                    ]}
                  >
                    {t(`inbox.tags.${tag}`)}
                  </Label>
                </Pressable>
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
    paddingHorizontal: inboxTokens.tagFilter.containerPadding,
    gap: inboxTokens.tagFilter.chipGap,
  },
  tagChip: {
    paddingHorizontal: inboxTokens.tagFilter.chipPaddingHorizontal,
    paddingVertical: inboxTokens.tagFilter.chipPaddingVertical,
    borderWidth: inboxTokens.tagFilter.chipBorderWidth,
    borderColor: inboxTokens.tagFilter.chipBorderColor,
    borderRadius: inboxTokens.tagFilter.chipBorderRadius,
    backgroundColor: inboxTokens.tagFilter.chipInactiveBackground,
  },
  tagChipActive: {
    backgroundColor: inboxTokens.tagFilter.chipActiveBackground,
  },
  tagChipText: {
    color: inboxTokens.tagFilter.chipInactiveTextColor,
    textTransform: 'uppercase',
  },
  tagChipTextActive: {
    color: inboxTokens.tagFilter.chipActiveTextColor,
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

  // Left icon slab
  iconSlab: {
    width: inboxTokens.listItem.iconSlabSize,
    height: inboxTokens.listItem.iconSlabSize,
    borderWidth: inboxTokens.listItem.iconSlabBorderWidth,
    borderColor: inboxTokens.listItem.iconSlabBorderColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: inboxTokens.listItem.iconSlabGap,
  },

  // Content block
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    marginBottom: inboxTokens.listItem.titleMarginBottom,
    textTransform: 'uppercase',
  },
  messagePreview: {
    marginBottom: inboxTokens.listItem.snippetMarginBottom,
  },

  // Right section
  messageRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: skin.spacing.sm,
  },

  // NEW badge
  newBadge: {
    backgroundColor: inboxTokens.listItem.newBadgeBackground,
    paddingHorizontal: inboxTokens.listItem.newBadgePadding,
    paddingVertical: inboxTokens.listItem.newBadgePadding,
    borderWidth: inboxTokens.listItem.newBadgeBorderWidth,
    borderColor: inboxTokens.listItem.newBadgeBorderColor,
    marginBottom: skin.spacing.sm,
  },
  newBadgeText: {
    color: inboxTokens.listItem.newBadgeTextColor,
    fontSize: skin.typography.fontSize.xs,
  },

  // Chevron box
  chevronBox: {
    width: inboxTokens.listItem.chevronBoxSize,
    height: inboxTokens.listItem.chevronBoxSize,
    backgroundColor: inboxTokens.listItem.chevronBoxBackground,
    borderWidth: inboxTokens.listItem.chevronBoxBorderWidth,
    borderColor: inboxTokens.listItem.chevronBoxBorderColor,
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
