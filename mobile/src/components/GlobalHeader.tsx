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
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMenu } from '../contexts/MenuContext';
import { Icon } from '../ui/Icon';
import { skin } from '../ui/skin';

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
   * Optional: Number of unread inbox messages (shows badge)
   */
  unreadCount?: number;
}

export function GlobalHeader({
  type,
  unreadCount = 0,
}: GlobalHeaderProps): React.JSX.Element {
  const navigation = useNavigation();
  const { openMenu } = useMenu();

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
      {/* Left: ALWAYS Hamburger Menu (back navigation via iOS swipe) */}
      <TouchableOpacity
        style={styles.leftButton}
        onPress={handleLeftPress}
        accessibilityLabel="Open menu"
      >
        <Icon name="menu" size="md" colorToken="textPrimary" />
      </TouchableOpacity>

      {/* Center: Always "MOJ VIS" */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>MOJ VIS</Text>
      </View>

      {/* Right: Inbox (hidden on inbox screens) */}
      <TouchableOpacity
        style={[styles.rightButton, !showInboxIcon && styles.hidden]}
        onPress={handleInboxPress}
        accessibilityLabel={`Inbox${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        disabled={!showInboxIcon}
      >
        {showInboxIcon && (
          <View>
            <Icon name="inbox" size="md" colorToken="textPrimary" />
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
    height: 56,
    paddingHorizontal: skin.spacing.lg,
    backgroundColor: skin.colors.backgroundTertiary,
    borderBottomWidth: skin.borders.widthThin,
    borderBottomColor: skin.colors.borderLight,
  },
  leftButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: skin.typography.fontSize.xl,
    fontWeight: skin.typography.fontWeight.bold,
    fontFamily: skin.typography.fontFamily.display.bold,
    color: skin.colors.textPrimary,
  },
  rightButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  hidden: {
    opacity: 0,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: skin.colors.urgent,
    borderRadius: skin.borders.radiusPill,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: skin.spacing.xs,
  },
  badgeText: {
    color: skin.colors.urgentText,
    fontSize: skin.typography.fontSize.sm,
    fontWeight: skin.typography.fontWeight.bold,
  },
});

export default GlobalHeader;
