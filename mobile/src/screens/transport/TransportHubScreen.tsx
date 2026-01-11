/**
 * Transport Hub Screen
 *
 * Entry point for all transport timetables.
 * User selects Road or Sea transport.
 *
 * Per spec:
 * - Root screen (hamburger menu)
 * - Two choices: Road / Sea
 * - Active notices show as banners
 * - No deep linking bypasses this hub
 *
 * Phase 3C: Migrated to skin primitives (100% skin-adopted).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { Card } from '../../ui/Card';
import { H1, Label, Meta } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { skin } from '../../ui/skin';
import { useMenu } from '../../contexts/MenuContext';
import { useUserContext } from '../../hooks/useUserContext';
import { useTranslations } from '../../i18n';
import { inboxApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const { colors, spacing, typography } = skin;

export function TransportHubScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { openMenu } = useMenu();
  const { t } = useTranslations();
  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const userContext = useUserContext();

  // Fetch banners for transport (Phase 2: unified 'transport' context)
  const fetchBanners = useCallback(async () => {
    try {
      const response = await inboxApi.getActiveBanners(userContext, 'transport');
      setBanners(response.banners);
    } catch (err) {
      console.error('[TransportHub] Error fetching banners:', err);
    }
  }, [userContext]);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  const handleMenuPress = (): void => {
    openMenu();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="root" onMenuPress={handleMenuPress} />

      <ScrollView style={styles.scrollView}>
        {/* Banners */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <BannerList banners={banners} />
          </View>
        )}

        {/* Title */}
        <View style={styles.section}>
          <H1>{t('transport.hub.title')}</H1>
        </View>

        {/* Transport Type Selection */}
        <View style={styles.optionsContainer}>
          <Card
            onPress={() => navigation.navigate('RoadTransport')}
            style={styles.optionCard}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Icon name="bus" size="lg" colorToken="textPrimary" />
              </View>
              <View style={styles.optionTextContainer}>
                <Label style={styles.optionTitle}>{t('transport.hub.road')}</Label>
                <Meta>{t('transport.hub.roadDescription')}</Meta>
              </View>
              <Icon name="chevron-right" size="md" colorToken="chevron" />
            </View>
          </Card>

          <Card
            onPress={() => navigation.navigate('SeaTransport')}
            style={styles.optionCard}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Icon name="ship" size="lg" colorToken="textPrimary" />
              </View>
              <View style={styles.optionTextContainer}>
                <Label style={styles.optionTitle}>{t('transport.hub.sea')}</Label>
                <Meta>{t('transport.hub.seaDescription')}</Meta>
              </View>
              <Icon name="chevron-right" size="md" colorToken="chevron" />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  bannerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  section: {
    padding: spacing.lg,
  },
  optionsContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  optionCard: {
    padding: spacing.lg,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    marginRight: spacing.lg,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
});

export default TransportHubScreen;
