/**
 * LineListCard Component
 *
 * Transport line card for list views (2-part poster card).
 * Used by SeaTransportScreen and RoadTransportScreen.
 *
 * Structure:
 * - TOP: Colored header slab with icon + title + badge
 * - BOTTOM: White body with meta info + chevron
 */

import React, { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { H2, Meta } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { Badge } from '../../../ui/Badge';
import { skin } from '../../../ui/skin';
import { formatDuration } from '../../../utils/transportFormat';
import type { IconName } from '../../../ui/Icon';
import type { LineListItem, TransportType } from '../../../types/transport';

const { colors, spacing, borders, components } = skin;
const listTokens = components.transport.list;

interface LineListCardProps {
  /** Line data */
  line: LineListItem;
  /** Transport type for icon selection */
  transportType: TransportType;
  /** Header background color */
  headerBackground: string;
  /** Icon name (from getSeaTypeIcon/getRoadTypeIcon) */
  iconName: IconName;
  /** Formatted title text */
  title: string;
  /** Translation function */
  t: (key: string) => string;
  /** Press handler */
  onPress: () => void;
  /** Show seasonal badge (for line 659) */
  showSeasonalBadge?: boolean;
  /** Seasonal badge text */
  seasonalText?: string;
}

/**
 * Line card with colored header slab and white body
 */
export const LineListCard = memo(function LineListCard({
  line,
  transportType,
  headerBackground,
  iconName,
  title,
  t,
  onPress,
  showSeasonalBadge = false,
  seasonalText,
}: LineListCardProps): React.JSX.Element {
  const isSea = transportType === 'sea';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && styles.pressed,
      ]}
    >
      {/* Shadow layer */}
      <View style={styles.shadow} />
      {/* Main card */}
      <View style={styles.card}>
        {/* TOP: Colored header */}
        <View style={[styles.header, { backgroundColor: headerBackground }]}>
          <View style={styles.headerIconBox}>
            <Icon name={iconName} size="md" colorToken="primaryText" />
          </View>
          {isSea ? (
            <View style={styles.headerTextContainer}>
              <H2 style={styles.headerTitle} numberOfLines={2}>
                {title}
              </H2>
              {showSeasonalBadge && (
                <Meta style={styles.headerSubtitle}>
                  {seasonalText}
                </Meta>
              )}
            </View>
          ) : (
            <H2 style={styles.headerTitle} numberOfLines={2}>
              {title}
            </H2>
          )}
          {/* Badge stack */}
          {(line.subtype || showSeasonalBadge) && (
            <View style={styles.badgeStack}>
              {line.subtype && (
                <Badge
                  variant="transport"
                  size={isSea ? 'large' : 'compact'}
                  style={!isSea ? styles.roadBadge : undefined}
                >
                  {line.subtype}
                </Badge>
              )}
              {showSeasonalBadge && (
                <Badge
                  variant="transport"
                  size="large"
                  backgroundColor={listTokens.lineCardHeaderBackgroundHighlight}
                  textColor={colors.textPrimary}
                >
                  {seasonalText || t('transport.seasonal')}
                </Badge>
              )}
            </View>
          )}
        </View>
        {/* BOTTOM: White body */}
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <Meta numberOfLines={1} style={styles.stops}>
              {line.stops_summary}
            </Meta>
            <Meta style={styles.meta} numberOfLines={1}>
              {line.stops_count} {t('transport.stations')}
              {line.typical_duration_minutes
                ? ` • ${formatDuration(line.typical_duration_minutes)}`
                : ''}
            </Meta>
          </View>
          <View style={styles.chevronBox}>
            <Icon name="chevron-right" size="sm" colorToken="textPrimary" />
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: listTokens.lineCardGap,
  },
  shadow: {
    position: 'absolute',
    top: listTokens.lineCardShadowOffsetY,
    left: listTokens.lineCardShadowOffsetX,
    right: -listTokens.lineCardShadowOffsetX,
    bottom: -listTokens.lineCardShadowOffsetY,
    backgroundColor: listTokens.lineCardShadowColor,
  },
  card: {
    borderWidth: listTokens.lineCardBorderWidth,
    borderColor: listTokens.lineCardBorderColor,
    borderRadius: listTokens.lineCardRadius,
    overflow: 'hidden',
  },
  pressed: {
    transform: [
      { translateX: listTokens.lineCardPressedOffsetX },
      { translateY: listTokens.lineCardPressedOffsetY },
    ],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: listTokens.lineCardHeaderPadding,
  },
  headerIconBox: {
    width: listTokens.lineCardHeaderIconBoxSize,
    height: listTokens.lineCardHeaderIconBoxSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: listTokens.lineCardHeaderIconGap,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: listTokens.lineCardHeaderTitleColor,
    flex: 1,
  },
  headerSubtitle: {
    color: listTokens.lineCardHeaderTitleColor,
    marginTop: spacing.xs,
  },
  badgeStack: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: spacing.xs,
    flexShrink: 0,
    marginLeft: spacing.sm,
  },
  roadBadge: {
    // Position-only for road transport
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: listTokens.lineCardBodyBackground,
    padding: listTokens.lineCardBodyPadding,
    borderTopWidth: listTokens.lineCardBodyBorderTopWidth,
    borderTopColor: listTokens.lineCardBodyBorderColor,
  },
  bodyContent: {
    flex: 1,
  },
  stops: {
    color: colors.textSecondary,
  },
  meta: {
    color: colors.textSecondary,
    marginTop: listTokens.lineCardMetaGap,
  },
  chevronBox: {
    width: listTokens.lineCardChevronBoxSize,
    height: listTokens.lineCardChevronBoxSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: listTokens.lineCardChevronGap,
  },
});
