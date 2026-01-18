/**
 * PosterButton - Neobrutalist poster-style button with shadow
 *
 * Matches the "Poster Card" style from UI Inventory:
 * - Sharp corners (no border radius)
 * - Thick border
 * - Offset shadow layer (poster shadow pattern)
 * - Correct typography via ButtonText primitive
 *
 * Use for primary CTAs throughout the app.
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
} from 'react-native';
import { skin } from './skin';
import { ButtonText } from './Text';

const { colors, borders, spacing } = skin;

interface PosterButtonProps {
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
  /** Additional wrapper style */
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
}

export function PosterButton({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
}: PosterButtonProps): React.JSX.Element {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <View style={[styles.wrapper, style]}>
      {/* Shadow layer */}
      <View style={styles.shadow} />
      {/* Button surface */}
      <TouchableOpacity
        style={[
          styles.button,
          isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isPrimary ? colors.primaryText : colors.textPrimary}
          />
        ) : (
          <ButtonText
            color={isPrimary ? colors.primaryText : colors.textPrimary}
            style={styles.text}
          >
            {children}
          </ButtonText>
        )}
      </TouchableOpacity>
    </View>
  );
}

const SHADOW_OFFSET = 4;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    backgroundColor: colors.border,
  },
  button: {
    position: 'relative',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: borders.widthCard,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.background,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'center',
  },
});

export default PosterButton;
