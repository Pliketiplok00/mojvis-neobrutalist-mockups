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
import { useTranslations } from '../i18n';
import type { InboxMessage } from '../types/inbox';
import type { MainStackParamList } from '../navigation/types';
import { skin } from '../ui/skin';

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
  const { t } = useTranslations();

  const handlePress = (): void => {
    // Per spec: "Clicking a banner ALWAYS opens Inbox message detail"
    navigation.navigate('InboxDetail', { messageId: message.id });
  };

  const isUrgent = message.is_urgent;

  return (
    <TouchableOpacity
      style={[styles.container, isUrgent && styles.containerUrgent]}
      onPress={handlePress}
      accessibilityLabel={`${isUrgent ? `${t('banner.urgent')}: ` : ''}${message.title}`}
      accessibilityHint={t('banner.accessibilityHint')}
    >
      {/* Urgent indicator */}
      {isUrgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>{t('banner.urgent')}</Text>
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
 *
 * NOTE: This component renders SYSTEM BANNERS from the Inbox/Banners API.
 * It should ONLY appear on allowed screens (Home, Transport, Events).
 * It should NEVER appear on static content pages (Flora, Fauna, Important Contacts).
 */
export function BannerList({ banners }: BannerListProps): React.JSX.Element | null {
  // DEV LOGGING: Track where BannerList renders
  if (__DEV__) {
    console.log('[BANNERLIST_RENDER]', {
      bannerCount: banners.length,
      bannerIds: banners.map(b => b.id.slice(0, 8)),
      timestamp: new Date().toISOString(),
    });
  }

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
    backgroundColor: skin.colors.warningBackground,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: skin.colors.warningAccent,
  },
  containerUrgent: {
    backgroundColor: skin.colors.errorBackground,
    borderLeftColor: skin.colors.urgent,
  },
  urgentBadge: {
    backgroundColor: skin.colors.urgent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  urgentText: {
    color: skin.colors.urgentText,
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: skin.colors.warningText,
  },
  titleUrgent: {
    color: skin.colors.errorText,
  },
  preview: {
    flex: 2,
    fontSize: 12,
    color: skin.colors.textMuted,
    marginLeft: 8,
  },
  arrow: {
    fontSize: 20,
    color: skin.colors.chevron,
    marginLeft: 8,
  },
});

export default Banner;
