/**
 * Banner Component
 *
 * Displays active inbox messages as banners.
 *
 * Rules (per spec):
 * - All banners are clickable
 * - Clicking a banner ALWAYS opens Inbox message detail
 * - Banners never open external links, filtered lists, or custom screens
 * - Banners are derived from Inbox messages (no separate content)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { InboxMessage } from '../types/inbox';
import type { MainStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface BannerProps {
  /**
   * The inbox message to display as a banner
   */
  message: InboxMessage;
}

/**
 * Single banner item
 * Clicking opens the inbox message detail
 */
export function Banner({ message }: BannerProps): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = (): void => {
    // Per spec: "Clicking a banner ALWAYS opens Inbox message detail"
    navigation.navigate('InboxDetail', { messageId: message.id });
  };

  const isUrgent = message.is_urgent;

  return (
    <TouchableOpacity
      style={[styles.container, isUrgent && styles.containerUrgent]}
      onPress={handlePress}
      accessibilityLabel={`${isUrgent ? 'Hitno: ' : ''}${message.title}`}
      accessibilityHint="Dodirnite za više informacija"
    >
      {/* Urgent indicator */}
      {isUrgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>HITNO</Text>
        </View>
      )}

      {/* Title */}
      <Text style={[styles.title, isUrgent && styles.titleUrgent]} numberOfLines={1}>
        {message.title}
      </Text>

      {/* Preview */}
      <Text style={styles.preview} numberOfLines={1}>
        {message.body}
      </Text>

      {/* Arrow indicator */}
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

interface BannerListProps {
  /**
   * List of active banners to display
   */
  banners: InboxMessage[];
}

/**
 * List of banners
 * Shows multiple banners stacked
 */
export function BannerList({ banners }: BannerListProps): React.JSX.Element | null {
  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.listContainer}>
      {banners.map((banner) => (
        <Banner key={banner.id} message={banner} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    gap: 8,
    marginBottom: 16,
  },
  container: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  containerUrgent: {
    backgroundColor: '#F8D7DA',
    borderLeftColor: '#DC3545',
  },
  urgentBadge: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  titleUrgent: {
    color: '#721C24',
  },
  preview: {
    flex: 2,
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  arrow: {
    fontSize: 20,
    color: '#999999',
    marginLeft: 8,
  },
});

export default Banner;
