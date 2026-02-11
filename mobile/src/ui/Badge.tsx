/**
 * Badge Primitive
 *
 * Small tag/badge for status indicators.
 * Uses skin tokens for consistent typography.
 *
 * Variants:
 * - urgent: Red background for critical alerts
 * - info: Blue tinted for information
 * - success: Green for positive status
 * - warning: Yellow/amber for caution
 * - pending: Orange-ish for in-progress
 * - type: Purple for category/type labels
 * - transport: Muted for transport subtype tags (Trajekt/Brod/Katamaran/Autobus)
 * - default: Grey muted for general use
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { skin } from './skin';

type BadgeVariant = 'urgent' | 'info' | 'success' | 'warning' | 'pending' | 'type' | 'transport' | 'default';

interface BadgeProps {
  /** Badge text */
  children: string;
  /** Badge variant */
  variant?: BadgeVariant;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Size variant - compact for inline use, large for emphasis */
  size?: 'default' | 'compact' | 'large';
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
  transport: { bg: skin.colors.backgroundSecondary, text: skin.colors.textSecondary },
  default: { bg: skin.colors.backgroundSecondary, text: skin.colors.textMuted },
};

export function Badge({
  children,
  variant = 'default',
  backgroundColor,
  textColor,
  size = 'default',
  style,
}: BadgeProps): React.JSX.Element {
  const colors = variantColors[variant];
  const isCompact = size === 'compact';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.container,
        isCompact && styles.containerCompact,
        isLarge && styles.containerLarge,
        { backgroundColor: backgroundColor ?? colors.bg },
        style,
      ]}
    >
      <Text style={[
        styles.text,
        isCompact && styles.textCompact,
        isLarge && styles.textLarge,
        { color: textColor ?? colors.text },
      ]}>
        {children}
      </Text>
    </View>
  );
}

const { components, typography } = skin;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: components.badge.paddingHorizontal,
    paddingVertical: components.badge.paddingVertical,
    borderRadius: components.badge.borderRadius,
    borderWidth: components.badge.borderWidth,
    borderColor: components.badge.borderColor,
  },
  containerCompact: {
    paddingHorizontal: components.badge.paddingHorizontal * 0.75,
    paddingVertical: components.badge.paddingVertical * 0.5,
  },
  containerLarge: {
    paddingHorizontal: components.badge.paddingHorizontalLarge,
    paddingVertical: components.badge.paddingVerticalLarge,
  },
  text: {
    fontFamily: typography.fontFamily.body.regular,
    fontSize: components.badge.fontSize,
    fontWeight: components.badge.fontWeight,
    textTransform: 'uppercase',
  },
  textCompact: {
    fontSize: components.badge.fontSize - 2,
  },
  textLarge: {
    fontSize: components.badge.fontSizeLarge,
  },
});

export default Badge;
