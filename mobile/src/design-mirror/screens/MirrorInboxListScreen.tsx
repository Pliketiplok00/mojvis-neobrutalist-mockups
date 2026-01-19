/**
 * Mirror Inbox List Screen (Design Mirror)
 *
 * Mirrors InboxListScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Tabs (Received / Sent)
 * 2. Message list with icon slabs, badges, chevrons
 * 3. Sent items with status badges
 * 4. Empty states
 * 5. Action buttons (Sent tab)
 *
 * Rules:
 * - NO useNavigation import
 * - NO useUnread hook
 * - NO useUserContext hook
 * - NO API calls
 * - All actions are NO-OP
 * - Skin tokens only
 */

import React, { useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/States';
import { Label, Body, Meta, ButtonText, H2 } from '../../ui/Text';
import type { IconName } from '../../ui/Icon';
import type { InboxTag, InboxMessage } from '../../types/inbox';
import { STATUS_COLORS } from '../../ui/utils/statusColors';
import {
  inboxMessagesFixture,
  sentItemsFixture,
  inboxLabels,
  type CombinedSentItemFixture,
} from '../fixtures/inbox';

// Inbox component tokens
const { inbox: inboxTokens } = skin.components;

/**
 * Get icon and background color for message based on tags
 */
function getMessageIconConfig(tags: InboxTag[], isUrgent: boolean): { icon: IconName; background: string } {
  if (isUrgent) {
    return { icon: 'alert-triangle', background: inboxTokens.listItem.iconSlabBackgroundUrgent };
  }
  if (tags.includes('promet')) {
    return { icon: 'ship', background: inboxTokens.listItem.iconSlabBackgroundTransport };
  }
  if (tags.includes('kultura')) {
    return { icon: 'calendar', background: inboxTokens.listItem.iconSlabBackgroundCulture };
  }
  if (tags.includes('opcenito')) {
    return { icon: 'message-circle', background: inboxTokens.listItem.iconSlabBackgroundGeneral };
  }
  return { icon: 'mail', background: inboxTokens.listItem.iconSlabBackgroundDefault };
}

/**
 * Format date short (DD.MM.)
 */
function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}.`;
}

// Tab options
type TabType = 'received' | 'sent';

/**
 * Mirror Inbox List Screen
 */
export function MirrorInboxListScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('received');

  // Fixture data
  const messages = inboxMessagesFixture;
  const sentItems = sentItemsFixture;

  // Simulate unread state for visual purposes (first 2 messages are "unread")
  const unreadIds = new Set([messages[0]?.id, messages[1]?.id]);

  // NO-OP handlers
  const handleMessagePress = (): void => {
    // Intentionally empty - mirror screens don't navigate
  };

  const handleSentItemPress = (): void => {
    // Intentionally empty - mirror screens don't navigate
  };

  const handleNewFeedback = (): void => {
    // Intentionally empty
  };

  const handleNewClickFix = (): void => {
    // Intentionally empty
  };

  const renderMessage = ({ item }: { item: InboxMessage }): React.JSX.Element => {
    const unread = unreadIds.has(item.id);
    const { icon, background } = getMessageIconConfig(item.tags, item.is_urgent);

    return (
      <View style={styles.messageItemWrapper}>
        <Pressable onPress={handleMessagePress}>
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
                      <Label style={styles.newBadgeText}>{inboxLabels.badges.new}</Label>
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
      title={inboxLabels.empty.title}
      subtitle={activeTab === 'received' ? inboxLabels.empty.received : inboxLabels.empty.sent}
    />
  );

  const renderSentItem = ({ item }: { item: CombinedSentItemFixture }): React.JSX.Element => {
    const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.zaprimljeno;
    const isClickFix = item.type === 'click_fix';
    const iconName: IconName = isClickFix ? 'camera' : 'send';
    const iconBackground = isClickFix
      ? skin.colors.orange
      : skin.colors.lavender;

    return (
      <View style={styles.messageItemWrapper}>
        <Pressable onPress={handleSentItemPress}>
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
                        {inboxLabels.badges.report}
                      </Badge>
                    )}
                    <Badge backgroundColor={statusColor.bg} textColor={statusColor.text}>
                      {item.status_label}
                    </Badge>
                  </View>

                  {/* Photo count for Click & Fix */}
                  {isClickFix && item.photo_count !== undefined && item.photo_count > 0 && (
                    <Meta style={styles.photoCount}>
                      {item.photo_count} {inboxLabels.photoCount}
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
      title={inboxLabels.empty.title}
      subtitle={inboxLabels.empty.sentHint}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>InboxList Mirror</H2>
        <Meta style={styles.headerMeta}>fixture: {activeTab === 'received' ? 'inboxMessagesFixture' : 'sentItemsFixture'}</Meta>
      </View>

      {/* Poster-style Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}
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
            {inboxLabels.tabs.received}
          </Label>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
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
            {inboxLabels.tabs.sent}
          </Label>
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === 'received' ? (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={messages.length === 0 ? styles.listEmpty : undefined}
        />
      ) : (
        <View style={styles.sentContainer}>
          <FlatList
            data={sentItems}
            keyExtractor={(item) => item.id}
            renderItem={renderSentItem}
            ListEmptyComponent={renderSentEmptyState}
            contentContainerStyle={sentItems.length === 0 ? styles.listEmpty : undefined}
          />

          {/* New submission buttons */}
          <View style={styles.newFeedbackContainer}>
            <Button onPress={handleNewFeedback} style={styles.primaryButton}>
              {inboxLabels.actions.newMessage}
            </Button>
            <Button variant="secondary" onPress={handleNewClickFix}>
              {inboxLabels.actions.reportProblem}
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
  header: {
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
    backgroundColor: skin.colors.backgroundTertiary,
  },
  headerTitle: {
    marginBottom: skin.spacing.xs,
  },
  headerMeta: {
    color: skin.colors.textMuted,
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

export default MirrorInboxListScreen;
