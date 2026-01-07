/**
 * Global Header Component
 *
 * Implements MOJ VIS header rules (NON-NEGOTIABLE):
 *
 * Root screens:
 * - Left: Hamburger menu
 * - Center: App name "MOJ VIS"
 * - Right: Inbox icon
 *
 * Child/detail screens:
 * - Left: Back button
 * - Center: App name "MOJ VIS"
 * - Right: Inbox icon
 *
 * Inbox screens:
 * - Inbox icon is NOT shown
 *
 * Title is ALWAYS "MOJ VIS" - never context-specific.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Placeholder icons - will be replaced with proper icons later
const HamburgerIcon = () => <Text style={styles.iconText}>☰</Text>;
const BackIcon = () => <Text style={styles.iconText}>←</Text>;
const InboxIcon = () => <Text style={styles.iconText}>📥</Text>;

export type HeaderType = 'root' | 'child' | 'inbox';

interface GlobalHeaderProps {
  /**
   * Type of screen determines header layout:
   * - 'root': Hamburger menu on left
   * - 'child': Back button on left
   * - 'inbox': No inbox icon on right
   */
  type: HeaderType;

  /**
   * Callback when menu button is pressed (root screens)
   */
  onMenuPress?: () => void;

  /**
   * Optional: Number of unread inbox messages (shows badge)
   */
  unreadCount?: number;
}

export function GlobalHeader({
  type,
  onMenuPress,
  unreadCount = 0,
}: GlobalHeaderProps): React.JSX.Element {
  const navigation = useNavigation();

  const handleLeftPress = (): void => {
    if (type === 'root' && onMenuPress) {
      onMenuPress();
    } else if (type === 'child' || type === 'inbox') {
      navigation.goBack();
    }
  };

  const handleInboxPress = (): void => {
    // Navigate to Inbox screen
    // @ts-expect-error Navigation typing is complex, this works at runtime
    navigation.navigate('Inbox');
  };

  const showInboxIcon = type !== 'inbox';

  return (
    <View style={styles.container}>
      {/* Left: Menu or Back */}
      <TouchableOpacity
        style={styles.leftButton}
        onPress={handleLeftPress}
        accessibilityLabel={type === 'root' ? 'Open menu' : 'Go back'}
      >
        {type === 'root' ? <HamburgerIcon /> : <BackIcon />}
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
            <InboxIcon />
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
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
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
  iconText: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default GlobalHeader;
