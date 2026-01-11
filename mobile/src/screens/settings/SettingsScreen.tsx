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
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { usePush } from '../../contexts/PushContext';
import { useTranslations } from '../../i18n';
import { skin } from '../../ui/skin';

export function SettingsScreen(): React.JSX.Element {
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
          <Text style={styles.sectionTitle}>
            {t('settings.pushNotifications.title')}
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>
                {t('settings.pushNotifications.title')}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.pushNotifications.description')}
              </Text>
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
          <Text style={styles.sectionTitle}>
            {t('settings.profile.title')}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('settings.profile.language')}
            </Text>
            <Text style={styles.infoValue}>{languageLabel}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('settings.profile.userMode')}
            </Text>
            <Text style={styles.infoValue}>{userModeLabel}</Text>
          </View>

          {userMode === 'local' && (
            <>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {t('settings.profile.municipality')}
                </Text>
                <Text style={styles.infoValue}>{municipalityLabel}</Text>
              </View>
            </>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleResetOnboarding}
            activeOpacity={0.7}
          >
            <Text style={styles.dangerButtonText}>
              {t('settings.reset.button')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>MOJ VIS v1.0.0</Text>
          <Text style={styles.versionText}>Phase 7 - Push Notifications</Text>
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
    fontSize: skin.typography.fontSize.xl,
    fontWeight: skin.typography.fontWeight.bold,
    color: skin.colors.textPrimary,
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
    fontSize: skin.typography.fontSize.lg,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.textPrimary,
    marginBottom: skin.spacing.xs,
  },
  settingDescription: {
    fontSize: skin.typography.fontSize.md,
    color: skin.colors.textMuted,
  },
  warningText: {
    fontSize: skin.typography.fontSize.sm,
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
    fontSize: skin.typography.fontSize.lg,
    color: skin.colors.textMuted,
  },
  infoValue: {
    fontSize: skin.typography.fontSize.lg,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: skin.colors.borderLight,
  },
  dangerButton: {
    backgroundColor: skin.colors.errorBackground,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.urgent,
    borderRadius: skin.borders.radiusCard,
    paddingVertical: skin.spacing.md,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: skin.typography.fontSize.lg,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.errorText,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: skin.spacing.xxl,
  },
  versionText: {
    fontSize: skin.typography.fontSize.sm,
    color: skin.colors.textDisabled,
  },
});

export default SettingsScreen;
