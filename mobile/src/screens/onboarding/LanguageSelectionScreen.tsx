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
 * Visual design:
 * - Two-zone layout matching approved mockup
 * - Blue identity zone (logo + welcome)
 * - Amber action zone (language selection + buttons)
 *
 * Skin-pure: Uses skin tokens only (no hardcoded hex, no magic numbers).
 */

import React from 'react';
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { H2, Body } from '../../ui/Text';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'LanguageSelection'>;
};

// Extract onboarding tokens for cleaner access
const { welcomeScreen } = skin.components.onboarding;

export function LanguageSelectionScreen({ navigation }: Props): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  // Logo size: ~40% of screen width for hero effect, square aspect ratio
  const logoSize = Math.round(screenWidth * 0.4);

  const handleLanguageSelect = (language: 'hr' | 'en'): void => {
    // TODO: Apply language to app UI
    console.info(`Selected language: ${language}`);
    navigation.navigate('UserModeSelection', { language });
  };

  return (
    <View style={styles.container}>
      {/* Identity zone: blue background with logo + welcome text */}
      <View style={styles.identityZone}>
        <View style={styles.logoContainer}>
          <Image
            source={skin.images.appLogo}
            style={{ width: logoSize, height: logoSize }}
            resizeMode="contain"
            accessibilityLabel="MOJ VIS"
          />
        </View>
        <H2 style={styles.welcomeText}>Dobrodošli / Welcome</H2>
      </View>

      {/* Zone divider: black line between identity and action zones */}
      <View style={styles.zoneDivider} />

      {/* Action zone: amber background with language selection */}
      <View style={styles.actionZone}>
        <Body style={styles.promptText}>Odaberite jezik / Select language</Body>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <Button
              variant="primary"
              onPress={() => handleLanguageSelect('hr')}
              accessibilityLabel="Hrvatski"
            >
              Hrvatski
            </Button>
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              variant="secondary"
              onPress={() => handleLanguageSelect('en')}
              accessibilityLabel="English"
            >
              English
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Identity zone: blue background, takes majority of screen
  identityZone: {
    flex: 1,
    backgroundColor: welcomeScreen.identityZone.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: skin.spacing.xxl,
    paddingTop: skin.spacing.xxxl,
  },
  logoContainer: {
    marginBottom: skin.spacing.xxl,
  },
  welcomeText: {
    color: welcomeScreen.identityZone.textColor,
    textAlign: 'center',
  },
  // Zone divider: black line between zones
  zoneDivider: {
    height: skin.borders.widthHeavy,
    backgroundColor: skin.colors.border,
  },
  // Action zone: amber background, fixed height for buttons
  actionZone: {
    backgroundColor: welcomeScreen.actionZone.background,
    paddingHorizontal: skin.spacing.xxl,
    paddingVertical: skin.spacing.xxl,
  },
  promptText: {
    color: welcomeScreen.actionZone.textColor,
    marginBottom: skin.spacing.lg,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: skin.spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default LanguageSelectionScreen;
