/**
 * Button Primitive
 *
 * Primary and secondary button variants.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
} from 'react-native';
import { skin } from './skin';

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

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.primaryText;
    }
  };

  const getLoadingColor = () => {
    switch (variant) {
      case 'secondary':
        return skin.colors.textPrimary;
      case 'danger':
        return skin.colors.errorText;
      default:
        return skin.colors.primaryText;
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
        <ActivityIndicator size="small" color={getLoadingColor()} />
      ) : (
        <Text style={getTextStyle()}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const { components, colors } = skin;

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
  primaryText: {
    fontSize: components.button.fontSize,
    fontWeight: components.button.fontWeight,
    color: components.button.primary.textColor,
  },
  secondaryText: {
    fontSize: components.button.fontSize,
    fontWeight: components.button.fontWeight,
    color: components.button.secondary.textColor,
  },
  dangerText: {
    fontSize: components.button.fontSize,
    fontWeight: components.button.fontWeight,
    color: components.button.danger.textColor,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
