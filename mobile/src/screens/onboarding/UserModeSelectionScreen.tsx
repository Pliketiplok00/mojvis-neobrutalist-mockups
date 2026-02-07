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
 * Skin-pure: Uses skin tokens and OnboardingRoleCard (no hardcoded hex).
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { skin } from '../../ui/skin';
import { H2, Body, Meta } from '../../ui/Text';
import { OnboardingRoleCard } from './components/OnboardingRoleCard';

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
          <OnboardingRoleCard
            variant="visitor"
            title="Posjetitelj / Visitor"
            subtitle="Turisticka posjeta otoku"
            icon="globe"
            bullets={[
              'Kulturni dogadaji i festivali',
              'Trajektni i autobusni vozni redovi',
              'Hitne obavijesti i upozorenja',
            ]}
            onPress={() => void handleModeSelect('visitor')}
          />

          <OnboardingRoleCard
            variant="local"
            title="Lokalac / Local"
            subtitle="Živim ili radim na otoku"
            icon="home"
            bullets={[
              'Sve funkcije za posjetitelje',
              'Opcinski servisi i obavijesti',
              'Komunalne prijave problema',
            ]}
            onPress={() => void handleModeSelect('local')}
          />
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
    gap: skin.spacing.xl,
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
