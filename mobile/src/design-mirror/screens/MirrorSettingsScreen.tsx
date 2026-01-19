/**
 * Mirror Settings Screen (Design Mirror)
 *
 * Mirrors SettingsScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Push Notifications toggle
 * 2. Profile info (language, userMode, municipality)
 * 3. Reset Onboarding button
 * 4. Developer Tools (fixture-controlled, NOT __DEV__)
 * 5. Version info
 *
 * Rules:
 * - NO useNavigation import
 * - NO navigate() calls
 * - NO real context hooks
 * - Dev Tools visibility controlled by fixture.isDev
 * - All toggles/buttons are visual only (no-op)
 * - Skin tokens only
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { H2, Label, Body, Meta } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { settingsFixture, settingsLabels } from '../fixtures/settings';

/**
 * Mirror Settings Screen
 * Uses settingsFixture for all state
 */
export function MirrorSettingsScreen(): React.JSX.Element {
  // All data from fixture - no real hooks
  const {
    language,
    userMode,
    municipality,
    pushOptIn,
    pushRegistered,
    isDev,
  } = settingsFixture;

  // Display labels from fixture
  const languageLabel = settingsLabels.language[language];
  const userModeLabel = settingsLabels.userMode[userMode][language];
  const municipalityLabel = municipality
    ? settingsLabels.municipality[municipality]
    : (language === 'en' ? 'Not selected' : 'Nije odabrano');

  // NO-OP handlers - visual only
  const handlePushToggle = (): void => {
    // Intentionally empty - mirror screens don't change state
  };

  const handleResetOnboarding = (): void => {
    // Intentionally empty - mirror screens don't navigate
  };

  const handleDevToolsPress = (): void => {
    // Intentionally empty - mirror screens don't navigate
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>Settings Mirror</H2>
        <Meta style={styles.headerMeta}>fixture: settingsFixture</Meta>
      </View>

      <ScrollView style={styles.content}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>
            {language === 'en' ? 'Push Notifications' : 'Push obavijesti'}
          </H2>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Label style={styles.settingLabel}>
                {language === 'en' ? 'Push Notifications' : 'Push obavijesti'}
              </Label>
              <Body style={styles.settingDescription}>
                {language === 'en'
                  ? 'Receive urgent notifications'
                  : 'Primajte hitne obavijesti'}
              </Body>
            </View>
            <Switch
              value={pushOptIn}
              onValueChange={handlePushToggle}
              disabled={!pushRegistered} // Visual indicator of registration state
              trackColor={{ false: skin.colors.borderLight, true: skin.colors.successAccent }}
              thumbColor={Platform.OS === 'ios' ? undefined : skin.colors.background}
            />
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>
            {language === 'en' ? 'Profile' : 'Profil'}
          </H2>

          <View style={styles.infoRow}>
            <Body style={styles.infoLabel}>
              {language === 'en' ? 'Language' : 'Jezik'}
            </Body>
            <Label style={styles.infoValue}>{languageLabel}</Label>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Body style={styles.infoLabel}>
              {language === 'en' ? 'User type' : 'Vrsta korisnika'}
            </Body>
            <Label style={styles.infoValue}>{userModeLabel}</Label>
          </View>

          {userMode === 'local' && (
            <>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Body style={styles.infoLabel}>
                  {language === 'en' ? 'Municipality' : 'Općina'}
                </Body>
                <Label style={styles.infoValue}>{municipalityLabel}</Label>
              </View>
            </>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Button variant="danger" onPress={handleResetOnboarding}>
            {language === 'en' ? 'Reset app settings' : 'Resetiraj postavke'}
          </Button>
        </View>

        {/* Dev Tools Section - FIXTURE CONTROLLED (not __DEV__) */}
        {isDev && (
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>Developer Tools</H2>
            <TouchableOpacity
              style={styles.devRow}
              onPress={handleDevToolsPress}
              activeOpacity={0.7}
              disabled={true} // No navigation in mirror
            >
              <View style={styles.devRowContent}>
                <Label style={styles.devRowLabel}>UI Inventory (DEV)</Label>
                <Body style={styles.devRowDescription}>
                  View all UI components and tokens
                </Body>
              </View>
              <Icon name="chevron-right" size="md" colorToken="chevron" />
            </TouchableOpacity>
          </View>
        )}

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Meta style={styles.versionText}>MOJ VIS v1.0.0</Meta>
          <Meta style={styles.versionText}>Design Mirror - Settings</Meta>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: skin.colors.backgroundSecondary,
  },
  header: {
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
    backgroundColor: skin.colors.backgroundTertiary,
  },
  headerTitle: {
    marginBottom: skin.spacing.xs,
  },
  headerMeta: {
    color: skin.colors.textMuted,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: skin.colors.backgroundTertiary,
    marginHorizontal: skin.spacing.lg,
    marginTop: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    padding: skin.spacing.lg,
    ...skin.shadows.card,
  },
  sectionTitle: {
    marginBottom: skin.spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: skin.spacing.lg,
  },
  settingLabel: {
    marginBottom: skin.spacing.xs,
  },
  settingDescription: {
    color: skin.colors.textMuted,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: skin.spacing.md,
  },
  infoLabel: {
    color: skin.colors.textMuted,
  },
  infoValue: {
    // Typography handled by Label primitive
  },
  separator: {
    height: skin.borders.widthHairline,
    backgroundColor: skin.colors.borderLight,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: skin.spacing.xxl,
  },
  versionText: {
    color: skin.colors.textDisabled,
  },
  // Dev tools
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: skin.spacing.md,
  },
  devRowContent: {
    flex: 1,
  },
  devRowLabel: {
    color: skin.colors.textPrimary,
    marginBottom: skin.spacing.xs,
  },
  devRowDescription: {
    color: skin.colors.textMuted,
  },
});

export default MirrorSettingsScreen;
