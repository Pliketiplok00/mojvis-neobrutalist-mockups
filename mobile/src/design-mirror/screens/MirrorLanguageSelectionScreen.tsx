/**
 * Mirror Language Selection Screen (Design Mirror)
 *
 * Mirrors LanguageSelectionScreen using fixture data.
 * For visual auditing only - no navigation, no storage.
 *
 * Sections mirrored:
 * 1. Logo placeholder
 * 2. Title (bilingual)
 * 3. Subtitle (bilingual)
 * 4. Language selection buttons (HR/EN)
 *
 * Rules:
 * - NO useNavigation import
 * - NO storage writes
 * - All actions are NO-OP or toggle local state
 * - Skin tokens only
 */

import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { H1, H2, Body, Meta } from '../../ui/Text';
import {
  languageOptions,
  languageSelectionLabels,
  languageSelectedHrFixture,
  type Language,
} from '../fixtures/onboarding';

/**
 * Mirror Language Selection Screen
 * Uses languageOptions fixture for visual state
 */
export function MirrorLanguageSelectionScreen(): React.JSX.Element {
  // Local state to demonstrate selection (visual only)
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    languageSelectedHrFixture
  );

  // NO-OP handler - mirror screens don't navigate
  const handleLanguageSelect = (language: Language): void => {
    setSelectedLanguage(language);
    // Does not navigate - visual only
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Mirror header - simplified */}
      <View style={styles.mirrorHeader}>
        <H2 style={styles.mirrorHeaderTitle}>LanguageSelection Mirror</H2>
        <Meta style={styles.mirrorHeaderMeta}>
          selected: {selectedLanguage || 'none'}
        </Meta>
      </View>

      <View style={styles.content}>
        {/* Logo placeholder */}
        <View style={styles.logoContainer}>
          <H1>{languageSelectionLabels.logo}</H1>
        </View>

        <H2 style={styles.title}>{languageSelectionLabels.title}</H2>
        <Body style={styles.subtitle}>{languageSelectionLabels.subtitle}</Body>

        <View style={styles.buttonContainer}>
          {languageOptions.map((option) => (
            <Button
              key={option.code}
              variant={selectedLanguage === option.code ? 'primary' : 'secondary'}
              onPress={() => handleLanguageSelect(option.code)}
              accessibilityLabel={option.label}
            >
              {option.label}
            </Button>
          ))}
        </View>

        {/* Visual indicator of selection state */}
        {selectedLanguage && (
          <View style={styles.selectionIndicator}>
            <Meta style={styles.selectionText}>
              Odabrano / Selected: {selectedLanguage.toUpperCase()}
            </Meta>
          </View>
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.xxl,
  },
  logoContainer: {
    marginBottom: skin.spacing.xxxl,
  },
  title: {
    marginBottom: skin.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: skin.colors.textMuted,
    marginBottom: skin.spacing.xxxl,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: skin.spacing.lg,
  },
  selectionIndicator: {
    marginTop: skin.spacing.xxl,
    padding: skin.spacing.md,
    backgroundColor: skin.colors.backgroundSecondary,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
  },
  selectionText: {
    textAlign: 'center',
  },
});

export default MirrorLanguageSelectionScreen;
