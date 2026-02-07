/**
 * OnboardingRoleCard
 *
 * Split-card component for role selection (visitor/local).
 * Pattern: colored header band + white body with bullet list.
 *
 * All styling driven by skin.components.onboarding.roleCard tokens.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { skin } from '../../../ui/skin';
import { Icon, type IconName } from '../../../ui/Icon';
import { ButtonText, Label, Meta } from '../../../ui/Text';

type RoleVariant = 'visitor' | 'local';

interface OnboardingRoleCardProps {
  variant: RoleVariant;
  title: string;
  subtitle: string;
  bullets: string[];
  icon: IconName;
  onPress: () => void;
}

const { components, colors, spacing } = skin;
const tokens = components.onboarding.roleCard;

/**
 * Get variant-specific colors
 */
function getVariantTokens(variant: RoleVariant) {
  return variant === 'visitor' ? tokens.visitor : tokens.local;
}

/**
 * Bullet item with small square marker
 */
function BulletItem({
  text,
  bulletColor,
}: {
  text: string;
  bulletColor: string;
}): React.JSX.Element {
  return (
    <View style={styles.bulletRow}>
      <View
        style={[
          styles.bulletSquare,
          { backgroundColor: bulletColor },
        ]}
      />
      <Label style={styles.bulletText}>{text}</Label>
    </View>
  );
}

export function OnboardingRoleCard({
  variant,
  title,
  subtitle,
  bullets,
  icon,
  onPress,
}: OnboardingRoleCardProps): React.JSX.Element {
  const variantTokens = getVariantTokens(variant);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {/* Shadow layer (neobrutalist offset) */}
      <View style={styles.shadowLayer} />

      {/* Card content */}
      <View style={styles.card}>
        {/* Header section (colored) */}
        <View
          style={[
            styles.header,
            { backgroundColor: variantTokens.headerBackground },
          ]}
        >
          {/* Icon box */}
          <View style={styles.iconBox}>
            <Icon name={icon} size="lg" colorToken="textPrimary" />
          </View>

          {/* Header text */}
          <View style={styles.headerText}>
            <ButtonText style={styles.headerTitle}>{title}</ButtonText>
            <Meta style={styles.headerSubtitle}>{subtitle}</Meta>
          </View>
        </View>

        {/* Body section (white with bullets) */}
        <View style={styles.body}>
          {bullets.map((bullet, index) => (
            <BulletItem
              key={index}
              text={bullet}
              bulletColor={variantTokens.bulletColor}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: tokens.shadowOffsetY,
    left: tokens.shadowOffsetX,
    right: -tokens.shadowOffsetX,
    bottom: -tokens.shadowOffsetY,
    backgroundColor: tokens.shadowColor,
    borderRadius: tokens.borderRadius,
  },
  card: {
    borderWidth: tokens.borderWidth,
    borderColor: tokens.borderColor,
    borderRadius: tokens.borderRadius,
    overflow: 'hidden',
    backgroundColor: tokens.body.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.header.paddingVertical,
    paddingHorizontal: tokens.header.paddingHorizontal,
  },
  iconBox: {
    width: tokens.iconBox.size,
    height: tokens.iconBox.size,
    backgroundColor: tokens.iconBox.background,
    borderWidth: tokens.iconBox.borderWidth,
    borderColor: tokens.iconBox.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: colors.primaryText,
  },
  headerSubtitle: {
    color: colors.primaryTextMuted,
    marginTop: spacing.xs,
  },
  body: {
    backgroundColor: tokens.body.background,
    padding: tokens.body.padding,
    borderTopWidth: tokens.body.borderTopWidth,
    borderTopColor: tokens.body.borderTopColor,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bulletSquare: {
    width: tokens.bullet.size,
    height: tokens.bullet.size,
    marginRight: tokens.bullet.marginRight,
    marginTop: tokens.bullet.marginTop,
  },
  bulletText: {
    flex: 1,
    color: colors.textPrimary,
  },
});

export default OnboardingRoleCard;
