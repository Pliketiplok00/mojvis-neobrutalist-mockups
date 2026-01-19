/**
 * Mirror Municipality Selection Screen (Design Mirror)
 *
 * Mirrors MunicipalitySelectionScreen using fixture data.
 * For visual auditing only - no navigation, no context.
 *
 * Sections mirrored:
 * 1. Back button (visual only, NO-OP)
 * 2. Title (bilingual)
 * 3. Municipality cards (Vis/Komiža)
 * 4. Hint text (bilingual)
 *
 * Rules:
 * - NO useNavigation import
 * - NO useOnboarding context
 * - All actions are NO-OP or toggle local state
 * - Skin tokens only
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';
import { Card } from '../../ui/Card';
import { H1, H2, Body, Label, Meta } from '../../ui/Text';
import {
  municipalityOptions,
  municipalitySelectionLabels,
  type Municipality,
} from '../fixtures/onboarding';

/**
 * Mirror Municipality Selection Screen
 * Uses municipalityOptions fixture for visual state
 */
export function MirrorMunicipalitySelectionScreen(): React.JSX.Element {
  // Local state to demonstrate selection (visual only)
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);

  // NO-OP handler - mirror screens don't navigate
  const handleMunicipalitySelect = (municipality: Municipality): void => {
    setSelectedMunicipality(municipality);
    // Does not navigate or complete onboarding - visual only
  };

  // NO-OP back handler
  const handleBack = (): void => {
    // Does not navigate - visual only
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Mirror header - simplified */}
      <View style={styles.mirrorHeader}>
        <H2 style={styles.mirrorHeaderTitle}>MunicipalitySelection Mirror</H2>
        <Meta style={styles.mirrorHeaderMeta}>
          selected: {selectedMunicipality || 'none'}
        </Meta>
      </View>

      <View style={styles.content}>
        {/* Back button (visual only) */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="chevron-left" size="sm" colorToken="textMuted" />
          <Body style={styles.backButtonText}>
            {municipalitySelectionLabels.backHr} / {municipalitySelectionLabels.backEn}
          </Body>
        </TouchableOpacity>

        <H2 style={styles.title}>{municipalitySelectionLabels.titleHr}</H2>
        <Body style={styles.subtitle}>{municipalitySelectionLabels.titleEn}</Body>

        <View style={styles.optionsContainer}>
          {municipalityOptions.map((option) => {
            const isSelected = selectedMunicipality === option.id;
            return (
              <Card
                key={option.id}
                variant="selection"
                onPress={() => handleMunicipalitySelect(option.id)}
                accessibilityLabel={option.name}
                style={{
                  ...styles.municipalityCard,
                  ...(isSelected ? styles.cardSelected : {}),
                }}
              >
                <H1 style={styles.municipalityName}>{option.name}</H1>
                <Label style={styles.municipalityDescription}>
                  {option.descriptionHr}
                </Label>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Icon name="check" size="sm" colorToken="primaryText" />
                  </View>
                )}
              </Card>
            );
          })}
        </View>

        <Meta style={styles.hint}>{municipalitySelectionLabels.hintHr}</Meta>
        <Meta style={styles.hintEn}>{municipalitySelectionLabels.hintEn}</Meta>

        {/* Visual state indicator */}
        <View style={styles.stateIndicator}>
          <Meta style={styles.stateText}>
            Tap a municipality to see selection state
          </Meta>
        </View>
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.xs,
    marginBottom: skin.spacing.xxl,
  },
  backButtonText: {
    color: skin.colors.textMuted,
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
  municipalityCard: {
    padding: skin.spacing.xxl,
  },
  municipalityName: {
    marginBottom: skin.spacing.sm,
  },
  municipalityDescription: {
    color: skin.colors.textMuted,
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
  stateIndicator: {
    marginTop: skin.spacing.xl,
    padding: skin.spacing.md,
    backgroundColor: skin.colors.backgroundSecondary,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.borderLight,
    borderStyle: 'dashed',
  },
  stateText: {
    textAlign: 'center',
    color: skin.colors.textMuted,
  },
});

export default MirrorMunicipalitySelectionScreen;
