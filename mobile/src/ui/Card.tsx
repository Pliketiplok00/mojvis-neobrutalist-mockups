/**
 * Card Primitive
 *
 * Base card surface with consistent styling.
 * Uses skin tokens for border, radius, and padding.
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { skin } from './skin';

interface CardProps {
  children: React.ReactNode;
  /** Make card pressable */
  onPress?: () => void;
  /** Disable press interaction */
  disabled?: boolean;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'filled' | 'selection';
  /** Background color override */
  backgroundColor?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Additional style */
  style?: ViewStyle;
}

export function Card({
  children,
  onPress,
  disabled,
  variant = 'outlined',
  backgroundColor,
  accessibilityLabel,
  style,
}: CardProps): React.JSX.Element {
  const getVariantStyle = () => {
    switch (variant) {
      case 'filled':
        return styles.filled;
      case 'selection':
        return styles.selection;
      case 'outlined':
      default:
        return styles.outlined;
    }
  };

  const cardStyle = [
    styles.base,
    getVariantStyle(),
    backgroundColor && { backgroundColor },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const { components, colors, borders } = skin;

const styles = StyleSheet.create({
  base: {
    borderRadius: components.card.borderRadius,
    padding: components.card.padding,
  },
  outlined: {
    backgroundColor: components.card.backgroundColor,
    borderWidth: components.card.borderWidth,
    borderColor: components.card.borderColor,
  },
  filled: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 0,
  },
  selection: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: borders.widthThin,
    borderColor: colors.borderLight,
    borderRadius: borders.radiusCard,
  },
});

export default Card;
