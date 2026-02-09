/**
 * Button Primitive
 *
 * Primary and secondary button variants.
 * Uses ButtonText primitive for consistent typography (Space Mono Bold).
 * Supports optional neobrut shadow styling via `shadow` prop.
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
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
  /** Enable neobrut offset shadow (default: true for primary variant) */
  shadow?: boolean;
  /** Additional style (applied to outer container when shadow=true, else to button) */
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
  shadow,
  style,
  accessibilityLabel,
}: ButtonProps): React.JSX.Element {
  // Default shadow to true for primary variant (neobrut design)
  const showShadow = shadow ?? (variant === 'primary');
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

  const button = (
    <TouchableOpacity
      style={[styles.base, getButtonStyle(), disabled && styles.disabled, !showShadow && style]}
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

  if (!showShadow) {
    return button;
  }

  // Wrap with shadow container for neobrut effect
  return (
    <View style={[styles.shadowContainer, style]}>
      <View style={styles.shadowLayer} />
      {button}
    </View>
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
  // Neobrut shadow styles (using skin tokens)
  shadowContainer: {
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: components.button.shadowOffset,
    left: components.button.shadowOffset,
    right: -components.button.shadowOffset,
    bottom: -components.button.shadowOffset,
    backgroundColor: components.button.shadowColor,
    borderRadius: components.button.borderRadius,
  },
});

export default Button;
