/**
 * Language Selection Screen (ONBOARD_LANG_00)
 *
 * Initial app entry screen where user selects app language.
 *
 * Rules:
 * - Language selection is mandatory
 * - Selected language is stored locally
 * - Language can be changed later in Settings
 *
 * Skin-pure: Uses skin tokens only (no hardcoded hex, no magic numbers).
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { skin } from '../../ui/skin';
import { H1, H2, Body, ButtonText } from '../../ui/Text';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'LanguageSelection'>;
};

export function LanguageSelectionScreen({ navigation }: Props): React.JSX.Element {
  const handleLanguageSelect = (language: 'hr' | 'en'): void => {
    // TODO: Apply language to app UI
    console.info(`Selected language: ${language}`);
    navigation.navigate('UserModeSelection', { language });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo placeholder */}
        <View style={styles.logoContainer}>
          <H1>MOJ VIS</H1>
        </View>

        <H2 style={styles.title}>Dobrodošli / Welcome</H2>
        <Body style={styles.subtitle}>Odaberite jezik / Select language</Body>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => handleLanguageSelect('hr')}
            accessibilityLabel="Hrvatski"
          >
            <ButtonText style={styles.languageButtonText}>Hrvatski</ButtonText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => handleLanguageSelect('en')}
            accessibilityLabel="English"
          >
            <ButtonText style={styles.languageButtonText}>English</ButtonText>
          </TouchableOpacity>
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
  languageButton: {
    backgroundColor: skin.colors.textPrimary,
    paddingVertical: skin.spacing.lg,
    paddingHorizontal: skin.spacing.xxl,
    borderRadius: skin.borders.radiusCard,
    alignItems: 'center',
  },
  languageButtonText: {
    color: skin.colors.background,
  },
});

export default LanguageSelectionScreen;
