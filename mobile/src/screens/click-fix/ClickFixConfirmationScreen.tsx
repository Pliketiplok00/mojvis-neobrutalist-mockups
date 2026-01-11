/**
 * Click & Fix Confirmation Screen
 *
 * Phase 6: Simple "sent" confirmation after Click & Fix submission.
 *
 * Skin-pure: Uses skin tokens and Icon primitive (no hardcoded hex, no text glyphs).
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { GlobalHeader } from '../../components/GlobalHeader';
import { useTranslations } from '../../i18n';
import type { MainStackParamList } from '../../navigation/types';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type ConfirmationRouteProp = RouteProp<MainStackParamList, 'ClickFixConfirmation'>;

export function ClickFixConfirmationScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ConfirmationRouteProp>();
  const { t } = useTranslations();
  const { clickFixId } = route.params;

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleViewClickFix = () => {
    navigation.replace('ClickFixDetail', { clickFixId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Icon name="check" size="xl" colorToken="background" />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>{t('clickFix.confirmation.title')}</Text>
        <Text style={styles.message}>
          {t('clickFix.confirmation.message')}
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewClickFix}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>{t('clickFix.confirmation.viewReport')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>{t('navigation.back')}</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.xxxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: skin.colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: skin.spacing.xxl,
  },
  title: {
    fontSize: skin.typography.fontSize.xxl,
    fontWeight: skin.typography.fontWeight.bold,
    color: skin.colors.textPrimary,
    marginBottom: skin.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: skin.typography.fontSize.lg,
    color: skin.colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: skin.spacing.xxxl,
  },
  actions: {
    width: '100%',
    gap: skin.spacing.md,
  },
  primaryButton: {
    backgroundColor: skin.colors.textPrimary,
    borderRadius: skin.borders.radiusCard,
    paddingVertical: skin.spacing.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: skin.typography.fontSize.lg,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.background,
  },
  secondaryButton: {
    backgroundColor: skin.colors.background,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusCard,
    paddingVertical: skin.spacing.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: skin.typography.fontSize.lg,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.textPrimary,
  },
});

export default ClickFixConfirmationScreen;
