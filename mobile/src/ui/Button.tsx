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
  variant?: 'primary' | 'secondary';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Additional style */
  style?: ViewStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps): React.JSX.Element {
  const isPrimary = variant === 'primary';
  const buttonStyle = isPrimary ? styles.primary : styles.secondary;
  const textStyle = isPrimary ? styles.primaryText : styles.secondaryText;

  return (
    <TouchableOpacity
      style={[styles.base, buttonStyle, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? skin.colors.primaryText : skin.colors.textPrimary}
        />
      ) : (
        <Text style={textStyle}>{children}</Text>
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
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
