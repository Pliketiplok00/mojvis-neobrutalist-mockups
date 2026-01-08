/**
 * Municipality Selection Screen (ONBOARD_MUNICIPALITY_02)
 *
 * Allow local users to choose their municipality.
 *
 * Rules:
 * - Only shown to users who selected "local" mode
 * - Municipality selection is required for local users
 * - Only one municipality can be active at a time
 * - Can be changed later in Settings
 *
 * Phase 0: UI skeleton only, no logic.
 * Phase 5.1: Added onboarding completion for locals.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useOnboarding } from '../../contexts/OnboardingContext';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'MunicipalitySelection'>;
  route: RouteProp<OnboardingStackParamList, 'MunicipalitySelection'>;
};

export function MunicipalitySelectionScreen({ navigation, route }: Props): React.JSX.Element {
  const { completeOnboarding } = useOnboarding();
  const { language } = route.params;

  const handleMunicipalitySelect = async (municipality: 'vis' | 'komiza'): Promise<void> => {
    console.info(`Selected municipality: ${municipality}`);
    // Complete onboarding with municipality
    await completeOnboarding({
      language,
      userMode: 'local',
      municipality,
    });
    // AppNavigator will automatically switch to Main stack
  };

  const handleBack = (): void => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Natrag / Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Odaberite općinu</Text>
        <Text style={styles.subtitle}>Select your municipality</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.municipalityCard}
            onPress={() => void handleMunicipalitySelect('vis')}
            accessibilityLabel="Vis"
          >
            <Text style={styles.municipalityName}>Vis</Text>
            <Text style={styles.municipalityDescription}>
              Grad Vis i okolica
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.municipalityCard}
            onPress={() => void handleMunicipalitySelect('komiza')}
            accessibilityLabel="Komiza"
          >
            <Text style={styles.municipalityName}>Komiža</Text>
            <Text style={styles.municipalityDescription}>
              Grad Komiža i okolica
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Ovo određuje koje općinske obavijesti primate.
        </Text>
        <Text style={styles.hintEn}>
          This determines which municipal notifications you receive.
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
  },
  backButton: {
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666666',
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
  municipalityCard: {
    backgroundColor: '#F5F5F5',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  municipalityName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  municipalityDescription: {
    fontSize: 14,
    color: '#666666',
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

export default MunicipalitySelectionScreen;
