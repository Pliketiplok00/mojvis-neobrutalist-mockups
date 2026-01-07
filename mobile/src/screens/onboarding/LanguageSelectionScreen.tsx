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
 * Phase 0: UI skeleton only, no logic.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'LanguageSelection'>;
};

export function LanguageSelectionScreen({ navigation }: Props): React.JSX.Element {
  const handleLanguageSelect = (language: 'hr' | 'en'): void => {
    // TODO: Store language preference locally
    // TODO: Apply language to app
    console.info(`Selected language: ${language}`);
    navigation.navigate('UserModeSelection');
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
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 48,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  languageButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  languageButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LanguageSelectionScreen;
