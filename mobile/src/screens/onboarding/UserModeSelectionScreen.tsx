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
 * Skin-pure: Uses skin tokens and Icon primitive (no hardcoded hex, no emoji).
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
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'UserModeSelection'>;
  route: RouteProp<OnboardingStackParamList, 'UserModeSelection'>;
};

export function UserModeSelectionScreen({ navigation, route }: Props): React.JSX.Element {
  const { completeOnboarding } = useOnboarding();
  const { language } = route.params;

  const handleModeSelect = async (mode: 'visitor' | 'local'): Promise<void> => {
    console.info(`Selected mode: ${mode}`);

    if (mode === 'visitor') {
      // Complete onboarding - visitor has no municipality
      await completeOnboarding({
        language,
        userMode: 'visitor',
        municipality: null,
      });
      // AppNavigator will automatically switch to Main stack
    } else {
      navigation.navigate('MunicipalitySelection', { language });
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
            onPress={() => void handleModeSelect('visitor')}
            accessibilityLabel="Visitor"
          >
            <View style={styles.optionIconContainer}>
              <Icon name="globe" size="lg" colorToken="textPrimary" />
            </View>
            <Text style={styles.optionTitle}>Posjetitelj / Visitor</Text>
            <Text style={styles.optionDescription}>
              Turisticka posjeta otoku
            </Text>
            <Text style={styles.optionDescriptionEn}>
              Visiting the island as a tourist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => void handleModeSelect('local')}
            accessibilityLabel="Local resident"
          >
            <View style={styles.optionIconContainer}>
              <Icon name="home" size="lg" colorToken="textPrimary" />
            </View>
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
    backgroundColor: skin.colors.background,
  },
  content: {
    flex: 1,
    padding: skin.spacing.xxl,
    paddingTop: skin.spacing.xxxl,
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
  optionCard: {
    backgroundColor: skin.colors.backgroundSecondary,
    padding: skin.spacing.xl,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.borderLight,
  },
  optionIconContainer: {
    marginBottom: skin.spacing.md,
  },
  optionTitle: {
    fontSize: skin.typography.fontSize.xl,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.textPrimary,
    marginBottom: skin.spacing.sm,
  },
  optionDescription: {
    fontSize: skin.typography.fontSize.md,
    color: skin.colors.textMuted,
  },
  optionDescriptionEn: {
    fontSize: skin.typography.fontSize.md,
    color: skin.colors.textDisabled,
    fontStyle: 'italic',
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

export default UserModeSelectionScreen;
