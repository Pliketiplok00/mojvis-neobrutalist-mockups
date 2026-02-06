/**
 * ServicePageHeader Component
 *
 * Teal-colored header slab for service pages.
 * NOT a HeroMediaHeader - simple colored band with text.
 *
 * Features:
 * - Teal background (administrative/service context)
 * - Leading icon
 * - Title and subtitle
 * - Heavy bottom border (neobrutalist style)
 *
 * Skin-pure: Uses skin tokens only.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { skin } from '../../ui/skin';
import { Icon, type IconName } from '../../ui/Icon';
import { H1, Body } from '../../ui/Text';

interface ServicePageHeaderProps {
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle?: string;
  /** Leading icon name */
  icon?: IconName;
}

const { colors, spacing, borders } = skin;

export function ServicePageHeader({
  title,
  subtitle,
  icon,
}: ServicePageHeaderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Icon name={icon} size="lg" color={colors.primaryText} />
          </View>
        )}
        <View style={styles.textContainer}>
          <H1 style={styles.title}>{title}</H1>
          {subtitle && <Body style={styles.subtitle}>{subtitle}</Body>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.teal,
    borderBottomWidth: borders.widthHeavy,
    borderBottomColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.primaryText,
  },
  subtitle: {
    color: colors.primaryTextMuted,
    marginTop: spacing.xs,
  },
});

export default ServicePageHeader;
