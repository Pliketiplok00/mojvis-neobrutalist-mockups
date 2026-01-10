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
import { GlobalHeader } from '../../components/GlobalHeader';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { usePush } from '../../contexts/PushContext';
import { useTranslations } from '../../i18n';

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
    <View style={styles.container}>
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
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000000',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  warningText: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 12,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dangerButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default SettingsScreen;
