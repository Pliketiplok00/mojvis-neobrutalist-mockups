/**
 * InfoTile Component
 *
 * Displays event information with icon and value.
 * Used for date, location, organizer in EventDetailScreen.
 *
 * Design:
 * - Icon box on left
 * - Value text with optional secondary line
 * - Border divider at bottom
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Body, Label } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import type { IconName } from '../../../ui/Icon';
import { skin } from '../../../ui/skin';

interface InfoTileProps {
  /** Icon name */
  icon: IconName;
  /** Primary value text */
  value: string;
  /** Optional secondary value (e.g., time range) */
  secondaryValue?: string;
}

/**
 * Info tile for displaying event details
 */
export function InfoTile({
  icon,
  value,
  secondaryValue,
}: InfoTileProps): React.JSX.Element {
  return (
    <View style={styles.infoTile}>
      <View style={styles.infoTileIconBox}>
        <Icon name={icon} size="md" colorToken="textPrimary" />
      </View>
      <View style={styles.infoTileContent}>
        <Body style={styles.infoTileValue}>{value}</Body>
        {secondaryValue && (
          <Label style={styles.infoTileSecondary}>{secondaryValue}</Label>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.components.events.detail.infoTilePadding,
    borderBottomWidth: skin.components.events.detail.infoSectionDividerWidth,
    borderBottomColor: skin.components.events.detail.infoSectionDividerColor,
    gap: skin.components.events.detail.infoTileGap,
  },
  infoTileIconBox: {
    width: skin.components.events.detail.infoTileIconBoxSize,
    height: skin.components.events.detail.infoTileIconBoxSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTileContent: {
    flex: 1,
  },
  infoTileValue: {
    color: skin.colors.textPrimary,
  },
  infoTileSecondary: {
    marginTop: skin.components.events.detail.secondaryValueMarginTop,
    color: skin.colors.textSecondary,
  },
});
