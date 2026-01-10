/**
 * Text Primitives
 *
 * Typography wrappers: H1, H2, Label, Body, Meta, ButtonText
 */

import React from 'react';
import { Text as RNText, StyleSheet, type StyleProp, type TextStyle, type TextProps as RNTextProps } from 'react-native';
import { skin } from './skin';

interface TextProps extends Omit<RNTextProps, 'style'> {
  children: React.ReactNode;
  /** Color override */
  color?: string;
  /** Additional style */
  style?: StyleProp<TextStyle>;
}

/** Hero title - 28px bold */
export function H1({ children, color, style, ...props }: TextProps): React.JSX.Element {
  return (
    <RNText style={[styles.h1, color && { color }, style]} {...props}>
      {children}
    </RNText>
  );
}

/** Section title - 18px semibold */
export function H2({ children, color, style, ...props }: TextProps): React.JSX.Element {
  return (
    <RNText style={[styles.h2, color && { color }, style]} {...props}>
      {children}
    </RNText>
  );
}

/** Label text - 14px medium */
export function Label({ children, color, style, ...props }: TextProps): React.JSX.Element {
  return (
    <RNText style={[styles.label, color && { color }, style]} {...props}>
      {children}
    </RNText>
  );
}

/** Body text - 16px regular */
export function Body({ children, color, style, ...props }: TextProps): React.JSX.Element {
  return (
    <RNText style={[styles.body, color && { color }, style]} {...props}>
      {children}
    </RNText>
  );
}

/** Meta text - 12px muted */
export function Meta({ children, color, style, ...props }: TextProps): React.JSX.Element {
  return (
    <RNText style={[styles.meta, color && { color }, style]} {...props}>
      {children}
    </RNText>
  );
}

/** Button text - 16px semibold */
export function ButtonText({ children, color, style, ...props }: TextProps): React.JSX.Element {
  return (
    <RNText style={[styles.buttonText, color && { color }, style]} {...props}>
      {children}
    </RNText>
  );
}

const { typography, colors } = skin;

const styles = StyleSheet.create({
  h1: {
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.display.bold,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.display.semiBold,
    color: colors.textPrimary,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body.regular,
    color: colors.textSecondary,
  },
  body: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.body.regular,
    color: colors.textSecondary,
  },
  meta: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body.regular,
    color: colors.textDisabled,
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.body.bold,
    color: colors.textPrimary,
  },
});

export default {
  H1,
  H2,
  Label,
  Body,
  Meta,
  ButtonText,
};
