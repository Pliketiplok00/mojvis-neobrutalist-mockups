/**
 * Section Primitive
 *
 * Section title/subtitle wrapper with consistent spacing.
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { skin } from './skin';

interface SectionProps {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Section content */
  children?: React.ReactNode;
  /** Additional style */
  style?: ViewStyle;
}

export function Section({
  title,
  subtitle,
  children,
  style,
}: SectionProps): React.JSX.Element {
  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const { components, colors, typography, spacing } = skin;

const styles = StyleSheet.create({
  container: {
    marginBottom: components.section.marginBottom,
  },
  title: {
    fontSize: components.section.titleFontSize,
    fontWeight: components.section.titleFontWeight,
    color: components.section.titleColor,
    marginBottom: components.section.titleMarginBottom,
  },
  subtitle: {
    fontSize: components.section.subtitleFontSize,
    color: components.section.subtitleColor,
  },
});

export default Section;
