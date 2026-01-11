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
 *
 * Skin-pure: Uses skin tokens and Icon primitive (no hardcoded hex, no text glyphs).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslations } from '../i18n';
import type { InboxMessage } from '../types/inbox';
import type { MainStackParamList } from '../navigation/types';
import { skin } from '../ui/skin';
import { Icon } from '../ui/Icon';

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

      {/* Arrow indicator - uses Icon primitive */}
      <View style={styles.arrowContainer}>
        <Icon name="chevron-right" size="sm" colorToken="chevron" />
      </View>
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
    gap: skin.spacing.sm,
    marginBottom: skin.spacing.lg,
  },
  container: {
    backgroundColor: skin.colors.warningBackground,
    borderRadius: skin.borders.radiusCard,
    padding: skin.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: skin.borders.widthHeavy,
    borderLeftColor: skin.colors.warningAccent,
  },
  containerUrgent: {
    backgroundColor: skin.colors.errorBackground,
    borderLeftColor: skin.colors.urgent,
  },
  urgentBadge: {
    backgroundColor: skin.colors.urgent,
    paddingHorizontal: skin.spacing.sm,
    paddingVertical: skin.components.badge.paddingVertical,
    borderRadius: skin.borders.radiusSmall,
    marginRight: skin.spacing.sm,
  },
  urgentText: {
    color: skin.colors.urgentText,
    fontSize: skin.typography.fontSize.xs,
    fontWeight: skin.typography.fontWeight.bold,
  },
  title: {
    flex: 1,
    fontSize: skin.typography.fontSize.md,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.textPrimary,
  },
  titleUrgent: {
    color: skin.colors.errorText,
  },
  preview: {
    flex: 2,
    fontSize: skin.typography.fontSize.sm,
    color: skin.colors.textMuted,
    marginLeft: skin.spacing.sm,
  },
  arrowContainer: {
    marginLeft: skin.spacing.sm,
  },
});

export default Banner;
