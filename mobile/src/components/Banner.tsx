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
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslations } from '../i18n';
import type { InboxMessage } from '../types/inbox';
import type { MainStackParamList } from '../navigation/types';
import { skin } from '../ui/skin';
import { Icon } from '../ui/Icon';
import { Label, Meta } from '../ui/Text';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface BannerProps {
  /**
   * The inbox message to display as a banner
   */
  message: InboxMessage;
}

/**
 * Single banner item - V1 Poster Slab Style
 * Full-width slab with strong fill, icon box, heavy border
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
    <View style={styles.bannerWrapper}>
      {/* Shadow layer for neobrut offset effect */}
      <View style={styles.bannerShadow} />
      {/* Main banner slab */}
      <TouchableOpacity
        style={[styles.container, isUrgent && styles.containerUrgent]}
        onPress={handlePress}
        accessibilityLabel={`${isUrgent ? `${t('banner.urgent')}: ` : ''}${message.title}`}
        accessibilityHint={t('banner.accessibilityHint')}
        activeOpacity={0.8}
      >
        {/* Icon box on left */}
        <View style={[styles.iconBox, isUrgent && styles.iconBoxUrgent]}>
          <Icon
            name="alert-triangle"
            size="md"
            color={isUrgent ? 'white' : skin.colors.textPrimary}
            stroke="strong"
          />
        </View>

        {/* Text content */}
        <View style={styles.textContent}>
          <Label style={[styles.title, isUrgent && styles.titleUrgent]} numberOfLines={1}>
            {message.title}
          </Label>
          <Meta style={styles.preview} numberOfLines={1}>
            {message.body}
          </Meta>
        </View>

        {/* NEW badge for urgent items */}
        {isUrgent && (
          <View style={styles.newBadge}>
            <Meta style={styles.newBadgeText}>{t('banner.urgent')}</Meta>
          </View>
        )}

        {/* Arrow indicator */}
        <View style={styles.arrowContainer}>
          <Icon
            name="chevron-right"
            size="md"
            color={isUrgent ? 'white' : skin.colors.textPrimary}
          />
        </View>
      </TouchableOpacity>
    </View>
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
    gap: skin.spacing.md,
  },
  // Wrapper for shadow + main banner
  bannerWrapper: {
    position: 'relative',
  },
  bannerShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '100%',
    height: '100%',
    backgroundColor: skin.colors.border,
    zIndex: 0,
  },
  container: {
    backgroundColor: skin.colors.warningAccent, // Strong fill, not muted background
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    padding: skin.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.md,
    zIndex: 1,
  },
  containerUrgent: {
    backgroundColor: skin.colors.urgent, // Red/terracotta for urgent
  },
  // Icon box on left - bordered square
  iconBox: {
    width: 44,
    height: 44,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxUrgent: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Text content
  textContent: {
    flex: 1,
  },
  title: {
    color: skin.colors.textPrimary,
    fontWeight: '700',
  },
  titleUrgent: {
    color: 'white',
  },
  preview: {
    color: skin.colors.textMuted,
    marginTop: skin.spacing.xs,
  },
  // NEW badge for urgent
  newBadge: {
    backgroundColor: skin.colors.border,
    paddingHorizontal: skin.spacing.sm,
    paddingVertical: skin.spacing.xs,
  },
  newBadgeText: {
    color: 'white',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  arrowContainer: {
    // Icon handles sizing
  },
});

export default Banner;
