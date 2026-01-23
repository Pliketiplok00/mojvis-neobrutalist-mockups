/**
 * Button Primitive
 *
 * Primary and secondary button variants.
 * Uses ButtonText primitive for consistent typography (Space Mono Bold).
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
} from 'react-native';
import { skin } from './skin';
import { ButtonText } from './Text';

interface ButtonProps {
  /** Button label */
  children: string;
  /** Press handler */
  onPress: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Additional style */
  style?: ViewStyle;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
}: ButtonProps): React.JSX.Element {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'danger':
        return styles.danger;
      default:
        return styles.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return components.button.secondary.textColor;
      case 'danger':
        return components.button.danger.textColor;
      default:
        return components.button.primary.textColor;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.base, getButtonStyle(), disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <ButtonText color={getTextColor()}>{children}</ButtonText>
      )}
    </TouchableOpacity>
  );
}

const { components } = skin;

const styles = StyleSheet.create({
  base: {
    borderRadius: components.button.borderRadius,
    paddingVertical: components.button.paddingVertical,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: components.button.primary.backgroundColor,
    borderWidth: components.button.primary.borderWidth,
    borderColor: components.button.primary.borderColor,
  },
  secondary: {
    backgroundColor: components.button.secondary.backgroundColor,
    borderWidth: components.button.secondary.borderWidth,
    borderColor: components.button.secondary.borderColor,
  },
  danger: {
    backgroundColor: components.button.danger.backgroundColor,
    borderWidth: components.button.danger.borderWidth,
    borderColor: components.button.danger.borderColor,
  },
  disabled: {
    opacity: components.button.disabledOpacity,
  },
});

export default Button;
