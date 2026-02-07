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
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';
import { Card } from '../../ui/Card';
import { H1, H2, Body, Label, Meta } from '../../ui/Text';

const t = skin.components.onboarding.municipalitySelection;

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'MunicipalitySelection'>;
  route: RouteProp<OnboardingStackParamList, 'MunicipalitySelection'>;
};

export function MunicipalitySelectionScreen({ navigation, route }: Props): React.JSX.Element {
  const { completeOnboarding } = useOnboarding();
  const { language } = route.params;

  const handleMunicipalitySelect = async (municipality: 'vis' | 'komiza'): Promise<void> => {
    console.info(`Selected municipality: ${municipality}`);
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
          <Body style={styles.backButtonText}>Natrag / Back</Body>
        </TouchableOpacity>

        <H2 style={styles.title}>Odaberite općinu</H2>
        <Body style={styles.subtitle}>Select your municipality</Body>

        <View style={styles.optionsContainer}>
          <Card
            variant="onboardingSelection"
            onPress={() => void handleMunicipalitySelect('komiza')}
            accessibilityLabel="Komiža"
          >
            <View style={styles.cardContent}>
              <View style={styles.iconBox}>
                <Icon name="file-text" size="lg" colorToken="textPrimary" />
              </View>
              <View style={styles.textStack}>
                <H1 style={styles.municipalityName}>Komiža</H1>
                <Label style={styles.municipalityDescription}>Općina Komiža</Label>
              </View>
            </View>
          </Card>

          <Card
            variant="onboardingSelection"
            onPress={() => void handleMunicipalitySelect('vis')}
            accessibilityLabel="Vis"
          >
            <View style={styles.cardContent}>
              <View style={styles.iconBox}>
                <Icon name="file-text" size="lg" colorToken="textPrimary" />
              </View>
              <View style={styles.textStack}>
                <H1 style={styles.municipalityName}>Vis</H1>
                <Label style={styles.municipalityDescription}>Grad Vis</Label>
              </View>
            </View>
          </Card>
        </View>

        <Meta style={styles.hint}>
          Ovo određuje koje općinske obavijesti primate.
        </Meta>
        <Meta style={styles.hintEn}>
          This determines which municipal notifications you receive.
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.xs,
    marginBottom: skin.spacing.xxl,
  },
  backButtonText: {
    color: skin.colors.textMuted,
  },
  title: {
    marginBottom: skin.spacing.xs,
  },
  subtitle: {
    color: skin.colors.textMuted,
    marginBottom: skin.spacing.xxxl,
  },
  optionsContainer: {
    gap: t.optionGap,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.card.contentGap,
  },
  iconBox: {
    width: t.iconBox.size,
    height: t.iconBox.size,
    backgroundColor: t.iconBox.backgroundColor,
    borderWidth: t.iconBox.borderWidth,
    borderColor: t.iconBox.borderColor,
    borderRadius: t.iconBox.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStack: {
    flex: 1,
  },
  municipalityName: {
    ...t.title,
    marginBottom: skin.spacing.sm,
  },
  municipalityDescription: {
    ...t.subtitle,
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

export default MunicipalitySelectionScreen;
