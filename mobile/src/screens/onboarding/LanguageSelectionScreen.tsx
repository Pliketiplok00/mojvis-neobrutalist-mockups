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
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { skin } from '../../ui/skin';

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
          <Text style={styles.logoText}>MOJ VIS</Text>
        </View>

        <Text style={styles.title}>Dobrodošli / Welcome</Text>
        <Text style={styles.subtitle}>Odaberite jezik / Select language</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => handleLanguageSelect('hr')}
            accessibilityLabel="Hrvatski"
          >
            <Text style={styles.languageButtonText}>Hrvatski</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => handleLanguageSelect('en')}
            accessibilityLabel="English"
          >
            <Text style={styles.languageButtonText}>English</Text>
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
  logoText: {
    fontSize: skin.typography.fontSize.xxxl,
    fontWeight: skin.typography.fontWeight.bold,
    color: skin.colors.textPrimary,
  },
  title: {
    fontSize: skin.typography.fontSize.xxl,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.textPrimary,
    marginBottom: skin.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: skin.typography.fontSize.lg,
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
    fontSize: skin.typography.fontSize.xl,
    fontWeight: skin.typography.fontWeight.semiBold,
  },
});

export default LanguageSelectionScreen;
