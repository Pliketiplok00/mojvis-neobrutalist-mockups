/**
 * Settings Screen
 *
 * Phase 7: User settings including push notification toggle.
 *
 * Settings:
 * - Push notifications toggle (hitno only)
 * - Language display
 * - User mode display
 * - Reset onboarding option
 *
 * Skin-pure: Uses skin tokens only (no hardcoded hex, no magic numbers).
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { usePush } from '../../contexts/PushContext';
import { useTranslations } from '../../i18n';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { H2, Label, Body, Meta } from '../../ui/Text';
import type { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export function SettingsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { data, resetOnboarding } = useOnboarding();
  const { isOptIn, isRegistered, isLoading, setOptIn } = usePush();
  const { t } = useTranslations();
  const [isUpdating, setIsUpdating] = useState(false);

  const language = data?.language ?? 'hr';
  const userMode = data?.userMode ?? 'visitor';
  const municipality = data?.municipality;

  // Handle push toggle
  const handlePushToggle = async (value: boolean) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await setOptIn(value);
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle reset onboarding
  const handleResetOnboarding = () => {
    Alert.alert(t('settings.reset.title'), t('settings.reset.confirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.reset.button'),
        style: 'destructive',
        onPress: async () => {
          try {
            await resetOnboarding();
            // Navigation will automatically switch to onboarding
          } catch (error) {
            console.error('Error resetting onboarding:', error);
          }
        },
      },
    ]);
  };

  // Get display labels
  const languageLabel = language === 'en' ? 'English' : 'Hrvatski';
  const userModeLabel = userMode === 'local' ? t('settings.profile.local') : t('settings.profile.visitor');
  const municipalityLabel = municipality
    ? (municipality === 'vis' ? 'Vis' : 'Komiža')
    : t('common.empty');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />

      <ScrollView style={styles.content}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>
            {t('settings.pushNotifications.title')}
          </H2>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Label style={styles.settingLabel}>
                {t('settings.pushNotifications.title')}
              </Label>
              <Body style={styles.settingDescription}>
                {t('settings.pushNotifications.description')}
              </Body>
            </View>
            <Switch
              value={isOptIn}
              onValueChange={handlePushToggle}
              disabled={isLoading || isUpdating || !isRegistered}
              trackColor={{ false: skin.colors.borderLight, true: skin.colors.successAccent }}
              thumbColor={Platform.OS === 'ios' ? undefined : skin.colors.background}
            />
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>
            {t('settings.profile.title')}
          </H2>

          <View style={styles.infoRow}>
            <Body style={styles.infoLabel}>
              {t('settings.profile.language')}
            </Body>
            <Label style={styles.infoValue}>{languageLabel}</Label>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Body style={styles.infoLabel}>
              {t('settings.profile.userMode')}
            </Body>
            <Label style={styles.infoValue}>{userModeLabel}</Label>
          </View>

          {userMode === 'local' && (
            <>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Body style={styles.infoLabel}>
                  {t('settings.profile.municipality')}
                </Body>
                <Label style={styles.infoValue}>{municipalityLabel}</Label>
              </View>
            </>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Button variant="danger" onPress={handleResetOnboarding}>
            {t('settings.reset.button')}
          </Button>
        </View>

        {/* DEV Preview - Confirmation Screen (TEMPORARY) */}
        {__DEV__ && (
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>[DEV] Screen Previews</H2>
            <Button
              variant="secondary"
              onPress={() => navigation.navigate('ClickFixConfirmation', {
                clickFixId: 'preview-mock-id-12345',
              })}
            >
              Preview Click & Fix Confirmation
            </Button>
          </View>
        )}

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Meta style={styles.versionText}>MOJ VIS v1.0.0</Meta>
          <Meta style={styles.versionText}>Phase 7 - Push Notifications</Meta>
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
  warningText: {
    color: skin.colors.warningAccent,
    marginTop: skin.spacing.md,
    fontStyle: 'italic',
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
});

export default SettingsScreen;
