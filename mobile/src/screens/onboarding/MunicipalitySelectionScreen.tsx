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
 * Skin-pure: Uses skin tokens and Icon primitive (no hardcoded hex, no text glyphs).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';

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
          <Icon name="chevron-left" size="sm" colorToken="textMuted" />
          <Text style={styles.backButtonText}>Natrag / Back</Text>
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
    backgroundColor: skin.colors.background,
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
    fontSize: skin.typography.fontSize.lg,
    color: skin.colors.textMuted,
  },
  title: {
    fontSize: skin.typography.fontSize.xxl,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.textPrimary,
    marginBottom: skin.spacing.xs,
  },
  subtitle: {
    fontSize: skin.typography.fontSize.lg,
    color: skin.colors.textMuted,
    marginBottom: skin.spacing.xxxl,
  },
  optionsContainer: {
    gap: skin.spacing.lg,
  },
  municipalityCard: {
    backgroundColor: skin.colors.backgroundSecondary,
    padding: skin.spacing.xxl,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.borderLight,
  },
  municipalityName: {
    fontSize: skin.typography.fontSize.xxl,
    fontWeight: skin.typography.fontWeight.bold,
    color: skin.colors.textPrimary,
    marginBottom: skin.spacing.sm,
  },
  municipalityDescription: {
    fontSize: skin.typography.fontSize.md,
    color: skin.colors.textMuted,
  },
  hint: {
    fontSize: skin.typography.fontSize.md,
    color: skin.colors.textDisabled,
    textAlign: 'center',
    marginTop: skin.spacing.xxxl,
  },
  hintEn: {
    fontSize: skin.typography.fontSize.md,
    color: skin.colors.textDisabled,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MunicipalitySelectionScreen;
