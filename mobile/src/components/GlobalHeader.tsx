/**
 * Global Header Component
 *
 * Implements MOJ VIS header rules (NON-NEGOTIABLE):
 *
 * ALL SCREENS:
 * - Left: Hamburger menu (ALWAYS - back navigation is via iOS swipe gesture only)
 * - Center: App name "MOJ VIS"
 * - Right: Inbox icon (hidden on inbox screens)
 *
 * IMPORTANT: No screen should ever show a back arrow.
 * Back navigation relies on iOS swipe gesture.
 *
 * Title is ALWAYS "MOJ VIS" - never context-specific.
 *
 * Skin-pure: Uses Icon primitive and skin tokens (no emoji, no hardcoded hex).
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMenu } from '../contexts/MenuContext';
import { useUnread } from '../contexts/UnreadContext';
import { Icon } from '../ui/Icon';
import { skin } from '../ui/skin';
import { H2 } from '../ui/Text';

// Header badge tokens
const { inboxBadge } = skin.components.header;

export type HeaderType = 'root' | 'child' | 'inbox';

interface GlobalHeaderProps {
  /**
   * Type of screen determines inbox icon visibility:
   * - 'root': Shows inbox icon
   * - 'child': Shows inbox icon
   * - 'inbox': Hides inbox icon (we're already on inbox)
   *
   * NOTE: Left side ALWAYS shows hamburger menu.
   * Back navigation is via iOS swipe gesture only.
   */
  type: HeaderType;

  /**
   * @deprecated No longer used - menu is opened via MenuContext
   * Kept for backwards compatibility, will be removed in future.
   */
  onMenuPress?: () => void;

  /**
   * @deprecated unreadCount is now sourced from UnreadContext automatically
   */
  unreadCount?: number;
}

export function GlobalHeader({
  type,
}: GlobalHeaderProps): React.JSX.Element {
  const navigation = useNavigation();
  const { openMenu } = useMenu();
  const { unreadCount } = useUnread();

  // ALWAYS open menu - no back button behavior
  const handleLeftPress = (): void => {
    openMenu();
  };

  const handleInboxPress = (): void => {
    // Navigate to Inbox screen
    // @ts-expect-error Navigation typing is complex, this works at runtime
    navigation.navigate('Inbox');
  };

  const showInboxIcon = type !== 'inbox';

  return (
    <View style={styles.container}>
      {/* Left: Hamburger Menu (unboxed) */}
      <TouchableOpacity
        style={styles.leftButton}
        onPress={handleLeftPress}
        accessibilityLabel="Open menu"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="menu" size="lg" colorToken="textPrimary" />
      </TouchableOpacity>

      {/* Center: Always "MOJ VIS" */}
      <View style={styles.titleContainer}>
        <H2 style={styles.title}>MOJ VIS</H2>
      </View>

      {/* Right: Inbox (unboxed, hidden on inbox screens) */}
      <TouchableOpacity
        style={[styles.rightButton, !showInboxIcon && styles.hidden]}
        onPress={handleInboxPress}
        accessibilityLabel={`Inbox${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        disabled={!showInboxIcon}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {showInboxIcon && (
          <View style={styles.iconWithBadge}>
            <Icon name="inbox" size="lg" colorToken="primary" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: skin.components.header.height,
    paddingHorizontal: skin.components.header.paddingHorizontal,
    backgroundColor: skin.components.header.backgroundColor,
    borderBottomWidth: skin.components.header.borderBottomWidth,
    borderBottomColor: skin.components.header.borderBottomColor,
  },
  leftButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    minWidth: skin.icons.unboxed.lg,
    minHeight: skin.icons.unboxed.lg,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: skin.colors.textPrimary,
  },
  rightButton: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: skin.icons.unboxed.lg,
    minHeight: skin.icons.unboxed.lg,
  },
  // Container for icon with badge positioning
  iconWithBadge: {
    position: 'relative',
  },
  hidden: {
    opacity: skin.opacity.hidden,
  },
  // Badge - square style for poster look (skin tokens)
  badge: {
    position: 'absolute',
    top: inboxBadge.offsetTop,
    right: inboxBadge.offsetRight,
    backgroundColor: inboxBadge.backgroundColor,
    borderWidth: inboxBadge.borderWidth,
    borderColor: inboxBadge.borderColor,
    minWidth: inboxBadge.minSize,
    height: inboxBadge.minSize,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: inboxBadge.paddingHorizontal,
  },
  badgeText: {
    color: inboxBadge.textColor,
    fontSize: inboxBadge.fontSize,
    fontFamily: inboxBadge.fontFamily,
  },
});

export default GlobalHeader;
