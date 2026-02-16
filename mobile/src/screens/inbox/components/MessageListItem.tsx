/**
 * MessageListItem Component
 *
 * Single inbox message list item with poster-style card.
 * Displays icon slabs, title, preview, date, and NEW badge.
 *
 * Extracted from InboxListScreen for reusability.
 */

import React, { memo, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Body, Meta, ButtonText, Label } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { skin } from '../../../ui/skin';
import { formatDateShort } from '../../../utils/dateFormat';
import type { IconName } from '../../../ui/Icon';
import type { InboxMessage, InboxTag } from '../../../types/inbox';

const { inbox: inboxTokens } = skin.components;

/**
 * Icon config for a single tag
 */
interface TagIconConfig {
  icon: IconName;
  background: string;
  colorToken: 'primaryText' | 'textPrimary';
}

/**
 * Get icon configs for ALL tags on a message
 *
 * Icon mapping (canonical):
 * - hitno (urgent) → shield-alert (red background, white icon)
 * - promet → traffic-cone (blue background, dark icon)
 * - kultura → calendar-heart (lavender background, dark icon)
 * - opcenito → newspaper (green background, dark icon)
 * - municipal (vis/komiza) → megaphone (default background, dark icon)
 * - default (no tags) → mail
 */
function getAllMessageIconConfigs(tags: InboxTag[], isUrgent: boolean): TagIconConfig[] {
  const configs: TagIconConfig[] = [];

  // Urgent gets its own icon (separate from hitno tag)
  if (isUrgent) {
    configs.push({
      icon: 'shield-alert',
      background: inboxTokens.listItem.iconSlabBackgroundUrgent,
      colorToken: 'primaryText',
    });
  }

  // Add icons for each tag (excluding 'hitno' since it's handled by isUrgent)
  if (tags.includes('promet')) {
    configs.push({
      icon: 'traffic-cone',
      background: inboxTokens.listItem.iconSlabBackgroundTransport,
      colorToken: 'textPrimary',
    });
  }
  if (tags.includes('kultura')) {
    configs.push({
      icon: 'calendar-heart',
      background: inboxTokens.listItem.iconSlabBackgroundCulture,
      colorToken: 'textPrimary',
    });
  }
  if (tags.includes('opcenito')) {
    configs.push({
      icon: 'newspaper',
      background: inboxTokens.listItem.iconSlabBackgroundGeneral,
      colorToken: 'textPrimary',
    });
  }
  if (tags.includes('vis') || tags.includes('komiza')) {
    configs.push({
      icon: 'megaphone',
      background: inboxTokens.listItem.iconSlabBackgroundDefault,
      colorToken: 'textPrimary',
    });
  }

  // Default if no icons at all
  if (configs.length === 0) {
    configs.push({
      icon: 'mail',
      background: inboxTokens.listItem.iconSlabBackgroundDefault,
      colorToken: 'textPrimary',
    });
  }

  return configs;
}

interface MessageListItemProps {
  message: InboxMessage;
  isUnread: boolean;
  /** Called with message ID when pressed */
  onPress: (messageId: string) => void;
}

/**
 * Single inbox message list item
 */
export const MessageListItem = memo(function MessageListItem({
  message,
  isUnread,
  onPress,
}: MessageListItemProps): React.JSX.Element {
  const iconConfigs = getAllMessageIconConfigs(message.tags, message.is_urgent);

  const handlePress = useCallback(() => {
    onPress(message.id);
  }, [onPress, message.id]);

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={handlePress}>
        {({ pressed }) => (
          <>
            {/* Dual-layer shadow - hidden when pressed */}
            {!pressed && <View style={styles.shadow} />}
            <View style={styles.card}>
              {/* Left icon slabs - one for each tag */}
              <View style={styles.iconSlabRow}>
                {iconConfigs.map((config, index) => (
                  <View
                    key={index}
                    style={[styles.iconSlab, { backgroundColor: config.background }]}
                  >
                    <Icon
                      name={config.icon}
                      size={iconConfigs.length > 1 ? 'sm' : 'md'}
                      colorToken={config.colorToken}
                    />
                  </View>
                ))}
              </View>

              {/* Content block */}
              <View style={styles.content}>
                {/* Title - ALL CAPS */}
                <ButtonText style={styles.title} numberOfLines={1}>
                  {message.title}
                </ButtonText>

                {/* Preview snippet */}
                <Body
                  color={skin.colors.textMuted}
                  numberOfLines={2}
                  style={styles.preview}
                >
                  {message.body}
                </Body>

                {/* Date */}
                <Meta>{formatDateShort(message.created_at)}</Meta>
              </View>

              {/* Right section: NEW badge + chevron */}
              <View style={styles.right}>
                {isUnread && (
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
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: inboxTokens.listItem.marginBottom,
    marginHorizontal: inboxTokens.listItem.marginHorizontal,
  },
  shadow: {
    position: 'absolute',
    top: inboxTokens.listItem.shadowOffsetY,
    left: inboxTokens.listItem.shadowOffsetX,
    right: -inboxTokens.listItem.shadowOffsetX,
    bottom: -inboxTokens.listItem.shadowOffsetY,
    backgroundColor: inboxTokens.listItem.shadowColor,
    borderRadius: inboxTokens.listItem.borderRadius,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: inboxTokens.listItem.background,
    borderWidth: inboxTokens.listItem.borderWidth,
    borderColor: inboxTokens.listItem.borderColor,
    borderRadius: inboxTokens.listItem.borderRadius,
    padding: inboxTokens.listItem.padding,
  },
  iconSlabRow: {
    flexDirection: 'row',
    gap: skin.spacing.xs,
    marginRight: inboxTokens.listItem.iconSlabGap,
  },
  iconSlab: {
    width: inboxTokens.listItem.iconSlabSize,
    height: inboxTokens.listItem.iconSlabSize,
    borderWidth: inboxTokens.listItem.iconSlabBorderWidth,
    borderColor: inboxTokens.listItem.iconSlabBorderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: inboxTokens.listItem.titleMarginBottom,
    textTransform: 'uppercase',
  },
  preview: {
    marginBottom: inboxTokens.listItem.snippetMarginBottom,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: skin.spacing.sm,
  },
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
  chevronBox: {
    width: inboxTokens.listItem.chevronBoxSize,
    height: inboxTokens.listItem.chevronBoxSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
