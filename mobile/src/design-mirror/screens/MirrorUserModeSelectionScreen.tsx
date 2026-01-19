/**
 * Mirror User Mode Selection Screen (Design Mirror)
 *
 * Mirrors UserModeSelectionScreen using fixture data.
 * For visual auditing only - no navigation, no context.
 *
 * Sections mirrored:
 * 1. Title (bilingual)
 * 2. Option cards (Visitor/Local) with icons
 * 3. Hint text (bilingual)
 *
 * Rules:
 * - NO useNavigation import
 * - NO useOnboarding context
 * - All actions are NO-OP or toggle local state
 * - Skin tokens only
 */

import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';
import { Card } from '../../ui/Card';
import { H2, Body, ButtonText, Label, Meta } from '../../ui/Text';
import {
  userModeOptions,
  userModeSelectionLabels,
  type UserMode,
} from '../fixtures/onboarding';

/**
 * Mirror User Mode Selection Screen
 * Uses userModeOptions fixture for visual state
 */
export function MirrorUserModeSelectionScreen(): React.JSX.Element {
  // Local state to demonstrate selection (visual only)
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null);

  // NO-OP handler - mirror screens don't navigate
  const handleModeSelect = (mode: UserMode): void => {
    setSelectedMode(mode);
    // Does not navigate or complete onboarding - visual only
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Mirror header - simplified */}
      <View style={styles.mirrorHeader}>
        <H2 style={styles.mirrorHeaderTitle}>UserModeSelection Mirror</H2>
        <Meta style={styles.mirrorHeaderMeta}>
          selected: {selectedMode || 'none'}
        </Meta>
      </View>

      <View style={styles.content}>
        <H2 style={styles.title}>{userModeSelectionLabels.titleHr}</H2>
        <Body style={styles.subtitle}>{userModeSelectionLabels.titleEn}</Body>

        <View style={styles.optionsContainer}>
          {userModeOptions.map((option) => {
            const isSelected = selectedMode === option.mode;
            return (
              <Card
                key={option.mode}
                variant="selection"
                onPress={() => handleModeSelect(option.mode)}
                accessibilityLabel={option.titleEn}
                style={isSelected ? styles.cardSelected : undefined}
              >
                <View style={styles.optionIconContainer}>
                  <Icon name={option.icon} size="lg" colorToken="textPrimary" />
                </View>
                <ButtonText style={styles.optionTitle}>
                  {option.titleHr} / {option.titleEn}
                </ButtonText>
                <Label style={styles.optionDescription}>
                  {option.descriptionHr}
                </Label>
                <Meta style={styles.optionDescriptionEn}>
                  {option.descriptionEn}
                </Meta>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Icon name="check" size="sm" colorToken="primaryText" />
                  </View>
                )}
              </Card>
            );
          })}
        </View>

        <Meta style={styles.hint}>{userModeSelectionLabels.hintHr}</Meta>
        <Meta style={styles.hintEn}>{userModeSelectionLabels.hintEn}</Meta>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: skin.colors.background,
  },
  mirrorHeader: {
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
    backgroundColor: skin.colors.backgroundTertiary,
  },
  mirrorHeaderTitle: {
    marginBottom: skin.spacing.xs,
  },
  mirrorHeaderMeta: {
    color: skin.colors.textMuted,
  },
  content: {
    flex: 1,
    padding: skin.spacing.xxl,
    paddingTop: skin.spacing.xxxl,
  },
  title: {
    marginBottom: skin.spacing.xs,
  },
  subtitle: {
    color: skin.colors.textMuted,
    marginBottom: skin.spacing.xxxl,
  },
  optionsContainer: {
    gap: skin.spacing.lg,
  },
  optionIconContainer: {
    marginBottom: skin.spacing.md,
  },
  optionTitle: {
    marginBottom: skin.spacing.sm,
  },
  optionDescription: {
    color: skin.colors.textMuted,
  },
  optionDescriptionEn: {
    fontStyle: 'italic',
  },
  cardSelected: {
    borderColor: skin.colors.primary,
    borderWidth: skin.borders.widthHeavy,
  },
  selectedBadge: {
    position: 'absolute',
    top: skin.spacing.md,
    right: skin.spacing.md,
    width: 24,
    height: 24,
    backgroundColor: skin.colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    textAlign: 'center',
    marginTop: skin.spacing.xxxl,
  },
  hintEn: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MirrorUserModeSelectionScreen;
