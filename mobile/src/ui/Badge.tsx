/**
 * Badge Primitive
 *
 * Small tag/badge for status indicators.
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { skin } from './skin';

type BadgeVariant = 'urgent' | 'info' | 'success' | 'warning' | 'pending' | 'type' | 'default';

interface BadgeProps {
  /** Badge text */
  children: string;
  /** Badge variant */
  variant?: BadgeVariant;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Additional style */
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  urgent: { bg: skin.colors.urgent, text: skin.colors.urgentText },
  info: { bg: skin.colors.infoBackground, text: skin.colors.infoText },
  success: { bg: skin.colors.successBackground, text: skin.colors.successText },
  warning: { bg: skin.colors.warningBackground, text: skin.colors.warningText },
  pending: { bg: skin.colors.pendingBackground, text: skin.colors.pendingText },
  type: { bg: skin.colors.typeBadge, text: skin.colors.urgentText },
  default: { bg: skin.colors.backgroundSecondary, text: skin.colors.textMuted },
};

export function Badge({
  children,
  variant = 'default',
  backgroundColor,
  textColor,
  style,
}: BadgeProps): React.JSX.Element {
  const colors = variantColors[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: backgroundColor ?? colors.bg },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor ?? colors.text }]}>
        {children}
      </Text>
    </View>
  );
}

const { components } = skin;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: components.badge.paddingHorizontal,
    paddingVertical: components.badge.paddingVertical,
    borderRadius: components.badge.borderRadius,
  },
  text: {
    fontSize: components.badge.fontSize,
    fontWeight: components.badge.fontWeight,
    textTransform: 'uppercase',
  },
});

export default Badge;
