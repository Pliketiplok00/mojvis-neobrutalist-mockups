/**
 * Card Primitive
 *
 * Base card surface with consistent styling.
 * Uses skin tokens for border, radius, and padding.
 */

import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { skin } from './skin';

interface CardProps {
  children: React.ReactNode;
  /** Make card pressable */
  onPress?: () => void;
  /** Disable press interaction */
  disabled?: boolean;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'filled' | 'selection' | 'onboardingSelection';
  /**
   * Press feedback tint for variants that support it (e.g. onboardingSelection).
   * Uses skin color tokens.
   */
  pressFeedbackColorToken?: 'primary' | 'secondary';
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
  pressFeedbackColorToken = 'primary',
  backgroundColor,
  accessibilityLabel,
  style,
}: CardProps): React.JSX.Element {
  const baseStyle = [styles.base, backgroundColor && { backgroundColor }, style];

  if (!onPress) {
    return (
      <View style={[...baseStyle, getVariantStyle(variant, false, pressFeedbackColorToken)]}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [
        ...baseStyle,
        getVariantStyle(variant, pressed, pressFeedbackColorToken),
        disabled && styles.disabled,
      ]}
    >
      {children}
    </Pressable>
  );
}

const { components, colors, borders, opacity } = skin;

type CardVariant = NonNullable<CardProps['variant']>;
type FeedbackToken = NonNullable<CardProps['pressFeedbackColorToken']>;

function getVariantStyle(
  variant: CardVariant,
  pressed: boolean,
  pressFeedbackColorToken: FeedbackToken
): ViewStyle {
  const v = variant === 'default' ? 'outlined' : variant;

  // New, strictly skin-driven onboarding selection style.
  if (v === 'onboardingSelection') {
    const token = components.card.variants?.onboardingSelection;
    const activeShadow =
      pressFeedbackColorToken === 'secondary'
        ? token?.shadow?.activeSecondary
        : token?.shadow?.activePrimary;

    return {
      backgroundColor: token?.backgroundColor ?? components.card.backgroundColor,
      borderWidth: token?.borderWidth ?? components.card.borderWidth,
      borderColor: pressed
        ? pressFeedbackColorToken === 'secondary'
          ? colors.secondary
          : colors.primary
        : token?.borderColor ?? components.card.borderColor,
      borderRadius: token?.borderRadius ?? components.card.borderRadius,
      padding: token?.padding ?? components.card.padding,
      ...(pressed ? activeShadow : token?.shadow?.inactive),
    };
  }

  switch (v) {
    case 'filled':
      return styles.filled;
    case 'selection':
      return styles.selection;
    case 'outlined':
    default:
      return styles.outlined;
  }
}

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
  disabled: {
    opacity: opacity.subtle,
  },
});

export default Card;
