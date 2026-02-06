/**
 * FormSectionHeader Component
 *
 * Section header for form pages with icon + uppercase label.
 * Used in Click & Fix, Feedback, and similar form screens.
 *
 * Features:
 * - Leading icon (sm size, muted)
 * - Uppercase label text
 * - Optional count display (e.g., "FOTOGRAFIJE (0/3)")
 *
 * Skin-pure: Uses skin tokens only.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { skin } from '../../ui/skin';
import { Icon, type IconName } from '../../ui/Icon';
import { Label } from '../../ui/Text';

interface FormSectionHeaderProps {
  /** Icon name */
  icon: IconName;
  /** Section label (displayed uppercase) */
  label: string;
  /** Optional count display (e.g., "0/3") */
  count?: string;
  /** Whether the field is required */
  required?: boolean;
}

const { colors, spacing } = skin;

export function FormSectionHeader({
  icon,
  label,
  count,
  required,
}: FormSectionHeaderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Icon name={icon} size="sm" colorToken="textMuted" />
      <Label style={styles.label}>
        {label}
        {count && ` (${count})`}
        {required && <Label style={styles.required}> *</Label>}
      </Label>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  label: {
    textTransform: 'uppercase',
    color: colors.textPrimary,
  },
  required: {
    color: colors.errorText,
  },
});

export default FormSectionHeader;
