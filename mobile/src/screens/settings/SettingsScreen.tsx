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

export function SettingsScreen(): React.JSX.Element {
  const { data, resetOnboarding } = useOnboarding();
  const { isOptIn, isRegistered, isLoading, setOptIn } = usePush();
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
      Alert.alert(
        language === 'en' ? 'Error' : 'Greška',
        language === 'en'
          ? 'Failed to update notification settings'
          : 'Nije moguće ažurirati postavke obavijesti'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle reset onboarding
  const handleResetOnboarding = () => {
    const title = language === 'en' ? 'Reset Settings' : 'Resetiraj postavke';
    const message = language === 'en'
      ? 'This will reset all your preferences. You will need to complete the setup again.'
      : 'Ovo će resetirati sve vaše postavke. Morat ćete ponovno proći postavke.';
    const cancel = language === 'en' ? 'Cancel' : 'Odustani';
    const confirm = language === 'en' ? 'Reset' : 'Resetiraj';

    Alert.alert(title, message, [
      { text: cancel, style: 'cancel' },
      {
        text: confirm,
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
  const userModeLabel = language === 'en'
    ? (userMode === 'local' ? 'Local Resident' : 'Visitor')
    : (userMode === 'local' ? 'Lokalni stanovnik' : 'Posjetitelj');
  const municipalityLabel = municipality
    ? (municipality === 'vis' ? 'Vis' : 'Komiža')
    : (language === 'en' ? 'Not set' : 'Nije postavljeno');

  return (
    <View style={styles.container}>
      <GlobalHeader type="child" />

      <ScrollView style={styles.content}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Notifications' : 'Obavijesti'}
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>
                {language === 'en' ? 'Emergency Notifications' : 'Hitne obavijesti (push)'}
              </Text>
              <Text style={styles.settingDescription}>
                {language === 'en'
                  ? 'Receive push notifications for emergency (hitno) messages'
                  : 'Primaj push obavijesti za hitne poruke'}
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

          {!isRegistered && (
            <Text style={styles.warningText}>
              {language === 'en'
                ? 'Push notifications require a physical device and permission.'
                : 'Push obavijesti zahtijevaju fizički uređaj i dopuštenje.'}
            </Text>
          )}
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Your Profile' : 'Vaš profil'}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {language === 'en' ? 'Language' : 'Jezik'}
            </Text>
            <Text style={styles.infoValue}>{languageLabel}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {language === 'en' ? 'Mode' : 'Način'}
            </Text>
            <Text style={styles.infoValue}>{userModeLabel}</Text>
          </View>

          {userMode === 'local' && (
            <>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {language === 'en' ? 'Municipality' : 'Općina'}
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
              {language === 'en' ? 'Reset All Settings' : 'Resetiraj sve postavke'}
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
