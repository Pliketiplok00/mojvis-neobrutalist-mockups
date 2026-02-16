/**
 * SentListItem Component
 *
 * Single sent item (feedback or click-fix) list item with poster-style card.
 * Displays icon slab, subject, status badge, photo count, and date.
 *
 * Extracted from InboxListScreen for reusability.
 */

import React, { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ButtonText, Meta } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { Badge } from '../../../ui/Badge';
import { skin } from '../../../ui/skin';
import { formatDateShort } from '../../../utils/dateFormat';
import { STATUS_COLORS } from '../../../ui/utils/statusColors';
import type { IconName } from '../../../ui/Icon';
import type { CombinedSentItem } from '../../../hooks/useSentItems';

const { inbox: inboxTokens } = skin.components;

interface SentListItemProps {
  item: CombinedSentItem;
  onPress: () => void;
  /** Translation function */
  t: (key: string) => string;
}

/**
 * Single sent item (feedback or click-fix) list item
 */
export const SentListItem = memo(function SentListItem({
  item,
  onPress,
  t,
}: SentListItemProps): React.JSX.Element {
  const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.zaprimljeno;
  const isClickFix = item.type === 'click_fix';
  const iconName: IconName = isClickFix ? 'camera' : 'send';
  const iconBackground = isClickFix
    ? skin.colors.orange
    : skin.colors.lavender;

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <>
            {/* Dual-layer shadow - hidden when pressed */}
            {!pressed && <View style={styles.shadow} />}
            <View style={styles.card}>
              {/* Left icon slab */}
              <View style={[styles.iconSlab, { backgroundColor: iconBackground }]}>
                <Icon name={iconName} size="md" colorToken="textPrimary" />
              </View>

              {/* Content block */}
              <View style={styles.content}>
                {/* Subject - ALL CAPS */}
                <ButtonText style={styles.title} numberOfLines={1}>
                  {item.subject}
                </ButtonText>

                {/* Status badge row */}
                <View style={styles.badgeRow}>
                  {isClickFix && (
                    <Badge variant="type" style={styles.badgeMargin}>
                      {t('inbox.badges.report')}
                    </Badge>
                  )}
                  <Badge backgroundColor={statusColor.bg} textColor={statusColor.text}>
                    {item.status_label}
                  </Badge>
                </View>

                {/* Photo count for Click & Fix */}
                {isClickFix && item.photo_count !== undefined && item.photo_count > 0 && (
                  <Meta style={styles.photoCount}>
                    {item.photo_count} {t('inbox.photoCount')}
                  </Meta>
                )}

                {/* Date */}
                <Meta>{formatDateShort(item.created_at)}</Meta>
              </View>

              {/* Right section: chevron */}
              <View style={styles.right}>
                <View style={styles.chevronBox}>
                  <Icon name="chevron-right" size="sm" colorToken="chevron" />
                </View>
              </View>
            </View>
          </>
        )}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: inboxTokens.listItem.marginBottom,
    marginHorizontal: inboxTokens.listItem.marginHorizontal,
  },
  shadow: {
    position: 'absolute',
    top: inboxTokens.listItem.shadowOffsetY,
    left: inboxTokens.listItem.shadowOffsetX,
    right: -inboxTokens.listItem.shadowOffsetX,
    bottom: -inboxTokens.listItem.shadowOffsetY,
    backgroundColor: inboxTokens.listItem.shadowColor,
    borderRadius: inboxTokens.listItem.borderRadius,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: inboxTokens.listItem.background,
    borderWidth: inboxTokens.listItem.borderWidth,
    borderColor: inboxTokens.listItem.borderColor,
    borderRadius: inboxTokens.listItem.borderRadius,
    padding: inboxTokens.listItem.padding,
  },
  iconSlab: {
    width: inboxTokens.listItem.iconSlabSize,
    height: inboxTokens.listItem.iconSlabSize,
    borderWidth: inboxTokens.listItem.iconSlabBorderWidth,
    borderColor: inboxTokens.listItem.iconSlabBorderColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: inboxTokens.listItem.iconSlabGap,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: inboxTokens.listItem.titleMarginBottom,
    textTransform: 'uppercase',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: skin.spacing.sm,
    marginBottom: skin.spacing.xs,
  },
  badgeMargin: {
    marginRight: skin.spacing.xs,
  },
  photoCount: {
    marginBottom: skin.spacing.xs,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: skin.spacing.sm,
  },
  chevronBox: {
    width: inboxTokens.listItem.chevronBoxSize,
    height: inboxTokens.listItem.chevronBoxSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
