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
 * V1 Poster Style:
 * - Edge-to-edge (no inset)
 * - No gaps between banners, only bottom rule separation
 * - Only bottom border, not full outline
 * - No shadow
 * - Warm yellow/orange fill
 * - Red accents for icon box + tags
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
import { Label } from '../ui/Text';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface BannerProps {
  /**
   * The inbox message to display as a banner
   */
  message: InboxMessage;
}

/**
 * Single banner item - V1 Poster Style
 * Edge-to-edge slab with warm yellow fill, red icon box, bottom border only
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
      activeOpacity={0.8}
    >
      {/* Icon box on left - red accent */}
      <View style={styles.iconBox}>
        <Icon
          name="shield-alert"
          size="md"
          colorToken="primaryText"
          stroke="strong"
        />
      </View>

      {/* Text content - title only, 2-line clamp */}
      <View style={styles.textContent}>
        <Label style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {message.title}
        </Label>
      </View>

      {/* Arrow indicator */}
      <View style={styles.arrowContainer}>
        <Icon
          name="chevron-right"
          size="md"
          colorToken="textPrimary"
        />
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
  // V1 Poster: No gaps between banners, only bottom rule separation
  listContainer: {
    gap: 0,
  },
  // V1 Poster: Edge-to-edge, amber fill (midpoint yellow-orange), only bottom border
  container: {
    backgroundColor: skin.colors.amber, // Midpoint between warningAccent and orange
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
    padding: skin.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.md,
  },
  containerUrgent: {
    backgroundColor: skin.colors.orange, // Warmer orange for urgent
  },
  // V1 Poster: Icon box (unboxed per design guardrails)
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Text content
  textContent: {
    flex: 1,
  },
  title: {
    color: skin.colors.textPrimary,
    fontWeight: '700',
  },
  arrowContainer: {
    // Icon handles sizing
  },
});

export default Banner;
