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
import { View, StyleSheet, SafeAreaView, Image, useWindowDimensions } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { H2, Body } from '../../ui/Text';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'LanguageSelection'>;
};

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Identity zone: logo + welcome text (takes available space, top-heavy) */}
        <View style={styles.identityZone}>
          <View style={styles.logoContainer}>
            <Image
              source={skin.images.appLogo}
              style={{ width: logoSize, height: logoSize }}
              resizeMode="contain"
              accessibilityLabel="MOJ VIS"
            />
          </View>
          <H2 style={styles.title}>Dobrodošli / Welcome</H2>
        </View>

        {/* Action zone: language selection */}
        <View style={styles.actionZone}>
          <Body style={styles.subtitle}>Odaberite jezik / Select language</Body>
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
    paddingHorizontal: skin.spacing.xxl,
    paddingTop: skin.spacing.xxxl,
    paddingBottom: skin.spacing.xxl,
  },
  // Identity zone: logo + welcome (flex to take available space)
  identityZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: skin.spacing.xxl,
  },
  title: {
    textAlign: 'center',
  },
  // Action zone: language prompt + buttons (fixed at bottom)
  actionZone: {
    width: '100%',
    paddingTop: skin.spacing.xxxl,
  },
  subtitle: {
    color: skin.colors.textMuted,
    marginBottom: skin.spacing.xl,
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
