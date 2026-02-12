/**
 * EmergencyTile Component
 *
 * Compact colored tile for emergency services.
 * Displays icon, service name, and phone number.
 *
 * Used in a row of 3 tiles for emergency numbers section.
 *
 * Skin-pure: Uses skin tokens only.
 */

import React from 'react';
import { View, StyleSheet, Linking, Pressable } from 'react-native';
import { skin } from '../../ui/skin';
import { Icon, type IconName } from '../../ui/Icon';
import { Label, H2 } from '../../ui/Text';

interface EmergencyTileProps {
  /** Icon name */
  icon: IconName;
  /** Service name (e.g., "HITNA POMOĆ") */
  name: string;
  /** Phone number (e.g., "194") */
  phoneNumber: string;
  /** Background color (use skin.colors token) */
  backgroundColor: string;
  /** Text color (defaults to textPrimary for light backgrounds) */
  textColor?: string;
}

const { colors, spacing, borders, opacity } = skin;

export function EmergencyTile({
  icon,
  name,
  phoneNumber,
  backgroundColor,
  textColor = colors.textPrimary,
}: EmergencyTileProps): React.JSX.Element {
  const handlePress = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${phoneNumber}`}
      accessibilityHint="Tap to call"
    >
      <View style={styles.iconContainer}>
        <Icon name={icon} size="md" color={textColor} />
      </View>
      <Label style={[styles.name, { color: textColor }]}>{name}</Label>
      <H2 style={[styles.number, { color: textColor }]}>{phoneNumber}</H2>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderWidth: borders.widthThin,
    borderColor: colors.border,
  },
  pressed: {
    opacity: opacity.soft,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  name: {
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  number: {
    textAlign: 'center',
  },
});

export default EmergencyTile;
