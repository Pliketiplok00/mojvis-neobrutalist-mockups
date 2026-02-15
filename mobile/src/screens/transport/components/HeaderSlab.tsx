/**
 * HeaderSlab Component
 *
 * Poster-style header with transport icon, line title, meta info, and badges.
 * Different rendering for road vs sea transport.
 *
 * Extracted from LineDetailScreen for reusability.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { H1, Meta } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { Badge } from '../../../ui/Badge';
import { skin } from '../../../ui/skin';
import { formatLineTitle, formatDuration } from '../../../utils/transportFormat';
import type { TransportType } from '../../../types/transport';

const { colors, spacing, components } = skin;
const lineDetail = components.transport.lineDetail;
const listTokens = components.transport.list;

interface HeaderSlabProps {
  transportType: TransportType;
  lineNumber: string | null;
  origin: string;
  destination: string;
  subtype: string | null;
  durationMinutes: number | null;
  backgroundColor: string;
  seasonalLabel?: string;
}

/**
 * Header slab with line info and badges
 * Road: subtype shown as meta, no badges
 * Sea: subtype + seasonal shown as badges
 */
export function HeaderSlab({
  transportType,
  lineNumber,
  origin,
  destination,
  subtype,
  durationMinutes,
  backgroundColor,
  seasonalLabel,
}: HeaderSlabProps): React.JSX.Element {
  const isSea = transportType === 'sea';
  const showSeasonalBadge = lineNumber === '659' && seasonalLabel;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Icon
            name={isSea ? 'ship' : 'bus'}
            size="lg"
            colorToken="primaryText"
          />
        </View>
        <View style={styles.textContainer}>
          <H1 style={styles.title}>
            {formatLineTitle(lineNumber, origin, destination)}
          </H1>
          <View style={styles.metaRow}>
            {/* Subtype as meta only for road transport (sea shows it as badge) */}
            {!isSea && subtype && (
              <Meta style={styles.meta}>{subtype}</Meta>
            )}
            {durationMinutes && (
              <Meta style={styles.meta}>
                {formatDuration(durationMinutes)}
              </Meta>
            )}
          </View>
        </View>
        {/* Badge stack: subtype + seasonal (right-aligned, sea only) */}
        {isSea && (subtype || showSeasonalBadge) && (
          <View style={styles.badgeStack}>
            {subtype && (
              <Badge variant="transport" size="large">
                {subtype}
              </Badge>
            )}
            {showSeasonalBadge && (
              <Badge
                variant="transport"
                size="large"
                backgroundColor={listTokens.lineCardHeaderBackgroundHighlight}
                textColor={colors.textPrimary}
              >
                {seasonalLabel}
              </Badge>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: lineDetail.headerPadding,
    borderBottomWidth: lineDetail.headerBorderWidth,
    borderBottomColor: lineDetail.headerBorderColor,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: lineDetail.headerIconBoxSize,
    height: lineDetail.headerIconBoxSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: lineDetail.headerTitleColor,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  meta: {
    color: lineDetail.headerMetaColor,
  },
  badgeStack: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginLeft: spacing.md,
  },
});
