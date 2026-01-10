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
  variant?: 'default' | 'outlined' | 'filled';
  /** Background color override */
  backgroundColor?: string;
  /** Additional style */
  style?: ViewStyle;
}

export function Card({
  children,
  onPress,
  disabled,
  variant = 'outlined',
  backgroundColor,
  style,
}: CardProps): React.JSX.Element {
  const cardStyle = [
    styles.base,
    variant === 'outlined' && styles.outlined,
    variant === 'filled' && styles.filled,
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
});

export default Card;
