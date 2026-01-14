/**
 * Input Primitive
 *
 * Skin-driven text input component for forms.
 * Supports single-line and multiline modes with consistent styling.
 */

import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { skin } from './skin';

interface InputProps {
  /** Current value */
  value: string;
  /** Change handler */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Error state - changes border color */
  error?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Multiline mode */
  multiline?: boolean;
  /** Number of lines for multiline mode */
  numberOfLines?: number;
  /** Fixed height for multiline mode (overrides numberOfLines) */
  height?: number;
  /** Maximum character length */
  maxLength?: number;
  /** Keyboard type */
  keyboardType?: TextInputProps['keyboardType'];
  /** Return key type */
  returnKeyType?: TextInputProps['returnKeyType'];
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
  /** Additional style */
  style?: StyleProp<TextStyle>;
}

const { components, typography } = skin;

export function Input({
  value,
  onChangeText,
  placeholder,
  error = false,
  disabled = false,
  multiline = false,
  numberOfLines = 4,
  height,
  maxLength,
  keyboardType,
  returnKeyType,
  accessibilityLabel,
  testID,
  style,
}: InputProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);

  // Determine border color based on state
  const getBorderColor = () => {
    if (error) return components.input.borderColorError;
    if (isFocused) return components.input.borderColorFocus;
    return components.input.borderColor;
  };

  // Calculate multiline height
  const getMultilineStyle = (): TextStyle | null => {
    if (!multiline) return null;

    if (height) {
      return { height, textAlignVertical: 'top' };
    }

    // Approximate line height calculation for default numberOfLines
    const lineHeight = components.input.fontSize * 1.4;
    const padding = components.input.paddingVertical * 2;
    const calculatedHeight = lineHeight * numberOfLines + padding;

    return {
      height: calculatedHeight,
      textAlignVertical: 'top',
    };
  };

  return (
    <TextInput
      style={[
        styles.input,
        { borderColor: getBorderColor() },
        multiline && getMultilineStyle(),
        disabled && styles.disabled,
        style,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={components.input.placeholderColor}
      editable={!disabled}
      multiline={multiline}
      numberOfLines={multiline ? numberOfLines : 1}
      maxLength={maxLength}
      keyboardType={keyboardType}
      returnKeyType={returnKeyType}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: components.input.backgroundColor,
    borderWidth: components.input.borderWidth,
    borderColor: components.input.borderColor,
    borderRadius: components.input.borderRadius,
    paddingHorizontal: components.input.paddingHorizontal,
    paddingVertical: components.input.paddingVertical,
    fontSize: components.input.fontSize,
    fontFamily: typography.fontFamily.body.regular,
    color: components.input.textColor,
  },
  disabled: {
    opacity: components.input.disabledOpacity,
  },
});

export default Input;
