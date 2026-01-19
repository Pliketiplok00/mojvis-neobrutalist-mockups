/**
 * Static Banner List (Design Mirror)
 *
 * A mirror-only version of BannerList that renders visually identical banners
 * WITHOUT navigation. For visual auditing only.
 *
 * Rules:
 * - NO useNavigation import
 * - NO navigate() calls
 * - onPress is a NO-OP (disabled)
 * - Data comes from fixtures only
 * - Uses skin tokens only
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import type { InboxMessage } from '../../types/inbox';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';
import { Label } from '../../ui/Text';

interface StaticBannerProps {
  /**
   * The inbox message to display as a banner
   */
  message: InboxMessage;
}

/**
 * Single static banner item - V1 Poster Style
 * Visually identical to production Banner but with NO navigation
 */
function StaticBanner({ message }: StaticBannerProps): React.JSX.Element {
  const isUrgent = message.is_urgent;

  // NO-OP handler - banner is visual only in mirror
  const handlePress = (): void => {
    // Intentionally empty - mirror screens don't navigate
  };

  return (
    <TouchableOpacity
      style={[styles.container, isUrgent && styles.containerUrgent]}
      onPress={handlePress}
      accessibilityLabel={`${isUrgent ? 'HITNO: ' : ''}${message.title}`}
      accessibilityHint="Banner je samo za vizualni pregled"
      activeOpacity={0.8}
      disabled={true} // Disabled to indicate non-interactive in mirror
    >
      {/* Icon box on left - red accent */}
      <View style={styles.iconBox}>
        <Icon
          name="alert-triangle"
          size="md"
          color="white"
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

interface StaticBannerListProps {
  /**
   * List of banners to display (from fixtures)
   */
  banners: InboxMessage[];
}

/**
 * Static list of banners for mirror screens
 * Visually identical to production BannerList but without navigation
 */
export function StaticBannerList({ banners }: StaticBannerListProps): React.JSX.Element | null {
  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.listContainer}>
      {banners.map((banner) => (
        <StaticBanner key={banner.id} message={banner} />
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
  // V1 Poster: Icon box with red accent
  iconBox: {
    width: 44,
    height: 44,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    backgroundColor: skin.colors.urgent, // Red accent
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

export default StaticBannerList;
