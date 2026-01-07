/**
 * User Mode Selection Screen (ONBOARD_ROLE_01)
 *
 * Determine if user is a visitor or local resident.
 *
 * Rules:
 * - Selection is mandatory
 * - Visitor: General + Emergency + Cultural notifications
 * - Local: All visitor notifications + Municipal notifications
 * - Local users proceed to municipality selection
 * - Visitors go directly to Home
 *
 * Phase 0: UI skeleton only, no logic.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'UserModeSelection'>;
};

export function UserModeSelectionScreen({ navigation }: Props): React.JSX.Element {
  const handleModeSelect = (mode: 'visitor' | 'local'): void => {
    // TODO: Store user mode preference
    console.info(`Selected mode: ${mode}`);

    if (mode === 'visitor') {
      // TODO: Navigate to Home (complete onboarding)
      console.info('Visitor selected - should navigate to Home');
    } else {
      navigation.navigate('MunicipalitySelection');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Kako koristite aplikaciju?</Text>
        <Text style={styles.subtitle}>How do you use the app?</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleModeSelect('visitor')}
            accessibilityLabel="Visitor"
          >
            <Text style={styles.optionIcon}>🧳</Text>
            <Text style={styles.optionTitle}>Posjetitelj / Visitor</Text>
            <Text style={styles.optionDescription}>
              Turistička posjeta otoku
            </Text>
            <Text style={styles.optionDescriptionEn}>
              Visiting the island as a tourist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleModeSelect('local')}
            accessibilityLabel="Local resident"
          >
            <Text style={styles.optionIcon}>🏠</Text>
            <Text style={styles.optionTitle}>Lokalac / Local</Text>
            <Text style={styles.optionDescription}>
              Živim ili radim na otoku
            </Text>
            <Text style={styles.optionDescriptionEn}>
              I live or work on the island
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Možete promijeniti kasnije u postavkama.
        </Text>
        <Text style={styles.hintEn}>
          You can change this later in settings.
        </Text>
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
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
  },
  optionDescriptionEn: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
  hint: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 32,
  },
  hintEn: {
    fontSize: 14,
    color: '#BBBBBB',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default UserModeSelectionScreen;
