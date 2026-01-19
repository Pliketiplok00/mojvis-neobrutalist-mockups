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
      {/* Left: Hamburger Menu in yellow box (V1 poster style) */}
      <TouchableOpacity
        style={styles.leftButton}
        onPress={handleLeftPress}
        accessibilityLabel="Open menu"
      >
        <View style={styles.menuIconBox}>
          <Icon name="menu" size="md" colorToken="textPrimary" />
        </View>
      </TouchableOpacity>

      {/* Center: Always "MOJ VIS" */}
      <View style={styles.titleContainer}>
        <H2 style={styles.title}>MOJ VIS</H2>
      </View>

      {/* Right: Inbox in blue box (hidden on inbox screens) */}
      <TouchableOpacity
        style={[styles.rightButton, !showInboxIcon && styles.hidden]}
        onPress={handleInboxPress}
        accessibilityLabel={`Inbox${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        disabled={!showInboxIcon}
      >
        {showInboxIcon && (
          <View style={styles.inboxIconBox}>
            <Icon name="inbox" size="md" colorToken="primaryText" />
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
  },
  // Yellow icon box for menu (V1 poster style - squared tile with thick border)
  menuIconBox: {
    width: 44,
    height: 44,
    backgroundColor: skin.colors.warningAccent, // Yellow
    borderWidth: skin.borders.widthCard, // Thick border per poster
    borderColor: skin.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  // Blue icon box for inbox (V1 poster style - squared tile with thick border)
  inboxIconBox: {
    width: 44,
    height: 44,
    backgroundColor: skin.colors.primary, // Blue
    borderWidth: skin.borders.widthCard, // Thick border per poster
    borderColor: skin.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    opacity: 0,
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
