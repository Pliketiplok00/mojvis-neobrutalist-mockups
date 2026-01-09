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
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { useMenu } from '../../contexts/MenuContext';
import { useUserContext } from '../../hooks/useUserContext';
import { inboxApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export function TransportHubScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { openMenu } = useMenu();
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
          <Text style={styles.title}>Vozni red</Text>
          <Text style={styles.subtitle}>Odaberite vrstu prijevoza</Text>
        </View>

        {/* Transport Type Selection */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('RoadTransport')}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>🚌</Text>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Cestovni promet</Text>
              <Text style={styles.optionSubtitle}>Autobusne linije</Text>
            </View>
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('SeaTransport')}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>⛴️</Text>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Pomorski promet</Text>
              <Text style={styles.optionSubtitle}>Trajekti i katamarani</Text>
            </View>
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  bannerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  optionsContainer: {
    padding: 16,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 16,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  chevron: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
});

export default TransportHubScreen;
