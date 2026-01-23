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
import { View, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';
import { Card } from '../../ui/Card';
import { H2, Body, ButtonText, Label, Meta } from '../../ui/Text';

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
        <H2 style={styles.title}>Kako koristite aplikaciju?</H2>
        <Body style={styles.subtitle}>How do you use the app?</Body>

        <View style={styles.optionsContainer}>
          <Card
            variant="selection"
            onPress={() => void handleModeSelect('visitor')}
            accessibilityLabel="Visitor"
          >
            <View style={styles.optionIconContainer}>
              <Icon name="globe" size="lg" colorToken="textPrimary" />
            </View>
            <ButtonText style={styles.optionTitle}>Posjetitelj / Visitor</ButtonText>
            <Label style={styles.optionDescription}>
              Turisticka posjeta otoku
            </Label>
            <Meta style={styles.optionDescriptionEn}>
              Visiting the island as a tourist
            </Meta>
          </Card>

          <Card
            variant="selection"
            onPress={() => void handleModeSelect('local')}
            accessibilityLabel="Local resident"
          >
            <View style={styles.optionIconContainer}>
              <Icon name="home" size="lg" colorToken="textPrimary" />
            </View>
            <ButtonText style={styles.optionTitle}>Lokalac / Local</ButtonText>
            <Label style={styles.optionDescription}>
              Živim ili radim na otoku
            </Label>
            <Meta style={styles.optionDescriptionEn}>
              I live or work on the island
            </Meta>
          </Card>
        </View>

        <Meta style={styles.hint}>
          Možete promijeniti kasnije u postavkama.
        </Meta>
        <Meta style={styles.hintEn}>
          You can change this later in settings.
        </Meta>
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
  hint: {
    textAlign: 'center',
    marginTop: skin.spacing.xxxl,
  },
  hintEn: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default UserModeSelectionScreen;
