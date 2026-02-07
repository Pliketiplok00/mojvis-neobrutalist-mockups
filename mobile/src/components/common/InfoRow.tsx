/**
 * InfoRow Component
 *
 * Reusable atomic row for displaying labeled information.
 * Used inside ServiceAccordionCard expanded content.
 *
 * Structure:
 * - Icon (sm, muted)
 * - Label (Meta, uppercase, muted)
 * - Value (Body, supports multiline)
 *
 * Skin-pure: Uses skin tokens only.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { skin } from '../../ui/skin';
import { Icon, type IconName } from '../../ui/Icon';
import { Meta, Body } from '../../ui/Text';

interface InfoRowProps {
  /** Icon name from available icon set */
  icon: IconName;
  /** Label text (displayed uppercase) */
  label: string;
  /** Value text (can be multiline) */
  value: string;
}

const { colors, spacing } = skin;

export function InfoRow({ icon, label, value }: InfoRowProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size="sm" colorToken="textMuted" />
      </View>
      <View style={styles.content}>
        <Meta style={styles.label}>{label}</Meta>
        <Body style={styles.value}>{value}</Body>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  iconContainer: {
    width: spacing.xxl,
    paddingTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  label: {
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.textPrimary,
  },
});

export default InfoRow;
